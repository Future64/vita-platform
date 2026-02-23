use actix_web::{web, HttpResponse};
use chrono::Utc;
use serde::Serialize;
use sqlx::PgPool;
use tracing::warn;

/// Aggregated panorama/dashboard response.
#[derive(Debug, Serialize)]
pub struct PanoramaSummary {
    /// Total verified accounts (population covered)
    pub verified_accounts: i64,
    /// Total registered accounts (all users)
    pub total_accounts: i64,
    /// Total monetary mass in circulation (sum of all balances)
    pub monetary_mass: String,
    /// Total emissions ever distributed
    pub total_emissions: i64,
    /// Transactions in the last 24 hours
    pub transactions_24h: i64,
    /// Transaction volume in Ѵ in the last 24 hours
    pub volume_24h: String,
    /// Active governance proposals (currently in vote)
    pub active_proposals: i64,
    /// Total governance proposals ever created
    pub total_proposals: i64,
    /// Common fund balance
    pub common_fund_balance: String,
    /// Audit chain status
    pub audit_chain_intact: bool,
    /// Server timestamp
    pub timestamp: String,
}

/// GET /api/v1/statistics/summary — Aggregated dashboard data
///
/// This endpoint runs multiple queries in parallel to build
/// the Panorama dashboard summary. All values come from real
/// database state.
pub async fn get_summary(
    pool: web::Data<PgPool>,
) -> HttpResponse {
    let now = Utc::now();
    let twenty_four_hours_ago = now - chrono::Duration::hours(24);

    // Run queries in parallel using tokio::join!
    let (
        verified_res,
        total_res,
        mass_res,
        emissions_res,
        tx_24h_res,
        volume_res,
        active_props_res,
        total_props_res,
        fund_res,
        audit_res,
    ) = tokio::join!(
        // Verified accounts count
        sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM accounts WHERE verified = true"
        )
        .fetch_one(pool.get_ref()),

        // Total accounts count
        sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM accounts"
        )
        .fetch_one(pool.get_ref()),

        // Total monetary mass (sum of all balances)
        sqlx::query_scalar::<_, Option<rust_decimal::Decimal>>(
            "SELECT SUM(balance) FROM accounts"
        )
        .fetch_one(pool.get_ref()),

        // Total emissions count
        sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM emission_log"
        )
        .fetch_one(pool.get_ref()),

        // Transactions in last 24h
        sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM transactions WHERE created_at >= $1"
        )
        .bind(twenty_four_hours_ago)
        .fetch_one(pool.get_ref()),

        // Volume in last 24h
        sqlx::query_scalar::<_, Option<rust_decimal::Decimal>>(
            "SELECT SUM(amount) FROM transactions WHERE created_at >= $1"
        )
        .bind(twenty_four_hours_ago)
        .fetch_one(pool.get_ref()),

        // Active proposals (in vote)
        sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM propositions WHERE statut = 'vote'"
        )
        .fetch_one(pool.get_ref()),

        // Total proposals
        sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM propositions"
        )
        .fetch_one(pool.get_ref()),

        // Common fund balance
        sqlx::query_scalar::<_, Option<rust_decimal::Decimal>>(
            "SELECT SUM(balance) FROM common_fund"
        )
        .fetch_one(pool.get_ref()),

        // Audit chain — check if latest entry is consistent
        sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM audit_log WHERE verified = false"
        )
        .fetch_one(pool.get_ref()),
    );

    // Handle potential query failures gracefully
    let zero = rust_decimal::Decimal::ZERO;

    let summary = PanoramaSummary {
        verified_accounts: verified_res.unwrap_or_else(|e| { warn!("stats: verified_accounts query failed: {e}"); 0 }),
        total_accounts: total_res.unwrap_or_else(|e| { warn!("stats: total_accounts query failed: {e}"); 0 }),
        monetary_mass: mass_res.unwrap_or_else(|e| { warn!("stats: monetary_mass query failed: {e}"); None }).unwrap_or(zero).to_string(),
        total_emissions: emissions_res.unwrap_or_else(|e| { warn!("stats: total_emissions query failed: {e}"); 0 }),
        transactions_24h: tx_24h_res.unwrap_or_else(|e| { warn!("stats: transactions_24h query failed: {e}"); 0 }),
        volume_24h: volume_res.unwrap_or_else(|e| { warn!("stats: volume_24h query failed: {e}"); None }).unwrap_or(zero).to_string(),
        active_proposals: active_props_res.unwrap_or_else(|e| { warn!("stats: active_proposals query failed: {e}"); 0 }),
        total_proposals: total_props_res.unwrap_or_else(|e| { warn!("stats: total_proposals query failed: {e}"); 0 }),
        common_fund_balance: fund_res.unwrap_or_else(|e| { warn!("stats: common_fund_balance query failed: {e}"); None }).unwrap_or(zero).to_string(),
        audit_chain_intact: audit_res.unwrap_or(1) == 0,
        timestamp: now.to_rfc3339(),
    };

    HttpResponse::Ok().json(summary)
}
