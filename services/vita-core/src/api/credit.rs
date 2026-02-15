use actix_web::{web, HttpResponse};
use rust_decimal::Decimal;
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::credit::{eligibility, mutual};
use crate::error::VitaError;

#[derive(Debug, Deserialize)]
pub struct CreditRequest {
    pub account_id: Uuid,
    pub amount: Decimal,
}

/// GET /api/v1/credit/eligibility/{account_id}
pub async fn get_eligibility(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, VitaError> {
    let account_id = path.into_inner();
    let elig = eligibility::check_eligibility(pool.get_ref(), account_id).await?;
    Ok(HttpResponse::Ok().json(elig))
}

/// POST /api/v1/credit/request
pub async fn request_credit(
    pool: web::Data<PgPool>,
    body: web::Json<CreditRequest>,
) -> Result<HttpResponse, VitaError> {
    let loan = mutual::request_credit(pool.get_ref(), body.account_id, body.amount).await?;
    Ok(HttpResponse::Created().json(loan))
}

/// GET /api/v1/credit/loans/{account_id}
pub async fn get_loans(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, VitaError> {
    let account_id = path.into_inner();
    let loans = mutual::get_loans(pool.get_ref(), account_id).await?;
    Ok(HttpResponse::Ok().json(loans))
}
