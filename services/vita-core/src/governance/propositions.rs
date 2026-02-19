use chrono::{DateTime, Duration, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::VitaError;
use super::parametres;

// ── Types ──────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Proposition {
    pub id: Uuid,
    pub titre: String,
    pub description: String,
    pub auteur_id: Uuid,
    pub type_proposition: String,
    pub categorie: Option<String>,
    pub statut: String,
    pub duree_vote_jours: i32,
    pub quorum_requis: Decimal,
    pub seuil_adoption: Decimal,
    pub date_debut_discussion: Option<DateTime<Utc>>,
    pub date_debut_vote: Option<DateTime<Utc>>,
    pub date_fin_vote: Option<DateTime<Utc>>,
    pub date_cloture: Option<DateTime<Utc>>,
    pub parametre_cible: Option<String>,
    pub valeur_actuelle: Option<String>,
    pub valeur_proposee: Option<String>,
    pub justification_parametre: Option<String>,
    pub doleance_source_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct PropositionDetail {
    #[serde(flatten)]
    pub proposition: Proposition,
    pub auteur_username: String,
    pub votes_pour: i64,
    pub votes_contre: i64,
    pub votes_abstention: i64,
    pub total_votants: i64,
    pub nb_fils_discussion: i64,
}

#[derive(Debug, Deserialize)]
pub struct CreatePropositionData {
    pub titre: String,
    pub description: String,
    pub type_proposition: Option<String>,
    pub categorie: Option<String>,
    pub parametre_cible: Option<String>,
    pub valeur_proposee: Option<String>,
    pub justification_parametre: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct PropositionFilters {
    pub statut: Option<String>,
    pub type_proposition: Option<String>,
    pub categorie: Option<String>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

#[derive(Debug, Serialize)]
pub struct ResultatVote {
    pub proposition_id: Uuid,
    pub statut_final: String,
    pub votes_pour: i64,
    pub votes_contre: i64,
    pub votes_abstention: i64,
    pub total_votants: i64,
    pub total_citoyens_verifies: i64,
    pub taux_participation: f64,
    pub pourcentage_pour: f64,
    pub quorum_atteint: bool,
    pub seuil_atteint: bool,
    pub parametre_modifie: bool,
}

// ── Functions ──────────────────────────────────────────────────────

pub async fn create_proposition(
    pool: &PgPool,
    auteur_id: Uuid,
    data: &CreatePropositionData,
) -> Result<Proposition, VitaError> {
    if data.titre.is_empty() || data.titre.len() > 300 {
        return Err(VitaError::BadRequest("Titre requis (max 300 caracteres)".into()));
    }
    if data.description.is_empty() {
        return Err(VitaError::BadRequest("Description requise".into()));
    }

    let type_prop = data.type_proposition.as_deref().unwrap_or("standard");
    let valid_types = ["standard", "constitutionnel", "urgent", "modification_parametre"];
    if !valid_types.contains(&type_prop) {
        return Err(VitaError::BadRequest(format!(
            "Type invalide: {}. Valides: {:?}", type_prop, valid_types
        )));
    }

    // Determine vote parameters based on type
    let (duree_vote, quorum, seuil) = match type_prop {
        "constitutionnel" => {
            let duree = get_param_int(pool, "duree_vote_constitutionnel").await.unwrap_or(14);
            let quorum = get_param_decimal(pool, "quorum_constitutionnel").await.unwrap_or(Decimal::from(67));
            let seuil = get_param_decimal(pool, "seuil_adoption_constitutionnel").await.unwrap_or(Decimal::from(67));
            (duree, quorum, seuil)
        }
        "urgent" => {
            let duree = get_param_int(pool, "duree_vote_urgent").await.unwrap_or(3);
            let quorum = get_param_decimal(pool, "quorum_standard").await.unwrap_or(Decimal::from(50));
            let seuil = get_param_decimal(pool, "seuil_adoption_standard").await.unwrap_or(Decimal::from(50));
            (duree, quorum, seuil)
        }
        _ => {
            let duree = get_param_int(pool, "duree_vote_standard").await.unwrap_or(7);
            let quorum = get_param_decimal(pool, "quorum_standard").await.unwrap_or(Decimal::from(50));
            let seuil = get_param_decimal(pool, "seuil_adoption_standard").await.unwrap_or(Decimal::from(50));
            (duree, quorum, seuil)
        }
    };

    // If modification_parametre, validate the parameter
    let mut valeur_actuelle: Option<String> = None;
    if type_prop == "modification_parametre" {
        let param_nom = data.parametre_cible.as_deref()
            .ok_or_else(|| VitaError::BadRequest("parametre_cible requis pour modification_parametre".into()))?;
        let valeur_prop = data.valeur_proposee.as_deref()
            .ok_or_else(|| VitaError::BadRequest("valeur_proposee requise pour modification_parametre".into()))?;

        let param = parametres::get_parametre(pool, param_nom).await?;

        if param.categorie == "immuable" {
            return Err(VitaError::Forbidden(
                "Les parametres immuables ne peuvent pas etre modifies, meme par vote".into(),
            ));
        }

        // Validate value is within range
        parametres::validate_value(&param, valeur_prop)?;

        valeur_actuelle = Some(param.valeur);
    }

    let prop = sqlx::query_as::<_, Proposition>(
        r#"INSERT INTO propositions (
            titre, description, auteur_id, type_proposition, categorie,
            statut, duree_vote_jours, quorum_requis, seuil_adoption,
            date_debut_discussion, parametre_cible, valeur_actuelle,
            valeur_proposee, justification_parametre
        ) VALUES ($1, $2, $3, $4, $5, 'discussion', $6, $7, $8, NOW(), $9, $10, $11, $12)
        RETURNING id, titre, description, auteur_id, type_proposition, categorie,
                  statut, duree_vote_jours, quorum_requis, seuil_adoption,
                  date_debut_discussion, date_debut_vote, date_fin_vote, date_cloture,
                  parametre_cible, valeur_actuelle, valeur_proposee,
                  justification_parametre, doleance_source_id, created_at, updated_at"#,
    )
    .bind(&data.titre)
    .bind(&data.description)
    .bind(auteur_id)
    .bind(type_prop)
    .bind(&data.categorie)
    .bind(duree_vote)
    .bind(quorum)
    .bind(seuil)
    .bind(&data.parametre_cible)
    .bind(&valeur_actuelle)
    .bind(&data.valeur_proposee)
    .bind(&data.justification_parametre)
    .fetch_one(pool)
    .await?;

    Ok(prop)
}

pub async fn get_propositions(
    pool: &PgPool,
    filters: &PropositionFilters,
) -> Result<Vec<Proposition>, VitaError> {
    let limit = filters.limit.unwrap_or(20).min(100);
    let offset = filters.offset.unwrap_or(0).max(0);

    let rows = sqlx::query_as::<_, Proposition>(
        r#"SELECT id, titre, description, auteur_id, type_proposition, categorie,
                  statut, duree_vote_jours, quorum_requis, seuil_adoption,
                  date_debut_discussion, date_debut_vote, date_fin_vote, date_cloture,
                  parametre_cible, valeur_actuelle, valeur_proposee,
                  justification_parametre, doleance_source_id, created_at, updated_at
           FROM propositions
           ORDER BY created_at DESC
           LIMIT $1 OFFSET $2"#,
    )
    .bind(limit)
    .bind(offset)
    .fetch_all(pool)
    .await?;

    let rows: Vec<Proposition> = rows
        .into_iter()
        .filter(|p| {
            if let Some(ref st) = filters.statut {
                if p.statut != *st {
                    return false;
                }
            }
            if let Some(ref tp) = filters.type_proposition {
                if p.type_proposition != *tp {
                    return false;
                }
            }
            if let Some(ref cat) = filters.categorie {
                if p.categorie.as_deref() != Some(cat.as_str()) {
                    return false;
                }
            }
            true
        })
        .collect();

    Ok(rows)
}

pub async fn get_proposition(pool: &PgPool, id: Uuid) -> Result<Proposition, VitaError> {
    sqlx::query_as::<_, Proposition>(
        r#"SELECT id, titre, description, auteur_id, type_proposition, categorie,
                  statut, duree_vote_jours, quorum_requis, seuil_adoption,
                  date_debut_discussion, date_debut_vote, date_fin_vote, date_cloture,
                  parametre_cible, valeur_actuelle, valeur_proposee,
                  justification_parametre, doleance_source_id, created_at, updated_at
           FROM propositions WHERE id = $1"#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| VitaError::NotFound(format!("Proposition {id}")))
}

pub async fn get_proposition_detail(pool: &PgPool, id: Uuid) -> Result<PropositionDetail, VitaError> {
    let prop = get_proposition(pool, id).await?;

    let auteur_username: String = sqlx::query_scalar(
        "SELECT username FROM users WHERE id = $1",
    )
    .bind(prop.auteur_id)
    .fetch_optional(pool)
    .await?
    .unwrap_or_else(|| "inconnu".to_string());

    let votes_pour: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM votes WHERE proposition_id = $1 AND choix = 'pour'",
    )
    .bind(id)
    .fetch_one(pool)
    .await
    .unwrap_or(0);

    let votes_contre: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM votes WHERE proposition_id = $1 AND choix = 'contre'",
    )
    .bind(id)
    .fetch_one(pool)
    .await
    .unwrap_or(0);

    let votes_abstention: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM votes WHERE proposition_id = $1 AND choix = 'abstention'",
    )
    .bind(id)
    .fetch_one(pool)
    .await
    .unwrap_or(0);

    let total_votants = votes_pour + votes_contre + votes_abstention;

    let nb_fils_discussion: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM fils_discussion WHERE proposition_id = $1",
    )
    .bind(id)
    .fetch_one(pool)
    .await
    .unwrap_or(0);

    Ok(PropositionDetail {
        proposition: prop,
        auteur_username,
        votes_pour,
        votes_contre,
        votes_abstention,
        total_votants,
        nb_fils_discussion,
    })
}

pub async fn passer_en_vote(pool: &PgPool, proposition_id: Uuid) -> Result<Proposition, VitaError> {
    let prop = get_proposition(pool, proposition_id).await?;

    if prop.statut != "discussion" {
        return Err(VitaError::BadRequest(format!(
            "La proposition doit etre en discussion pour passer en vote (statut actuel: {})",
            prop.statut
        )));
    }

    // Check minimum discussion duration
    let duree_discussion_min = get_param_int(pool, "duree_discussion").await.unwrap_or(2);
    if let Some(debut) = prop.date_debut_discussion {
        let min_end = debut + Duration::days(duree_discussion_min as i64);
        if Utc::now() < min_end {
            return Err(VitaError::BadRequest(format!(
                "La duree minimale de discussion ({} jours) n'est pas encore ecoulee",
                duree_discussion_min
            )));
        }
    }

    let date_fin = Utc::now() + Duration::days(prop.duree_vote_jours as i64);

    let updated = sqlx::query_as::<_, Proposition>(
        r#"UPDATE propositions SET
            statut = 'vote',
            date_debut_vote = NOW(),
            date_fin_vote = $2,
            updated_at = NOW()
           WHERE id = $1
           RETURNING id, titre, description, auteur_id, type_proposition, categorie,
                     statut, duree_vote_jours, quorum_requis, seuil_adoption,
                     date_debut_discussion, date_debut_vote, date_fin_vote, date_cloture,
                     parametre_cible, valeur_actuelle, valeur_proposee,
                     justification_parametre, doleance_source_id, created_at, updated_at"#,
    )
    .bind(proposition_id)
    .bind(date_fin)
    .fetch_one(pool)
    .await?;

    Ok(updated)
}

pub async fn cloturer_vote(pool: &PgPool, proposition_id: Uuid) -> Result<ResultatVote, VitaError> {
    let prop = get_proposition(pool, proposition_id).await?;

    if prop.statut != "vote" {
        return Err(VitaError::BadRequest(format!(
            "La proposition doit etre en vote pour etre cloturee (statut actuel: {})",
            prop.statut
        )));
    }

    // Count votes
    let votes_pour: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM votes WHERE proposition_id = $1 AND choix = 'pour'",
    )
    .bind(proposition_id)
    .fetch_one(pool)
    .await
    .unwrap_or(0);

    let votes_contre: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM votes WHERE proposition_id = $1 AND choix = 'contre'",
    )
    .bind(proposition_id)
    .fetch_one(pool)
    .await
    .unwrap_or(0);

    let votes_abstention: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM votes WHERE proposition_id = $1 AND choix = 'abstention'",
    )
    .bind(proposition_id)
    .fetch_one(pool)
    .await
    .unwrap_or(0);

    let total_votants = votes_pour + votes_contre + votes_abstention;

    // Count verified citizens
    let total_citoyens: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM users WHERE verification_statut = 'verifie' AND actif = true",
    )
    .fetch_one(pool)
    .await
    .unwrap_or(1); // avoid division by zero

    let taux_participation = if total_citoyens > 0 {
        (total_votants as f64 / total_citoyens as f64) * 100.0
    } else {
        0.0
    };

    let quorum_requis_f64 = prop.quorum_requis.to_string().parse::<f64>().unwrap_or(50.0);
    let seuil_requis_f64 = prop.seuil_adoption.to_string().parse::<f64>().unwrap_or(50.0);

    let quorum_atteint = taux_participation >= quorum_requis_f64;

    let votes_exprimes = votes_pour + votes_contre;
    let pourcentage_pour = if votes_exprimes > 0 {
        (votes_pour as f64 / votes_exprimes as f64) * 100.0
    } else {
        0.0
    };

    let seuil_atteint = pourcentage_pour >= seuil_requis_f64;

    let adopte = quorum_atteint && seuil_atteint;
    let statut_final = if adopte { "adopte" } else { "rejete" };

    // Update proposition status
    sqlx::query(
        r#"UPDATE propositions SET
            statut = $2,
            date_cloture = NOW(),
            updated_at = NOW()
           WHERE id = $1"#,
    )
    .bind(proposition_id)
    .bind(statut_final)
    .execute(pool)
    .await?;

    // If adopted and modification_parametre → apply the change
    let mut parametre_modifie = false;
    if adopte && prop.type_proposition == "modification_parametre" {
        if let (Some(ref nom), Some(ref nouvelle_valeur)) = (&prop.parametre_cible, &prop.valeur_proposee) {
            parametres::appliquer_modification(pool, nom, nouvelle_valeur, Some(proposition_id)).await?;
            parametre_modifie = true;
        }
    }

    Ok(ResultatVote {
        proposition_id,
        statut_final: statut_final.to_string(),
        votes_pour,
        votes_contre,
        votes_abstention,
        total_votants,
        total_citoyens_verifies: total_citoyens,
        taux_participation,
        pourcentage_pour,
        quorum_atteint,
        seuil_atteint,
        parametre_modifie,
    })
}

// ── Helpers ────────────────────────────────────────────────────────

async fn get_param_int(pool: &PgPool, nom: &str) -> Option<i32> {
    sqlx::query_scalar::<_, String>(
        "SELECT valeur FROM parametres_systeme WHERE nom = $1",
    )
    .bind(nom)
    .fetch_optional(pool)
    .await
    .ok()
    .flatten()
    .and_then(|v| v.parse().ok())
}

async fn get_param_decimal(pool: &PgPool, nom: &str) -> Option<Decimal> {
    sqlx::query_scalar::<_, String>(
        "SELECT valeur FROM parametres_systeme WHERE nom = $1",
    )
    .bind(nom)
    .fetch_optional(pool)
    .await
    .ok()
    .flatten()
    .and_then(|v| v.parse().ok())
}
