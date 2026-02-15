use chrono::Utc;
use rust_decimal::Decimal;
use serde::Serialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::VitaError;
use crate::monetary::Account;

/// Minimum account age (days) before credit is available.
const MIN_ACCOUNT_AGE_DAYS: i64 = 30;

/// Absolute ceiling: 180 Ѵ (≈ 6 months of daily emission).
const MAX_CREDIT_LIMIT: i64 = 180;

/// Result of an eligibility check.
#[derive(Debug, Clone, Serialize)]
pub struct CreditEligibility {
    pub eligible: bool,
    pub max_amount: Decimal,
    pub reason: Option<String>,
}

/// Pure computation: credit limit from account age.
///
/// Formula: `min(account_age_days / 2, 180)` Ѵ
///
/// A 100-day-old account can borrow up to 50 Ѵ.
/// A 400-day-old account is capped at 180 Ѵ.
pub fn calculate_credit_limit(account: &Account) -> Decimal {
    let age_days = (Utc::now() - account.created_at).num_days().max(0);
    let limit = (age_days / 2).min(MAX_CREDIT_LIMIT);
    Decimal::from(limit)
}

/// Full eligibility check against the database.
///
/// Rules:
/// 1. Account must be verified
/// 2. Account age must be > 30 days
/// 3. No active loan already in progress
pub async fn check_eligibility(
    pool: &PgPool,
    account_id: Uuid,
) -> Result<CreditEligibility, VitaError> {
    // Fetch account
    let account = sqlx::query_as::<_, Account>(
        r#"SELECT id, public_key, created_at, verified,
                  last_emission_at, balance, total_received, display_name
           FROM accounts WHERE id = $1"#,
    )
    .bind(account_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| VitaError::NotFound(format!("Account {account_id}")))?;

    // Rule 1: must be verified
    if !account.verified {
        return Ok(CreditEligibility {
            eligible: false,
            max_amount: Decimal::ZERO,
            reason: Some("Le compte doit être vérifié pour accéder au crédit".into()),
        });
    }

    // Rule 2: minimum account age
    let age_days = (Utc::now() - account.created_at).num_days();
    if age_days < MIN_ACCOUNT_AGE_DAYS {
        return Ok(CreditEligibility {
            eligible: false,
            max_amount: Decimal::ZERO,
            reason: Some(format!(
                "Le compte doit avoir au moins {MIN_ACCOUNT_AGE_DAYS} jours d'ancienneté \
                 (actuellement {age_days} jours)"
            )),
        });
    }

    // Rule 3: no active loan
    let active_count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM credit_loans WHERE account_id = $1 AND status = 'active'",
    )
    .bind(account_id)
    .fetch_one(pool)
    .await?;

    if active_count.0 > 0 {
        return Ok(CreditEligibility {
            eligible: false,
            max_amount: Decimal::ZERO,
            reason: Some("Un crédit est déjà en cours. Remboursez-le avant d'en demander un nouveau.".into()),
        });
    }

    let max_amount = calculate_credit_limit(&account);

    Ok(CreditEligibility {
        eligible: max_amount > Decimal::ZERO,
        max_amount,
        reason: None,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::{Duration, Utc};
    use rust_decimal::Decimal;
    use uuid::Uuid;

    fn mock_account(age_days: i64) -> Account {
        Account {
            id: Uuid::nil(),
            public_key: vec![0; 32],
            created_at: Utc::now() - Duration::days(age_days),
            verified: true,
            last_emission_at: None,
            balance: Decimal::ZERO,
            total_received: Decimal::ZERO,
            display_name: None,
        }
    }

    #[test]
    fn credit_limit_100_day_account() {
        let account = mock_account(100);
        let limit = calculate_credit_limit(&account);
        assert_eq!(limit, Decimal::from(50)); // 100 / 2
    }

    #[test]
    fn credit_limit_caps_at_180() {
        let account = mock_account(500);
        let limit = calculate_credit_limit(&account);
        assert_eq!(limit, Decimal::from(MAX_CREDIT_LIMIT));
    }

    #[test]
    fn credit_limit_exactly_360_days() {
        // 360 / 2 = 180 = cap
        let account = mock_account(360);
        let limit = calculate_credit_limit(&account);
        assert_eq!(limit, Decimal::from(180));
    }

    #[test]
    fn credit_limit_new_account_is_zero() {
        let account = mock_account(0);
        let limit = calculate_credit_limit(&account);
        assert_eq!(limit, Decimal::ZERO);
    }

    #[test]
    fn credit_limit_one_day() {
        // 1 / 2 = 0 (integer division)
        let account = mock_account(1);
        let limit = calculate_credit_limit(&account);
        assert_eq!(limit, Decimal::ZERO);
    }

    #[test]
    fn credit_limit_59_days() {
        let account = mock_account(59);
        let limit = calculate_credit_limit(&account);
        assert_eq!(limit, Decimal::from(29)); // 59 / 2 = 29
    }
}
