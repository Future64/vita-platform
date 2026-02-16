mod api;
pub mod codex;
pub mod config;
pub mod credit;
pub mod crypto;
pub mod error;
mod identity;
pub mod monetary;
pub mod transaction;
mod valuation;

use actix_cors::Cors;
use actix_web::{web, App, HttpServer, middleware};
use sqlx::postgres::PgPoolOptions;
use tracing::info;

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
            .wrap(cors)
            .wrap(middleware::Logger::default())
            .configure(api::configure)
    })
    .bind(bind_addr)?
    .run()
    .await
}
