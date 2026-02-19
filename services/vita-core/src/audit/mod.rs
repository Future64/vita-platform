use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sha2::Digest;
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::middleware::AuthUser;
use crate::error::VitaError;

// ── Types ──────────────────────────────────────────────────────────

/// Input for creating an audit entry.
pub struct AuditEntry {
    pub acteur_id: Option<Uuid>,
    pub acteur_username: Option<String>,
    pub acteur_role: Option<String>,
    pub acteur_ip: Option<String>,
    pub action: String,
    pub categorie: String,
    pub severite: String,
    pub description: String,
    pub details: Option<serde_json::Value>,
    pub entite_type: Option<String>,
    pub entite_id: Option<Uuid>,
}

/// Full audit log row from the database.
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct AuditLog {
    pub id: Uuid,
    pub sequence_number: i64,
    pub acteur_id: Option<Uuid>,
    pub acteur_username: Option<String>,
    pub acteur_role: Option<String>,
    pub action: String,
    pub categorie: String,
    pub severite: String,
    pub description: String,
    pub entite_type: Option<String>,
    pub entite_id: Option<Uuid>,
    pub hash: String,
    pub hash_precedent: String,
    pub created_at: DateTime<Utc>,
}

/// Detailed audit log (includes JSONB details).
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct AuditLogDetail {
    pub id: Uuid,
    pub sequence_number: i64,
    pub acteur_id: Option<Uuid>,
    pub acteur_username: Option<String>,
    pub acteur_role: Option<String>,
    pub acteur_ip: Option<String>,
    pub action: String,
    pub categorie: String,
    pub severite: String,
    pub description: String,
    pub details: Option<serde_json::Value>,
    pub entite_type: Option<String>,
    pub entite_id: Option<Uuid>,
    pub hash: String,
    pub hash_precedent: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct IntegrityReport {
    pub total_entries: i64,
    pub verified_ok: bool,
    pub first_error: Option<IntegrityError>,
}

#[derive(Debug, Serialize)]
pub struct IntegrityError {
    pub sequence_number: i64,
    pub expected_hash: String,
    pub actual_hash: String,
    pub error_type: String,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct AuditIntegrity {
    pub last_sequence: i64,
    pub last_hash: String,
    pub last_verified_at: DateTime<Utc>,
    pub total_entries: i64,
    pub integrity_ok: bool,
}

#[derive(Debug, Deserialize)]
pub struct AuditFilters {
    pub categorie: Option<String>,
    pub severite: Option<String>,
    pub acteur_id: Option<Uuid>,
    pub entite_type: Option<String>,
    pub date_from: Option<DateTime<Utc>>,
    pub date_to: Option<DateTime<Utc>>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

// ── Row for verification ───────────────────────────────────────────

#[derive(Debug, sqlx::FromRow)]
struct VerifyRow {
    sequence_number: i64,
    action: String,
    acteur_id: Option<Uuid>,
    description: String,
    details: Option<serde_json::Value>,
    created_at: DateTime<Utc>,
    hash: String,
    hash_precedent: String,
}

// ── Core Functions ─────────────────────────────────────────────────

/// Log an audit event with hash chain integrity.
/// This uses a SQL transaction with FOR UPDATE to guarantee serialized writes.
pub async fn log_event(pool: &PgPool, entry: AuditEntry) -> Result<(), VitaError> {
    let mut tx = pool.begin().await?;

    // Read last hash (FOR UPDATE to serialize concurrent writes)
    let (last_hash, last_seq, total): (String, i64, i64) = sqlx::query_as(
        "SELECT last_hash, last_sequence, total_entries FROM audit_integrity WHERE id = 1 FOR UPDATE",
    )
    .fetch_one(&mut *tx)
    .await
    .unwrap_or(("GENESIS".to_string(), 0, 0));

    let new_seq = last_seq + 1;
    let now = Utc::now();

    // Build the payload to hash
    let acteur_str = entry
        .acteur_id
        .map(|id| id.to_string())
        .unwrap_or_else(|| "system".to_string());
    let details_str = entry
        .details
        .as_ref()
        .map(|d| d.to_string())
        .unwrap_or_else(|| "null".to_string());

    let payload = format!(
        "{}|{}|{}|{}|{}|{}|{}",
        new_seq, entry.action, acteur_str, entry.description, details_str, now.to_rfc3339(), last_hash
    );

    // SHA-512 hash
    let hash = format!("{:x}", sha2::Sha512::digest(payload.as_bytes()));

    // Insert the audit entry (acteur_ip bound as text, cast to INET in SQL)
    sqlx::query(
        r#"INSERT INTO audit_logs (
            acteur_id, acteur_username, acteur_role, acteur_ip,
            action, categorie, severite, description, details,
            entite_type, entite_id, hash, hash_precedent, created_at
        ) VALUES ($1, $2, $3, $4::INET, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)"#,
    )
    .bind(entry.acteur_id)
    .bind(&entry.acteur_username)
    .bind(&entry.acteur_role)
    .bind(&entry.acteur_ip)
    .bind(&entry.action)
    .bind(&entry.categorie)
    .bind(&entry.severite)
    .bind(&entry.description)
    .bind(&entry.details)
    .bind(&entry.entite_type)
    .bind(entry.entite_id)
    .bind(&hash)
    .bind(&last_hash)
    .bind(now)
    .execute(&mut *tx)
    .await?;

    // Update integrity tracker
    sqlx::query(
        r#"UPDATE audit_integrity SET
            last_sequence = $1,
            last_hash = $2,
            total_entries = $3
           WHERE id = 1"#,
    )
    .bind(new_seq)
    .bind(&hash)
    .bind(total + 1)
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;
    Ok(())
}

/// Verify the entire hash chain integrity.
pub async fn verify_integrity(pool: &PgPool) -> Result<IntegrityReport, VitaError> {
    let rows = sqlx::query_as::<_, VerifyRow>(
        r#"SELECT sequence_number, action, acteur_id, description, details,
                  created_at, hash, hash_precedent
           FROM audit_logs
           ORDER BY sequence_number ASC"#,
    )
    .fetch_all(pool)
    .await?;

    let total_entries = rows.len() as i64;
    let mut previous_hash = "GENESIS".to_string();

    for row in &rows {
        // Verify hash_precedent matches the previous entry's hash
        if row.hash_precedent != previous_hash {
            // Update integrity status
            update_integrity_status(pool, false).await?;

            return Ok(IntegrityReport {
                total_entries,
                verified_ok: false,
                first_error: Some(IntegrityError {
                    sequence_number: row.sequence_number,
                    expected_hash: previous_hash,
                    actual_hash: row.hash_precedent.clone(),
                    error_type: "hash_precedent_mismatch".to_string(),
                }),
            });
        }

        // Recalculate the hash
        let acteur_str = row
            .acteur_id
            .map(|id| id.to_string())
            .unwrap_or_else(|| "system".to_string());
        let details_str = row
            .details
            .as_ref()
            .map(|d| d.to_string())
            .unwrap_or_else(|| "null".to_string());

        let payload = format!(
            "{}|{}|{}|{}|{}|{}|{}",
            row.sequence_number,
            row.action,
            acteur_str,
            row.description,
            details_str,
            row.created_at.to_rfc3339(),
            row.hash_precedent
        );

        let expected_hash = format!("{:x}", sha2::Sha512::digest(payload.as_bytes()));

        if expected_hash != row.hash {
            update_integrity_status(pool, false).await?;

            return Ok(IntegrityReport {
                total_entries,
                verified_ok: false,
                first_error: Some(IntegrityError {
                    sequence_number: row.sequence_number,
                    expected_hash,
                    actual_hash: row.hash.clone(),
                    error_type: "hash_mismatch".to_string(),
                }),
            });
        }

        previous_hash = row.hash.clone();
    }

    // All good — update integrity status
    update_integrity_status(pool, true).await?;

    Ok(IntegrityReport {
        total_entries,
        verified_ok: true,
        first_error: None,
    })
}

/// Get filtered audit logs.
pub async fn get_logs(pool: &PgPool, filters: &AuditFilters) -> Result<Vec<AuditLog>, VitaError> {
    let limit = filters.limit.unwrap_or(50).min(200);
    let offset = filters.offset.unwrap_or(0).max(0);

    // Build dynamic query with filters
    let mut conditions = Vec::new();
    let mut param_idx = 1u32;

    if filters.categorie.is_some() {
        conditions.push(format!("categorie = ${}", param_idx));
        param_idx += 1;
    }
    if filters.severite.is_some() {
        conditions.push(format!("severite = ${}", param_idx));
        param_idx += 1;
    }
    if filters.acteur_id.is_some() {
        conditions.push(format!("acteur_id = ${}", param_idx));
        param_idx += 1;
    }
    if filters.entite_type.is_some() {
        conditions.push(format!("entite_type = ${}", param_idx));
        param_idx += 1;
    }
    if filters.date_from.is_some() {
        conditions.push(format!("created_at >= ${}", param_idx));
        param_idx += 1;
    }
    if filters.date_to.is_some() {
        conditions.push(format!("created_at <= ${}", param_idx));
        param_idx += 1;
    }

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    let query_str = format!(
        r#"SELECT id, sequence_number, acteur_id, acteur_username, acteur_role,
                  action, categorie, severite, description,
                  entite_type, entite_id, hash, hash_precedent, created_at
           FROM audit_logs
           {}
           ORDER BY sequence_number DESC
           LIMIT ${} OFFSET ${}"#,
        where_clause, param_idx, param_idx + 1
    );

    let mut query = sqlx::query_as::<_, AuditLog>(&query_str);

    if let Some(ref cat) = filters.categorie {
        query = query.bind(cat);
    }
    if let Some(ref sev) = filters.severite {
        query = query.bind(sev);
    }
    if let Some(id) = filters.acteur_id {
        query = query.bind(id);
    }
    if let Some(ref et) = filters.entite_type {
        query = query.bind(et);
    }
    if let Some(df) = filters.date_from {
        query = query.bind(df);
    }
    if let Some(dt) = filters.date_to {
        query = query.bind(dt);
    }

    query = query.bind(limit).bind(offset);

    let rows = query.fetch_all(pool).await?;
    Ok(rows)
}

/// Get a single audit log entry with full details.
pub async fn get_log_detail(pool: &PgPool, id: Uuid) -> Result<AuditLogDetail, VitaError> {
    sqlx::query_as::<_, AuditLogDetail>(
        r#"SELECT id, sequence_number, acteur_id, acteur_username, acteur_role,
                  acteur_ip::TEXT AS acteur_ip, action, categorie, severite,
                  description, details, entite_type, entite_id,
                  hash, hash_precedent, created_at
           FROM audit_logs WHERE id = $1"#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| VitaError::NotFound("Entree d'audit introuvable".into()))
}

/// Get the current integrity status.
pub async fn get_integrity_status(pool: &PgPool) -> Result<AuditIntegrity, VitaError> {
    sqlx::query_as::<_, AuditIntegrity>(
        "SELECT last_sequence, last_hash, last_verified_at, total_entries, integrity_ok FROM audit_integrity WHERE id = 1",
    )
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| VitaError::Internal("Audit integrity table not initialized".into()))
}

// ── Helper: fire-and-forget audit ──────────────────────────────────

/// Non-blocking audit helper. Spawns the log_event in a background task
/// so that the HTTP handler is not blocked.
#[allow(clippy::too_many_arguments)]
pub fn audit(
    pool: sqlx::Pool<sqlx::Postgres>,
    user: Option<&AuthUser>,
    action: &str,
    categorie: &str,
    severite: &str,
    description: &str,
    details: Option<serde_json::Value>,
    entite: Option<(&str, Uuid)>,
) {
    let entry = AuditEntry {
        acteur_id: user.and_then(|u| uuid::Uuid::parse_str(&u.user_id).ok()),
        acteur_username: user.map(|u| u.username.clone()),
        acteur_role: user.map(|u| u.role.clone()),
        acteur_ip: None,
        action: action.to_string(),
        categorie: categorie.to_string(),
        severite: severite.to_string(),
        description: description.to_string(),
        details,
        entite_type: entite.map(|(t, _)| t.to_string()),
        entite_id: entite.map(|(_, id)| id),
    };

    tokio::spawn(async move {
        if let Err(e) = log_event(&pool, entry).await {
            tracing::error!("Erreur audit: {}", e);
        }
    });
}

/// Non-blocking audit for system events (no user context).
pub fn audit_system(
    pool: sqlx::Pool<sqlx::Postgres>,
    action: &str,
    categorie: &str,
    severite: &str,
    description: &str,
    details: Option<serde_json::Value>,
    entite: Option<(&str, Uuid)>,
) {
    audit(pool, None, action, categorie, severite, description, details, entite);
}

// ── Internal ───────────────────────────────────────────────────────

async fn update_integrity_status(pool: &PgPool, ok: bool) -> Result<(), VitaError> {
    sqlx::query(
        "UPDATE audit_integrity SET integrity_ok = $1, last_verified_at = NOW() WHERE id = 1",
    )
    .bind(ok)
    .execute(pool)
    .await?;
    Ok(())
}
