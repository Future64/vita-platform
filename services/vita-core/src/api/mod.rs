mod accounts;
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
            .route("/credit/loans/{account_id}", web::get().to(credit::get_loans)),
    );
}
