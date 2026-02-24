mod accounts;
mod audit;
pub mod auth;
mod codex;
mod credit;
mod crypto;
mod emissions;
pub mod governance;
mod health;
pub mod identity;
pub mod statistics;
mod transactions;
mod valuation;

use actix_web::web;
use crate::auth::middleware::AuthMiddleware;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/v1")
            // ── Public routes (no auth required) ───────────────────
            .route("/health", web::get().to(health::health_check))

            // Statistics (public, read-only)
            .route("/statistics/summary", web::get().to(statistics::get_summary))

            // Auth (public)
            .route("/auth/register", web::post().to(auth::register))
            .route("/auth/login", web::post().to(auth::login))
            .route("/auth/refresh", web::post().to(auth::refresh))
            .route("/auth/verify-email", web::post().to(auth::verify_email))
            .route("/auth/resend-verification", web::post().to(auth::resend_verification))

            // Codex (public, read-only)
            .route("/codex/titles", web::get().to(codex::get_titles))
            .route("/codex/articles", web::get().to(codex::get_articles))
            .route("/codex/articles/{number}", web::get().to(codex::get_article))
            .route("/codex/articles/{number}/versions", web::get().to(codex::get_article_versions))
            .route("/codex/export/json", web::get().to(codex::export_json))
            .route("/codex/export/pdf", web::get().to(codex::export_pdf))

            // Valuation calculator (public)
            .route("/valuation/calculate", web::post().to(valuation::calculate_valuation))

            // Governance (public — read-only)
            .route("/governance/doleances", web::get().to(governance::list_doleances))
            .route("/governance/doleances/{id}", web::get().to(governance::get_doleance))
            .route("/governance/propositions", web::get().to(governance::list_propositions))
            .route("/governance/propositions/{id}", web::get().to(governance::get_proposition))
            .route("/governance/propositions/{id}/resultats", web::get().to(governance::get_resultats))
            .route("/governance/propositions/{id}/fils", web::get().to(governance::list_fils))
            .route("/governance/fils/{fil_id}/messages", web::get().to(governance::list_messages))
            .route("/governance/parametres", web::get().to(governance::list_parametres))
            .route("/governance/parametres/{nom}", web::get().to(governance::get_parametre))
            .route("/governance/parametres/{nom}/historique", web::get().to(governance::get_historique_parametre))

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
                    .route("/transactions/transfer-confidentiel", web::post().to(transactions::create_confidential_transfer))
                    .route("/transactions/{id}/commitment", web::get().to(transactions::get_commitment))
                    .route("/transactions/{id}/verify-commitment", web::post().to(transactions::verify_commitment))
                    .route("/transactions/{id}/blinding-factor", web::get().to(transactions::get_blinding_factor))
                    .route("/transactions/{account_id}", web::get().to(transactions::get_transaction_history))

                    // Credit
                    .route("/credit/eligibility/{account_id}", web::get().to(credit::get_eligibility))
                    .route("/credit/request", web::post().to(credit::request_credit))
                    .route("/credit/loans/{account_id}", web::get().to(credit::get_loans))

                    // Codex (write operations)
                    .route("/codex/amendments", web::post().to(codex::create_amendment))
                    .route("/codex/amendments", web::get().to(codex::get_amendments))

                    // Governance (write operations — auth required)
                    .route("/governance/doleances", web::post().to(governance::create_doleance))
                    .route("/governance/doleances/{id}/soutenir", web::post().to(governance::soutenir_doleance))
                    .route("/governance/doleances/{id}/convertir", web::post().to(governance::convertir_doleance))
                    .route("/governance/propositions", web::post().to(governance::create_proposition))
                    .route("/governance/propositions/{id}/vote", web::post().to(governance::voter))
                    .route("/governance/propositions/{id}/passage-vote", web::post().to(governance::passage_vote))
                    .route("/governance/propositions/{id}/cloturer", web::post().to(governance::cloturer_vote))
                    .route("/governance/propositions/{id}/fils", web::post().to(governance::create_fil))
                    .route("/governance/fils/{fil_id}/messages", web::post().to(governance::create_message))
                    .route("/governance/messages/{msg_id}/reaction", web::post().to(governance::reagir_message))
                    .route("/governance/cron/close-votes", web::post().to(governance::cron_close_votes))

                    // Identity — provider-based verification (FranceConnect, Signicat)
                    .route("/identity/verify", web::post().to(identity::verify_provider_endpoint))
                    .route("/identity/status/{account_id}", web::get().to(identity::get_verification_status))

                    // Identity — verification by parrainage
                    .route("/identity/demande", web::post().to(identity::create_demande))
                    .route("/identity/demande", web::get().to(identity::get_demande_active))
                    .route("/identity/demande", web::delete().to(identity::annuler_demande))
                    .route("/identity/demande/inviter", web::post().to(identity::inviter_parrain))
                    .route("/identity/demande/{parrainage_id}/relancer", web::post().to(identity::relancer_parrain))
                    .route("/identity/parrainages", web::get().to(identity::get_parrainages_recus))
                    .route("/identity/parrainages/{id}/attester", web::post().to(identity::attester))
                    .route("/identity/parrainages/{id}/refuser", web::post().to(identity::refuser_parrainage))
                    .route("/identity/parrainages/{id}/revoquer", web::post().to(identity::revoquer_parrainage))
                    .route("/identity/parrainages/compteur", web::get().to(identity::get_compteur))
                    .route("/identity/parrainages/cooldown", web::get().to(identity::get_cooldown_status))
                    .route("/identity/parrains-potentiels", web::get().to(identity::search_parrains))
                    .route("/identity/verifications", web::get().to(identity::get_historique_verifications))
                    .route("/identity/cron/check-expirations", web::post().to(identity::cron_check_expirations))

                    // Audit — hash chain integrity
                    .route("/audit/logs", web::get().to(audit::get_logs))
                    .route("/audit/logs/{id}", web::get().to(audit::get_log_detail))
                    .route("/audit/verify", web::post().to(audit::verify_integrity))
                    .route("/audit/status", web::get().to(audit::get_status))
                    .route("/audit/export", web::get().to(audit::export_logs))

                    // Crypto — Merkle tree & signatures
                    .route("/crypto/merkle/roots", web::get().to(crypto::list_merkle_roots))
                    .route("/crypto/merkle/proof/{tx_id}", web::get().to(crypto::get_merkle_proof))
                    .route("/crypto/merkle/verify", web::post().to(crypto::verify_merkle_tree))
                    .route("/crypto/pubkey/{user_id}", web::get().to(crypto::get_public_key))
                    .route("/crypto/verify-tx/{tx_id}", web::get().to(crypto::verify_transaction_signature))
            ),
    );
}
