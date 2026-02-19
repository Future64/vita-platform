use chrono::{DateTime, Utc};
use ed25519_dalek::{Signature, Signer, Verifier, VerifyingKey};
use rust_decimal::Decimal;
use sha2::{Digest, Sha256};
use uuid::Uuid;

use crate::error::VitaError;
use super::keys::KeyPair;

/// A transaction payload with its Ed25519 signature and the signer's public key.
pub struct SignedTransaction {
    pub transaction_data: Vec<u8>,
    pub signature: Signature,
    pub public_key: VerifyingKey,
}

/// Sign arbitrary transaction data with a key pair.
pub fn sign_transaction(data: &[u8], keypair: &KeyPair) -> SignedTransaction {
    let signature = keypair.signing_key.sign(data);
    SignedTransaction {
        transaction_data: data.to_vec(),
        signature,
        public_key: keypair.verifying_key,
    }
}

/// Verify a signed transaction.
///
/// Returns `Ok(true)` if the signature is valid, `Ok(false)` if it is invalid.
/// Returns `Err` only on malformed input (should not happen with well-formed types).
pub fn verify_signature(signed: &SignedTransaction) -> Result<bool, VitaError> {
    match signed.public_key.verify(&signed.transaction_data, &signed.signature) {
        Ok(()) => Ok(true),
        Err(_) => Ok(false),
    }
}

/// Compute a SHA-256 hash of transaction data.
pub fn transaction_hash(data: &[u8]) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(data);
    hasher.finalize().into()
}

/// Decode a hex-encoded Ed25519 signature (64 bytes = 128 hex chars).
pub fn signature_from_hex(hex_str: &str) -> Result<Signature, VitaError> {
    let bytes = hex::decode(hex_str).map_err(|e| {
        VitaError::InvalidSignature(format!("Invalid hex: {e}"))
    })?;
    let bytes: [u8; 64] = bytes.try_into().map_err(|_| {
        VitaError::InvalidSignature("Signature must be exactly 64 bytes".into())
    })?;
    Ok(Signature::from_bytes(&bytes))
}

/// Encode an Ed25519 signature as a hex string.
pub fn signature_to_hex(sig: &Signature) -> String {
    hex::encode(sig.to_bytes())
}

// ── Transaction payload signing ─────────────────────────────────────

/// Deterministic payload for signing a VITA transaction.
pub struct TransactionPayload {
    pub from_id: Uuid,
    pub to_id: Uuid,
    pub amount: Decimal,
    pub timestamp: DateTime<Utc>,
    pub nonce: Uuid,
}

/// Build the canonical byte string for a transaction payload.
///
/// Format: `"{from}|{to}|{amount}|{timestamp_rfc3339}|{nonce}"`
/// This deterministic format ensures the same payload always produces
/// the same bytes, regardless of serialisation order.
pub fn build_payload(payload: &TransactionPayload) -> Vec<u8> {
    format!(
        "{}|{}|{}|{}|{}",
        payload.from_id,
        payload.to_id,
        payload.amount,
        payload.timestamp.to_rfc3339(),
        payload.nonce,
    )
    .into_bytes()
}

/// Compute the SHA-256 hash of a transaction payload, returned as hex.
pub fn hash_payload(payload: &TransactionPayload) -> String {
    let data = build_payload(payload);
    let hash = transaction_hash(&data);
    hex::encode(hash)
}

/// Sign a transaction payload with a key pair.
/// Returns (signature_hex, payload_hash_hex, signer_pubkey_hex).
pub fn sign_payload(
    payload: &TransactionPayload,
    keypair: &KeyPair,
) -> (String, String, String) {
    let data = build_payload(payload);
    let hash_hex = hex::encode(transaction_hash(&data));
    let signature = keypair.signing_key.sign(&data);
    let sig_hex = signature_to_hex(&signature);
    let pubkey_hex = hex::encode(keypair.verifying_key.as_bytes());
    (sig_hex, hash_hex, pubkey_hex)
}

/// Verify a transaction signature given the payload, hex signature, and hex public key.
pub fn verify_payload_signature(
    payload: &TransactionPayload,
    sig_hex: &str,
    pubkey_hex: &str,
) -> Result<bool, VitaError> {
    let data = build_payload(payload);
    let signature = signature_from_hex(sig_hex)?;
    let pubkey = crate::crypto::keys::public_key_from_hex(pubkey_hex)?;
    match pubkey.verify(&data, &signature) {
        Ok(()) => Ok(true),
        Err(_) => Ok(false),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::crypto::keys::{generate_keypair, keypair_from_seed};

    #[test]
    fn sign_and_verify_succeeds() {
        let kp = generate_keypair();
        let data = b"transfer 10 VITA from alice to bob";
        let signed = sign_transaction(data, &kp);

        assert!(verify_signature(&signed).unwrap());
    }

    #[test]
    fn modified_data_fails_verification() {
        let kp = generate_keypair();
        let data = b"transfer 10 VITA";
        let mut signed = sign_transaction(data, &kp);

        // Tamper with the data
        signed.transaction_data = b"transfer 999 VITA".to_vec();
        assert!(!verify_signature(&signed).unwrap());
    }

    #[test]
    fn wrong_public_key_fails_verification() {
        let kp1 = generate_keypair();
        let kp2 = generate_keypair();
        let data = b"some transaction data";
        let mut signed = sign_transaction(data, &kp1);

        // Replace public key with a different one
        signed.public_key = kp2.verifying_key;
        assert!(!verify_signature(&signed).unwrap());
    }

    #[test]
    fn transaction_hash_is_32_bytes() {
        let hash = transaction_hash(b"hello vita");
        assert_eq!(hash.len(), 32);
    }

    #[test]
    fn transaction_hash_is_deterministic() {
        let h1 = transaction_hash(b"same input");
        let h2 = transaction_hash(b"same input");
        assert_eq!(h1, h2);
    }

    #[test]
    fn transaction_hash_differs_for_different_input() {
        let h1 = transaction_hash(b"input A");
        let h2 = transaction_hash(b"input B");
        assert_ne!(h1, h2);
    }

    #[test]
    fn signature_hex_roundtrip() {
        let kp = keypair_from_seed(&[7u8; 32]);
        let signed = sign_transaction(b"test", &kp);
        let hex_str = signature_to_hex(&signed.signature);
        assert_eq!(hex_str.len(), 128); // 64 bytes = 128 hex chars

        let restored = signature_from_hex(&hex_str).unwrap();
        assert_eq!(signed.signature, restored);
    }

    #[test]
    fn signature_from_hex_rejects_invalid() {
        assert!(signature_from_hex("not_hex").is_err());
        assert!(signature_from_hex("aabb").is_err()); // too short
    }

    #[test]
    fn payload_sign_and_verify() {
        let kp = generate_keypair();
        let payload = TransactionPayload {
            from_id: Uuid::new_v4(),
            to_id: Uuid::new_v4(),
            amount: Decimal::new(100, 0),
            timestamp: Utc::now(),
            nonce: Uuid::new_v4(),
        };

        let (sig_hex, _hash_hex, pubkey_hex) = sign_payload(&payload, &kp);
        assert!(verify_payload_signature(&payload, &sig_hex, &pubkey_hex).unwrap());
    }

    #[test]
    fn payload_hash_is_deterministic() {
        let payload = TransactionPayload {
            from_id: Uuid::nil(),
            to_id: Uuid::nil(),
            amount: Decimal::new(50, 0),
            timestamp: chrono::DateTime::parse_from_rfc3339("2025-06-01T12:00:00Z")
                .unwrap()
                .with_timezone(&Utc),
            nonce: Uuid::nil(),
        };
        let h1 = hash_payload(&payload);
        let h2 = hash_payload(&payload);
        assert_eq!(h1, h2);
        assert_eq!(h1.len(), 64); // SHA-256 = 32 bytes = 64 hex chars
    }
}
