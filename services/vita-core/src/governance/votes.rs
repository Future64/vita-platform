use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::VitaError;
use super::propositions;

// ── Types ──────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Vote {
    pub id: Uuid,
    pub proposition_id: Uuid,
    pub user_id: Uuid,
    pub choix: String,
    pub poids: Decimal,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct ResultatVote {
    pub proposition_id: Uuid,
    pub votes_pour: i64,
    pub votes_contre: i64,
    pub votes_abstention: i64,
    pub total_votants: i64,
    pub total_citoyens_verifies: i64,
    pub taux_participation: f64,
    pub pourcentage_pour: f64,
    pub quorum_requis: Decimal,
    pub seuil_adoption: Decimal,
    pub quorum_atteint: bool,
    pub seuil_atteint: bool,
}

// ── Functions ──────────────────────────────────────────────────────

pub async fn voter(
    pool: &PgPool,
    proposition_id: Uuid,
    user_id: Uuid,
    choix: &str,
) -> Result<Vote, VitaError> {
    let valid_choices = ["pour", "contre", "abstention"];
    if !valid_choices.contains(&choix) {
        return Err(VitaError::BadRequest(format!(
            "Choix invalide: {}. Valides: {:?}", choix, valid_choices
        )));
    }

    // Check proposition is in vote status
    let prop = propositions::get_proposition(pool, proposition_id).await?;

    if prop.statut != "vote" {
        return Err(VitaError::BadRequest(format!(
            "La proposition n'est pas en phase de vote (statut: {})", prop.statut
        )));
    }

    // Check vote deadline not passed
    if let Some(fin) = prop.date_fin_vote {
        if Utc::now() > fin {
            return Err(VitaError::BadRequest(
                "La periode de vote est terminee".into(),
            ));
        }
    }

    // Check user is verified
    let user_verif: Option<String> = sqlx::query_scalar(
        "SELECT verification_statut FROM users WHERE id = $1",
    )
    .bind(user_id)
    .fetch_optional(pool)
    .await?;

    match user_verif {
        Some(statut) if statut == "verifie" => {}
        _ => {
            return Err(VitaError::Forbidden(
                "Identite non verifiee. Veuillez faire verifier votre identite pour participer.".into(),
            ));
        }
    }

    // Insert vote (UNIQUE constraint will catch duplicates)
    let vote = sqlx::query_as::<_, Vote>(
        r#"INSERT INTO votes (proposition_id, user_id, choix)
           VALUES ($1, $2, $3)
           RETURNING id, proposition_id, user_id, choix, poids, created_at"#,
    )
    .bind(proposition_id)
    .bind(user_id)
    .bind(choix)
    .fetch_one(pool)
    .await
    .map_err(|e| match e {
        sqlx::Error::Database(ref db_err) if db_err.constraint().is_some() => {
            VitaError::BadRequest("Vous avez deja vote pour cette proposition".into())
        }
        _ => VitaError::Database(e),
    })?;

    Ok(vote)
}

pub async fn get_resultats(
    pool: &PgPool,
    proposition_id: Uuid,
) -> Result<ResultatVote, VitaError> {
    let prop = propositions::get_proposition(pool, proposition_id).await?;

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

    let total_citoyens: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM users WHERE verification_statut = 'verifie' AND actif = true",
    )
    .fetch_one(pool)
    .await
    .unwrap_or(1);

    let taux_participation = if total_citoyens > 0 {
        (total_votants as f64 / total_citoyens as f64) * 100.0
    } else {
        0.0
    };

    let votes_exprimes = votes_pour + votes_contre;
    let pourcentage_pour = if votes_exprimes > 0 {
        (votes_pour as f64 / votes_exprimes as f64) * 100.0
    } else {
        0.0
    };

    let quorum_f64 = prop.quorum_requis.to_string().parse::<f64>().unwrap_or(50.0);
    let seuil_f64 = prop.seuil_adoption.to_string().parse::<f64>().unwrap_or(50.0);

    Ok(ResultatVote {
        proposition_id,
        votes_pour,
        votes_contre,
        votes_abstention,
        total_votants,
        total_citoyens_verifies: total_citoyens,
        taux_participation,
        pourcentage_pour,
        quorum_requis: prop.quorum_requis,
        seuil_adoption: prop.seuil_adoption,
        quorum_atteint: taux_participation >= quorum_f64,
        seuil_atteint: pourcentage_pour >= seuil_f64,
    })
}
