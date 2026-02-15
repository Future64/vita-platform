use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use serde::Serialize;
use sqlx::PgPool;
use std::str::FromStr;
use tracing::info;
use uuid::Uuid;

use crate::error::VitaError;
use super::eligibility;

/// A credit loan row from the database.
#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct CreditLoan {
    pub id: Uuid,
    pub account_id: Uuid,
    pub amount: Decimal,
    pub remaining: Decimal,
    pub daily_repayment_rate: Decimal,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
}

/// Result of a daily repayment.
#[derive(Debug, Clone, Serialize)]
pub struct RepaymentResult {
    pub loan_id: Uuid,
    pub repayment_amount: Decimal,
    pub remaining_after: Decimal,
    pub loan_completed: bool,
}

/// Request a zero-interest credit from the common fund.
///
/// Steps (all inside a single SQL transaction):
/// 1. Verify eligibility (verified, no active loan, age > 30 days)
/// 2. Verify requested amount is within the calculated limit
/// 3. Verify the common fund has sufficient balance
/// 4. Create the loan record
/// 5. Transfer funds: common fund → account
pub async fn request_credit(
    pool: &PgPool,
    account_id: Uuid,
    amount: Decimal,
) -> Result<CreditLoan, VitaError> {
    // ── pre-validation ────────────────────────────────────────────
    if amount <= Decimal::ZERO {
        return Err(VitaError::BadRequest(
            "Le montant du crédit doit être positif".into(),
        ));
    }

    let elig = eligibility::check_eligibility(pool, account_id).await?;

    if !elig.eligible {
        return Err(VitaError::BadRequest(
            elig.reason.unwrap_or_else(|| "Non éligible au crédit".into()),
        ));
    }

    if amount > elig.max_amount {
        return Err(VitaError::BadRequest(format!(
            "Le montant demandé ({amount} Ѵ) dépasse votre limite de crédit ({} Ѵ)",
            elig.max_amount
        )));
    }

    // ── SQL transaction ───────────────────────────────────────────
    let mut tx = pool.begin().await?;

    // Lock common fund and check balance
    let fund_balance: (Decimal,) = sqlx::query_as(
        "SELECT balance FROM common_fund LIMIT 1 FOR UPDATE",
    )
    .fetch_one(&mut *tx)
    .await?;

    if fund_balance.0 < amount {
        return Err(VitaError::BadRequest(
            "Le pot commun n'a pas assez de fonds pour ce crédit".into(),
        ));
    }

    // Create loan
    let loan = sqlx::query_as::<_, CreditLoan>(
        r#"INSERT INTO credit_loans (account_id, amount, remaining)
           VALUES ($1, $2, $2)
           RETURNING id, account_id, amount, remaining,
                     daily_repayment_rate, status, created_at, completed_at"#,
    )
    .bind(account_id)
    .bind(amount)
    .fetch_one(&mut *tx)
    .await?;

    // Debit common fund
    sqlx::query(
        r#"UPDATE common_fund
           SET balance = balance - $1,
               total_disbursements = total_disbursements + $1,
               updated_at = NOW()"#,
    )
    .bind(amount)
    .execute(&mut *tx)
    .await?;

    // Credit borrower
    sqlx::query("UPDATE accounts SET balance = balance + $1 WHERE id = $2")
        .bind(amount)
        .bind(account_id)
        .execute(&mut *tx)
        .await?;

    tx.commit().await?;

    info!(
        account = %account_id,
        amount = %amount,
        loan = %loan.id,
        "Credit disbursed from common fund"
    );

    Ok(loan)
}

/// Process a daily repayment on an active loan.
///
/// Called once per day per active loan (typically during the emission batch).
///
/// Repayment = `daily_emission (1 Ѵ) × daily_repayment_rate (default 0.25)`.
/// If `remaining < repayment`, we repay only `remaining` (final partial payment).
///
/// Steps (inside SQL transaction):
/// 1. Lock the loan row
/// 2. Compute repayment amount
/// 3. Debit borrower's account
/// 4. Credit common fund
/// 5. Reduce loan remaining
/// 6. If remaining == 0 → mark loan as `repaid`
pub async fn process_daily_repayment(
    pool: &PgPool,
    loan_id: Uuid,
) -> Result<RepaymentResult, VitaError> {
    let daily_emission = Decimal::from_str("1.0").unwrap();

    let mut tx = pool.begin().await?;

    // Lock and fetch loan
    let loan = sqlx::query_as::<_, CreditLoan>(
        r#"SELECT id, account_id, amount, remaining,
                  daily_repayment_rate, status, created_at, completed_at
           FROM credit_loans WHERE id = $1 FOR UPDATE"#,
    )
    .bind(loan_id)
    .fetch_optional(&mut *tx)
    .await?
    .ok_or_else(|| VitaError::NotFound(format!("Loan {loan_id}")))?;

    if loan.status != "active" {
        return Err(VitaError::BadRequest(format!(
            "Le prêt {} n'est pas actif (statut: {})",
            loan_id, loan.status
        )));
    }

    // Compute repayment: min(remaining, emission × rate)
    let scheduled = daily_emission * loan.daily_repayment_rate;
    let repayment = scheduled.min(loan.remaining);

    // Check borrower has enough balance
    let borrower_balance: (Decimal,) = sqlx::query_as(
        "SELECT balance FROM accounts WHERE id = $1 FOR UPDATE",
    )
    .bind(loan.account_id)
    .fetch_one(&mut *tx)
    .await?;

    if borrower_balance.0 < repayment {
        return Err(VitaError::InsufficientBalance);
    }

    // Debit borrower
    sqlx::query("UPDATE accounts SET balance = balance - $1 WHERE id = $2")
        .bind(repayment)
        .bind(loan.account_id)
        .execute(&mut *tx)
        .await?;

    // Credit common fund
    sqlx::query(
        r#"UPDATE common_fund
           SET balance = balance + $1,
               total_contributions = total_contributions + $1,
               updated_at = NOW()"#,
    )
    .bind(repayment)
    .execute(&mut *tx)
    .await?;

    // Update loan remaining
    let new_remaining = loan.remaining - repayment;
    let loan_completed = new_remaining <= Decimal::ZERO;

    if loan_completed {
        sqlx::query(
            "UPDATE credit_loans SET remaining = 0, status = 'repaid', completed_at = NOW() WHERE id = $1",
        )
        .bind(loan_id)
        .execute(&mut *tx)
        .await?;
    } else {
        sqlx::query("UPDATE credit_loans SET remaining = $1 WHERE id = $2")
            .bind(new_remaining)
            .bind(loan_id)
            .execute(&mut *tx)
            .await?;
    }

    tx.commit().await?;

    info!(
        loan = %loan_id,
        repayment = %repayment,
        remaining = %new_remaining.max(Decimal::ZERO),
        completed = loan_completed,
        "Daily repayment processed"
    );

    Ok(RepaymentResult {
        loan_id,
        repayment_amount: repayment,
        remaining_after: new_remaining.max(Decimal::ZERO),
        loan_completed,
    })
}

/// Fetch all loans for an account.
pub async fn get_loans(
    pool: &PgPool,
    account_id: Uuid,
) -> Result<Vec<CreditLoan>, VitaError> {
    let loans = sqlx::query_as::<_, CreditLoan>(
        r#"SELECT id, account_id, amount, remaining,
                  daily_repayment_rate, status, created_at, completed_at
           FROM credit_loans
           WHERE account_id = $1
           ORDER BY created_at DESC"#,
    )
    .bind(account_id)
    .fetch_all(pool)
    .await?;

    Ok(loans)
}
