use actix_web::{web, HttpResponse};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::middleware::{AuthUser, require_role};
use crate::error::VitaError;

// ── Types ────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct ForgeDocumentSummary {
    pub id: Uuid,
    pub title: String,
    pub version: i32,
    pub codex_ref: Option<i32>,
    pub locked: bool,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct ForgeDocument {
    pub id: Uuid,
    pub title: String,
    pub content: String,
    pub version: i32,
    pub codex_ref: Option<i32>,
    pub locked: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct ForgeDiffRow {
    pub id: Uuid,
    pub document_id: Uuid,
    pub author_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub content_new: String,
    pub status: String,
    pub votes_for: i32,
    pub votes_against: i32,
    pub created_at: DateTime<Utc>,
    pub reviewed_at: Option<DateTime<Utc>>,
    pub reviewer_id: Option<Uuid>,
    pub author_pseudo: Option<String>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct ForgeHistoryRow {
    pub id: Uuid,
    pub document_id: Uuid,
    pub version: i32,
    pub content: String,
    pub diff_id: Option<Uuid>,
    pub author_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateDiffBody {
    pub title: String,
    pub description: Option<String>,
    pub content_new: String,
}

#[derive(Debug, Deserialize)]
pub struct VoteDiffBody {
    pub choice: String, // "for" | "against"
}

// ── Handlers ─────────────────────────────────────────────────────────

/// GET /api/v1/forge/documents
pub async fn list_documents(
    pool: web::Data<PgPool>,
) -> Result<HttpResponse, VitaError> {
    let docs = sqlx::query_as::<_, ForgeDocumentSummary>(
        "SELECT id, title, version, codex_ref, locked, updated_at
         FROM forge_documents ORDER BY updated_at DESC",
    )
    .fetch_all(pool.get_ref())
    .await?;

    Ok(HttpResponse::Ok().json(docs))
}

/// GET /api/v1/forge/documents/{id}
pub async fn get_document(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, VitaError> {
    let doc_id = path.into_inner();

    let doc = sqlx::query_as::<_, ForgeDocument>(
        "SELECT * FROM forge_documents WHERE id = $1",
    )
    .bind(doc_id)
    .fetch_optional(pool.get_ref())
    .await?
    .ok_or_else(|| VitaError::NotFound("Document introuvable".into()))?;

    let diffs = sqlx::query_as::<_, ForgeDiffRow>(
        r#"SELECT d.id, d.document_id, d.author_id, d.title, d.description,
                  d.content_new, d.status, d.votes_for, d.votes_against,
                  d.created_at, d.reviewed_at, d.reviewer_id,
                  a.display_name as author_pseudo
           FROM forge_diffs d
           LEFT JOIN accounts a ON a.id = d.author_id
           WHERE d.document_id = $1
           ORDER BY d.created_at DESC"#,
    )
    .bind(doc.id)
    .fetch_all(pool.get_ref())
    .await
    .unwrap_or_default();

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "document": doc,
        "diffs": diffs,
    })))
}

/// GET /api/v1/forge/documents/{id}/history
pub async fn get_document_history(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, VitaError> {
    let doc_id = path.into_inner();

    let history = sqlx::query_as::<_, ForgeHistoryRow>(
        "SELECT * FROM forge_document_history WHERE document_id = $1 ORDER BY version DESC",
    )
    .bind(doc_id)
    .fetch_all(pool.get_ref())
    .await?;

    Ok(HttpResponse::Ok().json(history))
}

/// POST /api/v1/forge/documents/{id}/diffs — Propose a modification
pub async fn create_diff(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
    body: web::Json<CreateDiffBody>,
    user: AuthUser,
) -> Result<HttpResponse, VitaError> {
    let doc_id = path.into_inner();
    let user_id = Uuid::parse_str(&user.user_id)
        .map_err(|_| VitaError::Internal("Invalid user ID".into()))?;

    // Verify document exists and is not locked
    let locked: Option<bool> = sqlx::query_scalar(
        "SELECT locked FROM forge_documents WHERE id = $1",
    )
    .bind(doc_id)
    .fetch_optional(pool.get_ref())
    .await?;

    match locked {
        None => return Err(VitaError::NotFound("Document introuvable".into())),
        Some(true) => {
            return Ok(HttpResponse::build(actix_web::http::StatusCode::LOCKED)
                .json(serde_json::json!({
                    "error": "Document verrouille pendant un vote en cours"
                })))
        }
        _ => {}
    }

    let diff_id: Uuid = sqlx::query_scalar(
        r#"INSERT INTO forge_diffs (document_id, author_id, title, description, content_new)
           VALUES ($1, $2, $3, $4, $5) RETURNING id"#,
    )
    .bind(doc_id)
    .bind(user_id)
    .bind(&body.title)
    .bind(&body.description)
    .bind(&body.content_new)
    .fetch_one(pool.get_ref())
    .await?;

    Ok(HttpResponse::Created().json(serde_json::json!({ "diff_id": diff_id })))
}

/// POST /api/v1/forge/diffs/{id}/vote
pub async fn vote_diff(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
    body: web::Json<VoteDiffBody>,
    user: AuthUser,
) -> Result<HttpResponse, VitaError> {
    let diff_id = path.into_inner();
    let user_id = Uuid::parse_str(&user.user_id)
        .map_err(|_| VitaError::Internal("Invalid user ID".into()))?;

    if body.choice != "for" && body.choice != "against" {
        return Err(VitaError::BadRequest("choice must be 'for' or 'against'".into()));
    }

    // Upsert vote
    sqlx::query(
        r#"INSERT INTO forge_diff_votes (diff_id, account_id, choice)
           VALUES ($1, $2, $3)
           ON CONFLICT (diff_id, account_id) DO UPDATE SET choice = EXCLUDED.choice"#,
    )
    .bind(diff_id)
    .bind(user_id)
    .bind(&body.choice)
    .execute(pool.get_ref())
    .await?;

    // Recount
    sqlx::query(
        r#"UPDATE forge_diffs SET
           votes_for     = (SELECT COUNT(*) FROM forge_diff_votes WHERE diff_id = $1 AND choice = 'for'),
           votes_against = (SELECT COUNT(*) FROM forge_diff_votes WHERE diff_id = $1 AND choice = 'against')
           WHERE id = $1"#,
    )
    .bind(diff_id)
    .execute(pool.get_ref())
    .await?;

    Ok(HttpResponse::Ok().json(serde_json::json!({ "ok": true })))
}

/// POST /api/v1/forge/diffs/{id}/merge — Apply the modification (Referent+)
pub async fn merge_diff(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
    user: AuthUser,
) -> Result<HttpResponse, VitaError> {
    require_role(&user, &["referent", "mandataire", "gardien", "dieu", "super_admin", "admin"])?;

    let diff_id = path.into_inner();
    let user_id = Uuid::parse_str(&user.user_id)
        .map_err(|_| VitaError::Internal("Invalid user ID".into()))?;

    // Fetch the diff
    let diff = sqlx::query_as::<_, ForgeDiffRow>(
        r#"SELECT d.id, d.document_id, d.author_id, d.title, d.description,
                  d.content_new, d.status, d.votes_for, d.votes_against,
                  d.created_at, d.reviewed_at, d.reviewer_id,
                  NULL::text as author_pseudo
           FROM forge_diffs d WHERE d.id = $1"#,
    )
    .bind(diff_id)
    .fetch_optional(pool.get_ref())
    .await?
    .ok_or_else(|| VitaError::NotFound("Diff introuvable".into()))?;

    if diff.status == "merged" {
        return Err(VitaError::BadRequest("Ce diff a deja ete fusionne".into()));
    }

    let mut tx = pool.begin().await?;

    // Save current version to history
    sqlx::query(
        r#"INSERT INTO forge_document_history (document_id, version, content, diff_id, author_id)
           SELECT id, version, content, $2, $3 FROM forge_documents WHERE id = $1"#,
    )
    .bind(diff.document_id)
    .bind(diff_id)
    .bind(user_id)
    .execute(&mut *tx)
    .await?;

    // Apply the modification
    sqlx::query(
        "UPDATE forge_documents SET content = $1, version = version + 1, updated_at = NOW() WHERE id = $2",
    )
    .bind(&diff.content_new)
    .bind(diff.document_id)
    .execute(&mut *tx)
    .await?;

    // Mark diff as merged
    sqlx::query(
        "UPDATE forge_diffs SET status = 'merged', reviewed_at = NOW(), reviewer_id = $1 WHERE id = $2",
    )
    .bind(user_id)
    .bind(diff_id)
    .execute(&mut *tx)
    .await?;

    // If document is linked to a codex article, update the article too
    let codex_ref: Option<i32> = sqlx::query_scalar(
        "SELECT codex_ref FROM forge_documents WHERE id = $1",
    )
    .bind(diff.document_id)
    .fetch_one(&mut *tx)
    .await?;

    if let Some(article_number) = codex_ref {
        sqlx::query(
            "UPDATE codex_articles SET content = $1, version = version + 1, updated_at = NOW() WHERE number = $2 AND immutable = FALSE",
        )
        .bind(&diff.content_new)
        .bind(article_number)
        .execute(&mut *tx)
        .await?;

        // Add codex version entry
        sqlx::query(
            r#"INSERT INTO codex_versions (article_id, version, content, change_summary, author_id)
               SELECT id, version, $2, $3, $4
               FROM codex_articles WHERE number = $1"#,
        )
        .bind(article_number)
        .bind(&diff.content_new)
        .bind(&diff.title)
        .bind(user_id)
        .execute(&mut *tx)
        .await?;
    }

    tx.commit().await?;

    Ok(HttpResponse::Ok().json(serde_json::json!({ "ok": true })))
}
