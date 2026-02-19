use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::VitaError;

// ── Types ──────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Doleance {
    pub id: Uuid,
    pub titre: String,
    pub description: String,
    pub auteur_id: Uuid,
    pub categorie: String,
    pub soutiens: i32,
    pub seuil_proposition: i32,
    pub statut: String,
    pub proposition_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct DoleanceFilters {
    pub categorie: Option<String>,
    pub statut: Option<String>,
    pub tri: Option<String>, // recentes, soutenues, proches_seuil
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

// ── Functions ──────────────────────────────────────────────────────

pub async fn create_doleance(
    pool: &PgPool,
    auteur_id: Uuid,
    titre: &str,
    description: &str,
    categorie: &str,
) -> Result<Doleance, VitaError> {
    let valid_categories = [
        "economie", "gouvernance", "technique", "social",
        "ecologie", "education", "sante", "autre",
    ];
    if !valid_categories.contains(&categorie) {
        return Err(VitaError::BadRequest(format!(
            "Categorie invalide: {}. Valides: {:?}", categorie, valid_categories
        )));
    }

    if titre.is_empty() || titre.len() > 200 {
        return Err(VitaError::BadRequest("Titre requis (max 200 caracteres)".into()));
    }
    if description.is_empty() {
        return Err(VitaError::BadRequest("Description requise".into()));
    }

    // Get seuil from parametres_systeme
    let seuil: i32 = sqlx::query_scalar(
        "SELECT CAST(valeur AS INTEGER) FROM parametres_systeme WHERE nom = 'seuil_doleance'"
    )
    .fetch_optional(pool)
    .await?
    .unwrap_or(100);

    let doleance = sqlx::query_as::<_, Doleance>(
        r#"INSERT INTO doleances (titre, description, auteur_id, categorie, seuil_proposition)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, titre, description, auteur_id, categorie, soutiens,
                     seuil_proposition, statut, proposition_id, created_at, updated_at"#,
    )
    .bind(titre)
    .bind(description)
    .bind(auteur_id)
    .bind(categorie)
    .bind(seuil)
    .fetch_one(pool)
    .await?;

    Ok(doleance)
}

pub async fn get_doleances(
    pool: &PgPool,
    filters: &DoleanceFilters,
) -> Result<Vec<Doleance>, VitaError> {
    let limit = filters.limit.unwrap_or(20).min(100);
    let offset = filters.offset.unwrap_or(0).max(0);

    let order_by = match filters.tri.as_deref() {
        Some("soutenues") => "soutiens DESC",
        Some("proches_seuil") => "(seuil_proposition - soutiens) ASC",
        _ => "created_at DESC",
    };

    // Build query dynamically based on filters
    let mut query = String::from(
        "SELECT id, titre, description, auteur_id, categorie, soutiens, \
         seuil_proposition, statut, proposition_id, created_at, updated_at \
         FROM doleances WHERE 1=1"
    );

    if filters.categorie.is_some() {
        query.push_str(" AND categorie = $3");
    }
    if filters.statut.is_some() {
        query.push_str(if filters.categorie.is_some() {
            " AND statut = $4"
        } else {
            " AND statut = $3"
        });
    }

    query.push_str(&format!(" ORDER BY {} LIMIT $1 OFFSET $2", order_by));

    // Use a simpler approach: always filter in Rust for flexibility
    let rows = sqlx::query_as::<_, Doleance>(
        r#"SELECT id, titre, description, auteur_id, categorie, soutiens,
                  seuil_proposition, statut, proposition_id, created_at, updated_at
           FROM doleances
           ORDER BY created_at DESC
           LIMIT $1 OFFSET $2"#,
    )
    .bind(limit)
    .bind(offset)
    .fetch_all(pool)
    .await?;

    // Apply in-memory filters
    let rows: Vec<Doleance> = rows
        .into_iter()
        .filter(|d| {
            if let Some(ref cat) = filters.categorie {
                if d.categorie != *cat {
                    return false;
                }
            }
            if let Some(ref st) = filters.statut {
                if d.statut != *st {
                    return false;
                }
            }
            true
        })
        .collect();

    Ok(rows)
}

pub async fn get_doleance(pool: &PgPool, id: Uuid) -> Result<Doleance, VitaError> {
    sqlx::query_as::<_, Doleance>(
        r#"SELECT id, titre, description, auteur_id, categorie, soutiens,
                  seuil_proposition, statut, proposition_id, created_at, updated_at
           FROM doleances WHERE id = $1"#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| VitaError::NotFound(format!("Doleance {id}")))
}

pub async fn soutenir_doleance(
    pool: &PgPool,
    doleance_id: Uuid,
    user_id: Uuid,
) -> Result<Doleance, VitaError> {
    // Check doleance exists and is open
    let doleance = get_doleance(pool, doleance_id).await?;
    if doleance.statut != "ouverte" {
        return Err(VitaError::BadRequest(
            "Cette doleance n'accepte plus de soutiens".into(),
        ));
    }

    // Check user hasn't already supported
    sqlx::query(
        "INSERT INTO soutiens_doleance (doleance_id, user_id) VALUES ($1, $2)",
    )
    .bind(doleance_id)
    .bind(user_id)
    .execute(pool)
    .await
    .map_err(|e| match e {
        sqlx::Error::Database(ref db_err) if db_err.constraint().is_some() => {
            VitaError::BadRequest("Vous avez deja soutenu cette doleance".into())
        }
        _ => VitaError::Database(e),
    })?;

    // Increment support count
    let updated = sqlx::query_as::<_, Doleance>(
        r#"UPDATE doleances SET soutiens = soutiens + 1, updated_at = NOW()
           WHERE id = $1
           RETURNING id, titre, description, auteur_id, categorie, soutiens,
                     seuil_proposition, statut, proposition_id, created_at, updated_at"#,
    )
    .bind(doleance_id)
    .fetch_one(pool)
    .await?;

    // Check if threshold reached
    if updated.soutiens >= updated.seuil_proposition && updated.statut == "ouverte" {
        sqlx::query("UPDATE doleances SET statut = 'seuil_atteint', updated_at = NOW() WHERE id = $1")
            .bind(doleance_id)
            .execute(pool)
            .await?;
    }

    // Re-fetch to get the latest state
    get_doleance(pool, doleance_id).await
}

pub async fn convertir_en_proposition(
    pool: &PgPool,
    doleance_id: Uuid,
    auteur_id: Uuid,
) -> Result<Uuid, VitaError> {
    let doleance = get_doleance(pool, doleance_id).await?;

    if doleance.statut != "seuil_atteint" {
        return Err(VitaError::BadRequest(
            "La doleance n'a pas encore atteint le seuil de soutiens requis".into(),
        ));
    }

    // Verify the requester is the author or an admin
    if doleance.auteur_id != auteur_id {
        // Check if admin — we don't have role info here, caller must check
        return Err(VitaError::Forbidden(
            "Seul l'auteur de la doleance peut la convertir en proposition".into(),
        ));
    }

    // Create the proposition
    let prop_id: Uuid = sqlx::query_scalar(
        r#"INSERT INTO propositions (titre, description, auteur_id, categorie,
                                     statut, doleance_source_id, date_debut_discussion)
           VALUES ($1, $2, $3, $4, 'discussion', $5, NOW())
           RETURNING id"#,
    )
    .bind(&doleance.titre)
    .bind(&doleance.description)
    .bind(auteur_id)
    .bind(&doleance.categorie)
    .bind(doleance_id)
    .fetch_one(pool)
    .await?;

    // Update doleance status
    sqlx::query(
        "UPDATE doleances SET statut = 'convertie', proposition_id = $1, updated_at = NOW() WHERE id = $2",
    )
    .bind(prop_id)
    .bind(doleance_id)
    .execute(pool)
    .await?;

    Ok(prop_id)
}
