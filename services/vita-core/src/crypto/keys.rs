use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};
use ed25519_dalek::{SigningKey, VerifyingKey};
use rand::rngs::OsRng;
use sha2::{Digest, Sha256};

use crate::error::VitaError;

/// Ed25519 key pair for signing VITA transactions.
pub struct KeyPair {
    pub signing_key: SigningKey,
    pub verifying_key: VerifyingKey,
}

/// Generate a new random Ed25519 key pair.
pub fn generate_keypair() -> KeyPair {
    let signing_key = SigningKey::generate(&mut OsRng);
    let verifying_key = signing_key.verifying_key();
    KeyPair {
        signing_key,
        verifying_key,
    }
}

/// Create a key pair deterministically from a 32-byte seed.
pub fn keypair_from_seed(seed: &[u8; 32]) -> KeyPair {
    let signing_key = SigningKey::from_bytes(seed);
    let verifying_key = signing_key.verifying_key();
    KeyPair {
        signing_key,
        verifying_key,
    }
}

/// Encode a verifying (public) key as a hex string.
pub fn public_key_to_hex(key: &VerifyingKey) -> String {
    hex::encode(key.as_bytes())
}

/// Decode a verifying (public) key from a hex string.
pub fn public_key_from_hex(hex_str: &str) -> Result<VerifyingKey, VitaError> {
    let bytes = hex::decode(hex_str).map_err(|e| {
        VitaError::CryptoError(format!("Invalid hex for public key: {e}"))
    })?;
    let bytes: [u8; 32] = bytes.try_into().map_err(|_| {
        VitaError::CryptoError("Public key must be exactly 32 bytes".into())
    })?;
    VerifyingKey::from_bytes(&bytes).map_err(|e| {
        VitaError::CryptoError(format!("Invalid Ed25519 public key: {e}"))
    })
}

/// Serialize a key pair to its 32-byte secret seed.
pub fn serialize_keypair(keypair: &KeyPair) -> Vec<u8> {
    keypair.signing_key.to_bytes().to_vec()
}

/// Reconstruct a key pair from its 32-byte secret seed.
pub fn deserialize_keypair(bytes: &[u8]) -> Result<KeyPair, VitaError> {
    let seed: [u8; 32] = bytes.try_into().map_err(|_| {
        VitaError::CryptoError("Key seed must be exactly 32 bytes".into())
    })?;
    Ok(keypair_from_seed(&seed))
}

/// Encrypt a 32-byte private key seed using a password-derived key (HKDF + XOR).
///
/// This is a simplified prototype encryption. For production, use a proper
/// authenticated encryption scheme (e.g. AES-GCM with Argon2 KDF).
pub fn encrypt_private_key(seed: &[u8; 32], password: &str) -> String {
    let key = derive_key(password);
    let encrypted: Vec<u8> = seed.iter().zip(key.iter()).map(|(a, b)| a ^ b).collect();
    BASE64.encode(encrypted)
}

/// Decrypt a base64-encoded encrypted private key seed using the same password.
pub fn decrypt_private_key(encrypted_b64: &str, password: &str) -> Result<[u8; 32], VitaError> {
    let encrypted = BASE64.decode(encrypted_b64).map_err(|e| {
        VitaError::CryptoError(format!("Invalid base64 for encrypted key: {e}"))
    })?;
    if encrypted.len() != 32 {
        return Err(VitaError::CryptoError(
            "Encrypted key must be exactly 32 bytes".into(),
        ));
    }
    let key = derive_key(password);
    let mut seed = [0u8; 32];
    for (i, (a, b)) in encrypted.iter().zip(key.iter()).enumerate() {
        seed[i] = a ^ b;
    }
    Ok(seed)
}

/// Derive a 32-byte key from a password using HKDF-like construction (SHA-256).
fn derive_key(password: &str) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(b"vita-key-derivation-v1:");
    hasher.update(password.as_bytes());
    hasher.finalize().into()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn generate_keypair_produces_32_byte_public_key() {
        let kp = generate_keypair();
        assert_eq!(kp.verifying_key.as_bytes().len(), 32);
    }

    #[test]
    fn keypair_from_seed_is_deterministic() {
        let seed = [42u8; 32];
        let kp1 = keypair_from_seed(&seed);
        let kp2 = keypair_from_seed(&seed);
        assert_eq!(kp1.verifying_key, kp2.verifying_key);
        assert_eq!(kp1.signing_key.to_bytes(), kp2.signing_key.to_bytes());
    }

    #[test]
    fn serialize_deserialize_roundtrip() {
        let kp = generate_keypair();
        let bytes = serialize_keypair(&kp);
        assert_eq!(bytes.len(), 32);

        let restored = deserialize_keypair(&bytes).unwrap();
        assert_eq!(kp.verifying_key, restored.verifying_key);
        assert_eq!(kp.signing_key.to_bytes(), restored.signing_key.to_bytes());
    }

    #[test]
    fn public_key_hex_roundtrip() {
        let kp = generate_keypair();
        let hex_str = public_key_to_hex(&kp.verifying_key);
        assert_eq!(hex_str.len(), 64); // 32 bytes = 64 hex chars

        let restored = public_key_from_hex(&hex_str).unwrap();
        assert_eq!(kp.verifying_key, restored);
    }

    #[test]
    fn public_key_from_hex_rejects_invalid() {
        assert!(public_key_from_hex("not_hex").is_err());
        assert!(public_key_from_hex("aabb").is_err()); // too short
    }

    #[test]
    fn deserialize_keypair_rejects_wrong_length() {
        assert!(deserialize_keypair(&[0u8; 16]).is_err());
        assert!(deserialize_keypair(&[0u8; 64]).is_err());
    }

    #[test]
    fn encrypt_decrypt_roundtrip() {
        let kp = generate_keypair();
        let seed = kp.signing_key.to_bytes();
        let password = "my-secret-password";

        let encrypted = encrypt_private_key(&seed, password);
        let decrypted = decrypt_private_key(&encrypted, password).unwrap();
        assert_eq!(seed, decrypted);
    }

    #[test]
    fn wrong_password_produces_different_key() {
        let seed = [42u8; 32];
        let encrypted = encrypt_private_key(&seed, "correct");
        let decrypted = decrypt_private_key(&encrypted, "wrong").unwrap();
        assert_ne!(seed, decrypted);
    }
}
