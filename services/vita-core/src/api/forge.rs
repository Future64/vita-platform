use actix_web::{web, HttpResponse};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::middleware::{AuthUser, require_role};
use crate::error::VitaError;

// ── Types ────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct ProjectSummary {
    pub id: Uuid,
    pub title: String,
    pub description: String,
    pub codex_ref: Option<i32>,
    pub default_branch: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub branch_count: Option<i64>,
    pub mr_count: Option<i64>,
    pub contributor_count: Option<i64>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct BranchRow {
    pub id: Uuid,
    pub project_id: Uuid,
    pub name: String,
    pub is_default: bool,
    pub head_commit_id: Option<Uuid>,
    pub created_by: Uuid,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct CommitRow {
    pub id: Uuid,
    pub branch_id: Uuid,
    pub author_id: Uuid,
    pub message: String,
    pub content: String,
    pub parent_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub author_name: Option<String>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct MergeRequestRow {
    pub id: Uuid,
    pub project_id: Uuid,
    pub source_branch_id: Uuid,
    pub target_branch_id: Uuid,
    pub title: String,
    pub description: String,
    pub author_id: Uuid,
    pub status: String,
    pub votes_for: i32,
    pub votes_against: i32,
    pub merged_by: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub author_name: Option<String>,
    pub source_branch_name: Option<String>,
    pub target_branch_name: Option<String>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct MRCommentRow {
    pub id: Uuid,
    pub merge_request_id: Uuid,
    pub author_id: Uuid,
    pub content: String,
    pub created_at: DateTime<Utc>,
    pub author_name: Option<String>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct ContributorRow {
    pub author_id: Uuid,
    pub project_id: Uuid,
    pub display_name: Option<String>,
    pub commit_count: Option<i64>,
    pub mr_count: Option<i64>,
    pub last_active: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct CreateProjectBody {
    pub title: String,
    pub description: Option<String>,
    pub content: String,
    pub codex_ref: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct CreateBranchBody {
    pub name: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateCommitBody {
    pub message: String,
    pub content: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateMergeRequestBody {
    pub project_id: Uuid,
    pub source_branch_id: Uuid,
    pub target_branch_id: Uuid,
    pub title: String,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct VoteMRBody {
    pub choice: String, // "for" | "against"
}

// ── Public Handlers ──────────────────────────────────────────────────

/// GET /api/v1/forge/projects
pub async fn list_projects(
    pool: web::Data<PgPool>,
) -> Result<HttpResponse, VitaError> {
    let projects = sqlx::query_as::<_, ProjectSummary>(
        r#"SELECT
            p.id, p.title, p.description, p.codex_ref, p.default_branch,
            p.created_at, p.updated_at,
            (SELECT COUNT(*) FROM forge_branches WHERE project_id = p.id) AS branch_count,
            (SELECT COUNT(*) FROM forge_merge_requests WHERE project_id = p.id) AS mr_count,
            (SELECT COUNT(DISTINCT c.author_id) FROM forge_commits c
             JOIN forge_branches b ON b.id = c.branch_id WHERE b.project_id = p.id) AS contributor_count
           FROM forge_projects p
           ORDER BY p.updated_at DESC"#,
    )
    .fetch_all(pool.get_ref())
    .await?;

    Ok(HttpResponse::Ok().json(projects))
}

/// GET /api/v1/forge/projects/{id}
pub async fn get_project(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, VitaError> {
    let project_id = path.into_inner();

    let project = sqlx::query_as::<_, ProjectSummary>(
        r#"SELECT
            p.id, p.title, p.description, p.codex_ref, p.default_branch,
            p.created_at, p.updated_at,
            (SELECT COUNT(*) FROM forge_branches WHERE project_id = p.id) AS branch_count,
            (SELECT COUNT(*) FROM forge_merge_requests WHERE project_id = p.id) AS mr_count,
            (SELECT COUNT(DISTINCT c.author_id) FROM forge_commits c
             JOIN forge_branches b ON b.id = c.branch_id WHERE b.project_id = p.id) AS contributor_count
           FROM forge_projects p
           WHERE p.id = $1"#,
    )
    .bind(project_id)
    .fetch_optional(pool.get_ref())
    .await?
    .ok_or_else(|| VitaError::NotFound("Projet introuvable".into()))?;

    let branches = sqlx::query_as::<_, BranchRow>(
        "SELECT * FROM forge_branches WHERE project_id = $1 ORDER BY is_default DESC, created_at ASC",
    )
    .bind(project_id)
    .fetch_all(pool.get_ref())
    .await?;

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "project": project,
        "branches": branches,
    })))
}

/// GET /api/v1/forge/branches/{id}/commits
pub async fn get_branch_commits(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, VitaError> {
    let branch_id = path.into_inner();

    let commits = sqlx::query_as::<_, CommitRow>(
        r#"SELECT c.id, c.branch_id, c.author_id, c.message, c.content,
                  c.parent_id, c.created_at,
                  a.display_name AS author_name
           FROM forge_commits c
           LEFT JOIN accounts a ON a.id = c.author_id
           WHERE c.branch_id = $1
           ORDER BY c.created_at DESC"#,
    )
    .bind(branch_id)
    .fetch_all(pool.get_ref())
    .await?;

    Ok(HttpResponse::Ok().json(commits))
}

/// GET /api/v1/forge/commits/{id}
pub async fn get_commit(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, VitaError> {
    let commit_id = path.into_inner();

    let commit = sqlx::query_as::<_, CommitRow>(
        r#"SELECT c.id, c.branch_id, c.author_id, c.message, c.content,
                  c.parent_id, c.created_at,
                  a.display_name AS author_name
           FROM forge_commits c
           LEFT JOIN accounts a ON a.id = c.author_id
           WHERE c.id = $1"#,
    )
    .bind(commit_id)
    .fetch_optional(pool.get_ref())
    .await?
    .ok_or_else(|| VitaError::NotFound("Commit introuvable".into()))?;

    Ok(HttpResponse::Ok().json(commit))
}

/// GET /api/v1/forge/merge-requests/{id}
pub async fn get_merge_request(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, VitaError> {
    let mr_id = path.into_inner();

    let mr = sqlx::query_as::<_, MergeRequestRow>(
        r#"SELECT mr.id, mr.project_id, mr.source_branch_id, mr.target_branch_id,
                  mr.title, mr.description, mr.author_id, mr.status,
                  mr.votes_for, mr.votes_against, mr.merged_by,
                  mr.created_at, mr.updated_at,
                  a.display_name AS author_name,
                  sb.name AS source_branch_name,
                  tb.name AS target_branch_name
           FROM forge_merge_requests mr
           LEFT JOIN accounts a ON a.id = mr.author_id
           LEFT JOIN forge_branches sb ON sb.id = mr.source_branch_id
           LEFT JOIN forge_branches tb ON tb.id = mr.target_branch_id
           WHERE mr.id = $1"#,
    )
    .bind(mr_id)
    .fetch_optional(pool.get_ref())
    .await?
    .ok_or_else(|| VitaError::NotFound("Merge request introuvable".into()))?;

    // Get source and target head content for diff
    let source_content: Option<String> = sqlx::query_scalar(
        r#"SELECT c.content FROM forge_commits c
           JOIN forge_branches b ON b.head_commit_id = c.id
           WHERE b.id = $1"#,
    )
    .bind(mr.source_branch_id)
    .fetch_optional(pool.get_ref())
    .await?;

    let target_content: Option<String> = sqlx::query_scalar(
        r#"SELECT c.content FROM forge_commits c
           JOIN forge_branches b ON b.head_commit_id = c.id
           WHERE b.id = $1"#,
    )
    .bind(mr.target_branch_id)
    .fetch_optional(pool.get_ref())
    .await?;

    let comments = sqlx::query_as::<_, MRCommentRow>(
        r#"SELECT mc.id, mc.merge_request_id, mc.author_id, mc.content, mc.created_at,
                  a.display_name AS author_name
           FROM forge_mr_comments mc
           LEFT JOIN accounts a ON a.id = mc.author_id
           WHERE mc.merge_request_id = $1
           ORDER BY mc.created_at ASC"#,
    )
    .bind(mr_id)
    .fetch_all(pool.get_ref())
    .await?;

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "merge_request": mr,
        "source_content": source_content,
        "target_content": target_content,
        "comments": comments,
    })))
}

/// GET /api/v1/forge/projects/{id}/merge-requests
pub async fn list_project_mrs(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, VitaError> {
    let project_id = path.into_inner();

    let mrs = sqlx::query_as::<_, MergeRequestRow>(
        r#"SELECT mr.id, mr.project_id, mr.source_branch_id, mr.target_branch_id,
                  mr.title, mr.description, mr.author_id, mr.status,
                  mr.votes_for, mr.votes_against, mr.merged_by,
                  mr.created_at, mr.updated_at,
                  a.display_name AS author_name,
                  sb.name AS source_branch_name,
                  tb.name AS target_branch_name
           FROM forge_merge_requests mr
           LEFT JOIN accounts a ON a.id = mr.author_id
           LEFT JOIN forge_branches sb ON sb.id = mr.source_branch_id
           LEFT JOIN forge_branches tb ON tb.id = mr.target_branch_id
           WHERE mr.project_id = $1
           ORDER BY mr.updated_at DESC"#,
    )
    .bind(project_id)
    .fetch_all(pool.get_ref())
    .await?;

    Ok(HttpResponse::Ok().json(mrs))
}

/// GET /api/v1/forge/projects/{id}/contributors
pub async fn list_project_contributors(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, VitaError> {
    let project_id = path.into_inner();

    let contributors = sqlx::query_as::<_, ContributorRow>(
        r#"SELECT author_id, project_id, display_name, commit_count, mr_count, last_active
           FROM forge_contributors
           WHERE project_id = $1
           ORDER BY commit_count DESC"#,
    )
    .bind(project_id)
    .fetch_all(pool.get_ref())
    .await?;

    Ok(HttpResponse::Ok().json(contributors))
}

// ── Protected Handlers ───────────────────────────────────────────────

/// POST /api/v1/forge/projects — Create project + default branch + initial commit
pub async fn create_project(
    pool: web::Data<PgPool>,
    body: web::Json<CreateProjectBody>,
    user: AuthUser,
) -> Result<HttpResponse, VitaError> {
    let user_uuid = Uuid::parse_str(&user.user_id)
        .map_err(|_| VitaError::Internal("Invalid user ID".into()))?;

    // Resolve account id
    let account_id: Uuid = sqlx::query_scalar(
        "SELECT id FROM accounts WHERE user_id = $1",
    )
    .bind(user_uuid)
    .fetch_optional(pool.get_ref())
    .await?
    .ok_or_else(|| VitaError::NotFound("Compte introuvable".into()))?;

    let mut tx = pool.begin().await?;

    // Create project
    let project_id: Uuid = sqlx::query_scalar(
        r#"INSERT INTO forge_projects (title, description, codex_ref, created_by)
           VALUES ($1, $2, $3, $4) RETURNING id"#,
    )
    .bind(&body.title)
    .bind(body.description.as_deref().unwrap_or(""))
    .bind(body.codex_ref)
    .bind(account_id)
    .fetch_one(&mut *tx)
    .await?;

    // Create default branch
    let branch_id: Uuid = sqlx::query_scalar(
        r#"INSERT INTO forge_branches (project_id, name, is_default, created_by)
           VALUES ($1, 'main', TRUE, $2) RETURNING id"#,
    )
    .bind(project_id)
    .bind(account_id)
    .fetch_one(&mut *tx)
    .await?;

    // Create initial commit
    let commit_id: Uuid = sqlx::query_scalar(
        r#"INSERT INTO forge_commits (branch_id, author_id, message, content)
           VALUES ($1, $2, 'Contenu initial', $3) RETURNING id"#,
    )
    .bind(branch_id)
    .bind(account_id)
    .bind(&body.content)
    .fetch_one(&mut *tx)
    .await?;

    // Link head_commit and default_branch
    sqlx::query("UPDATE forge_branches SET head_commit_id = $1 WHERE id = $2")
        .bind(commit_id)
        .bind(branch_id)
        .execute(&mut *tx)
        .await?;

    sqlx::query("UPDATE forge_projects SET default_branch = $1 WHERE id = $2")
        .bind(branch_id)
        .bind(project_id)
        .execute(&mut *tx)
        .await?;

    tx.commit().await?;

    Ok(HttpResponse::Created().json(serde_json::json!({
        "project_id": project_id,
        "branch_id": branch_id,
        "commit_id": commit_id,
    })))
}

/// POST /api/v1/forge/projects/{id}/branches — Create branch from default branch head
pub async fn create_branch(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
    body: web::Json<CreateBranchBody>,
    user: AuthUser,
) -> Result<HttpResponse, VitaError> {
    let project_id = path.into_inner();
    let user_uuid = Uuid::parse_str(&user.user_id)
        .map_err(|_| VitaError::Internal("Invalid user ID".into()))?;

    let account_id: Uuid = sqlx::query_scalar(
        "SELECT id FROM accounts WHERE user_id = $1",
    )
    .bind(user_uuid)
    .fetch_optional(pool.get_ref())
    .await?
    .ok_or_else(|| VitaError::NotFound("Compte introuvable".into()))?;

    // Get default branch head commit
    let head_commit_id: Option<Uuid> = sqlx::query_scalar(
        r#"SELECT b.head_commit_id FROM forge_branches b
           JOIN forge_projects p ON p.default_branch = b.id
           WHERE p.id = $1"#,
    )
    .bind(project_id)
    .fetch_optional(pool.get_ref())
    .await?
    .ok_or_else(|| VitaError::NotFound("Projet introuvable ou sans branche par defaut".into()))?;

    let mut tx = pool.begin().await?;

    // Create branch
    let branch_id: Uuid = sqlx::query_scalar(
        r#"INSERT INTO forge_branches (project_id, name, is_default, head_commit_id, created_by)
           VALUES ($1, $2, FALSE, $3, $4) RETURNING id"#,
    )
    .bind(project_id)
    .bind(&body.name)
    .bind(head_commit_id)
    .bind(account_id)
    .fetch_one(&mut *tx)
    .await?;

    // If there is a head commit, also create a copy of that commit on the new branch
    // so the branch has its own initial commit
    if let Some(parent_commit_id) = head_commit_id {
        let content: String = sqlx::query_scalar(
            "SELECT content FROM forge_commits WHERE id = $1",
        )
        .bind(parent_commit_id)
        .fetch_one(&mut *tx)
        .await?;

        let new_commit_id: Uuid = sqlx::query_scalar(
            r#"INSERT INTO forge_commits (branch_id, author_id, message, content, parent_id)
               VALUES ($1, $2, $3, $4, $5) RETURNING id"#,
        )
        .bind(branch_id)
        .bind(account_id)
        .bind(format!("Branche {} creee depuis main", &body.name))
        .bind(&content)
        .bind(parent_commit_id)
        .fetch_one(&mut *tx)
        .await?;

        sqlx::query("UPDATE forge_branches SET head_commit_id = $1 WHERE id = $2")
            .bind(new_commit_id)
            .bind(branch_id)
            .execute(&mut *tx)
            .await?;
    }

    tx.commit().await?;

    Ok(HttpResponse::Created().json(serde_json::json!({ "branch_id": branch_id })))
}

/// POST /api/v1/forge/branches/{id}/commits — Add commit to a branch
pub async fn create_commit(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
    body: web::Json<CreateCommitBody>,
    user: AuthUser,
) -> Result<HttpResponse, VitaError> {
    let branch_id = path.into_inner();
    let user_uuid = Uuid::parse_str(&user.user_id)
        .map_err(|_| VitaError::Internal("Invalid user ID".into()))?;

    let account_id: Uuid = sqlx::query_scalar(
        "SELECT id FROM accounts WHERE user_id = $1",
    )
    .bind(user_uuid)
    .fetch_optional(pool.get_ref())
    .await?
    .ok_or_else(|| VitaError::NotFound("Compte introuvable".into()))?;

    // Check branch exists and is not default
    let branch = sqlx::query_as::<_, BranchRow>(
        "SELECT * FROM forge_branches WHERE id = $1",
    )
    .bind(branch_id)
    .fetch_optional(pool.get_ref())
    .await?
    .ok_or_else(|| VitaError::NotFound("Branche introuvable".into()))?;

    if branch.is_default {
        return Err(VitaError::BadRequest(
            "Impossible de commiter directement sur la branche par defaut. Creez une branche et une merge request.".into(),
        ));
    }

    let mut tx = pool.begin().await?;

    let commit_id: Uuid = sqlx::query_scalar(
        r#"INSERT INTO forge_commits (branch_id, author_id, message, content, parent_id)
           VALUES ($1, $2, $3, $4, $5) RETURNING id"#,
    )
    .bind(branch_id)
    .bind(account_id)
    .bind(&body.message)
    .bind(&body.content)
    .bind(branch.head_commit_id)
    .fetch_one(&mut *tx)
    .await?;

    // Update head
    sqlx::query("UPDATE forge_branches SET head_commit_id = $1 WHERE id = $2")
        .bind(commit_id)
        .bind(branch_id)
        .execute(&mut *tx)
        .await?;

    // Update project updated_at
    sqlx::query("UPDATE forge_projects SET updated_at = NOW() WHERE id = $1")
        .bind(branch.project_id)
        .execute(&mut *tx)
        .await?;

    tx.commit().await?;

    Ok(HttpResponse::Created().json(serde_json::json!({ "commit_id": commit_id })))
}

/// POST /api/v1/forge/merge-requests — Create a merge request
pub async fn create_merge_request(
    pool: web::Data<PgPool>,
    body: web::Json<CreateMergeRequestBody>,
    user: AuthUser,
) -> Result<HttpResponse, VitaError> {
    let user_uuid = Uuid::parse_str(&user.user_id)
        .map_err(|_| VitaError::Internal("Invalid user ID".into()))?;

    let account_id: Uuid = sqlx::query_scalar(
        "SELECT id FROM accounts WHERE user_id = $1",
    )
    .bind(user_uuid)
    .fetch_optional(pool.get_ref())
    .await?
    .ok_or_else(|| VitaError::NotFound("Compte introuvable".into()))?;

    let mr_id: Uuid = sqlx::query_scalar(
        r#"INSERT INTO forge_merge_requests
           (project_id, source_branch_id, target_branch_id, title, description, author_id)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id"#,
    )
    .bind(body.project_id)
    .bind(body.source_branch_id)
    .bind(body.target_branch_id)
    .bind(&body.title)
    .bind(body.description.as_deref().unwrap_or(""))
    .bind(account_id)
    .fetch_one(pool.get_ref())
    .await?;

    Ok(HttpResponse::Created().json(serde_json::json!({ "merge_request_id": mr_id })))
}

/// POST /api/v1/forge/merge-requests/{id}/vote
pub async fn vote_merge_request(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
    body: web::Json<VoteMRBody>,
    user: AuthUser,
) -> Result<HttpResponse, VitaError> {
    let mr_id = path.into_inner();
    let user_uuid = Uuid::parse_str(&user.user_id)
        .map_err(|_| VitaError::Internal("Invalid user ID".into()))?;

    let account_id: Uuid = sqlx::query_scalar(
        "SELECT id FROM accounts WHERE user_id = $1",
    )
    .bind(user_uuid)
    .fetch_optional(pool.get_ref())
    .await?
    .ok_or_else(|| VitaError::NotFound("Compte introuvable".into()))?;

    if body.choice != "for" && body.choice != "against" {
        return Err(VitaError::BadRequest("choice must be 'for' or 'against'".into()));
    }

    // Check MR is open or voting
    let status: String = sqlx::query_scalar(
        "SELECT status FROM forge_merge_requests WHERE id = $1",
    )
    .bind(mr_id)
    .fetch_optional(pool.get_ref())
    .await?
    .ok_or_else(|| VitaError::NotFound("Merge request introuvable".into()))?;

    if status != "open" && status != "voting" {
        return Err(VitaError::BadRequest("Cette merge request n'accepte plus de votes".into()));
    }

    // Upsert vote
    sqlx::query(
        r#"INSERT INTO forge_mr_votes (merge_request_id, account_id, choice)
           VALUES ($1, $2, $3)
           ON CONFLICT (merge_request_id, account_id) DO UPDATE SET choice = EXCLUDED.choice"#,
    )
    .bind(mr_id)
    .bind(account_id)
    .bind(&body.choice)
    .execute(pool.get_ref())
    .await?;

    // Recount
    sqlx::query(
        r#"UPDATE forge_merge_requests SET
           votes_for     = (SELECT COUNT(*) FROM forge_mr_votes WHERE merge_request_id = $1 AND choice = 'for'),
           votes_against = (SELECT COUNT(*) FROM forge_mr_votes WHERE merge_request_id = $1 AND choice = 'against'),
           updated_at = NOW()
           WHERE id = $1"#,
    )
    .bind(mr_id)
    .execute(pool.get_ref())
    .await?;

    Ok(HttpResponse::Ok().json(serde_json::json!({ "ok": true })))
}

/// POST /api/v1/forge/merge-requests/{id}/merge — Merge (referent+)
pub async fn merge_merge_request(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
    user: AuthUser,
) -> Result<HttpResponse, VitaError> {
    require_role(&user, &["referent", "mandataire", "gardien", "dieu", "super_admin", "admin"])?;

    let mr_id = path.into_inner();
    let user_uuid = Uuid::parse_str(&user.user_id)
        .map_err(|_| VitaError::Internal("Invalid user ID".into()))?;

    let account_id: Uuid = sqlx::query_scalar(
        "SELECT id FROM accounts WHERE user_id = $1",
    )
    .bind(user_uuid)
    .fetch_optional(pool.get_ref())
    .await?
    .ok_or_else(|| VitaError::NotFound("Compte introuvable".into()))?;

    // Fetch the MR
    let mr = sqlx::query_as::<_, MergeRequestRow>(
        r#"SELECT mr.id, mr.project_id, mr.source_branch_id, mr.target_branch_id,
                  mr.title, mr.description, mr.author_id, mr.status,
                  mr.votes_for, mr.votes_against, mr.merged_by,
                  mr.created_at, mr.updated_at,
                  NULL::text AS author_name,
                  NULL::text AS source_branch_name,
                  NULL::text AS target_branch_name
           FROM forge_merge_requests mr WHERE mr.id = $1"#,
    )
    .bind(mr_id)
    .fetch_optional(pool.get_ref())
    .await?
    .ok_or_else(|| VitaError::NotFound("Merge request introuvable".into()))?;

    if mr.status == "merged" {
        return Err(VitaError::BadRequest("Cette merge request a deja ete fusionnee".into()));
    }
    if mr.status == "rejected" {
        return Err(VitaError::BadRequest("Cette merge request a ete rejetee".into()));
    }

    // Get source branch head content
    let source_content: String = sqlx::query_scalar(
        r#"SELECT c.content FROM forge_commits c
           JOIN forge_branches b ON b.head_commit_id = c.id
           WHERE b.id = $1"#,
    )
    .bind(mr.source_branch_id)
    .fetch_optional(pool.get_ref())
    .await?
    .ok_or_else(|| VitaError::Internal("Branche source sans commit".into()))?;

    let mut tx = pool.begin().await?;

    // Get current target head commit id
    let target_head: Option<Uuid> = sqlx::query_scalar(
        "SELECT head_commit_id FROM forge_branches WHERE id = $1",
    )
    .bind(mr.target_branch_id)
    .fetch_one(&mut *tx)
    .await?;

    // Create merge commit on target branch
    let merge_commit_id: Uuid = sqlx::query_scalar(
        r#"INSERT INTO forge_commits (branch_id, author_id, message, content, parent_id)
           VALUES ($1, $2, $3, $4, $5) RETURNING id"#,
    )
    .bind(mr.target_branch_id)
    .bind(account_id)
    .bind(format!("Merge: {}", &mr.title))
    .bind(&source_content)
    .bind(target_head)
    .fetch_one(&mut *tx)
    .await?;

    // Update target branch head
    sqlx::query("UPDATE forge_branches SET head_commit_id = $1 WHERE id = $2")
        .bind(merge_commit_id)
        .bind(mr.target_branch_id)
        .execute(&mut *tx)
        .await?;

    // Mark MR as merged
    sqlx::query(
        "UPDATE forge_merge_requests SET status = 'merged', merged_by = $1, updated_at = NOW() WHERE id = $2",
    )
    .bind(account_id)
    .bind(mr_id)
    .execute(&mut *tx)
    .await?;

    // Update project updated_at
    sqlx::query("UPDATE forge_projects SET updated_at = NOW() WHERE id = $1")
        .bind(mr.project_id)
        .execute(&mut *tx)
        .await?;

    // If project is linked to a codex article, update the article
    let codex_ref: Option<i32> = sqlx::query_scalar(
        "SELECT codex_ref FROM forge_projects WHERE id = $1",
    )
    .bind(mr.project_id)
    .fetch_one(&mut *tx)
    .await?;

    if let Some(article_number) = codex_ref {
        sqlx::query(
            "UPDATE codex_articles SET content = $1, version = version + 1, updated_at = NOW() WHERE number = $2 AND immutable = FALSE",
        )
        .bind(&source_content)
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
        .bind(&source_content)
        .bind(&mr.title)
        .bind(account_id)
        .execute(&mut *tx)
        .await?;
    }

    tx.commit().await?;

    Ok(HttpResponse::Ok().json(serde_json::json!({ "ok": true })))
}
