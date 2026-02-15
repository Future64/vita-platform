use actix_web::{HttpResponse, http::StatusCode, ResponseError};

#[derive(Debug, thiserror::Error)]
pub enum VitaError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Unauthorized: {0}")]
    Unauthorized(String),

    #[error("Bad request: {0}")]
    BadRequest(String),

    #[error("Insufficient balance")]
    InsufficientBalance,

    #[error("Duplicate account: this identity already has an account")]
    DuplicateAccount,

    #[error("Daily emission already claimed")]
    EmissionAlreadyClaimed,

    #[error("Invalid signature: {0}")]
    InvalidSignature(String),

    #[error("Crypto error: {0}")]
    CryptoError(String),

    #[error("Internal error: {0}")]
    Internal(String),
}

impl ResponseError for VitaError {
    fn status_code(&self) -> StatusCode {
        match self {
            VitaError::Database(_) => StatusCode::INTERNAL_SERVER_ERROR,
            VitaError::NotFound(_) => StatusCode::NOT_FOUND,
            VitaError::Unauthorized(_) => StatusCode::UNAUTHORIZED,
            VitaError::BadRequest(_) => StatusCode::BAD_REQUEST,
            VitaError::InsufficientBalance => StatusCode::BAD_REQUEST,
            VitaError::DuplicateAccount => StatusCode::CONFLICT,
            VitaError::EmissionAlreadyClaimed => StatusCode::CONFLICT,
            VitaError::InvalidSignature(_) => StatusCode::BAD_REQUEST,
            VitaError::CryptoError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            VitaError::Internal(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn error_response(&self) -> HttpResponse {
        let code = match self {
            VitaError::Database(_) => "DATABASE_ERROR",
            VitaError::NotFound(_) => "NOT_FOUND",
            VitaError::Unauthorized(_) => "UNAUTHORIZED",
            VitaError::BadRequest(_) => "BAD_REQUEST",
            VitaError::InsufficientBalance => "INSUFFICIENT_BALANCE",
            VitaError::DuplicateAccount => "DUPLICATE_ACCOUNT",
            VitaError::EmissionAlreadyClaimed => "EMISSION_ALREADY_CLAIMED",
            VitaError::InvalidSignature(_) => "INVALID_SIGNATURE",
            VitaError::CryptoError(_) => "CRYPTO_ERROR",
            VitaError::Internal(_) => "INTERNAL_ERROR",
        };

        HttpResponse::build(self.status_code()).json(serde_json::json!({
            "error": self.to_string(),
            "code": code
        }))
    }
}

pub type Result<T> = std::result::Result<T, VitaError>;
