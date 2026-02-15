use actix_web::{web, HttpResponse};
use rust_decimal::Decimal;
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::config::SystemParams;
use crate::crypto::keys::public_key_from_hex;
use crate::crypto::signatures::signature_from_hex;
use crate::error::VitaError;
use crate::transaction::transfer;

// ── request types ───────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct TransferBody {
    pub from_id: Uuid,
    pub to_id: Uuid,
    pub amount: Decimal,
    pub note: Option<String>,
    /// Optional hex-encoded Ed25519 signature. When present, the server
    /// verifies it against the sender's public key before executing the transfer.
    pub signature: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct HistoryQuery {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

// ── handlers ────────────────────────────────────────────────────────

/// POST /api/v1/transactions/transfer — Execute a Ѵ transfer.
///
/// When an optional `signature` field (hex-encoded Ed25519) is provided,
/// the server verifies it against the sender's stored public key before
/// executing the transfer. If absent, the transfer proceeds without
/// signature verification (prototype compatibility).
pub async fn create_transfer(
    pool: web::Data<PgPool>,
    params: web::Data<SystemParams>,
    body: web::Json<TransferBody>,
) -> Result<HttpResponse, VitaError> {
    // ── optional signature verification ──────────────────────────
    if let Some(ref sig_hex) = body.signature {
        // Build canonical JSON bytes for the signed payload
        let canonical = serde_json::json!({
            "from_id": body.from_id,
            "to_id": body.to_id,
            "amount": body.amount.to_string(),
            "note": body.note,
        });
        let data = serde_json::to_vec(&canonical)
            .map_err(|e| VitaError::Internal(format!("Serialization error: {e}")))?;

        // Decode the hex signature
        let signature = signature_from_hex(sig_hex)?;

        // Look up sender's public key from the database
        let row: (Vec<u8>,) = sqlx::query_as(
            "SELECT public_key FROM accounts WHERE id = $1",
        )
        .bind(body.from_id)
        .fetch_optional(pool.get_ref())
        .await?
        .ok_or_else(|| VitaError::NotFound(format!("Account {}", body.from_id)))?;

        let pub_key_hex = hex::encode(&row.0);
        let verifying_key = public_key_from_hex(&pub_key_hex)?;

        // Verify
        use ed25519_dalek::Verifier;
        verifying_key
            .verify(&data, &signature)
            .map_err(|_| VitaError::InvalidSignature(
                "Signature does not match sender's public key".into(),
            ))?;
    }

    // ── execute transfer ─────────────────────────────────────────
    let req = transfer::TransferRequest {
        from_id: body.from_id,
        to_id: body.to_id,
        amount: body.amount,
        note: body.note.clone(),
    };

    let common_fund_rate = params.configurable.common_pot_rate;
    let result = transfer::execute_transfer(pool.get_ref(), req, common_fund_rate).await?;

    Ok(HttpResponse::Ok().json(result))
}

/// GET /api/v1/transactions/{account_id} — Transaction history for an account.
pub async fn get_transaction_history(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
    query: web::Query<HistoryQuery>,
) -> Result<HttpResponse, VitaError> {
    let account_id = path.into_inner();
    let limit = query.limit.unwrap_or(20).min(100);
    let offset = query.offset.unwrap_or(0).max(0);

    let rows = transfer::get_transaction_history(pool.get_ref(), account_id, limit, offset).await?;

    Ok(HttpResponse::Ok().json(rows))
}
