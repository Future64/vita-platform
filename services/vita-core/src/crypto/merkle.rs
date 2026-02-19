use chrono::{NaiveDate, Utc};
use serde::Serialize;
use sha2::{Digest, Sha256};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::VitaError;

// ── Types ──────────────────────────────────────────────────────────

#[derive(Debug, Clone, PartialEq)]
pub enum Side {
    Left,
    Right,
}

#[derive(Debug, Clone)]
pub struct MerkleProofStep {
    pub hash: String,
    pub side: Side,
}

#[derive(Debug, Clone)]
pub struct MerkleProof {
    pub leaf_hash: String,
    pub path: Vec<MerkleProofStep>,
    pub root_hash: String,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct MerkleRacine {
    pub id: Uuid,
    pub date: NaiveDate,
    pub racine_hash: String,
    pub nombre_feuilles: i32,
    pub nombre_niveaux: i32,
    pub verifie: bool,
    pub created_at: chrono::DateTime<Utc>,
}

// ── Hashing helpers ────────────────────────────────────────────────

/// Hash a leaf node: SHA-256("leaf:" + tx_id + "|" + payload_hash).
pub fn hash_leaf(tx_id: &Uuid, payload_hash: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(b"leaf:");
    hasher.update(tx_id.to_string().as_bytes());
    hasher.update(b"|");
    hasher.update(payload_hash.as_bytes());
    hex::encode(hasher.finalize())
}

/// Hash an internal node: SHA-256("node:" + left_hash + right_hash).
pub fn hash_node(left: &str, right: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(b"node:");
    hasher.update(left.as_bytes());
    hasher.update(right.as_bytes());
    hex::encode(hasher.finalize())
}

// ── In-memory tree construction ────────────────────────────────────

/// Build a Merkle tree in memory from a list of leaf hashes.
/// Returns (root_hash, all_levels) where levels[0] = leaves, levels[last] = [root].
pub fn build_tree(leaf_hashes: &[String]) -> (String, Vec<Vec<String>>) {
    if leaf_hashes.is_empty() {
        return (String::new(), vec![]);
    }

    let mut levels: Vec<Vec<String>> = vec![leaf_hashes.to_vec()];

    loop {
        let current = levels.last().unwrap();
        if current.len() == 1 {
            break;
        }

        let mut next_level = Vec::new();
        let mut i = 0;
        while i < current.len() {
            let left = &current[i];
            // If odd number of nodes, duplicate the last one
            let right = if i + 1 < current.len() {
                &current[i + 1]
            } else {
                &current[i]
            };
            next_level.push(hash_node(left, right));
            i += 2;
        }
        levels.push(next_level);
    }

    let root = levels.last().unwrap()[0].clone();
    (root, levels)
}

/// Generate a proof-of-inclusion for a leaf at the given index.
pub fn get_proof(levels: &[Vec<String>], leaf_index: usize) -> Option<MerkleProof> {
    if levels.is_empty() || leaf_index >= levels[0].len() {
        return None;
    }

    let leaf_hash = levels[0][leaf_index].clone();
    let root_hash = levels.last().unwrap()[0].clone();
    let mut path = Vec::new();
    let mut idx = leaf_index;

    for level in &levels[..levels.len() - 1] {
        let sibling_idx = if idx.is_multiple_of(2) { idx + 1 } else { idx - 1 };
        let sibling_hash = if sibling_idx < level.len() {
            level[sibling_idx].clone()
        } else {
            // Odd node duplicated itself
            level[idx].clone()
        };
        let side = if idx.is_multiple_of(2) { Side::Right } else { Side::Left };
        path.push(MerkleProofStep {
            hash: sibling_hash,
            side,
        });
        idx /= 2;
    }

    Some(MerkleProof {
        leaf_hash,
        path,
        root_hash,
    })
}

/// Verify a Merkle proof: recompute the root from the leaf and path.
pub fn verify_proof(proof: &MerkleProof) -> bool {
    let mut current = proof.leaf_hash.clone();

    for step in &proof.path {
        current = match step.side {
            Side::Left => hash_node(&step.hash, &current),
            Side::Right => hash_node(&current, &step.hash),
        };
    }

    current == proof.root_hash
}

// ── Database operations ────────────────────────────────────────────

/// Build and store the daily Merkle tree for all transactions on a given date.
pub async fn build_daily_merkle(pool: &PgPool, date: NaiveDate) -> Result<Option<MerkleRacine>, VitaError> {
    // Check if a tree already exists for this date
    let existing: Option<MerkleRacine> = sqlx::query_as(
        "SELECT id, date, racine_hash, nombre_feuilles, nombre_niveaux, verifie, created_at FROM merkle_racines WHERE date = $1",
    )
    .bind(date)
    .fetch_optional(pool)
    .await?;

    if existing.is_some() {
        return Ok(existing);
    }

    // Fetch all transactions for the date that have a payload_hash
    let rows: Vec<(Uuid, String)> = sqlx::query_as(
        r#"SELECT id, payload_hash
           FROM transactions
           WHERE DATE(created_at) = $1 AND payload_hash IS NOT NULL
           ORDER BY created_at ASC"#,
    )
    .bind(date)
    .fetch_all(pool)
    .await?;

    if rows.is_empty() {
        return Ok(None);
    }

    // Build leaf hashes
    let leaf_hashes: Vec<String> = rows
        .iter()
        .map(|(tx_id, payload_hash)| hash_leaf(tx_id, payload_hash))
        .collect();

    let (root_hash, levels) = build_tree(&leaf_hashes);
    let nombre_niveaux = levels.len() as i32;
    let nombre_feuilles = leaf_hashes.len() as i32;

    // Insert the root record
    let racine: MerkleRacine = sqlx::query_as(
        r#"INSERT INTO merkle_racines (date, racine_hash, nombre_feuilles, nombre_niveaux)
           VALUES ($1, $2, $3, $4)
           RETURNING id, date, racine_hash, nombre_feuilles, nombre_niveaux, verifie, created_at"#,
    )
    .bind(date)
    .bind(&root_hash)
    .bind(nombre_feuilles)
    .bind(nombre_niveaux)
    .fetch_one(pool)
    .await?;

    // Store all nodes level by level
    let mut position = 0i32;
    for (niveau, level) in levels.iter().enumerate() {
        for (i, node_hash) in level.iter().enumerate() {
            let tx_id = if niveau == 0 { Some(rows[i].0) } else { None };
            sqlx::query(
                r#"INSERT INTO merkle_nodes (racine_id, position, niveau, hash, tx_id)
                   VALUES ($1, $2, $3, $4, $5)"#,
            )
            .bind(racine.id)
            .bind(position)
            .bind(niveau as i32)
            .bind(node_hash)
            .bind(tx_id)
            .execute(pool)
            .await?;
            position += 1;
        }
    }

    Ok(Some(racine))
}

/// Verify the integrity of a stored Merkle tree by recomputing the root.
pub async fn verify_merkle_tree(pool: &PgPool, date: NaiveDate) -> Result<bool, VitaError> {
    let racine: MerkleRacine = sqlx::query_as(
        "SELECT id, date, racine_hash, nombre_feuilles, nombre_niveaux, verifie, created_at FROM merkle_racines WHERE date = $1",
    )
    .bind(date)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| VitaError::NotFound(format!("Merkle tree for date {date}")))?;

    // Recompute from transactions
    let rows: Vec<(Uuid, String)> = sqlx::query_as(
        r#"SELECT id, payload_hash
           FROM transactions
           WHERE DATE(created_at) = $1 AND payload_hash IS NOT NULL
           ORDER BY created_at ASC"#,
    )
    .bind(date)
    .fetch_all(pool)
    .await?;

    let leaf_hashes: Vec<String> = rows
        .iter()
        .map(|(tx_id, payload_hash)| hash_leaf(tx_id, payload_hash))
        .collect();

    let (recomputed_root, _) = build_tree(&leaf_hashes);
    let valid = recomputed_root == racine.racine_hash;

    // Update verified status
    sqlx::query("UPDATE merkle_racines SET verifie = $1 WHERE id = $2")
        .bind(valid)
        .bind(racine.id)
        .execute(pool)
        .await?;

    Ok(valid)
}

/// Get a Merkle proof for a specific transaction on a given date.
pub async fn get_transaction_proof(
    pool: &PgPool,
    tx_id: Uuid,
) -> Result<Option<MerkleProof>, VitaError> {
    // Find which date this transaction belongs to
    let tx_date: Option<NaiveDate> = sqlx::query_scalar(
        "SELECT DATE(created_at) FROM transactions WHERE id = $1 AND payload_hash IS NOT NULL",
    )
    .bind(tx_id)
    .fetch_optional(pool)
    .await?;

    let date = match tx_date {
        Some(d) => d,
        None => return Ok(None),
    };

    // Check tree exists
    let racine: Option<MerkleRacine> = sqlx::query_as(
        "SELECT id, date, racine_hash, nombre_feuilles, nombre_niveaux, verifie, created_at FROM merkle_racines WHERE date = $1",
    )
    .bind(date)
    .fetch_optional(pool)
    .await?;

    if racine.is_none() {
        return Ok(None);
    }

    // Rebuild the tree to generate the proof
    let rows: Vec<(Uuid, String)> = sqlx::query_as(
        r#"SELECT id, payload_hash
           FROM transactions
           WHERE DATE(created_at) = $1 AND payload_hash IS NOT NULL
           ORDER BY created_at ASC"#,
    )
    .bind(date)
    .fetch_all(pool)
    .await?;

    let leaf_index = rows.iter().position(|(id, _)| *id == tx_id);
    let leaf_index = match leaf_index {
        Some(i) => i,
        None => return Ok(None),
    };

    let leaf_hashes: Vec<String> = rows
        .iter()
        .map(|(id, ph)| hash_leaf(id, ph))
        .collect();

    let (_, levels) = build_tree(&leaf_hashes);
    Ok(get_proof(&levels, leaf_index))
}

/// List all Merkle tree roots.
pub async fn list_racines(pool: &PgPool, limit: i64, offset: i64) -> Result<Vec<MerkleRacine>, VitaError> {
    let rows = sqlx::query_as(
        r#"SELECT id, date, racine_hash, nombre_feuilles, nombre_niveaux, verifie, created_at
           FROM merkle_racines
           ORDER BY date DESC
           LIMIT $1 OFFSET $2"#,
    )
    .bind(limit)
    .bind(offset)
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

// ── Tests ──────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hash_leaf_is_deterministic() {
        let tx_id = Uuid::nil();
        let payload = "abc123";
        let h1 = hash_leaf(&tx_id, payload);
        let h2 = hash_leaf(&tx_id, payload);
        assert_eq!(h1, h2);
        assert_eq!(h1.len(), 64);
    }

    #[test]
    fn hash_node_is_deterministic() {
        let h1 = hash_node("left", "right");
        let h2 = hash_node("left", "right");
        assert_eq!(h1, h2);
    }

    #[test]
    fn hash_node_is_order_dependent() {
        let h1 = hash_node("a", "b");
        let h2 = hash_node("b", "a");
        assert_ne!(h1, h2);
    }

    #[test]
    fn build_tree_single_leaf() {
        let leaves = vec!["abc".to_string()];
        let (root, levels) = build_tree(&leaves);
        assert_eq!(levels.len(), 1);
        assert_eq!(root, "abc");
    }

    #[test]
    fn build_tree_two_leaves() {
        let leaves = vec!["a".to_string(), "b".to_string()];
        let (root, levels) = build_tree(&leaves);
        assert_eq!(levels.len(), 2);
        assert_eq!(root, hash_node("a", "b"));
    }

    #[test]
    fn build_tree_four_leaves() {
        let leaves = vec![
            "a".to_string(),
            "b".to_string(),
            "c".to_string(),
            "d".to_string(),
        ];
        let (root, levels) = build_tree(&leaves);
        assert_eq!(levels.len(), 3); // 4 leaves → 2 → 1
        let ab = hash_node("a", "b");
        let cd = hash_node("c", "d");
        assert_eq!(root, hash_node(&ab, &cd));
    }

    #[test]
    fn build_tree_odd_leaves() {
        let leaves = vec!["a".to_string(), "b".to_string(), "c".to_string()];
        let (root, levels) = build_tree(&leaves);
        assert_eq!(levels.len(), 3);
        let ab = hash_node("a", "b");
        let cc = hash_node("c", "c"); // duplicated
        assert_eq!(root, hash_node(&ab, &cc));
    }

    #[test]
    fn proof_and_verify_works() {
        let leaves = vec![
            "a".to_string(),
            "b".to_string(),
            "c".to_string(),
            "d".to_string(),
        ];
        let (_, levels) = build_tree(&leaves);

        for i in 0..4 {
            let proof = get_proof(&levels, i).unwrap();
            assert!(verify_proof(&proof), "Proof failed for leaf {i}");
        }
    }

    #[test]
    fn proof_with_odd_leaves() {
        let leaves = vec!["x".to_string(), "y".to_string(), "z".to_string()];
        let (_, levels) = build_tree(&leaves);

        for i in 0..3 {
            let proof = get_proof(&levels, i).unwrap();
            assert!(verify_proof(&proof), "Proof failed for leaf {i}");
        }
    }

    #[test]
    fn tampered_proof_fails() {
        let leaves = vec!["a".to_string(), "b".to_string()];
        let (_, levels) = build_tree(&leaves);

        let mut proof = get_proof(&levels, 0).unwrap();
        proof.leaf_hash = "tampered".to_string();
        assert!(!verify_proof(&proof));
    }

    #[test]
    fn empty_leaves_returns_empty() {
        let (root, levels) = build_tree(&[]);
        assert!(root.is_empty());
        assert!(levels.is_empty());
    }

    #[test]
    fn get_proof_out_of_bounds() {
        let leaves = vec!["a".to_string()];
        let (_, levels) = build_tree(&leaves);
        assert!(get_proof(&levels, 5).is_none());
    }
}
