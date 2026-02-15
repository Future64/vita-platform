//! Bulletproofs range proofs for VITA confidential transactions.
//!
//! A range proof proves that a committed value lies in `[0, 2^64)` — i.e.
//! the balance is non-negative — **without** revealing the actual amount.
//!
//! Combined with Pedersen commitments (see `commitments.rs`), this lets the
//! network verify that no VITA is created out of thin air during a transfer.
//!
//! All cryptography comes from the `bulletproofs` and `curve25519-dalek`
//! crates — no custom crypto.

use bulletproofs::{BulletproofGens, PedersenGens, RangeProof};
use curve25519_dalek::ristretto::CompressedRistretto;
use curve25519_dalek::scalar::Scalar;
use merlin::Transcript;

use crate::error::VitaError;

/// Bit-size of the range: proves `0 ≤ v < 2^64`.
const RANGE_BITS: usize = 64;

/// Domain separator for all VITA range-proof transcripts.
/// Must be identical between prover and verifier.
const TRANSCRIPT_LABEL: &[u8] = b"vita-range-proof";

/// Proof bundle for a single transfer: proves both the new sender balance
/// and the transferred amount are non-negative.
pub struct TransferProof {
    pub sender_new_balance_proof: RangeProof,
    pub sender_new_balance_commitment: CompressedRistretto,
    pub transfer_amount_proof: RangeProof,
    pub transfer_amount_commitment: CompressedRistretto,
}

/// Create a range proof that `0 ≤ amount < 2^64`.
///
/// Returns the proof **and** the Pedersen commitment produced during proving
/// (the commitment is bound to the same `amount` + `blinding`).
pub fn create_range_proof(
    amount: u64,
    blinding: &Scalar,
) -> Result<(RangeProof, CompressedRistretto), VitaError> {
    let bp_gens = BulletproofGens::new(RANGE_BITS, 1);
    let pc_gens = PedersenGens::default();
    let mut transcript = Transcript::new(TRANSCRIPT_LABEL);

    RangeProof::prove_single(
        &bp_gens,
        &pc_gens,
        &mut transcript,
        amount,
        blinding,
        RANGE_BITS,
    )
    .map_err(|e| VitaError::CryptoError(format!("Range proof creation failed: {e}")))
}

/// Verify that `commitment` hides a value in `[0, 2^64)`.
pub fn verify_range_proof(
    proof: &RangeProof,
    commitment: &CompressedRistretto,
) -> bool {
    let bp_gens = BulletproofGens::new(RANGE_BITS, 1);
    let pc_gens = PedersenGens::default();
    let mut transcript = Transcript::new(TRANSCRIPT_LABEL);

    proof
        .verify_single(&bp_gens, &pc_gens, &mut transcript, commitment, RANGE_BITS)
        .is_ok()
}

/// Build range proofs for a complete transfer:
///
/// 1. Proves the sender's **new** balance (`sender_balance − transfer_amount`) ≥ 0
/// 2. Proves the `transfer_amount` ≥ 0
///
/// Returns `Err(InsufficientBalance)` if `transfer_amount > sender_balance`
/// (the subtraction would underflow, meaning the balance would go negative).
pub fn create_transfer_proof(
    sender_balance: u64,
    transfer_amount: u64,
    sender_blinding: &Scalar,
    transfer_blinding: &Scalar,
) -> Result<TransferProof, VitaError> {
    let new_balance = sender_balance
        .checked_sub(transfer_amount)
        .ok_or(VitaError::InsufficientBalance)?;

    let (sender_new_balance_proof, sender_new_balance_commitment) =
        create_range_proof(new_balance, sender_blinding)?;

    let (transfer_amount_proof, transfer_amount_commitment) =
        create_range_proof(transfer_amount, transfer_blinding)?;

    Ok(TransferProof {
        sender_new_balance_proof,
        sender_new_balance_commitment,
        transfer_amount_proof,
        transfer_amount_commitment,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    // ── single range proof ──────────────────────────────────────────

    #[test]
    fn prove_and_verify_amount_100() {
        let blinding = Scalar::from(42u64);
        let (proof, commitment) = create_range_proof(100, &blinding).unwrap();

        assert!(verify_range_proof(&proof, &commitment));
    }

    #[test]
    fn prove_and_verify_amount_zero() {
        let blinding = Scalar::from(7u64);
        let (proof, commitment) = create_range_proof(0, &blinding).unwrap();

        assert!(verify_range_proof(&proof, &commitment));
    }

    #[test]
    fn verification_fails_with_wrong_commitment() {
        let blinding = Scalar::from(42u64);
        let (proof, _) = create_range_proof(100, &blinding).unwrap();

        // Create a different commitment (different amount, same blinding)
        let other_blinding = Scalar::from(42u64);
        let (_, wrong_commitment) = create_range_proof(999, &other_blinding).unwrap();

        assert!(!verify_range_proof(&proof, &wrong_commitment));
    }

    #[test]
    fn negative_amount_underflow_is_rejected() {
        // A "negative" balance can't exist as u64.
        // create_transfer_proof catches underflow via checked_sub.
        let blinding = Scalar::from(1u64);
        let result = create_transfer_proof(0, 1, &blinding, &blinding);

        assert!(result.is_err());
    }

    // ── transfer proofs ─────────────────────────────────────────────

    #[test]
    fn valid_transfer_30_from_100() {
        let sender_blinding = Scalar::from(111u64);
        let transfer_blinding = Scalar::from(222u64);

        let tp = create_transfer_proof(100, 30, &sender_blinding, &transfer_blinding)
            .expect("transfer proof should succeed");

        // New sender balance (70) proof is valid
        assert!(verify_range_proof(
            &tp.sender_new_balance_proof,
            &tp.sender_new_balance_commitment,
        ));

        // Transfer amount (30) proof is valid
        assert!(verify_range_proof(
            &tp.transfer_amount_proof,
            &tp.transfer_amount_commitment,
        ));
    }

    #[test]
    fn transfer_exceeding_balance_is_rejected() {
        let sender_blinding = Scalar::from(111u64);
        let transfer_blinding = Scalar::from(222u64);

        // Sender has 100 but tries to send 200 → should fail
        let result = create_transfer_proof(100, 200, &sender_blinding, &transfer_blinding);

        assert!(result.is_err());
    }

    #[test]
    fn transfer_entire_balance() {
        let sender_blinding = Scalar::from(10u64);
        let transfer_blinding = Scalar::from(20u64);

        // Sender sends their full balance (new balance = 0)
        let tp = create_transfer_proof(50, 50, &sender_blinding, &transfer_blinding)
            .expect("transferring entire balance should succeed");

        assert!(verify_range_proof(
            &tp.sender_new_balance_proof,
            &tp.sender_new_balance_commitment,
        ));
        assert!(verify_range_proof(
            &tp.transfer_amount_proof,
            &tp.transfer_amount_commitment,
        ));
    }

    #[test]
    fn transfer_zero_amount() {
        let sender_blinding = Scalar::from(33u64);
        let transfer_blinding = Scalar::from(44u64);

        // Sending 0 Ѵ is valid (no-op transfer)
        let tp = create_transfer_proof(100, 0, &sender_blinding, &transfer_blinding)
            .expect("zero transfer should succeed");

        assert!(verify_range_proof(
            &tp.sender_new_balance_proof,
            &tp.sender_new_balance_commitment,
        ));
        assert!(verify_range_proof(
            &tp.transfer_amount_proof,
            &tp.transfer_amount_commitment,
        ));
    }
}
