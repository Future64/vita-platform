use actix_web::{web, HttpResponse};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::VitaError;
use crate::monetary::Account;

// ── request / response types ────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct CreateAccountRequest {
    pub display_name: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct CreateAccountResponse {
    pub id: Uuid,
    pub public_key: String,
    pub display_name: Option<String>,
    pub balance: Decimal,
    pub created_at: String,
}

#[derive(Debug, Serialize)]
pub struct AccountInfoResponse {
    pub id: Uuid,
    pub display_name: Option<String>,
    pub balance: Decimal,
    pub verified: bool,
    pub total_received: Decimal,
    pub created_at: String,
}

// ── handlers ────────────────────────────────────────────────────────

/// POST /api/v1/accounts — Create a new account.
///
/// For the prototype, we generate a random 32-byte "public key" server-side.
/// In production this will be replaced by client-side Ed25519 key generation.
pub async fn create_account(
    pool: web::Data<PgPool>,
    body: web::Json<CreateAccountRequest>,
) -> Result<HttpResponse, VitaError> {
    // Generate a random 32-byte key (prototype placeholder for Ed25519)
    let mut fake_pubkey = [0u8; 32];
    use rand::RngCore;
    rand::thread_rng().fill_bytes(&mut fake_pubkey);

    let account = sqlx::query_as::<_, Account>(
        r#"INSERT INTO accounts (public_key, display_name)
           VALUES ($1, $2)
           RETURNING id, public_key, created_at, verified,
                     last_emission_at, balance, total_received, display_name"#,
    )
    .bind(fake_pubkey.to_vec())
    .bind(&body.display_name)
    .fetch_one(pool.get_ref())
    .await?;

    Ok(HttpResponse::Created().json(CreateAccountResponse {
        id: account.id,
        public_key: hex::encode(&account.public_key),
        display_name: account.display_name,
        balance: account.balance,
        created_at: account.created_at.to_rfc3339(),
    }))
}

/// GET /api/v1/accounts/{id} — Get account info.
pub async fn get_account(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, VitaError> {
    let account_id = path.into_inner();

    let account = sqlx::query_as::<_, Account>(
        r#"SELECT id, public_key, created_at, verified,
                  last_emission_at, balance, total_received, display_name
           FROM accounts WHERE id = $1"#,
    )
    .bind(account_id)
    .fetch_optional(pool.get_ref())
    .await?
    .ok_or_else(|| VitaError::NotFound(format!("Account {account_id}")))?;

    Ok(HttpResponse::Ok().json(AccountInfoResponse {
        id: account.id,
        display_name: account.display_name,
        balance: account.balance,
        verified: account.verified,
        total_received: account.total_received,
        created_at: account.created_at.to_rfc3339(),
    }))
}

/// POST /api/v1/accounts/{id}/verify — Mark an account as verified (prototype).
///
/// In production this will be replaced by zero-knowledge proof of identity.
pub async fn verify_account(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, VitaError> {
    let account_id = path.into_inner();

    let result = sqlx::query(
        "UPDATE accounts SET verified = true WHERE id = $1",
    )
    .bind(account_id)
    .execute(pool.get_ref())
    .await?;

    if result.rows_affected() == 0 {
        return Err(VitaError::NotFound(format!("Account {account_id}")));
    }

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "id": account_id,
        "verified": true,
        "message": "Account verified (prototype — will use zk-PoI in production)"
    })))
}
