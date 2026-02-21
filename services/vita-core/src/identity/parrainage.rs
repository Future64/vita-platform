use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::audit;
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
pub struct CooldownStatus {
    pub can_attest: bool,
    pub last_attestation: Option<DateTime<Utc>>,
    pub available_at: Option<DateTime<Utc>>,
    pub cooldown_days: i64,
}

#[derive(Debug, Serialize)]
pub struct RevocationResult {
    pub revoked: bool,
    pub parrainage_id: Uuid,
    pub verification_invalidated: bool,
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

    // ── Web of Trust: 30-day cooldown check ──────────────────────
    let cooldown = check_cooldown(pool, parrain_id).await?;
    if !cooldown.can_attest {
        let available = cooldown
            .available_at
            .map(|d| d.format("%d/%m/%Y").to_string())
            .unwrap_or_default();
        return Err(VitaError::BadRequest(format!(
            "Cooldown de {} jours entre attestations. Prochaine attestation possible le {}",
            cooldown.cooldown_days, available
        )));
    }

    // ── Web of Trust: anti-cross-sponsorship check ───────────────
    let demandeur_id_for_cross: Uuid = sqlx::query_scalar(
        "SELECT demandeur_id FROM demandes_verification WHERE id = $1",
    )
    .bind(parrainage.demande_id)
    .fetch_one(pool)
    .await?;

    check_anti_cross_sponsorship(pool, parrain_id, demandeur_id_for_cross).await?;

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

    // Update sponsorship (including cooldown tracker)
    sqlx::query(
        r#"UPDATE parrainages SET
            statut = 'accepte',
            lien_avec_demandeur = $2,
            commentaire = $3,
            date_reponse = NOW(),
            date_derniere_attestation = NOW()
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

        // Audit the verification completion
        audit::audit_system(
            pool.clone(),
            "identity.verified",
            "identity",
            "info",
            &format!("Utilisateur {} verifie — {} attestations, transition: {} -> {}",
                demandeur_id, acceptes, &current_role, new_role),
            Some(serde_json::json!({
                "parrainages": acceptes,
                "ancien_role": &current_role,
                "nouveau_role": new_role,
            })),
            Some(("user", demandeur_id)),
        );

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

// ── Web of Trust — Cooldown (30 jours entre attestations) ─────────

/// Check if a sponsor can attest right now (30-day cooldown).
pub async fn check_cooldown(
    pool: &PgPool,
    parrain_id: Uuid,
) -> Result<CooldownStatus, VitaError> {
    let cooldown_days: i64 = sqlx::query_scalar::<_, String>(
        "SELECT valeur FROM parametres_systeme WHERE nom = 'cooldown_parrainage_jours'",
    )
    .fetch_optional(pool)
    .await?
    .and_then(|v| v.parse().ok())
    .unwrap_or(30);

    // Get the most recent accepted attestation
    let last_attestation: Option<DateTime<Utc>> = sqlx::query_scalar(
        r#"SELECT MAX(date_reponse) FROM parrainages
           WHERE parrain_id = $1 AND statut = 'accepte'"#,
    )
    .bind(parrain_id)
    .fetch_optional(pool)
    .await?
    .flatten();

    match last_attestation {
        Some(last) => {
            let available_at = last + Duration::days(cooldown_days);
            let can_attest = Utc::now() >= available_at;
            Ok(CooldownStatus {
                can_attest,
                last_attestation: Some(last),
                available_at: Some(available_at),
                cooldown_days,
            })
        }
        None => Ok(CooldownStatus {
            can_attest: true,
            last_attestation: None,
            available_at: None,
            cooldown_days,
        }),
    }
}

// ── Web of Trust — Anti-parrainage croise ─────────────────────────

/// Check that the sponsor was NOT previously sponsored by the requester.
/// Prevents mutual sponsorship: if A sponsored B, B cannot sponsor A.
pub async fn check_anti_cross_sponsorship(
    pool: &PgPool,
    parrain_id: Uuid,
    demandeur_id: Uuid,
) -> Result<(), VitaError> {
    // Did the demandeur (the person requesting verification) ever sponsor
    // the parrain (the person now being asked to attest)?
    let cross_exists: bool = sqlx::query_scalar(
        r#"SELECT EXISTS(
            SELECT 1 FROM parrainages p
            JOIN demandes_verification dv ON p.demande_id = dv.id
            WHERE p.parrain_id = $1
              AND dv.demandeur_id = $2
              AND p.statut = 'accepte'
        )"#,
    )
    .bind(demandeur_id) // demandeur was the parrain in a previous request
    .bind(parrain_id)   // parrain was the demandeur in a previous request
    .fetch_one(pool)
    .await?;

    if cross_exists {
        return Err(VitaError::BadRequest(
            "Parrainage croise interdit : cette personne a deja atteste votre identite. \
             Vous ne pouvez pas attester la sienne en retour."
                .into(),
        ));
    }

    Ok(())
}

// ── Web of Trust — Revocation ─────────────────────────────────────

/// Revoke a previously accepted sponsorship attestation.
/// If this brings the demandeur below the required threshold,
/// their verification is invalidated.
pub async fn revoquer_parrainage(
    pool: &PgPool,
    parrainage_id: Uuid,
    parrain_id: Uuid,
    motif: &str,
) -> Result<RevocationResult, VitaError> {
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
        return Err(VitaError::Forbidden(
            "Ce parrainage ne vous est pas destine".into(),
        ));
    }

    if parrainage.statut != "accepte" {
        return Err(VitaError::BadRequest(format!(
            "Impossible de revoquer un parrainage en statut '{}'",
            parrainage.statut
        )));
    }

    if motif.is_empty() {
        return Err(VitaError::BadRequest(
            "Le motif de revocation est requis".into(),
        ));
    }

    // Update sponsorship to revoked
    sqlx::query(
        r#"UPDATE parrainages SET
            statut = 'revoque',
            date_revocation = NOW(),
            motif_revocation = $2
           WHERE id = $1"#,
    )
    .bind(parrainage_id)
    .bind(motif)
    .execute(pool)
    .await?;

    // Check if this invalidates the demandeur's verification
    let demande_id = parrainage.demande_id;

    let remaining_acceptes: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM parrainages WHERE demande_id = $1 AND statut = 'accepte'",
    )
    .bind(demande_id)
    .fetch_one(pool)
    .await?;

    let requis: i32 = sqlx::query_scalar(
        "SELECT parrainages_requis FROM demandes_verification WHERE id = $1",
    )
    .bind(demande_id)
    .fetch_one(pool)
    .await?;

    let mut verification_invalidated = false;

    // If remaining attestations < required, invalidate verification
    if remaining_acceptes < requis as i64 {
        let demandeur_id: Uuid = sqlx::query_scalar(
            "SELECT demandeur_id FROM demandes_verification WHERE id = $1",
        )
        .bind(demande_id)
        .fetch_one(pool)
        .await?;

        // Check if the user was verified via this request
        let user_statut: String = sqlx::query_scalar(
            "SELECT verification_statut FROM users WHERE id = $1",
        )
        .bind(demandeur_id)
        .fetch_one(pool)
        .await?;

        if user_statut == "verifie" {
            // Revert verification
            sqlx::query(
                r#"UPDATE users SET
                    verification_statut = 'non_verifie',
                    verification_date = NULL,
                    verification_expiration = NULL,
                    niveau_confiance = 0,
                    updated_at = NOW()
                   WHERE id = $1"#,
            )
            .bind(demandeur_id)
            .execute(pool)
            .await?;

            // Reopen the request
            sqlx::query(
                "UPDATE demandes_verification SET statut = 'en_attente', updated_at = NOW() WHERE id = $1",
            )
            .bind(demande_id)
            .execute(pool)
            .await?;

            // Log in verification history
            sqlx::query(
                r#"INSERT INTO historique_verifications (user_id, methode, statut, details)
                   VALUES ($1, 'parrainage', 'revoque', $2)"#,
            )
            .bind(demandeur_id)
            .bind(format!(
                "Attestation revoquee par parrain — restant: {}/{}",
                remaining_acceptes, requis
            ))
            .execute(pool)
            .await?;

            verification_invalidated = true;

            audit::audit_system(
                pool.clone(),
                "identity.revoked",
                "identity",
                "warning",
                &format!(
                    "Verification invalidee pour {} — parrainage revoque, restant: {}/{}",
                    demandeur_id, remaining_acceptes, requis
                ),
                Some(serde_json::json!({
                    "parrainage_id": parrainage_id,
                    "remaining": remaining_acceptes,
                    "required": requis,
                })),
                Some(("user", demandeur_id)),
            );
        }
    }

    Ok(RevocationResult {
        revoked: true,
        parrainage_id,
        verification_invalidated,
    })
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

// ── Tests ──────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cooldown_status_fields() {
        let status = CooldownStatus {
            can_attest: true,
            last_attestation: None,
            available_at: None,
            cooldown_days: 30,
        };
        assert!(status.can_attest);
        assert_eq!(status.cooldown_days, 30);
    }

    #[test]
    fn test_cooldown_status_with_date() {
        let now = Utc::now();
        let status = CooldownStatus {
            can_attest: false,
            last_attestation: Some(now),
            available_at: Some(now + Duration::days(30)),
            cooldown_days: 30,
        };
        assert!(!status.can_attest);
        assert!(status.available_at.unwrap() > now);
    }

    #[test]
    fn test_revocation_result_fields() {
        let result = RevocationResult {
            revoked: true,
            parrainage_id: Uuid::new_v4(),
            verification_invalidated: false,
        };
        assert!(result.revoked);
        assert!(!result.verification_invalidated);
    }

    #[test]
    fn test_revocation_result_with_invalidation() {
        let result = RevocationResult {
            revoked: true,
            parrainage_id: Uuid::new_v4(),
            verification_invalidated: true,
        };
        assert!(result.verification_invalidated);
    }
}
