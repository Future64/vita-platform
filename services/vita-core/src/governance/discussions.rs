use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::VitaError;

// ── Types ──────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct FilDiscussion {
    pub id: Uuid,
    pub proposition_id: Uuid,
    pub auteur_id: Uuid,
    pub sujet: String,
    pub categorie: String,
    pub epingle: bool,
    pub resolu: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct MessageDiscussion {
    pub id: Uuid,
    pub fil_id: Uuid,
    pub auteur_id: Uuid,
    pub contenu: String,
    pub reponse_a: Option<Uuid>,
    pub modifie: bool,
    pub reactions_approuve: i32,
    pub reactions_pertinent: i32,
    pub reactions_desaccord: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct FilFilters {
    pub categorie: Option<String>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

// ── Functions ──────────────────────────────────────────────────────

pub async fn create_fil(
    pool: &PgPool,
    proposition_id: Uuid,
    auteur_id: Uuid,
    sujet: &str,
    categorie: &str,
) -> Result<FilDiscussion, VitaError> {
    let valid_categories = [
        "argument_pour", "argument_contre", "question",
        "proposition_amendement", "technique", "general",
    ];
    if !valid_categories.contains(&categorie) {
        return Err(VitaError::BadRequest(format!(
            "Categorie invalide: {}. Valides: {:?}", categorie, valid_categories
        )));
    }

    if sujet.is_empty() || sujet.len() > 200 {
        return Err(VitaError::BadRequest("Sujet requis (max 200 caracteres)".into()));
    }

    // Verify proposition exists
    let exists: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM propositions WHERE id = $1)",
    )
    .bind(proposition_id)
    .fetch_one(pool)
    .await?;

    if !exists {
        return Err(VitaError::NotFound(format!("Proposition {proposition_id}")));
    }

    let fil = sqlx::query_as::<_, FilDiscussion>(
        r#"INSERT INTO fils_discussion (proposition_id, auteur_id, sujet, categorie)
           VALUES ($1, $2, $3, $4)
           RETURNING id, proposition_id, auteur_id, sujet, categorie,
                     epingle, resolu, created_at"#,
    )
    .bind(proposition_id)
    .bind(auteur_id)
    .bind(sujet)
    .bind(categorie)
    .fetch_one(pool)
    .await?;

    Ok(fil)
}

pub async fn get_fils(
    pool: &PgPool,
    proposition_id: Uuid,
    filters: &FilFilters,
) -> Result<Vec<FilDiscussion>, VitaError> {
    let limit = filters.limit.unwrap_or(50).min(100);
    let offset = filters.offset.unwrap_or(0).max(0);

    let fils = sqlx::query_as::<_, FilDiscussion>(
        r#"SELECT id, proposition_id, auteur_id, sujet, categorie,
                  epingle, resolu, created_at
           FROM fils_discussion
           WHERE proposition_id = $1
           ORDER BY epingle DESC, created_at DESC
           LIMIT $2 OFFSET $3"#,
    )
    .bind(proposition_id)
    .bind(limit)
    .bind(offset)
    .fetch_all(pool)
    .await?;

    let fils: Vec<FilDiscussion> = fils
        .into_iter()
        .filter(|f| {
            if let Some(ref cat) = filters.categorie {
                if f.categorie != *cat {
                    return false;
                }
            }
            true
        })
        .collect();

    Ok(fils)
}

pub async fn create_message(
    pool: &PgPool,
    fil_id: Uuid,
    auteur_id: Uuid,
    contenu: &str,
    reponse_a: Option<Uuid>,
) -> Result<MessageDiscussion, VitaError> {
    if contenu.is_empty() {
        return Err(VitaError::BadRequest("Contenu requis".into()));
    }
    if contenu.len() > 5000 {
        return Err(VitaError::BadRequest("Message trop long (max 5000 caracteres)".into()));
    }

    // Verify fil exists
    let exists: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM fils_discussion WHERE id = $1)",
    )
    .bind(fil_id)
    .fetch_one(pool)
    .await?;

    if !exists {
        return Err(VitaError::NotFound(format!("Fil de discussion {fil_id}")));
    }

    // If replying, verify parent message exists in same thread
    if let Some(parent_id) = reponse_a {
        let parent_exists: bool = sqlx::query_scalar(
            "SELECT EXISTS(SELECT 1 FROM messages_discussion WHERE id = $1 AND fil_id = $2)",
        )
        .bind(parent_id)
        .bind(fil_id)
        .fetch_one(pool)
        .await?;

        if !parent_exists {
            return Err(VitaError::NotFound("Message parent introuvable dans ce fil".into()));
        }
    }

    let msg = sqlx::query_as::<_, MessageDiscussion>(
        r#"INSERT INTO messages_discussion (fil_id, auteur_id, contenu, reponse_a)
           VALUES ($1, $2, $3, $4)
           RETURNING id, fil_id, auteur_id, contenu, reponse_a, modifie,
                     reactions_approuve, reactions_pertinent, reactions_desaccord,
                     created_at, updated_at"#,
    )
    .bind(fil_id)
    .bind(auteur_id)
    .bind(contenu)
    .bind(reponse_a)
    .fetch_one(pool)
    .await?;

    Ok(msg)
}

pub async fn get_messages(
    pool: &PgPool,
    fil_id: Uuid,
    limit: i64,
    offset: i64,
) -> Result<Vec<MessageDiscussion>, VitaError> {
    let limit = limit.min(100);
    let offset = offset.max(0);

    let messages = sqlx::query_as::<_, MessageDiscussion>(
        r#"SELECT id, fil_id, auteur_id, contenu, reponse_a, modifie,
                  reactions_approuve, reactions_pertinent, reactions_desaccord,
                  created_at, updated_at
           FROM messages_discussion
           WHERE fil_id = $1
           ORDER BY created_at ASC
           LIMIT $2 OFFSET $3"#,
    )
    .bind(fil_id)
    .bind(limit)
    .bind(offset)
    .fetch_all(pool)
    .await?;

    Ok(messages)
}

pub async fn reagir(
    pool: &PgPool,
    message_id: Uuid,
    type_reaction: &str,
) -> Result<MessageDiscussion, VitaError> {
    let column = match type_reaction {
        "approuve" => "reactions_approuve",
        "pertinent" => "reactions_pertinent",
        "desaccord" => "reactions_desaccord",
        _ => {
            return Err(VitaError::BadRequest(format!(
                "Type de reaction invalide: {}. Valides: approuve, pertinent, desaccord",
                type_reaction
            )));
        }
    };

    // Check message exists
    let exists: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM messages_discussion WHERE id = $1)",
    )
    .bind(message_id)
    .fetch_one(pool)
    .await?;

    if !exists {
        return Err(VitaError::NotFound(format!("Message {message_id}")));
    }

    // Increment the reaction counter
    let query = format!(
        "UPDATE messages_discussion SET {} = {} + 1, updated_at = NOW() \
         WHERE id = $1 \
         RETURNING id, fil_id, auteur_id, contenu, reponse_a, modifie, \
                   reactions_approuve, reactions_pertinent, reactions_desaccord, \
                   created_at, updated_at",
        column, column
    );

    let msg = sqlx::query_as::<_, MessageDiscussion>(&query)
        .bind(message_id)
        .fetch_one(pool)
        .await?;

    Ok(msg)
}
