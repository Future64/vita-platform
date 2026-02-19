use actix_web::{web, HttpResponse};
use rust_decimal::Decimal;
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::audit;
use crate::auth::middleware::AuthUser;
use crate::config::SystemParams;
use crate::crypto::commitments;
use crate::crypto::keys::public_key_from_hex;
use crate::crypto::range_proofs;
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

#[derive(Debug, Deserialize)]
pub struct ConfidentialTransferBody {
    pub from_id: Uuid,
    pub to_id: Uuid,
    pub amount: String,
    pub note: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct VerifyCommitmentBody {
    pub amount: String,
    pub blinding_factor: String,
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
    user: AuthUser,
    body: web::Json<TransferBody>,
) -> Result<HttpResponse, VitaError> {
    // Verify the user owns the sender account
    let user_id = uuid::Uuid::parse_str(&user.user_id)
        .map_err(|_| VitaError::Internal("Invalid user ID in token".into()))?;
    let owns: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM accounts WHERE id = $1 AND user_id = $2)",
    )
    .bind(body.from_id)
    .bind(user_id)
    .fetch_one(pool.get_ref())
    .await?;

    if !owns {
        return Err(VitaError::Forbidden("Ce compte ne vous appartient pas".into()));
    }

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

    audit::audit(
        pool.get_ref().clone(),
        Some(&user),
        "transaction.transfer",
        "transaction",
        "info",
        &format!("Transfert de {} V de {} vers {}", body.amount, body.from_id, body.to_id),
        Some(serde_json::json!({
            "amount": body.amount.to_string(),
            "from_id": body.from_id,
            "to_id": body.to_id,
        })),
        Some(("transaction", result.transaction_id)),
    );

    Ok(HttpResponse::Ok().json(result))
}

/// GET /api/v1/transactions/{account_id} — Transaction history for an account.
pub async fn get_transaction_history(
    pool: web::Data<PgPool>,
    user: AuthUser,
    path: web::Path<Uuid>,
    query: web::Query<HistoryQuery>,
) -> Result<HttpResponse, VitaError> {
    let account_id = path.into_inner();

    // Verify the user owns this account
    let user_id = uuid::Uuid::parse_str(&user.user_id)
        .map_err(|_| VitaError::Internal("Invalid user ID in token".into()))?;
    let owns: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM accounts WHERE id = $1 AND user_id = $2)",
    )
    .bind(account_id)
    .bind(user_id)
    .fetch_one(pool.get_ref())
    .await?;

    if !owns {
        return Err(VitaError::Forbidden("Ce compte ne vous appartient pas".into()));
    }

    let limit = query.limit.unwrap_or(20).min(100);
    let offset = query.offset.unwrap_or(0).max(0);

    let rows = transfer::get_transaction_history(pool.get_ref(), account_id, limit, offset).await?;

    Ok(HttpResponse::Ok().json(rows))
}

// ── Confidential transactions ──────────────────────────────────────

/// POST /api/v1/transactions/transfer-confidentiel — Execute a confidential transfer.
///
/// The transfer is executed normally (balances updated), but the amount is also
/// hidden in a Pedersen commitment with a range proof. The blinding factor is
/// encrypted for both sender and receiver.
///
/// NOTE: In this prototype, the server knows the amount. In production, the
/// commitment would be created client-side and the server would never see
/// the plaintext amount.
pub async fn create_confidential_transfer(
    pool: web::Data<PgPool>,
    params: web::Data<SystemParams>,
    user: AuthUser,
    body: web::Json<ConfidentialTransferBody>,
) -> Result<HttpResponse, VitaError> {
    // Parse amount
    let amount: Decimal = body.amount.parse().map_err(|_| {
        VitaError::BadRequest("Montant invalide".into())
    })?;

    // Verify the user owns the sender account
    let user_id = uuid::Uuid::parse_str(&user.user_id)
        .map_err(|_| VitaError::Internal("Invalid user ID in token".into()))?;
    let owns: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM accounts WHERE id = $1 AND user_id = $2)",
    )
    .bind(body.from_id)
    .bind(user_id)
    .fetch_one(pool.get_ref())
    .await?;

    if !owns {
        return Err(VitaError::Forbidden("Ce compte ne vous appartient pas".into()));
    }

    // Convert amount to centièmes (u64) for the commitment
    // 1 Ѵ = 100_000_000 centièmes (8 decimal places)
    let amount_u64 = decimal_to_u64(amount)?;

    // Generate blinding factor
    let blinding = commitments::generate_blinding_factor();

    // Create commitment and range proof
    let (range_proof, commitment) = range_proofs::create_range_proof(amount_u64, &blinding)?;

    let commitment_hex = commitments::commitment_to_hex(&commitment);
    let range_proof_hex = range_proofs::range_proof_to_hex(&range_proof);

    // Execute the normal transfer
    let req = transfer::TransferRequest {
        from_id: body.from_id,
        to_id: body.to_id,
        amount,
        note: body.note.clone(),
    };

    let common_fund_rate = params.configurable.common_pot_rate;
    let result = transfer::execute_transfer(pool.get_ref(), req, common_fund_rate).await?;

    // Update the transaction with confidential fields
    sqlx::query(
        "UPDATE transactions SET commitment = $1, range_proof = $2, confidentiel = true WHERE id = $3",
    )
    .bind(&commitment_hex)
    .bind(&range_proof_hex)
    .bind(result.transaction_id)
    .execute(pool.get_ref())
    .await?;

    // Store encrypted blinding factors for sender and receiver
    let sender_pubkey: Vec<u8> = sqlx::query_scalar(
        "SELECT public_key FROM accounts WHERE id = $1",
    )
    .bind(body.from_id)
    .fetch_one(pool.get_ref())
    .await?;

    let receiver_user_id: Option<Uuid> = sqlx::query_scalar(
        "SELECT user_id FROM accounts WHERE id = $1",
    )
    .bind(body.to_id)
    .fetch_optional(pool.get_ref())
    .await?;

    let receiver_pubkey: Vec<u8> = sqlx::query_scalar(
        "SELECT public_key FROM accounts WHERE id = $1",
    )
    .bind(body.to_id)
    .fetch_one(pool.get_ref())
    .await?;

    // Encrypt blinding factor for sender
    let sender_enc = commitments::encrypt_blinding_factor(&blinding, &sender_pubkey);
    sqlx::query(
        "INSERT INTO blinding_factors (transaction_id, user_id, encrypted_factor) VALUES ($1, $2, $3)",
    )
    .bind(result.transaction_id)
    .bind(user_id)
    .bind(&sender_enc)
    .execute(pool.get_ref())
    .await?;

    // Encrypt blinding factor for receiver
    if let Some(recv_uid) = receiver_user_id {
        let receiver_enc = commitments::encrypt_blinding_factor(&blinding, &receiver_pubkey);
        sqlx::query(
            "INSERT INTO blinding_factors (transaction_id, user_id, encrypted_factor) VALUES ($1, $2, $3)",
        )
        .bind(result.transaction_id)
        .bind(recv_uid)
        .bind(&receiver_enc)
        .execute(pool.get_ref())
        .await?;
    }

    audit::audit(
        pool.get_ref().clone(),
        Some(&user),
        "transaction.transfer_confidentiel",
        "transaction",
        "info",
        &format!("Transfert confidentiel de {} vers {}", body.from_id, body.to_id),
        Some(serde_json::json!({
            "from_id": body.from_id,
            "to_id": body.to_id,
            "confidentiel": true,
        })),
        Some(("transaction", result.transaction_id)),
    );

    // Return response WITHOUT the amount (confidential!)
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "transaction_id": result.transaction_id,
        "commitment": commitment_hex,
        "confidentiel": true,
        "common_fund_contribution": result.common_fund_contribution.to_string(),
        "timestamp": result.timestamp,
    })))
}

/// GET /api/v1/transactions/{id}/commitment — Get the commitment for a transaction.
pub async fn get_commitment(
    pool: web::Data<PgPool>,
    _user: AuthUser,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, VitaError> {
    let tx_id = path.into_inner();

    let row: Option<CommitmentRow> = sqlx::query_as(
        "SELECT commitment, range_proof, confidentiel FROM transactions WHERE id = $1",
    )
    .bind(tx_id)
    .fetch_optional(pool.get_ref())
    .await?;

    let row = row.ok_or_else(|| VitaError::NotFound(format!("Transaction {tx_id}")))?;

    if !row.confidentiel.unwrap_or(false) {
        return Ok(HttpResponse::Ok().json(serde_json::json!({
            "tx_id": tx_id,
            "confidentiel": false,
            "message": "Cette transaction n'est pas confidentielle"
        })));
    }

    // Verify the range proof if present
    let range_proof_valid = if let (Some(ref c_hex), Some(ref rp_hex)) = (&row.commitment, &row.range_proof) {
        let commitment = commitments::commitment_from_hex(c_hex)?;
        match range_proofs::range_proof_from_hex(rp_hex) {
            Ok(proof) => range_proofs::verify_range_proof(&proof, &commitment),
            Err(_) => false,
        }
    } else {
        false
    };

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "tx_id": tx_id,
        "confidentiel": true,
        "commitment": row.commitment,
        "range_proof": row.range_proof,
        "range_proof_valid": range_proof_valid,
    })))
}

/// POST /api/v1/transactions/{id}/verify-commitment — Verify a commitment.
///
/// The user provides the amount and blinding factor, and the server verifies
/// that they match the stored commitment. Only the sender or receiver can do this.
pub async fn verify_commitment(
    pool: web::Data<PgPool>,
    user: AuthUser,
    path: web::Path<Uuid>,
    body: web::Json<VerifyCommitmentBody>,
) -> Result<HttpResponse, VitaError> {
    let tx_id = path.into_inner();
    let user_id = uuid::Uuid::parse_str(&user.user_id)
        .map_err(|_| VitaError::Internal("Invalid user ID in token".into()))?;

    // Check user is sender or receiver
    let is_party: bool = sqlx::query_scalar(
        r#"SELECT EXISTS(
            SELECT 1 FROM transactions t
            JOIN accounts a ON a.id = t.from_account_id OR a.id = t.to_account_id
            WHERE t.id = $1 AND a.user_id = $2
        )"#,
    )
    .bind(tx_id)
    .bind(user_id)
    .fetch_one(pool.get_ref())
    .await?;

    if !is_party {
        return Err(VitaError::Forbidden(
            "Seul l'expediteur ou le destinataire peut verifier ce commitment".into(),
        ));
    }

    // Get commitment
    let commitment_hex: Option<String> = sqlx::query_scalar(
        "SELECT commitment FROM transactions WHERE id = $1 AND confidentiel = true",
    )
    .bind(tx_id)
    .fetch_optional(pool.get_ref())
    .await?
    .flatten();

    let commitment_hex = commitment_hex.ok_or_else(|| {
        VitaError::NotFound("Pas de commitment confidentiel pour cette transaction".into())
    })?;

    // Parse user inputs
    let amount: Decimal = body.amount.parse().map_err(|_| {
        VitaError::BadRequest("Montant invalide".into())
    })?;
    let amount_u64 = decimal_to_u64(amount)?;

    let blinding = commitments::blinding_from_hex(&body.blinding_factor)?;
    let commitment = commitments::commitment_from_hex(&commitment_hex)?;

    let valid = commitments::verify_commitment(&commitment, amount_u64, &blinding);

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "tx_id": tx_id,
        "valid": valid,
    })))
}

/// GET /api/v1/transactions/{id}/blinding-factor — Get encrypted blinding factor.
///
/// Returns the blinding factor encrypted for the current user. Only works
/// if the user is the sender or receiver of the transaction.
pub async fn get_blinding_factor(
    pool: web::Data<PgPool>,
    user: AuthUser,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, VitaError> {
    let tx_id = path.into_inner();
    let user_id = uuid::Uuid::parse_str(&user.user_id)
        .map_err(|_| VitaError::Internal("Invalid user ID in token".into()))?;

    let encrypted: Option<String> = sqlx::query_scalar(
        "SELECT encrypted_factor FROM blinding_factors WHERE transaction_id = $1 AND user_id = $2",
    )
    .bind(tx_id)
    .bind(user_id)
    .fetch_optional(pool.get_ref())
    .await?;

    let encrypted = encrypted.ok_or_else(|| {
        VitaError::NotFound(
            "Pas de blinding factor disponible pour cette transaction".into(),
        )
    })?;

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "tx_id": tx_id,
        "encrypted_blinding_factor": encrypted,
    })))
}

// ── Helpers ────────────────────────────────────────────────────────

/// Convert a Decimal amount (up to 8 decimal places) to u64 centièmes.
/// 1 Ѵ = 100_000_000 centièmes.
fn decimal_to_u64(amount: Decimal) -> Result<u64, VitaError> {
    let multiplier = Decimal::new(100_000_000, 0);
    let centimes = amount * multiplier;
    let centimes_str = centimes.to_string();
    // Remove any decimal part (should be .0 or nothing)
    let int_str = centimes_str.split('.').next().unwrap_or(&centimes_str);
    int_str.parse::<u64>().map_err(|_| {
        VitaError::BadRequest("Montant trop grand ou invalide pour la conversion".into())
    })
}

#[derive(Debug, sqlx::FromRow)]
struct CommitmentRow {
    commitment: Option<String>,
    range_proof: Option<String>,
    confidentiel: Option<bool>,
}
