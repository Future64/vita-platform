use actix_web::{web, HttpResponse};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::middleware::AuthUser;
use crate::error::VitaError;

// ── Row type ───────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct NotificationRow {
    pub id: Uuid,
    #[sqlx(rename = "type")]
    #[serde(rename = "type")]
    pub type_: String,
    pub titre: String,
    pub contenu: String,
    pub lien: Option<String>,
    pub lue: bool,
    pub created_at: DateTime<Utc>,
}

// ── Handlers ───────────────────────────────────────────────────────

/// GET /api/v1/notifications — List recent notifications (max 30) + unread count.
pub async fn get_notifications(
    pool: web::Data<PgPool>,
    user: AuthUser,
) -> Result<HttpResponse, VitaError> {
    let user_id = Uuid::parse_str(&user.user_id)
        .map_err(|_| VitaError::Internal("Invalid user ID".into()))?;

    let notifications = sqlx::query_as::<_, NotificationRow>(
        r#"SELECT id, type, titre, contenu, lien, lue, created_at
           FROM notifications
           WHERE user_id = $1
           ORDER BY created_at DESC
           LIMIT 30"#,
    )
    .bind(user_id)
    .fetch_all(pool.get_ref())
    .await?;

    let unread_count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND lue = FALSE",
    )
    .bind(user_id)
    .fetch_one(pool.get_ref())
    .await
    .unwrap_or(0);

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "notifications": notifications,
        "unread_count": unread_count,
    })))
}

/// POST /api/v1/notifications/mark-read — Mark all notifications as read.
pub async fn mark_all_read(
    pool: web::Data<PgPool>,
    user: AuthUser,
) -> Result<HttpResponse, VitaError> {
    let user_id = Uuid::parse_str(&user.user_id)
        .map_err(|_| VitaError::Internal("Invalid user ID".into()))?;

    sqlx::query(
        "UPDATE notifications SET lue = TRUE WHERE user_id = $1 AND lue = FALSE",
    )
    .bind(user_id)
    .execute(pool.get_ref())
    .await?;

    Ok(HttpResponse::Ok().json(serde_json::json!({ "ok": true })))
}

/// POST /api/v1/notifications/{id}/read — Mark a single notification as read.
pub async fn mark_one_read(
    pool: web::Data<PgPool>,
    user: AuthUser,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, VitaError> {
    let user_id = Uuid::parse_str(&user.user_id)
        .map_err(|_| VitaError::Internal("Invalid user ID".into()))?;
    let notif_id = path.into_inner();

    sqlx::query(
        "UPDATE notifications SET lue = TRUE WHERE id = $1 AND user_id = $2",
    )
    .bind(notif_id)
    .bind(user_id)
    .execute(pool.get_ref())
    .await?;

    Ok(HttpResponse::Ok().json(serde_json::json!({ "ok": true })))
}

// ── Helper: insert a notification into the DB ──────────────────────

/// Insert a persistent notification for a user.
/// Called from emission, transaction, and governance handlers.
pub async fn insert_notification(
    pool: &PgPool,
    user_id: Uuid,
    type_: &str,
    titre: &str,
    contenu: &str,
    lien: Option<&str>,
) -> Result<(), VitaError> {
    sqlx::query(
        r#"INSERT INTO notifications (user_id, type, titre, contenu, lien)
           VALUES ($1, $2, $3, $4, $5)"#,
    )
    .bind(user_id)
    .bind(type_)
    .bind(titre)
    .bind(contenu)
    .bind(lien)
    .execute(pool)
    .await?;

    Ok(())
}
