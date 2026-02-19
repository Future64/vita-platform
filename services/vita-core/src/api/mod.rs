mod accounts;
pub mod auth;
mod codex;
mod credit;
mod emissions;
mod health;
mod transactions;
mod valuation;

use actix_web::web;
use crate::auth::middleware::AuthMiddleware;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/v1")
            // ── Public routes (no auth required) ───────────────────
            .route("/health", web::get().to(health::health_check))

            // Auth (public)
            .route("/auth/register", web::post().to(auth::register))
            .route("/auth/login", web::post().to(auth::login))
            .route("/auth/refresh", web::post().to(auth::refresh))

            // Codex (public, read-only)
            .route("/codex/titles", web::get().to(codex::get_titles))
            .route("/codex/articles", web::get().to(codex::get_articles))
            .route("/codex/articles/{number}", web::get().to(codex::get_article))
            .route("/codex/articles/{number}/versions", web::get().to(codex::get_article_versions))
            .route("/codex/export/json", web::get().to(codex::export_json))
            .route("/codex/export/pdf", web::get().to(codex::export_pdf))

            // Valuation calculator (public)
            .route("/valuation/calculate", web::post().to(valuation::calculate_valuation))

            // ── Protected routes (JWT required) ────────────────────
            .service(
                web::scope("")
                    .wrap(AuthMiddleware)

                    // Auth (protected)
                    .route("/auth/logout", web::post().to(auth::logout))
                    .route("/auth/me", web::get().to(auth::get_me))
                    .route("/auth/me", web::put().to(auth::update_me))
                    .route("/auth/me/password", web::put().to(auth::change_password))

                    // Accounts
                    .route("/accounts", web::post().to(accounts::create_account))
                    .route("/accounts/{id}", web::get().to(accounts::get_account))
                    .route("/accounts/{id}/verify", web::post().to(accounts::verify_account))

                    // Emissions
                    .route("/emissions/claim", web::post().to(emissions::claim_emission))
                    .route("/emissions/batch", web::post().to(emissions::batch_emission))
                    .route("/emissions/{account_id}", web::get().to(emissions::get_emission_history))

                    // Transactions
                    .route("/transactions/transfer", web::post().to(transactions::create_transfer))
                    .route("/transactions/{account_id}", web::get().to(transactions::get_transaction_history))

                    // Credit
                    .route("/credit/eligibility/{account_id}", web::get().to(credit::get_eligibility))
                    .route("/credit/request", web::post().to(credit::request_credit))
                    .route("/credit/loans/{account_id}", web::get().to(credit::get_loans))

                    // Codex (write operations — protected)
                    .route("/codex/amendments", web::post().to(codex::create_amendment))
                    .route("/codex/amendments", web::get().to(codex::get_amendments))
            ),
    );
}
