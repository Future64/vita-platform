use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use tracing::info;
use uuid::Uuid;

use crate::crypto::keys;
use crate::crypto::signatures::{self, TransactionPayload};
use crate::error::VitaError;
use super::Transaction;

// ── request / response types ────────────────────────────────────────

#[derive(Debug, Clone, Deserialize)]
pub struct TransferRequest {
    pub from_id: Uuid,
    pub to_id: Uuid,
    pub amount: Decimal,
    pub note: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct TransferResult {
    pub transaction_id: Uuid,
    pub amount: Decimal,
    pub common_fund_contribution: Decimal,
    pub net_amount: Decimal,
    pub new_sender_balance: Decimal,
    pub timestamp: DateTime<Utc>,
}

// ── core transfer logic ─────────────────────────────────────────────

/// Execute a peer-to-peer transfer of Ѵ between two accounts.
///
/// Rules enforced:
/// - Sender and receiver must be different accounts
/// - Amount must be strictly positive
/// - Sender balance must be >= amount (checked under row lock)
/// - A configurable percentage goes to the common fund
/// - Everything happens inside a single SQL transaction (atomic)
pub async fn execute_transfer(
    pool: &PgPool,
    req: TransferRequest,
    common_fund_rate: Decimal,
) -> Result<TransferResult, VitaError> {
    // ── validation ──────────────────────────────────────────────
    if req.from_id == req.to_id {
        return Err(VitaError::BadRequest(
            "Cannot transfer to yourself".into(),
        ));
    }

    if req.amount <= Decimal::ZERO {
        return Err(VitaError::BadRequest(
            "Transfer amount must be positive".into(),
        ));
    }

    // ── compute amounts ─────────────────────────────────────────
    let contribution = req.amount * common_fund_rate;
    let net_amount = req.amount - contribution;

    // ── SQL transaction ─────────────────────────────────────────
    let mut tx = pool.begin().await?;

    // a. Lock sender row and read balance
    let sender: BalanceRow = sqlx::query_as::<_, BalanceRow>(
        "SELECT balance FROM accounts WHERE id = $1 FOR UPDATE",
    )
    .bind(req.from_id)
    .fetch_optional(&mut *tx)
    .await?
    .ok_or_else(|| VitaError::NotFound(format!("Account {}", req.from_id)))?;

    // b. Check sufficient balance
    if sender.balance < req.amount {
        return Err(VitaError::InsufficientBalance);
    }

    // Verify receiver exists
    sqlx::query_as::<_, BalanceRow>(
        "SELECT balance FROM accounts WHERE id = $1",
    )
    .bind(req.to_id)
    .fetch_optional(&mut *tx)
    .await?
    .ok_or_else(|| VitaError::NotFound(format!("Account {}", req.to_id)))?;

    // c. Debit sender (full amount)
    sqlx::query(
        "UPDATE accounts SET balance = balance - $1 WHERE id = $2",
    )
    .bind(req.amount)
    .bind(req.from_id)
    .execute(&mut *tx)
    .await?;

    // d. Credit receiver (net amount after common fund contribution)
    sqlx::query(
        "UPDATE accounts SET balance = balance + $1 WHERE id = $2",
    )
    .bind(net_amount)
    .bind(req.to_id)
    .execute(&mut *tx)
    .await?;

    // e. Credit common fund
    sqlx::query(
        r#"UPDATE common_fund
           SET balance = balance + $1,
               total_contributions = total_contributions + $1,
               updated_at = NOW()"#,
    )
    .bind(contribution)
    .execute(&mut *tx)
    .await?;

    // f. Record transaction (without signature first to get the id + timestamp)
    let row = sqlx::query_as::<_, TxRow>(
        r#"INSERT INTO transactions
               (tx_type, from_account_id, to_account_id, amount,
                common_fund_contribution, net_amount, note)
           VALUES ('transfer', $1, $2, $3, $4, $5, $6)
           RETURNING id, created_at"#,
    )
    .bind(req.from_id)
    .bind(req.to_id)
    .bind(req.amount)
    .bind(contribution)
    .bind(net_amount)
    .bind(&req.note)
    .fetch_one(&mut *tx)
    .await?;

    // g. Server-side signing: look up sender's private key and sign the payload
    let sender_key: Option<SenderKeyRow> = sqlx::query_as(
        r#"SELECT u.encrypted_private_key, a.public_key
           FROM accounts a
           JOIN users u ON u.id = a.user_id
           WHERE a.id = $1"#,
    )
    .bind(req.from_id)
    .fetch_optional(&mut *tx)
    .await?;

    if let Some(sk) = sender_key {
        if let Some(ref enc_key) = sk.encrypted_private_key {
            // Use a fixed server-side passphrase for prototype signing
            // (the real password-based decryption happens client-side in future)
            let server_pass = std::env::var("CRYPTO_SERVER_KEY").unwrap_or_else(|_| "vita-server-prototype".to_string());
            if let Ok(seed) = keys::decrypt_private_key(enc_key, &server_pass) {
                let keypair = keys::keypair_from_seed(&seed);
                let payload = TransactionPayload {
                    from_id: req.from_id,
                    to_id: req.to_id,
                    amount: req.amount,
                    timestamp: row.created_at,
                    nonce: row.id,
                };
                let (sig_hex, hash_hex, pubkey_hex) = signatures::sign_payload(&payload, &keypair);

                sqlx::query(
                    "UPDATE transactions SET signature = $1, payload_hash = $2, signer_pubkey = $3 WHERE id = $4",
                )
                .bind(&sig_hex)
                .bind(&hash_hex)
                .bind(&pubkey_hex)
                .bind(row.id)
                .execute(&mut *tx)
                .await?;
            }
        }
    }

    tx.commit().await?;

    let new_sender_balance = sender.balance - req.amount;

    info!(
        from = %req.from_id,
        to = %req.to_id,
        amount = %req.amount,
        fund = %contribution,
        net = %net_amount,
        "Transfer complete"
    );

    Ok(TransferResult {
        transaction_id: row.id,
        amount: req.amount,
        common_fund_contribution: contribution,
        net_amount,
        new_sender_balance,
        timestamp: row.created_at,
    })
}

// ── query helpers ───────────────────────────────────────────────────

/// Get the current balance for an account.
pub async fn get_balance(pool: &PgPool, account_id: Uuid) -> Result<Decimal, VitaError> {
    let row = sqlx::query_as::<_, BalanceRow>(
        "SELECT balance FROM accounts WHERE id = $1",
    )
    .bind(account_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| VitaError::NotFound(format!("Account {account_id}")))?;

    Ok(row.balance)
}

/// Get transaction history for an account (sent or received), most recent first.
pub async fn get_transaction_history(
    pool: &PgPool,
    account_id: Uuid,
    limit: i64,
    offset: i64,
) -> Result<Vec<Transaction>, VitaError> {
    let rows = sqlx::query_as::<_, Transaction>(
        r#"SELECT id, tx_type, from_account_id, to_account_id,
                  amount, common_fund_contribution, net_amount, note, created_at
           FROM transactions
           WHERE from_account_id = $1 OR to_account_id = $1
           ORDER BY created_at DESC
           LIMIT $2 OFFSET $3"#,
    )
    .bind(account_id)
    .bind(limit)
    .bind(offset)
    .fetch_all(pool)
    .await?;

    Ok(rows)
}

// ── helper row types ────────────────────────────────────────────────

#[derive(sqlx::FromRow)]
struct BalanceRow {
    balance: Decimal,
}

#[derive(sqlx::FromRow)]
struct TxRow {
    id: Uuid,
    created_at: DateTime<Utc>,
}

#[derive(sqlx::FromRow)]
struct SenderKeyRow {
    encrypted_private_key: Option<String>,
    #[allow(dead_code)]
    public_key: Vec<u8>,
}

// ── tests ───────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use rust_decimal::Decimal;
    use std::str::FromStr;

    #[test]
    fn test_common_fund_calculation() {
        let amount = Decimal::from_str("100.0").unwrap();
        let rate = Decimal::from_str("0.05").unwrap();
        let contribution = amount * rate;
        let net = amount - contribution;

        assert_eq!(contribution, Decimal::from_str("5.0").unwrap());
        assert_eq!(net, Decimal::from_str("95.0").unwrap());
    }

    #[test]
    fn test_common_fund_zero_rate() {
        let amount = Decimal::from_str("50.0").unwrap();
        let rate = Decimal::ZERO;
        let contribution = amount * rate;
        let net = amount - contribution;

        assert_eq!(contribution, Decimal::ZERO);
        assert_eq!(net, amount);
    }

    #[test]
    fn test_transfer_result_serializes() {
        let result = TransferResult {
            transaction_id: Uuid::nil(),
            amount: Decimal::from_str("10.0").unwrap(),
            common_fund_contribution: Decimal::from_str("0.5").unwrap(),
            net_amount: Decimal::from_str("9.5").unwrap(),
            new_sender_balance: Decimal::from_str("90.0").unwrap(),
            timestamp: DateTime::parse_from_rfc3339("2025-01-15T12:00:00Z")
                .unwrap()
                .with_timezone(&Utc),
        };
        let json = serde_json::to_string(&result).unwrap();
        assert!(json.contains("\"transaction_id\""));
        assert!(json.contains("\"net_amount\""));
        assert!(json.contains("\"new_sender_balance\""));
    }
}
