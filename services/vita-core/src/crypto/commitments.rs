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
}
