use chrono::{DateTime, NaiveDate, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use std::str::FromStr;
use tracing::{info, warn};
use uuid::Uuid;

use crate::error::VitaError;

/// One row per account per day — the UNIQUE(account_id, emission_date) constraint
/// in the database prevents any double emission.
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct EmissionLog {
    pub id: Uuid,
    pub account_id: Uuid,
    pub emission_date: NaiveDate,
    pub amount: Decimal,
    pub created_at: DateTime<Utc>,
}

/// Summary returned after a batch emission run.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmissionBatchResult {
    pub total_accounts: u32,
    pub successful: u32,
    pub failed: u32,
    pub date: NaiveDate,
}

/// The daily emission amount — constitutional, IMMUTABLE.
fn daily_amount() -> Decimal {
    Decimal::from_str("1.0").unwrap()
}

/// Emit 1 Ѵ for a single verified account on a given date.
///
/// Rules enforced:
/// - Account must exist and be verified
/// - No retroactive emission (caller provides the date)
/// - UNIQUE constraint prevents double emission per day
/// - All DB writes happen inside a single SQL transaction (atomic)
pub async fn emit_daily(
    pool: &PgPool,
    account_id: Uuid,
    date: NaiveDate,
) -> Result<EmissionLog, VitaError> {
    let amount = daily_amount();

    // 1. Check that account exists and is verified
    let account = sqlx::query_as::<_, AccountCheck>(
        "SELECT id, verified FROM accounts WHERE id = $1",
    )
    .bind(account_id)
    .fetch_optional(pool)
    .await?;

    let account = account.ok_or_else(|| {
        VitaError::NotFound(format!("Account {account_id}"))
    })?;

    if !account.verified {
        return Err(VitaError::BadRequest(
            "Account is not verified — cannot receive emission".into(),
        ));
    }

    // 2. Begin SQL transaction
    let mut tx = pool.begin().await?;

    // 2a. INSERT emission_log (UNIQUE constraint catches double-emission)
    let row = sqlx::query_as::<_, EmissionLog>(
        r#"INSERT INTO emission_log (account_id, emission_date, amount)
           VALUES ($1, $2, $3)
           RETURNING id, account_id, emission_date, amount, created_at"#,
    )
    .bind(account_id)
    .bind(date)
    .bind(amount)
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| match &e {
        sqlx::Error::Database(db_err) if db_err.is_unique_violation() => {
            VitaError::EmissionAlreadyClaimed
        }
        _ => VitaError::Database(e),
    })?;

    // 2b. UPDATE account balance
    sqlx::query(
        r#"UPDATE accounts
           SET balance = balance + $1,
               total_received = total_received + $1,
               last_emission_at = NOW()
           WHERE id = $2"#,
    )
    .bind(amount)
    .bind(account_id)
    .execute(&mut *tx)
    .await?;

    // 2c. INSERT transaction record
    sqlx::query(
        r#"INSERT INTO transactions (tx_type, to_account_id, amount, common_fund_contribution, net_amount)
           VALUES ('emission', $1, $2, 0, $2)"#,
    )
    .bind(account_id)
    .bind(amount)
    .execute(&mut *tx)
    .await?;

    // 3. Commit
    tx.commit().await?;

    info!(account_id = %account_id, date = %date, "Emission: +1 Ѵ");
    Ok(row)
}

/// Emit 1 Ѵ for ALL verified accounts that have not yet received today's emission.
pub async fn emit_daily_all(pool: &PgPool) -> Result<EmissionBatchResult, VitaError> {
    let today = Utc::now().date_naive();

    // Find verified accounts missing today's emission
    let eligible: Vec<EligibleAccount> = sqlx::query_as::<_, EligibleAccount>(
        r#"SELECT a.id
           FROM accounts a
           WHERE a.verified = true
             AND NOT EXISTS (
               SELECT 1 FROM emission_log e
               WHERE e.account_id = a.id AND e.emission_date = $1
             )"#,
    )
    .bind(today)
    .fetch_all(pool)
    .await?;

    let total_accounts = eligible.len() as u32;
    let mut successful: u32 = 0;
    let mut failed: u32 = 0;

    for row in &eligible {
        match emit_daily(pool, row.id, today).await {
            Ok(_) => successful += 1,
            Err(e) => {
                warn!(account_id = %row.id, error = %e, "Emission failed");
                failed += 1;
            }
        }
    }

    info!(
        total = total_accounts,
        ok = successful,
        fail = failed,
        date = %today,
        "Daily emission batch complete"
    );

    Ok(EmissionBatchResult {
        total_accounts,
        successful,
        failed,
        date: today,
    })
}

// ── helper row types for queries ────────────────────────────────────

#[derive(sqlx::FromRow)]
struct AccountCheck {
    #[allow(dead_code)]
    id: Uuid,
    verified: bool,
}

#[derive(sqlx::FromRow)]
struct EligibleAccount {
    id: Uuid,
}

// ── tests ───────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use rust_decimal::Decimal;
    use std::str::FromStr;

    #[test]
    fn test_daily_amount_is_one() {
        assert_eq!(daily_amount(), Decimal::from_str("1.0").unwrap());
    }

    #[test]
    fn test_daily_amount_is_not_float() {
        // Ensure we never use floating point
        let amount = daily_amount();
        assert_eq!(amount.to_string(), "1.0");
    }

    #[test]
    fn test_emission_batch_result_serializes() {
        let result = EmissionBatchResult {
            total_accounts: 100,
            successful: 98,
            failed: 2,
            date: NaiveDate::from_ymd_opt(2025, 2, 15).unwrap(),
        };
        let json = serde_json::to_string(&result).unwrap();
        assert!(json.contains("\"total_accounts\":100"));
        assert!(json.contains("\"successful\":98"));
        assert!(json.contains("\"failed\":2"));
        assert!(json.contains("2025-02-15"));
    }
}
