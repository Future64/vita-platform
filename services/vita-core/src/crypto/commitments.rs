//! Pedersen commitments for hiding transaction amounts.
//!
//! A Pedersen commitment `C = v·B + r·B_blinding` hides value `v` behind a
//! random blinding factor `r`.  Thanks to the homomorphic property, the
//! network can verify that a transfer is balanced (no VITA created/destroyed)
//! **without** learning the actual amounts.
//!
//! This module uses the standard Ristretto generators provided by the
//! `bulletproofs` crate — no custom cryptography.

use bulletproofs::PedersenGens;
use curve25519_dalek::ristretto::CompressedRistretto;
use curve25519_dalek::scalar::Scalar;
use rand::rngs::OsRng;

use crate::error::VitaError;

/// A balance hidden behind a Pedersen commitment.
///
/// * `commitment` — the public Pedersen commitment (safe to store/share).
/// * `blinding`   — the SECRET blinding factor; only the balance owner knows it.
pub struct CommittedBalance {
    pub commitment: CompressedRistretto,
    pub blinding: Scalar,
}

/// Create a Pedersen commitment: `C = amount·B + blinding·B_blinding`.
///
/// Uses the standard generators from the `bulletproofs` crate.
pub fn commit_balance(amount: u64, blinding: &Scalar) -> CompressedRistretto {
    let pg = PedersenGens::default();
    pg.commit(Scalar::from(amount), *blinding).compress()
}

/// Verify the balance equation for a transfer:
///
/// ```text
///   sender_old − sender_new  ==  receiver_new − receiver_old
/// ```
///
/// If the committed amounts satisfy `a_old − a_new == b_new − b_old` **and**
/// the blinding factors satisfy the same relation, this returns `true`.
///
/// This is the core homomorphic property: amounts balance without being
/// revealed.
pub fn verify_balance_equation(
    sender_old: &CompressedRistretto,
    sender_new: &CompressedRistretto,
    receiver_old: &CompressedRistretto,
    receiver_new: &CompressedRistretto,
) -> bool {
    let (so, sn, ro, rn) = match (
        sender_old.decompress(),
        sender_new.decompress(),
        receiver_old.decompress(),
        receiver_new.decompress(),
    ) {
        (Some(a), Some(b), Some(c), Some(d)) => (a, b, c, d),
        _ => return false,
    };

    // sender_old - sender_new == receiver_new - receiver_old
    so - sn == rn - ro
}

// ── Blinding factor helpers ─────────────────────────────────────────

/// Generate a cryptographically random blinding factor.
pub fn generate_blinding_factor() -> Scalar {
    Scalar::random(&mut OsRng)
}

/// Encode a Scalar blinding factor as hex (32 bytes = 64 hex chars).
pub fn blinding_to_hex(s: &Scalar) -> String {
    hex::encode(s.as_bytes())
}

/// Decode a hex-encoded Scalar blinding factor.
pub fn blinding_from_hex(hex_str: &str) -> Result<Scalar, VitaError> {
    let bytes = hex::decode(hex_str).map_err(|e| {
        VitaError::CryptoError(format!("Invalid hex for blinding factor: {e}"))
    })?;
    let bytes: [u8; 32] = bytes.try_into().map_err(|_| {
        VitaError::CryptoError("Blinding factor must be exactly 32 bytes".into())
    })?;
    // Scalar::from_canonical_bytes returns an Option in dalek 4.x
    let opt = Scalar::from_canonical_bytes(bytes);
    if opt.is_some().into() {
        Ok(opt.unwrap())
    } else {
        // Fall back to from_bytes_mod_order for non-canonical scalars
        Ok(Scalar::from_bytes_mod_order(bytes))
    }
}

// ── Commitment hex helpers ─────────────────────────────────────────

/// Encode a CompressedRistretto commitment as hex.
pub fn commitment_to_hex(c: &CompressedRistretto) -> String {
    hex::encode(c.as_bytes())
}

/// Decode a CompressedRistretto commitment from hex.
pub fn commitment_from_hex(hex_str: &str) -> Result<CompressedRistretto, VitaError> {
    let bytes = hex::decode(hex_str).map_err(|e| {
        VitaError::CryptoError(format!("Invalid hex for commitment: {e}"))
    })?;
    let bytes: [u8; 32] = bytes.try_into().map_err(|_| {
        VitaError::CryptoError("Commitment must be exactly 32 bytes".into())
    })?;
    Ok(CompressedRistretto(bytes))
}

/// Verify that a given commitment matches the expected amount and blinding factor.
pub fn verify_commitment(
    commitment: &CompressedRistretto,
    amount: u64,
    blinding_factor: &Scalar,
) -> bool {
    let recomputed = commit_balance(amount, blinding_factor);
    *commitment == recomputed
}

/// Encrypt a blinding factor for a specific user using a simple XOR
/// with a key derived from the user's public key.
///
/// NOTE: Prototype encryption. Production should use ECIES or similar.
pub fn encrypt_blinding_factor(blinding: &Scalar, user_pubkey: &[u8]) -> String {
    use sha2::{Digest, Sha256};
    let mut hasher = Sha256::new();
    hasher.update(b"vita-blinding-encryption-v1:");
    hasher.update(user_pubkey);
    let key: [u8; 32] = hasher.finalize().into();

    let blinding_bytes = blinding.as_bytes();
    let encrypted: Vec<u8> = blinding_bytes
        .iter()
        .zip(key.iter())
        .map(|(a, b)| a ^ b)
        .collect();
    hex::encode(encrypted)
}

/// Decrypt a blinding factor encrypted with `encrypt_blinding_factor`.
pub fn decrypt_blinding_factor(
    encrypted_hex: &str,
    user_pubkey: &[u8],
) -> Result<Scalar, VitaError> {
    use sha2::{Digest, Sha256};
    let encrypted = hex::decode(encrypted_hex).map_err(|e| {
        VitaError::CryptoError(format!("Invalid hex for encrypted blinding factor: {e}"))
    })?;
    if encrypted.len() != 32 {
        return Err(VitaError::CryptoError(
            "Encrypted blinding factor must be exactly 32 bytes".into(),
        ));
    }

    let mut hasher = Sha256::new();
    hasher.update(b"vita-blinding-encryption-v1:");
    hasher.update(user_pubkey);
    let key: [u8; 32] = hasher.finalize().into();

    let mut decrypted = [0u8; 32];
    for (i, (a, b)) in encrypted.iter().zip(key.iter()).enumerate() {
        decrypted[i] = a ^ b;
    }

    Ok(Scalar::from_bytes_mod_order(decrypted))
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Helper: build a CommittedBalance from an amount and a u64 seed
    /// used as deterministic blinding factor.
    fn committed(amount: u64, blinding_seed: u64) -> CommittedBalance {
        let blinding = Scalar::from(blinding_seed);
        let commitment = commit_balance(amount, &blinding);
        CommittedBalance {
            commitment,
            blinding,
        }
    }

    // ── transfer equation tests ─────────────────────────────────────

    #[test]
    fn transfer_equation_holds_when_balanced() {
        // Sender: 100 → 70  (sends 30)
        // Receiver: 50 → 80  (receives 30)
        let r1 = Scalar::from(111u64);
        let r2 = Scalar::from(222u64);
        let r3 = Scalar::from(333u64);
        // r4 must satisfy: r1 - r2 == r4 - r3  →  r4 = r3 + r1 - r2
        let r4 = r3 + r1 - r2;

        let sender_old = commit_balance(100, &r1);
        let sender_new = commit_balance(70, &r2);
        let receiver_old = commit_balance(50, &r3);
        let receiver_new = commit_balance(80, &r4);

        assert!(verify_balance_equation(
            &sender_old,
            &sender_new,
            &receiver_old,
            &receiver_new,
        ));
    }

    #[test]
    fn equation_fails_when_amount_tampered() {
        let r1 = Scalar::from(10u64);
        let r2 = Scalar::from(20u64);
        let r3 = Scalar::from(30u64);
        let r4 = r3 + r1 - r2;

        let sender_old = commit_balance(100, &r1);
        // Wrong: sender claims new balance is 75 instead of 70 (steals 5 Ѵ)
        let sender_new = commit_balance(75, &r2);
        let receiver_old = commit_balance(50, &r3);
        let receiver_new = commit_balance(80, &r4);

        assert!(!verify_balance_equation(
            &sender_old,
            &sender_new,
            &receiver_old,
            &receiver_new,
        ));
    }

    #[test]
    fn equation_fails_when_blinding_not_balanced() {
        let r1 = Scalar::from(10u64);
        let r2 = Scalar::from(20u64);
        let r3 = Scalar::from(30u64);
        // Use an unrelated r4 instead of the balanced one
        let r4_wrong = Scalar::from(999u64);

        let sender_old = commit_balance(100, &r1);
        let sender_new = commit_balance(70, &r2);
        let receiver_old = commit_balance(50, &r3);
        let receiver_new = commit_balance(80, &r4_wrong);

        assert!(!verify_balance_equation(
            &sender_old,
            &sender_new,
            &receiver_old,
            &receiver_new,
        ));
    }

    #[test]
    fn transfer_with_zero_amounts() {
        // Edge case: transfer 0 Ѵ — both balances unchanged
        let r1 = Scalar::from(42u64);
        let r2 = Scalar::from(42u64); // same blinding → blinding diff = 0
        let r3 = Scalar::from(99u64);
        let r4 = Scalar::from(99u64); // same blinding → blinding diff = 0

        let sender_old = commit_balance(100, &r1);
        let sender_new = commit_balance(100, &r2);
        let receiver_old = commit_balance(0, &r3);
        let receiver_new = commit_balance(0, &r4);

        assert!(verify_balance_equation(
            &sender_old,
            &sender_new,
            &receiver_old,
            &receiver_new,
        ));
    }

    #[test]
    fn zero_balance_commitments_are_valid() {
        let cb = committed(0, 77);
        // A commitment to 0 should still be a valid Ristretto point
        assert!(cb.commitment.decompress().is_some());
    }

    // ── committed balance struct tests ──────────────────────────────

    #[test]
    fn committed_balance_stores_blinding() {
        let cb = committed(100, 42);
        assert_eq!(cb.blinding, Scalar::from(42u64));
        assert!(cb.commitment.decompress().is_some());
    }

    #[test]
    fn different_blindings_produce_different_commitments() {
        let c1 = commit_balance(100, &Scalar::from(1u64));
        let c2 = commit_balance(100, &Scalar::from(2u64));
        assert_ne!(c1, c2);
    }

    #[test]
    fn same_inputs_produce_same_commitment() {
        let blinding = Scalar::from(55u64);
        let c1 = commit_balance(42, &blinding);
        let c2 = commit_balance(42, &blinding);
        assert_eq!(c1, c2);
    }

    // ── hex roundtrip tests ──────────────────────────────────────────

    #[test]
    fn commitment_hex_roundtrip() {
        let blinding = Scalar::from(42u64);
        let c = commit_balance(100, &blinding);
        let hex_str = commitment_to_hex(&c);
        assert_eq!(hex_str.len(), 64); // 32 bytes = 64 hex chars
        let restored = commitment_from_hex(&hex_str).unwrap();
        assert_eq!(c, restored);
    }

    #[test]
    fn blinding_hex_roundtrip() {
        let b = Scalar::from(12345u64);
        let hex_str = blinding_to_hex(&b);
        assert_eq!(hex_str.len(), 64);
        let restored = blinding_from_hex(&hex_str).unwrap();
        assert_eq!(b, restored);
    }

    #[test]
    fn verify_commitment_correct() {
        let blinding = Scalar::from(77u64);
        let c = commit_balance(500, &blinding);
        assert!(verify_commitment(&c, 500, &blinding));
    }

    #[test]
    fn verify_commitment_wrong_amount() {
        let blinding = Scalar::from(77u64);
        let c = commit_balance(500, &blinding);
        assert!(!verify_commitment(&c, 501, &blinding));
    }

    #[test]
    fn encrypt_decrypt_blinding_roundtrip() {
        let blinding = Scalar::from(999u64);
        let pubkey = b"fake-public-key-32-bytes-padding";
        let encrypted = encrypt_blinding_factor(&blinding, pubkey);
        let decrypted = decrypt_blinding_factor(&encrypted, pubkey).unwrap();
        assert_eq!(blinding, decrypted);
    }

    #[test]
    fn generate_blinding_is_random() {
        let b1 = generate_blinding_factor();
        let b2 = generate_blinding_factor();
        assert_ne!(b1, b2);
    }
}
