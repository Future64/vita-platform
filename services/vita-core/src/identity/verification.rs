use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::audit;
use crate::error::VitaError;

// ── Types ──────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct DemandeVerification {
    pub id: Uuid,
    pub demandeur_id: Uuid,
    pub message_personnel: Option<String>,
    pub parrainages_requis: i32,
    pub statut: String,
    pub date_expiration: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct ParrainageRow {
    pub id: Uuid,
    pub demande_id: Uuid,
    pub parrain_id: Uuid,
    pub statut: String,
    pub lien_avec_demandeur: Option<String>,
    pub commentaire: Option<String>,
    pub date_invitation: DateTime<Utc>,
    pub date_reponse: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize)]
pub struct DemandeAvecParrainages {
    #[serde(flatten)]
    pub demande: DemandeVerification,
    pub parrainages: Vec<ParrainageDetail>,
    pub parrainages_acceptes: i64,
}

#[derive(Debug, Serialize)]
pub struct ParrainageDetail {
    pub id: Uuid,
    pub parrain_id: Uuid,
    pub parrain_username: String,
    pub statut: String,
    pub lien_avec_demandeur: Option<String>,
    pub commentaire: Option<String>,
    pub date_invitation: DateTime<Utc>,
    pub date_reponse: Option<DateTime<Utc>>,
}

// ── Functions ──────────────────────────────────────────────────────

/// Create a verification request with invited sponsors.
pub async fn create_demande(
    pool: &PgPool,
    demandeur_id: Uuid,
    message: Option<&str>,
    parrains_ids: &[Uuid],
) -> Result<DemandeAvecParrainages, VitaError> {
    // Check user status — must be non_verifie or expire
    let user_statut: String = sqlx::query_scalar(
        "SELECT verification_statut FROM users WHERE id = $1",
    )
    .bind(demandeur_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| VitaError::NotFound("Utilisateur introuvable".into()))?;

    if user_statut != "non_verifie" && user_statut != "expire" {
        return Err(VitaError::BadRequest(format!(
            "Verification impossible avec le statut actuel: {}. Requis: non_verifie ou expire",
            user_statut
        )));
    }

    // Check no active request
    let active: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM demandes_verification WHERE demandeur_id = $1 AND statut = 'en_attente')",
    )
    .bind(demandeur_id)
    .fetch_one(pool)
    .await?;

    if active {
        return Err(VitaError::BadRequest(
            "Vous avez deja une demande de verification en cours".into(),
        ));
    }

    // Get required sponsorships from system parameters
    let parrainages_requis: i32 = sqlx::query_scalar::<_, String>(
        "SELECT valeur FROM parametres_systeme WHERE nom = 'parrainages_requis'",
    )
    .fetch_optional(pool)
    .await?
    .and_then(|v| v.parse().ok())
    .unwrap_or(3);

    // Validate sponsor count
    if parrains_ids.len() < parrainages_requis as usize {
        return Err(VitaError::BadRequest(format!(
            "Au moins {} parrains requis, {} fournis",
            parrainages_requis, parrains_ids.len()
        )));
    }
    if parrains_ids.len() > 5 {
        return Err(VitaError::BadRequest(
            "Maximum 5 parrains par demande".into(),
        ));
    }

    // Check no duplicates
    let mut unique_ids = parrains_ids.to_vec();
    unique_ids.sort();
    unique_ids.dedup();
    if unique_ids.len() != parrains_ids.len() {
        return Err(VitaError::BadRequest("Parrains en double dans la liste".into()));
    }

    // Check user is not sponsoring themselves
    if parrains_ids.contains(&demandeur_id) {
        return Err(VitaError::BadRequest("Vous ne pouvez pas etre votre propre parrain".into()));
    }

    // Validate each sponsor exists, is verified, and no cross-sponsorship
    for parrain_id in parrains_ids {
        let parrain_statut: Option<String> = sqlx::query_scalar(
            "SELECT verification_statut FROM users WHERE id = $1 AND actif = true",
        )
        .bind(parrain_id)
        .fetch_optional(pool)
        .await?;

        match parrain_statut {
            Some(s) if s == "verifie" => {}
            Some(_) => {
                return Err(VitaError::BadRequest(format!(
                    "Le parrain {} n'est pas verifie", parrain_id
                )));
            }
            None => {
                return Err(VitaError::NotFound(format!(
                    "Parrain {} introuvable", parrain_id
                )));
            }
        }

        // Web of Trust: anti-cross-sponsorship check at request creation
        crate::identity::parrainage::check_anti_cross_sponsorship(
            pool,
            *parrain_id,
            demandeur_id,
        )
        .await?;
    }

    // Create the request — expiration from system parameter (default 14 days)
    let duree_demande: i64 = sqlx::query_scalar::<_, String>(
        "SELECT valeur FROM parametres_systeme WHERE nom = 'duree_demande_verification_jours'",
    )
    .fetch_optional(pool)
    .await?
    .and_then(|v| v.parse().ok())
    .unwrap_or(14);

    let date_expiration = Utc::now() + Duration::days(duree_demande);

    let demande = sqlx::query_as::<_, DemandeVerification>(
        r#"INSERT INTO demandes_verification (demandeur_id, message_personnel, parrainages_requis, date_expiration)
           VALUES ($1, $2, $3, $4)
           RETURNING id, demandeur_id, message_personnel, parrainages_requis,
                     statut, date_expiration, created_at, updated_at"#,
    )
    .bind(demandeur_id)
    .bind(message)
    .bind(parrainages_requis)
    .bind(date_expiration)
    .fetch_one(pool)
    .await?;

    // Create sponsorship invitations
    for parrain_id in parrains_ids {
        sqlx::query(
            "INSERT INTO parrainages (demande_id, parrain_id) VALUES ($1, $2)",
        )
        .bind(demande.id)
        .bind(parrain_id)
        .execute(pool)
        .await?;
    }

    // Update user verification status
    sqlx::query("UPDATE users SET verification_statut = 'en_cours', updated_at = NOW() WHERE id = $1")
        .bind(demandeur_id)
        .execute(pool)
        .await?;

    // Return with sponsorship details
    get_demande_with_details(pool, demande.id).await
}

/// Get the active verification request for a user.
pub async fn get_demande_active(
    pool: &PgPool,
    user_id: Uuid,
) -> Result<Option<DemandeAvecParrainages>, VitaError> {
    let demande = sqlx::query_as::<_, DemandeVerification>(
        r#"SELECT id, demandeur_id, message_personnel, parrainages_requis,
                  statut, date_expiration, created_at, updated_at
           FROM demandes_verification
           WHERE demandeur_id = $1 AND statut = 'en_attente'
           ORDER BY created_at DESC LIMIT 1"#,
    )
    .bind(user_id)
    .fetch_optional(pool)
    .await?;

    match demande {
        Some(d) => Ok(Some(get_demande_with_details(pool, d.id).await?)),
        None => Ok(None),
    }
}

/// Cancel a verification request.
pub async fn annuler_demande(
    pool: &PgPool,
    demande_id: Uuid,
    user_id: Uuid,
) -> Result<(), VitaError> {
    let demande = sqlx::query_as::<_, DemandeVerification>(
        r#"SELECT id, demandeur_id, message_personnel, parrainages_requis,
                  statut, date_expiration, created_at, updated_at
           FROM demandes_verification WHERE id = $1"#,
    )
    .bind(demande_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| VitaError::NotFound("Demande introuvable".into()))?;

    if demande.demandeur_id != user_id {
        return Err(VitaError::Forbidden("Cette demande ne vous appartient pas".into()));
    }
    if demande.statut != "en_attente" {
        return Err(VitaError::BadRequest(format!(
            "Impossible d'annuler une demande en statut '{}'", demande.statut
        )));
    }

    sqlx::query("UPDATE demandes_verification SET statut = 'annulee', updated_at = NOW() WHERE id = $1")
        .bind(demande_id)
        .execute(pool)
        .await?;

    sqlx::query("UPDATE users SET verification_statut = 'non_verifie', updated_at = NOW() WHERE id = $1")
        .bind(user_id)
        .execute(pool)
        .await?;

    Ok(())
}

/// Invite an additional sponsor to an existing request.
pub async fn inviter_parrain_supplementaire(
    pool: &PgPool,
    demande_id: Uuid,
    demandeur_id: Uuid,
    parrain_id: Uuid,
) -> Result<ParrainageRow, VitaError> {
    // Verify request exists, belongs to user, and is active
    let demande = sqlx::query_as::<_, DemandeVerification>(
        r#"SELECT id, demandeur_id, message_personnel, parrainages_requis,
                  statut, date_expiration, created_at, updated_at
           FROM demandes_verification WHERE id = $1"#,
    )
    .bind(demande_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| VitaError::NotFound("Demande introuvable".into()))?;

    if demande.demandeur_id != demandeur_id {
        return Err(VitaError::Forbidden("Cette demande ne vous appartient pas".into()));
    }
    if demande.statut != "en_attente" {
        return Err(VitaError::BadRequest("La demande n'est plus active".into()));
    }

    // Check max invitations (5)
    let count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM parrainages WHERE demande_id = $1",
    )
    .bind(demande_id)
    .fetch_one(pool)
    .await?;

    if count >= 5 {
        return Err(VitaError::BadRequest(
            "Maximum 5 invitations par demande".into(),
        ));
    }

    // Cannot sponsor yourself
    if parrain_id == demandeur_id {
        return Err(VitaError::BadRequest("Vous ne pouvez pas etre votre propre parrain".into()));
    }

    // Verify sponsor is verified
    let parrain_statut: Option<String> = sqlx::query_scalar(
        "SELECT verification_statut FROM users WHERE id = $1 AND actif = true",
    )
    .bind(parrain_id)
    .fetch_optional(pool)
    .await?;

    match parrain_statut {
        Some(s) if s == "verifie" => {}
        Some(_) => {
            return Err(VitaError::BadRequest("Ce parrain n'est pas verifie".into()));
        }
        None => {
            return Err(VitaError::NotFound("Parrain introuvable".into()));
        }
    }

    // Insert (UNIQUE constraint will catch duplicates)
    let parrainage = sqlx::query_as::<_, ParrainageRow>(
        r#"INSERT INTO parrainages (demande_id, parrain_id)
           VALUES ($1, $2)
           RETURNING id, demande_id, parrain_id, statut, lien_avec_demandeur,
                     commentaire, date_invitation, date_reponse"#,
    )
    .bind(demande_id)
    .bind(parrain_id)
    .fetch_one(pool)
    .await
    .map_err(|e| match e {
        sqlx::Error::Database(ref db_err) if db_err.constraint().is_some() => {
            VitaError::BadRequest("Ce parrain est deja invite pour cette demande".into())
        }
        _ => VitaError::Database(e),
    })?;

    Ok(parrainage)
}

/// Check and expire overdue verification requests.
pub async fn check_expiration(pool: &PgPool) -> Result<Vec<Uuid>, VitaError> {
    // Find expired requests
    let expired_ids: Vec<Uuid> = sqlx::query_scalar(
        r#"SELECT id FROM demandes_verification
           WHERE statut = 'en_attente' AND date_expiration < NOW()"#,
    )
    .fetch_all(pool)
    .await?;

    let mut affected_users = Vec::new();

    for demande_id in &expired_ids {
        // Get user ID
        let user_id: Option<Uuid> = sqlx::query_scalar(
            "SELECT demandeur_id FROM demandes_verification WHERE id = $1",
        )
        .bind(demande_id)
        .fetch_optional(pool)
        .await?;

        // Update request status
        sqlx::query("UPDATE demandes_verification SET statut = 'expiree', updated_at = NOW() WHERE id = $1")
            .bind(demande_id)
            .execute(pool)
            .await?;

        // Reset user verification status
        if let Some(uid) = user_id {
            sqlx::query(
                "UPDATE users SET verification_statut = 'non_verifie', updated_at = NOW() WHERE id = $1 AND verification_statut = 'en_cours'",
            )
            .bind(uid)
            .execute(pool)
            .await?;
            affected_users.push(uid);
        }
    }

    // Also check for expired verifications (verified users whose verification has expired)
    let expired_verifications: Vec<Uuid> = sqlx::query_scalar(
        r#"SELECT id FROM users
           WHERE verification_statut = 'verifie'
           AND verification_expiration IS NOT NULL
           AND verification_expiration < NOW()"#,
    )
    .fetch_all(pool)
    .await?;

    for user_id in &expired_verifications {
        sqlx::query(
            "UPDATE users SET verification_statut = 'expire', updated_at = NOW() WHERE id = $1",
        )
        .bind(user_id)
        .execute(pool)
        .await?;

        audit::audit_system(
            pool.clone(),
            "identity.expired",
            "identity",
            "warning",
            &format!("Verification expiree pour l'utilisateur {}", user_id),
            None,
            Some(("user", *user_id)),
        );

        affected_users.push(*user_id);
    }

    Ok(affected_users)
}

// ── Internal helpers ───────────────────────────────────────────────

async fn get_demande_with_details(
    pool: &PgPool,
    demande_id: Uuid,
) -> Result<DemandeAvecParrainages, VitaError> {
    let demande = sqlx::query_as::<_, DemandeVerification>(
        r#"SELECT id, demandeur_id, message_personnel, parrainages_requis,
                  statut, date_expiration, created_at, updated_at
           FROM demandes_verification WHERE id = $1"#,
    )
    .bind(demande_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| VitaError::NotFound("Demande introuvable".into()))?;

    let parrainages = sqlx::query_as::<_, ParrainageRow>(
        r#"SELECT id, demande_id, parrain_id, statut, lien_avec_demandeur,
                  commentaire, date_invitation, date_reponse
           FROM parrainages WHERE demande_id = $1
           ORDER BY date_invitation ASC"#,
    )
    .bind(demande_id)
    .fetch_all(pool)
    .await?;

    let mut details = Vec::new();
    let mut acceptes = 0i64;

    for p in &parrainages {
        let username: String = sqlx::query_scalar(
            "SELECT username FROM users WHERE id = $1",
        )
        .bind(p.parrain_id)
        .fetch_optional(pool)
        .await?
        .unwrap_or_else(|| "inconnu".to_string());

        if p.statut == "accepte" {
            acceptes += 1;
        }

        details.push(ParrainageDetail {
            id: p.id,
            parrain_id: p.parrain_id,
            parrain_username: username,
            statut: p.statut.clone(),
            lien_avec_demandeur: p.lien_avec_demandeur.clone(),
            commentaire: p.commentaire.clone(),
            date_invitation: p.date_invitation,
            date_reponse: p.date_reponse,
        });
    }

    Ok(DemandeAvecParrainages {
        demande,
        parrainages: details,
        parrainages_acceptes: acceptes,
    })
}
