use chrono::Utc;
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};

use crate::error::VitaError;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    /// User ID (UUID as string)
    pub sub: String,
    /// User role
    pub role: String,
    /// Username
    pub username: String,
    /// Identity verification status
    pub verification_statut: String,
    /// Expiration (Unix timestamp)
    pub exp: usize,
    /// Issued at (Unix timestamp)
    pub iat: usize,
    /// Token type: "access" or "refresh"
    pub token_type: String,
}

/// Generate an access token (expires in `expiry_secs`, default 1 hour).
pub fn generate_access_token(
    user_id: &str,
    role: &str,
    username: &str,
    verification_statut: &str,
    secret: &str,
    expiry_secs: u64,
) -> Result<String, VitaError> {
    let now = Utc::now().timestamp() as usize;
    let claims = Claims {
        sub: user_id.to_string(),
        role: role.to_string(),
        username: username.to_string(),
        verification_statut: verification_statut.to_string(),
        exp: now + expiry_secs as usize,
        iat: now,
        token_type: "access".to_string(),
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|e| VitaError::Internal(format!("JWT encoding failed: {e}")))
}

/// Generate a refresh token (expires in `expiry_secs`, default 7 days).
pub fn generate_refresh_token(
    user_id: &str,
    role: &str,
    username: &str,
    verification_statut: &str,
    secret: &str,
    expiry_secs: u64,
) -> Result<String, VitaError> {
    let now = Utc::now().timestamp() as usize;
    let claims = Claims {
        sub: user_id.to_string(),
        role: role.to_string(),
        username: username.to_string(),
        verification_statut: verification_statut.to_string(),
        exp: now + expiry_secs as usize,
        iat: now,
        token_type: "refresh".to_string(),
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|e| VitaError::Internal(format!("JWT encoding failed: {e}")))
}

/// Validate a token and return its claims.
pub fn validate_token(token: &str, secret: &str) -> Result<Claims, VitaError> {
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )
    .map_err(|e| VitaError::Unauthorized(format!("Invalid token: {e}")))?;

    Ok(token_data.claims)
}
