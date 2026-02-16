mod accounts;
mod codex;
mod credit;
mod emissions;
mod health;
mod transactions;
mod valuation;

use actix_web::web;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/v1")
            // Health
            .route("/health", web::get().to(health::health_check))
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
            // Valuation
            .route("/valuation/calculate", web::post().to(valuation::calculate_valuation))
            // Credit
            .route("/credit/eligibility/{account_id}", web::get().to(credit::get_eligibility))
            .route("/credit/request", web::post().to(credit::request_credit))
            .route("/credit/loans/{account_id}", web::get().to(credit::get_loans))
            // Codex (Constitution)
            .route("/codex/titles", web::get().to(codex::get_titles))
            .route("/codex/articles", web::get().to(codex::get_articles))
            .route("/codex/articles/{number}", web::get().to(codex::get_article))
            .route("/codex/articles/{number}/versions", web::get().to(codex::get_article_versions))
            .route("/codex/amendments", web::post().to(codex::create_amendment))
            .route("/codex/amendments", web::get().to(codex::get_amendments))
            .route("/codex/export/json", web::get().to(codex::export_json))
            .route("/codex/export/pdf", web::get().to(codex::export_pdf)),
    );
}
