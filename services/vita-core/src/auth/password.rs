use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};

use crate::error::VitaError;

/// Hash a password using Argon2id with default parameters.
/// Returns the hash in PHC string format.
pub fn hash_password(password: &str) -> Result<String, VitaError> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let hash = argon2
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| VitaError::Internal(format!("Password hashing failed: {e}")))?;
    Ok(hash.to_string())
}

/// Verify a password against an Argon2 hash.
pub fn verify_password(password: &str, hash: &str) -> Result<bool, VitaError> {
    let parsed = PasswordHash::new(hash)
        .map_err(|e| VitaError::Internal(format!("Invalid password hash: {e}")))?;
    Ok(Argon2::default()
        .verify_password(password.as_bytes(), &parsed)
        .is_ok())
}
