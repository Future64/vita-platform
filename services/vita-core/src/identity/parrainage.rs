use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::VitaError;

// ── Types ──────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct DemandeParrainage {
    pub parrainage_id: Uuid,
    pub demande_id: Uuid,
    pub demandeur_id: Uuid,
    pub demandeur_username: String,
    pub demandeur_prenom: Option<String>,
    pub message_personnel: Option<String>,
    pub statut: String,
    pub date_invitation: DateTime<Utc>,
    pub date_reponse: Option<DateTime<Utc>>,
    pub date_expiration: DateTime<Utc>,
    pub parrainages_acceptes: i64,
    pub parrainages_requis: i32,
}

#[derive(Debug, Serialize)]
pub struct AttestationResult {
    pub verification_complete: bool,
    pub parrainages_actuels: i64,
    pub parrainages_requis: i32,
    pub nouveau_role: Option<String>,
}

// ── Functions ──────────────────────────────────────────────────────

/// Get sponsorship requests received by a sponsor.
pub async fn get_demandes_recues(
    pool: &PgPool,
    parrain_id: Uuid,
    statut_filter: Option<&str>,
) -> Result<Vec<DemandeParrainage>, VitaError> {
    let rows = sqlx::query_as::<_, DemandeParrainage>(
        r#"SELECT
            p.id AS parrainage_id,
            p.demande_id,
            dv.demandeur_id,
            u.username AS demandeur_username,
            u.prenom_affiche AS demandeur_prenom,
            dv.message_personnel,
            p.statut,
            p.date_invitation,
            p.date_reponse,
            dv.date_expiration,
            (SELECT COUNT(*) FROM parrainages WHERE demande_id = dv.id AND statut = 'accepte') AS parrainages_acceptes,
            dv.parrainages_requis
        FROM parrainages p
        JOIN demandes_verification dv ON p.demande_id = dv.id
        JOIN users u ON dv.demandeur_id = u.id
        WHERE p.parrain_id = $1 AND dv.statut = 'en_attente'
        ORDER BY p.date_invitation DESC"#,
    )
    .bind(parrain_id)
    .fetch_all(pool)
    .await?;

    // Apply status filter if provided
    let rows = if let Some(st) = statut_filter {
        rows.into_iter().filter(|r| r.statut == st).collect()
    } else {
        rows
    };

    Ok(rows)
}

/// Attest a user's identity (accept a sponsorship request).
pub async fn attester(
    pool: &PgPool,
    parrainage_id: Uuid,
    parrain_id: Uuid,
    lien: &str,
    commentaire: Option<&str>,
) -> Result<AttestationResult, VitaError> {
    // Verify sponsorship exists and belongs to this sponsor
    let parrainage = sqlx::query_as::<_, super::verification::ParrainageRow>(
        r#"SELECT id, demande_id, parrain_id, statut, lien_avec_demandeur,
                  commentaire, date_invitation, date_reponse
           FROM parrainages WHERE id = $1"#,
    )
    .bind(parrainage_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| VitaError::NotFound("Parrainage introuvable".into()))?;

    if parrainage.parrain_id != parrain_id {
        return Err(VitaError::Forbidden("Ce parrainage ne vous est pas destine".into()));
    }

    if parrainage.statut != "invite" {
        return Err(VitaError::BadRequest(format!(
            "Impossible d'attester un parrainage en statut '{}'", parrainage.statut
        )));
    }

    // Check annual counter
    let current_year = Utc::now().year();
    let max_par_an: i32 = sqlx::query_scalar::<_, String>(
        "SELECT valeur FROM parametres_systeme WHERE nom = 'max_parrainages_par_an'",
    )
    .fetch_optional(pool)
    .await?
    .and_then(|v| v.parse().ok())
    .unwrap_or(10);

    let compteur: i32 = sqlx::query_scalar(
        "SELECT COALESCE(nombre, 0) FROM compteur_parrainages WHERE parrain_id = $1 AND annee = $2",
    )
    .bind(parrain_id)
    .bind(current_year)
    .fetch_optional(pool)
    .await?
    .unwrap_or(0);

    if compteur >= max_par_an {
        return Err(VitaError::BadRequest(format!(
            "Vous avez atteint le maximum de {} parrainages pour cette annee", max_par_an
        )));
    }

    // Validate lien
    if lien.is_empty() {
        return Err(VitaError::BadRequest("Le lien avec le demandeur est requis".into()));
    }

    // Update sponsorship
    sqlx::query(
        r#"UPDATE parrainages SET
            statut = 'accepte',
            lien_avec_demandeur = $2,
            commentaire = $3,
            date_reponse = NOW()
           WHERE id = $1"#,
    )
    .bind(parrainage_id)
    .bind(lien)
    .bind(commentaire)
    .execute(pool)
    .await?;

    // Increment annual counter
    sqlx::query(
        r#"INSERT INTO compteur_parrainages (parrain_id, annee, nombre)
           VALUES ($1, $2, 1)
           ON CONFLICT (parrain_id, annee) DO UPDATE SET nombre = compteur_parrainages.nombre + 1"#,
    )
    .bind(parrain_id)
    .bind(current_year)
    .execute(pool)
    .await?;

    // Count accepted sponsorships for this request
    let demande_id = parrainage.demande_id;

    let acceptes: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM parrainages WHERE demande_id = $1 AND statut = 'accepte'",
    )
    .bind(demande_id)
    .fetch_one(pool)
    .await?;

    // Get required count
    let requis: i32 = sqlx::query_scalar(
        "SELECT parrainages_requis FROM demandes_verification WHERE id = $1",
    )
    .bind(demande_id)
    .fetch_one(pool)
    .await?;

    // Check if verification is complete
    if acceptes >= requis as i64 {
        // Get the user ID
        let demandeur_id: Uuid = sqlx::query_scalar(
            "SELECT demandeur_id FROM demandes_verification WHERE id = $1",
        )
        .bind(demande_id)
        .fetch_one(pool)
        .await?;

        // Mark request as complete
        sqlx::query("UPDATE demandes_verification SET statut = 'complete', updated_at = NOW() WHERE id = $1")
            .bind(demande_id)
            .execute(pool)
            .await?;

        // Get verification duration from system parameters
        let duree_verification: i64 = sqlx::query_scalar::<_, String>(
            "SELECT valeur FROM parametres_systeme WHERE nom = 'duree_verification'",
        )
        .fetch_optional(pool)
        .await?
        .and_then(|v| v.parse().ok())
        .unwrap_or(365);

        let expiration = Utc::now() + Duration::days(duree_verification);

        // Get current role
        let current_role: String = sqlx::query_scalar(
            "SELECT role FROM users WHERE id = $1",
        )
        .bind(demandeur_id)
        .fetch_one(pool)
        .await?;

        // Determine new role
        let new_role = if current_role == "nouveau" {
            "citoyen"
        } else {
            &current_role
        };

        // Update user
        sqlx::query(
            r#"UPDATE users SET
                verification_statut = 'verifie',
                verification_date = NOW(),
                verification_expiration = $2,
                niveau_confiance = 80,
                role = $3,
                updated_at = NOW()
               WHERE id = $1"#,
        )
        .bind(demandeur_id)
        .bind(expiration)
        .bind(new_role)
        .execute(pool)
        .await?;

        // Collect sponsor names for history
        let parrains_usernames: Vec<String> = sqlx::query_scalar(
            r#"SELECT u.username FROM parrainages p
               JOIN users u ON p.parrain_id = u.id
               WHERE p.demande_id = $1 AND p.statut = 'accepte'"#,
        )
        .bind(demande_id)
        .fetch_all(pool)
        .await?;

        // Create verification history entry
        let parrains_json = serde_json::json!(parrains_usernames);
        sqlx::query(
            r#"INSERT INTO historique_verifications (user_id, methode, statut, details, parrains)
               VALUES ($1, 'parrainage', 'verifie', $2, $3)"#,
        )
        .bind(demandeur_id)
        .bind(format!("Verification par parrainage - {} attestations recues", acceptes))
        .bind(parrains_json)
        .execute(pool)
        .await?;

        let nouveau_role = if current_role == "nouveau" {
            Some("citoyen".to_string())
        } else {
            None
        };

        return Ok(AttestationResult {
            verification_complete: true,
            parrainages_actuels: acceptes,
            parrainages_requis: requis,
            nouveau_role,
        });
    }

    Ok(AttestationResult {
        verification_complete: false,
        parrainages_actuels: acceptes,
        parrainages_requis: requis,
        nouveau_role: None,
    })
}

/// Refuse a sponsorship request.
pub async fn refuser(
    pool: &PgPool,
    parrainage_id: Uuid,
    parrain_id: Uuid,
    motif: &str,
) -> Result<(), VitaError> {
    let parrainage = sqlx::query_as::<_, super::verification::ParrainageRow>(
        r#"SELECT id, demande_id, parrain_id, statut, lien_avec_demandeur,
                  commentaire, date_invitation, date_reponse
           FROM parrainages WHERE id = $1"#,
    )
    .bind(parrainage_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| VitaError::NotFound("Parrainage introuvable".into()))?;

    if parrainage.parrain_id != parrain_id {
        return Err(VitaError::Forbidden("Ce parrainage ne vous est pas destine".into()));
    }

    if parrainage.statut != "invite" {
        return Err(VitaError::BadRequest(format!(
            "Impossible de refuser un parrainage en statut '{}'", parrainage.statut
        )));
    }

    sqlx::query(
        r#"UPDATE parrainages SET
            statut = 'refuse',
            commentaire = $2,
            date_reponse = NOW()
           WHERE id = $1"#,
    )
    .bind(parrainage_id)
    .bind(motif)
    .execute(pool)
    .await?;

    Ok(())
}

/// Resend an invitation to a sponsor.
pub async fn relancer(
    pool: &PgPool,
    parrainage_id: Uuid,
    demandeur_id: Uuid,
) -> Result<(), VitaError> {
    let parrainage = sqlx::query_as::<_, super::verification::ParrainageRow>(
        r#"SELECT id, demande_id, parrain_id, statut, lien_avec_demandeur,
                  commentaire, date_invitation, date_reponse
           FROM parrainages WHERE id = $1"#,
    )
    .bind(parrainage_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| VitaError::NotFound("Parrainage introuvable".into()))?;

    // Verify the requester owns the related demand
    let demande_owner: Uuid = sqlx::query_scalar(
        "SELECT demandeur_id FROM demandes_verification WHERE id = $1",
    )
    .bind(parrainage.demande_id)
    .fetch_one(pool)
    .await?;

    if demande_owner != demandeur_id {
        return Err(VitaError::Forbidden("Cette demande ne vous appartient pas".into()));
    }

    if parrainage.statut != "invite" {
        return Err(VitaError::BadRequest(
            "Impossible de relancer un parrain qui a deja repondu".into(),
        ));
    }

    // Check 48h cooldown since invitation
    let min_delay = parrainage.date_invitation + Duration::hours(48);
    if Utc::now() < min_delay {
        return Err(VitaError::BadRequest(
            "Veuillez attendre au moins 48h avant de relancer ce parrain".into(),
        ));
    }

    // Update invitation date to track relance
    sqlx::query("UPDATE parrainages SET date_invitation = NOW() WHERE id = $1")
        .bind(parrainage_id)
        .execute(pool)
        .await?;

    // In production, this would send a notification
    Ok(())
}

/// Get the annual counter for a sponsor.
pub async fn get_compteur_annuel(
    pool: &PgPool,
    parrain_id: Uuid,
) -> Result<(i32, i32), VitaError> {
    let current_year = Utc::now().year();

    let max_par_an: i32 = sqlx::query_scalar::<_, String>(
        "SELECT valeur FROM parametres_systeme WHERE nom = 'max_parrainages_par_an'",
    )
    .fetch_optional(pool)
    .await?
    .and_then(|v| v.parse().ok())
    .unwrap_or(10);

    let nombre_utilise: i32 = sqlx::query_scalar(
        "SELECT COALESCE(nombre, 0) FROM compteur_parrainages WHERE parrain_id = $1 AND annee = $2",
    )
    .bind(parrain_id)
    .bind(current_year)
    .fetch_optional(pool)
    .await?
    .unwrap_or(0);

    Ok((nombre_utilise, max_par_an))
}

// ── Helper ─────────────────────────────────────────────────────────

trait YearHelper {
    fn year(&self) -> i32;
}

impl YearHelper for DateTime<Utc> {
    fn year(&self) -> i32 {
        chrono::Datelike::year(&self.date_naive())
    }
}
