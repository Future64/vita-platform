use actix_web::{web, HttpResponse};
use chrono::Utc;
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::api::notifications::insert_notification;
use crate::audit;
use crate::auth::middleware::{AuthUser, require_role};
use crate::error::VitaError;
use crate::monetary::emission;
use crate::ws::{WsServer, ServerMessage};

// ── request types ───────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct ClaimEmissionRequest {
    pub account_id: Uuid,
}

// ── handlers ────────────────────────────────────────────────────────

/// POST /api/v1/emissions/claim — Claim today's daily emission for one account.
pub async fn claim_emission(
    pool: web::Data<PgPool>,
    ws_server: web::Data<WsServer>,
    user: AuthUser,
    body: web::Json<ClaimEmissionRequest>,
) -> Result<HttpResponse, VitaError> {
    // Verify the user owns this account
    let user_id = uuid::Uuid::parse_str(&user.user_id)
        .map_err(|_| VitaError::Internal("Invalid user ID in token".into()))?;
    let owns: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM accounts WHERE id = $1 AND user_id = $2)",
    )
    .bind(body.account_id)
    .bind(user_id)
    .fetch_one(pool.get_ref())
    .await?;

    if !owns {
        return Err(VitaError::Forbidden("Ce compte ne vous appartient pas".into()));
    }

    let today = Utc::now().date_naive();
    let log = emission::emit_daily(pool.get_ref(), body.account_id, today).await?;

    // Fetch updated balance
    let balance = crate::transaction::transfer::get_balance(pool.get_ref(), body.account_id).await?;

    audit::audit(
        pool.get_ref().clone(),
        Some(&user),
        "emission.daily",
        "transaction",
        "info",
        &format!("Emission de {} V pour @{}", log.amount, &user.username),
        None,
        Some(("account", body.account_id)),
    );

    // ── WebSocket notifications ───────────────────────────────────
    ws_server.send_to_user(
        &user.user_id,
        ServerMessage::BalanceUpdate {
            nouvelle_balance: balance.to_string(),
            raison: format!("Emission quotidienne de {} V", log.amount),
        },
    );
    ws_server.send_to_user(
        &user.user_id,
        ServerMessage::Notification {
            type_: "emission_quotidienne".to_string(),
            titre: "Emission quotidienne".to_string(),
            contenu: format!("Votre emission quotidienne de {} V a ete creditee", log.amount),
            lien: Some("/bourse".to_string()),
        },
    );

    // Persist notification in DB
    let _ = insert_notification(
        pool.get_ref(),
        uuid::Uuid::parse_str(&user.user_id).unwrap_or_default(),
        "emission_quotidienne",
        "Votre V quotidien est arrive",
        &format!("Vous avez recu {} V aujourd'hui. Bonne journee !", log.amount),
        Some("/bourse"),
    )
    .await;

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "emission_date": log.emission_date,
        "amount": log.amount,
        "new_balance": balance
    })))
}

/// POST /api/v1/emissions/batch — Trigger daily emission for all verified accounts (admin only).
pub async fn batch_emission(
    pool: web::Data<PgPool>,
    user: AuthUser,
) -> Result<HttpResponse, VitaError> {
    require_role(&user, &["dieu", "super_admin", "admin"])?;
    let result = emission::emit_daily_all(pool.get_ref()).await?;

    audit::audit(
        pool.get_ref().clone(),
        Some(&user),
        "emission.batch",
        "transaction",
        "info",
        "Emission batch declenchee par admin",
        None,
        None,
    );

    Ok(HttpResponse::Ok().json(result))
}

/// GET /api/v1/emissions/{account_id} — Emission history for an account.
pub async fn get_emission_history(
    pool: web::Data<PgPool>,
    user: AuthUser,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, VitaError> {
    let account_id = path.into_inner();

    // Verify the user owns this account
    let user_id = uuid::Uuid::parse_str(&user.user_id)
        .map_err(|_| VitaError::Internal("Invalid user ID in token".into()))?;
    let owns: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM accounts WHERE id = $1 AND user_id = $2)",
    )
    .bind(account_id)
    .bind(user_id)
    .fetch_one(pool.get_ref())
    .await?;

    if !owns {
        return Err(VitaError::Forbidden("Ce compte ne vous appartient pas".into()));
    }

    let rows = sqlx::query_as::<_, emission::EmissionLog>(
        r#"SELECT id, account_id, emission_date, amount, created_at
           FROM emission_log
           WHERE account_id = $1
           ORDER BY emission_date DESC"#,
    )
    .bind(account_id)
    .fetch_all(pool.get_ref())
    .await?;

    // Return simplified list
    let entries: Vec<serde_json::Value> = rows
        .iter()
        .map(|r| {
            serde_json::json!({
                "emission_date": r.emission_date,
                "amount": r.amount
            })
        })
        .collect();

    Ok(HttpResponse::Ok().json(entries))
}
