use actix_web::{web, HttpResponse};
use chrono::NaiveDate;
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::middleware::{AuthUser, require_role};
use crate::crypto::merkle;
use crate::error::VitaError;

// ── Request types ──────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct MerkleListQuery {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct MerkleVerifyBody {
    pub date: String,
}

// ── Handlers ───────────────────────────────────────────────────────

/// GET /api/v1/crypto/merkle/roots — List all Merkle tree roots.
pub async fn list_merkle_roots(
    pool: web::Data<PgPool>,
    _user: AuthUser,
    query: web::Query<MerkleListQuery>,
) -> Result<HttpResponse, VitaError> {
    let limit = query.limit.unwrap_or(30).min(100);
    let offset = query.offset.unwrap_or(0).max(0);

    let roots = merkle::list_racines(pool.get_ref(), limit, offset).await?;
    Ok(HttpResponse::Ok().json(roots))
}

/// GET /api/v1/crypto/merkle/proof/{tx_id} — Get Merkle proof for a transaction.
pub async fn get_merkle_proof(
    pool: web::Data<PgPool>,
    _user: AuthUser,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, VitaError> {
    let tx_id = path.into_inner();
    let proof = merkle::get_transaction_proof(pool.get_ref(), tx_id).await?;

    match proof {
        Some(p) => {
            let path_json: Vec<serde_json::Value> = p
                .path
                .iter()
                .map(|step| {
                    serde_json::json!({
                        "hash": step.hash,
                        "side": match step.side {
                            merkle::Side::Left => "left",
                            merkle::Side::Right => "right",
                        }
                    })
                })
                .collect();

            Ok(HttpResponse::Ok().json(serde_json::json!({
                "leaf_hash": p.leaf_hash,
                "root_hash": p.root_hash,
                "path": path_json,
                "valid": merkle::verify_proof(&p)
            })))
        }
        None => Err(VitaError::NotFound(
            "Merkle proof not available for this transaction".into(),
        )),
    }
}

/// POST /api/v1/crypto/merkle/verify — Verify a daily Merkle tree (admin).
pub async fn verify_merkle_tree(
    pool: web::Data<PgPool>,
    user: AuthUser,
    body: web::Json<MerkleVerifyBody>,
) -> Result<HttpResponse, VitaError> {
    require_role(&user, &["dieu", "super_admin", "admin", "auditeur"])?;

    let date = NaiveDate::parse_from_str(&body.date, "%Y-%m-%d")
        .map_err(|_| VitaError::BadRequest("Date invalide (format YYYY-MM-DD)".into()))?;

    let valid = merkle::verify_merkle_tree(pool.get_ref(), date).await?;

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "date": body.date,
        "valid": valid
    })))
}

/// GET /api/v1/crypto/pubkey/{user_id} — Get a user's public key.
pub async fn get_public_key(
    pool: web::Data<PgPool>,
    _user: AuthUser,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, VitaError> {
    let target_user_id = path.into_inner();

    let pubkey_bytes: Option<Vec<u8>> = sqlx::query_scalar(
        "SELECT public_key FROM accounts WHERE user_id = $1",
    )
    .bind(target_user_id)
    .fetch_optional(pool.get_ref())
    .await?;

    match pubkey_bytes {
        Some(bytes) => {
            let pubkey_hex = hex::encode(&bytes);
            Ok(HttpResponse::Ok().json(serde_json::json!({
                "user_id": target_user_id,
                "public_key": pubkey_hex
            })))
        }
        None => Err(VitaError::NotFound(
            format!("No account found for user {target_user_id}"),
        )),
    }
}

/// GET /api/v1/crypto/verify-tx/{tx_id} — Verify a transaction's signature.
pub async fn verify_transaction_signature(
    pool: web::Data<PgPool>,
    _user: AuthUser,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, VitaError> {
    let tx_id = path.into_inner();

    // Fetch transaction with its crypto fields
    let row: Option<TxCryptoRow> = sqlx::query_as(
        r#"SELECT t.id, t.from_account_id, t.to_account_id, t.amount, t.created_at,
                  t.signature, t.payload_hash, t.signer_pubkey
           FROM transactions t
           WHERE t.id = $1"#,
    )
    .bind(tx_id)
    .fetch_optional(pool.get_ref())
    .await?;

    let row = row.ok_or_else(|| VitaError::NotFound(format!("Transaction {tx_id}")))?;

    // Check if this transaction was signed
    let (signature, payload_hash, signer_pubkey) = match (
        row.signature.as_ref(),
        row.payload_hash.as_ref(),
        row.signer_pubkey.as_ref(),
    ) {
        (Some(sig), Some(ph), Some(pk)) => (sig.clone(), ph.clone(), pk.clone()),
        _ => {
            return Ok(HttpResponse::Ok().json(serde_json::json!({
                "tx_id": tx_id,
                "signed": false,
                "message": "This transaction has no cryptographic signature"
            })));
        }
    };

    // Rebuild payload to verify
    let from_id = row.from_account_id.ok_or_else(|| {
        VitaError::Internal("Transaction has no sender".into())
    })?;

    let payload = crate::crypto::signatures::TransactionPayload {
        from_id,
        to_id: row.to_account_id,
        amount: row.amount,
        timestamp: row.created_at,
        nonce: tx_id, // We use tx_id as nonce for server-side signing
    };

    let valid = crate::crypto::signatures::verify_payload_signature(
        &payload,
        &signature,
        &signer_pubkey,
    )?;

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "tx_id": tx_id,
        "signed": true,
        "valid": valid,
        "payload_hash": payload_hash,
        "signer_pubkey": signer_pubkey
    })))
}

// ── Helper types ───────────────────────────────────────────────────

#[derive(Debug, sqlx::FromRow)]
struct TxCryptoRow {
    #[allow(dead_code)]
    id: Uuid,
    from_account_id: Option<Uuid>,
    to_account_id: Uuid,
    amount: rust_decimal::Decimal,
    created_at: chrono::DateTime<chrono::Utc>,
    signature: Option<String>,
    payload_hash: Option<String>,
    signer_pubkey: Option<String>,
}
