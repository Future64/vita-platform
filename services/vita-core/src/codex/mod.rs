use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::VitaError;

// ── row types ───────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct CodexTitle {
    pub id: Uuid,
    pub number: String,
    pub name: String,
    pub description: Option<String>,
    pub display_order: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct CodexArticle {
    pub id: Uuid,
    pub title_id: Uuid,
    pub number: i32,
    pub name: String,
    pub content: String,
    pub rationale: Option<String>,
    pub immutable: bool,
    pub status: String,
    pub version: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct CodexVersion {
    pub id: Uuid,
    pub article_id: Uuid,
    pub version: i32,
    pub content: String,
    pub rationale: Option<String>,
    pub change_summary: Option<String>,
    pub author_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct CodexAmendment {
    pub id: Uuid,
    pub article_id: Uuid,
    pub proposed_content: String,
    pub proposed_rationale: Option<String>,
    pub change_summary: String,
    pub author_id: Uuid,
    pub status: String,
    pub co_signatures: i32,
    pub created_at: DateTime<Utc>,
    pub deliberation_end: Option<DateTime<Utc>>,
    pub voting_end: Option<DateTime<Utc>>,
}

// ── summary types (without full content) ────────────────────────────

#[derive(Debug, Clone, Serialize)]
pub struct ArticleSummary {
    pub id: Uuid,
    pub number: i32,
    pub name: String,
    pub immutable: bool,
    pub status: String,
    pub version: i32,
}

#[derive(Debug, Clone, Serialize)]
pub struct TitleWithArticles {
    pub id: Uuid,
    pub number: String,
    pub name: String,
    pub description: Option<String>,
    pub display_order: i32,
    pub articles: Vec<ArticleSummary>,
}

// ── queries ─────────────────────────────────────────────────────────

pub async fn get_titles(pool: &PgPool) -> Result<Vec<CodexTitle>, VitaError> {
    let rows = sqlx::query_as::<_, CodexTitle>(
        "SELECT * FROM codex_titles ORDER BY display_order",
    )
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn get_titles_with_articles(pool: &PgPool) -> Result<Vec<TitleWithArticles>, VitaError> {
    let titles = get_titles(pool).await?;
    let articles = sqlx::query_as::<_, CodexArticle>(
        "SELECT * FROM codex_articles ORDER BY number",
    )
    .fetch_all(pool)
    .await?;

    let result = titles
        .into_iter()
        .map(|t| {
            let arts: Vec<ArticleSummary> = articles
                .iter()
                .filter(|a| a.title_id == t.id)
                .map(|a| ArticleSummary {
                    id: a.id,
                    number: a.number,
                    name: a.name.clone(),
                    immutable: a.immutable,
                    status: a.status.clone(),
                    version: a.version,
                })
                .collect();
            TitleWithArticles {
                id: t.id,
                number: t.number,
                name: t.name,
                description: t.description,
                display_order: t.display_order,
                articles: arts,
            }
        })
        .collect();
    Ok(result)
}

pub async fn get_articles(
    pool: &PgPool,
    title_id: Option<Uuid>,
) -> Result<Vec<CodexArticle>, VitaError> {
    if let Some(tid) = title_id {
        let rows = sqlx::query_as::<_, CodexArticle>(
            "SELECT * FROM codex_articles WHERE title_id = $1 ORDER BY number",
        )
        .bind(tid)
        .fetch_all(pool)
        .await?;
        Ok(rows)
    } else {
        let rows = sqlx::query_as::<_, CodexArticle>(
            "SELECT * FROM codex_articles ORDER BY number",
        )
        .fetch_all(pool)
        .await?;
        Ok(rows)
    }
}

pub async fn get_article_by_number(
    pool: &PgPool,
    number: i32,
) -> Result<CodexArticle, VitaError> {
    sqlx::query_as::<_, CodexArticle>(
        "SELECT * FROM codex_articles WHERE number = $1",
    )
    .bind(number)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| VitaError::NotFound(format!("Article {number}")))
}

pub async fn get_article_versions(
    pool: &PgPool,
    article_id: Uuid,
) -> Result<Vec<CodexVersion>, VitaError> {
    let rows = sqlx::query_as::<_, CodexVersion>(
        "SELECT * FROM codex_versions WHERE article_id = $1 ORDER BY version DESC",
    )
    .bind(article_id)
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn create_amendment(
    pool: &PgPool,
    article_id: Uuid,
    author_id: Uuid,
    proposed_content: String,
    proposed_rationale: Option<String>,
    change_summary: String,
) -> Result<CodexAmendment, VitaError> {
    // Check that the article exists and is not immutable
    let article = sqlx::query_as::<_, CodexArticle>(
        "SELECT * FROM codex_articles WHERE id = $1",
    )
    .bind(article_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| VitaError::NotFound(format!("Article {article_id}")))?;

    if article.immutable {
        return Err(VitaError::BadRequest(
            "Cet article est immuable et ne peut pas être amendé".into(),
        ));
    }

    let amendment = sqlx::query_as::<_, CodexAmendment>(
        r#"INSERT INTO codex_amendments
               (article_id, author_id, proposed_content, proposed_rationale, change_summary)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *"#,
    )
    .bind(article_id)
    .bind(author_id)
    .bind(&proposed_content)
    .bind(&proposed_rationale)
    .bind(&change_summary)
    .fetch_one(pool)
    .await?;

    Ok(amendment)
}

pub async fn get_amendments(
    pool: &PgPool,
    status: Option<String>,
) -> Result<Vec<CodexAmendment>, VitaError> {
    if let Some(s) = status {
        let rows = sqlx::query_as::<_, CodexAmendment>(
            "SELECT * FROM codex_amendments WHERE status = $1 ORDER BY created_at DESC",
        )
        .bind(s)
        .fetch_all(pool)
        .await?;
        Ok(rows)
    } else {
        let rows = sqlx::query_as::<_, CodexAmendment>(
            "SELECT * FROM codex_amendments ORDER BY created_at DESC",
        )
        .fetch_all(pool)
        .await?;
        Ok(rows)
    }
}

// ── full export structure ───────────────────────────────────────────

#[derive(Debug, Serialize)]
pub struct CodexExport {
    pub titles: Vec<TitleWithArticlesExport>,
    pub exported_at: DateTime<Utc>,
    pub total_articles: usize,
}

#[derive(Debug, Serialize)]
pub struct TitleWithArticlesExport {
    pub number: String,
    pub name: String,
    pub description: Option<String>,
    pub articles: Vec<CodexArticle>,
}

pub async fn export_full(pool: &PgPool) -> Result<CodexExport, VitaError> {
    let titles = get_titles(pool).await?;
    let articles = get_articles(pool, None).await?;
    let total_articles = articles.len();

    let titles_export: Vec<TitleWithArticlesExport> = titles
        .into_iter()
        .map(|t| {
            let arts: Vec<CodexArticle> = articles
                .iter()
                .filter(|a| a.title_id == t.id)
                .cloned()
                .collect();
            TitleWithArticlesExport {
                number: t.number,
                name: t.name,
                description: t.description,
                articles: arts,
            }
        })
        .collect();

    Ok(CodexExport {
        titles: titles_export,
        exported_at: Utc::now(),
        total_articles,
    })
}
