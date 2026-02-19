mod api;
pub mod audit;
pub mod auth;
pub mod codex;
pub mod config;
pub mod credit;
pub mod crypto;
pub mod error;
pub mod governance;
pub mod identity;
pub mod monetary;
pub mod transaction;
mod valuation;
pub mod ws;

use actix_cors::Cors;
use actix_web::{web, App, HttpServer, middleware};
use sqlx::postgres::PgPoolOptions;
use tracing::info;

use auth::middleware::JwtSecret;

pub use error::{VitaError, Result};
pub use monetary::{Account, CommonFund, EmissionLog};
pub use transaction::{Transaction, TransactionType};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Load .env file
    dotenvy::dotenv().ok();

    // Initialize tracing
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info")),
        )
        .init();

    info!("Starting VITA Core Backend v{}", env!("CARGO_PKG_VERSION"));

    // Database connection
    let database_url = std::env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set in .env");

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to connect to PostgreSQL");

    info!("Connected to PostgreSQL");

    // Load system parameters
    let params = config::SystemParams::new();
    info!("System parameters loaded (daily emission: {} Ѵ)", params.immutable.daily_emission);

    // Load JWT secret
    let jwt_secret = std::env::var("JWT_SECRET")
        .expect("JWT_SECRET must be set in .env");
    let jwt_secret = JwtSecret(jwt_secret);
    info!("JWT secret loaded");

    // Start background tasks
    let cron_pool = pool.clone();
    tokio::spawn(async move {
        loop {
            tokio::time::sleep(tokio::time::Duration::from_secs(60)).await;
            // Auto-close expired votes
            match api::governance::check_and_close_votes(&cron_pool).await {
                Ok(results) if !results.is_empty() => {
                    info!("{} vote(s) cloture(s) automatiquement", results.len());
                }
                Err(e) => {
                    tracing::error!("Erreur cron cloture votes: {}", e);
                }
                _ => {}
            }
            // Check verification expirations
            match api::identity::check_expirations(&cron_pool).await {
                Ok(affected) if !affected.is_empty() => {
                    info!("{} verification(s) expiree(s)", affected.len());
                }
                Err(e) => {
                    tracing::error!("Erreur cron expirations verifications: {}", e);
                }
                _ => {}
            }
        }
    });

    // Daily Merkle tree builder — runs every hour, builds yesterday's tree if missing
    let merkle_pool = pool.clone();
    tokio::spawn(async move {
        loop {
            tokio::time::sleep(tokio::time::Duration::from_secs(3600)).await;
            let yesterday = (chrono::Utc::now() - chrono::Duration::days(1)).date_naive();
            match crypto::merkle::build_daily_merkle(&merkle_pool, yesterday).await {
                Ok(Some(racine)) => {
                    info!(
                        "Merkle tree built for {} — {} leaves, root: {}",
                        racine.date, racine.nombre_feuilles, racine.racine_hash
                    );
                }
                Ok(None) => {} // No transactions or already built
                Err(e) => {
                    tracing::error!("Erreur cron Merkle tree: {}", e);
                }
            }
        }
    });

    // Create shared WebSocket server
    let ws_server = web::Data::new(ws::WsServer::new());
    info!("WebSocket server initialized");

    // Start HTTP server
    let bind_addr = "127.0.0.1:8080";
    info!("Starting HTTP server on http://{}", bind_addr);

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:3000")
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"])
            .allowed_headers(vec![
                actix_web::http::header::AUTHORIZATION,
                actix_web::http::header::CONTENT_TYPE,
            ])
            .max_age(3600);

        App::new()
            .app_data(web::Data::new(pool.clone()))
            .app_data(web::Data::new(params.clone()))
            .app_data(web::Data::new(jwt_secret.clone()))
            .app_data(ws_server.clone())
            .wrap(cors)
            .wrap(middleware::Logger::default())
            // WebSocket route (before API configure, outside auth middleware)
            .route("/api/v1/ws", web::get().to(ws::ws_handler))
            .configure(api::configure)
    })
    .bind(bind_addr)?
    .run()
    .await
}
