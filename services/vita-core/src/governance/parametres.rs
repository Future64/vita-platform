use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::audit;
use crate::error::VitaError;

// ── Types ──────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Parametre {
    pub id: Uuid,
    pub nom: String,
    pub valeur: String,
    pub categorie: String,
    pub description: Option<String>,
    pub type_valeur: String,
    pub valeur_min: Option<String>,
    pub valeur_max: Option<String>,
    pub unite: Option<String>,
    pub quorum_modification: Option<Decimal>,
    pub derniere_modification: DateTime<Utc>,
    pub modifie_par_vote_id: Option<Uuid>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct HistoriqueParametre {
    pub id: Uuid,
    pub parametre_id: Uuid,
    pub ancienne_valeur: String,
    pub nouvelle_valeur: String,
    pub proposition_id: Option<Uuid>,
    pub date_modification: DateTime<Utc>,
}

// ── Functions ──────────────────────────────────────────────────────

pub async fn get_all_parametres(pool: &PgPool) -> Result<Vec<Parametre>, VitaError> {
    let params = sqlx::query_as::<_, Parametre>(
        r#"SELECT id, nom, valeur, categorie, description, type_valeur,
                  valeur_min, valeur_max, unite, quorum_modification,
                  derniere_modification, modifie_par_vote_id
           FROM parametres_systeme
           ORDER BY categorie, nom"#,
    )
    .fetch_all(pool)
    .await?;

    Ok(params)
}

pub async fn get_parametre(pool: &PgPool, nom: &str) -> Result<Parametre, VitaError> {
    sqlx::query_as::<_, Parametre>(
        r#"SELECT id, nom, valeur, categorie, description, type_valeur,
                  valeur_min, valeur_max, unite, quorum_modification,
                  derniere_modification, modifie_par_vote_id
           FROM parametres_systeme WHERE nom = $1"#,
    )
    .bind(nom)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| VitaError::NotFound(format!("Parametre '{nom}'")))
}

pub async fn get_historique_parametre(
    pool: &PgPool,
    nom: &str,
) -> Result<Vec<HistoriqueParametre>, VitaError> {
    // First get the parameter id
    let param = get_parametre(pool, nom).await?;

    let history = sqlx::query_as::<_, HistoriqueParametre>(
        r#"SELECT id, parametre_id, ancienne_valeur, nouvelle_valeur,
                  proposition_id, date_modification
           FROM historique_parametres
           WHERE parametre_id = $1
           ORDER BY date_modification DESC"#,
    )
    .bind(param.id)
    .fetch_all(pool)
    .await?;

    Ok(history)
}

pub async fn appliquer_modification(
    pool: &PgPool,
    nom: &str,
    nouvelle_valeur: &str,
    proposition_id: Option<Uuid>,
) -> Result<Parametre, VitaError> {
    let param = get_parametre(pool, nom).await?;

    if param.categorie == "immuable" {
        return Err(VitaError::Forbidden(
            "Les parametres immuables ne peuvent pas etre modifies".into(),
        ));
    }

    // Validate the new value
    validate_value(&param, nouvelle_valeur)?;

    // Archive old value
    sqlx::query(
        r#"INSERT INTO historique_parametres (parametre_id, ancienne_valeur, nouvelle_valeur, proposition_id)
           VALUES ($1, $2, $3, $4)"#,
    )
    .bind(param.id)
    .bind(&param.valeur)
    .bind(nouvelle_valeur)
    .bind(proposition_id)
    .execute(pool)
    .await?;

    // Update the parameter
    let updated = sqlx::query_as::<_, Parametre>(
        r#"UPDATE parametres_systeme SET
            valeur = $2,
            derniere_modification = NOW(),
            modifie_par_vote_id = $3
           WHERE nom = $1
           RETURNING id, nom, valeur, categorie, description, type_valeur,
                     valeur_min, valeur_max, unite, quorum_modification,
                     derniere_modification, modifie_par_vote_id"#,
    )
    .bind(nom)
    .bind(nouvelle_valeur)
    .bind(proposition_id)
    .fetch_one(pool)
    .await?;

    // Audit the parameter modification
    audit::audit_system(
        pool.clone(),
        "parametre.modify",
        "governance",
        "critique",
        &format!("Parametre '{}' modifie: {} -> {}", nom, &param.valeur, nouvelle_valeur),
        Some(serde_json::json!({
            "parametre": nom,
            "ancienne_valeur": &param.valeur,
            "nouvelle_valeur": nouvelle_valeur,
            "proposition_id": proposition_id
        })),
        Some(("parametre", updated.id)),
    );

    Ok(updated)
}

/// Validate that a value is within the parameter's allowed range.
pub fn validate_value(param: &Parametre, value: &str) -> Result<(), VitaError> {
    match param.type_valeur.as_str() {
        "integer" => {
            let v: i64 = value.parse().map_err(|_| {
                VitaError::BadRequest(format!("Valeur '{}' n'est pas un entier valide", value))
            })?;

            if let Some(ref min) = param.valeur_min {
                let min_val: i64 = min.parse().unwrap_or(i64::MIN);
                if v < min_val {
                    return Err(VitaError::BadRequest(format!(
                        "Valeur {} inferieure au minimum autorise ({})",
                        v, min_val
                    )));
                }
            }
            if let Some(ref max) = param.valeur_max {
                let max_val: i64 = max.parse().unwrap_or(i64::MAX);
                if v > max_val {
                    return Err(VitaError::BadRequest(format!(
                        "Valeur {} superieure au maximum autorise ({})",
                        v, max_val
                    )));
                }
            }
        }
        "decimal" => {
            let v: f64 = value.parse().map_err(|_| {
                VitaError::BadRequest(format!("Valeur '{}' n'est pas un decimal valide", value))
            })?;

            if let Some(ref min) = param.valeur_min {
                let min_val: f64 = min.parse().unwrap_or(f64::MIN);
                if v < min_val {
                    return Err(VitaError::BadRequest(format!(
                        "Valeur {} inferieure au minimum autorise ({})",
                        v, min_val
                    )));
                }
            }
            if let Some(ref max) = param.valeur_max {
                let max_val: f64 = max.parse().unwrap_or(f64::MAX);
                if v > max_val {
                    return Err(VitaError::BadRequest(format!(
                        "Valeur {} superieure au maximum autorise ({})",
                        v, max_val
                    )));
                }
            }
        }
        "boolean" => {
            if value != "true" && value != "false" {
                return Err(VitaError::BadRequest(format!(
                    "Valeur '{}' n'est pas un booleen valide (true/false)", value
                )));
            }
        }
        _ => {} // string, duration — no range validation
    }

    Ok(())
}
