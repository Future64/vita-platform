use ed25519_dalek::{SigningKey, VerifyingKey};
use rand::rngs::OsRng;

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
}
