use actix_web::{web, HttpResponse};
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::audit;
use crate::auth::middleware::{AuthUser, require_role};
use crate::error::VitaError;
use crate::identity::{verification, parrainage, provider};
use crate::ws::{WsServer, ServerMessage};

// ── Helpers ────────────────────────────────────────────────────────

fn require_verified(user: &AuthUser) -> Result<(), VitaError> {
    if user.verification_statut != "verifie" {
        return Err(VitaError::Forbidden(
            "Identite non verifiee. Veuillez faire verifier votre identite pour participer.".into(),
        ));
    }
    Ok(())
}

fn parse_user_uuid(user: &AuthUser) -> Result<Uuid, VitaError> {
    Uuid::parse_str(&user.user_id)
        .map_err(|_| VitaError::Internal("Invalid user ID in token".into()))
}

// ── Vérification (pour le demandeur) ───────────────────────────────

#[derive(Debug, Deserialize)]
pub struct CreateDemandeBody {
    pub message: Option<String>,
    pub parrains: Vec<Uuid>,
}

/// POST /api/v1/identity/demande
pub async fn create_demande(
    pool: web::Data<PgPool>,
    user: AuthUser,
    body: web::Json<CreateDemandeBody>,
) -> Result<HttpResponse, VitaError> {
    let user_id = parse_user_uuid(&user)?;

    let demande = verification::create_demande(
        pool.get_ref(),
        user_id,
        body.message.as_deref(),
        &body.parrains,
    )
    .await?;

    audit::audit(
        pool.get_ref().clone(),
        Some(&user),
        "identity.request",
        "identity",
        "info",
        &format!("Demande de verification par @{} ({} parrains)", &user.username, body.parrains.len()),
        None,
        Some(("demande_verification", demande.demande.id)),
    );

    Ok(HttpResponse::Created().json(demande))
}

/// GET /api/v1/identity/demande
pub async fn get_demande_active(
    pool: web::Data<PgPool>,
    user: AuthUser,
) -> Result<HttpResponse, VitaError> {
    let user_id = parse_user_uuid(&user)?;

    let demande = verification::get_demande_active(pool.get_ref(), user_id).await?;

    match demande {
        Some(d) => Ok(HttpResponse::Ok().json(d)),
        None => Ok(HttpResponse::Ok().json(serde_json::json!({
            "message": "Aucune demande de verification en cours"
        }))),
    }
}

/// DELETE /api/v1/identity/demande
pub async fn annuler_demande(
    pool: web::Data<PgPool>,
    user: AuthUser,
) -> Result<HttpResponse, VitaError> {
    let user_id = parse_user_uuid(&user)?;

    // Find the active request
    let demande = verification::get_demande_active(pool.get_ref(), user_id).await?;
    let demande = demande.ok_or_else(|| {
        VitaError::NotFound("Aucune demande de verification en cours".into())
    })?;

    verification::annuler_demande(pool.get_ref(), demande.demande.id, user_id).await?;

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "message": "Demande de verification annulee"
    })))
}

#[derive(Debug, Deserialize)]
pub struct InviterParrainBody {
    pub parrain_id: Uuid,
}

/// POST /api/v1/identity/demande/inviter
pub async fn inviter_parrain(
    pool: web::Data<PgPool>,
    user: AuthUser,
    body: web::Json<InviterParrainBody>,
) -> Result<HttpResponse, VitaError> {
    let user_id = parse_user_uuid(&user)?;

    // Find the active request
    let demande = verification::get_demande_active(pool.get_ref(), user_id).await?;
    let demande = demande.ok_or_else(|| {
        VitaError::NotFound("Aucune demande de verification en cours".into())
    })?;

    let p = verification::inviter_parrain_supplementaire(
        pool.get_ref(),
        demande.demande.id,
        user_id,
        body.parrain_id,
    )
    .await?;

    Ok(HttpResponse::Created().json(p))
}

/// POST /api/v1/identity/demande/{parrainage_id}/relancer
pub async fn relancer_parrain(
    pool: web::Data<PgPool>,
    user: AuthUser,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, VitaError> {
    let user_id = parse_user_uuid(&user)?;
    let parrainage_id = path.into_inner();

    parrainage::relancer(pool.get_ref(), parrainage_id, user_id).await?;

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "message": "Relance envoyee"
    })))
}

// ── Parrainage (pour le parrain) ───────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct ParrainageQuery {
    pub statut: Option<String>,
}

/// GET /api/v1/identity/parrainages
pub async fn get_parrainages_recus(
    pool: web::Data<PgPool>,
    user: AuthUser,
    query: web::Query<ParrainageQuery>,
) -> Result<HttpResponse, VitaError> {
    require_verified(&user)?;
    let user_id = parse_user_uuid(&user)?;

    let demandes = parrainage::get_demandes_recues(
        pool.get_ref(),
        user_id,
        query.statut.as_deref(),
    )
    .await?;

    Ok(HttpResponse::Ok().json(demandes))
}

#[derive(Debug, Deserialize)]
pub struct AttesterBody {
    pub lien: String,
    pub commentaire: Option<String>,
}

/// POST /api/v1/identity/parrainages/{id}/attester
pub async fn attester(
    pool: web::Data<PgPool>,
    ws_server: web::Data<WsServer>,
    user: AuthUser,
    path: web::Path<Uuid>,
    body: web::Json<AttesterBody>,
) -> Result<HttpResponse, VitaError> {
    require_verified(&user)?;
    let user_id = parse_user_uuid(&user)?;
    let parrainage_id = path.into_inner();

    // Look up the demandeur before the attestation
    let demandeur_id: Option<Uuid> = sqlx::query_scalar(
        r#"SELECT dv.demandeur_id FROM parrainages p
           JOIN demandes_verification dv ON p.demande_id = dv.id
           WHERE p.id = $1"#,
    )
    .bind(parrainage_id)
    .fetch_optional(pool.get_ref())
    .await?;

    let result = parrainage::attester(
        pool.get_ref(),
        parrainage_id,
        user_id,
        &body.lien,
        body.commentaire.as_deref(),
    )
    .await?;

    audit::audit(
        pool.get_ref().clone(),
        Some(&user),
        "identity.attest",
        "identity",
        "info",
        &format!("@{} atteste pour le parrainage {}", &user.username, parrainage_id),
        Some(serde_json::json!({
            "lien": &body.lien,
            "verification_complete": result.verification_complete
        })),
        Some(("parrainage", parrainage_id)),
    );

    // ── WebSocket notifications ───────────────────────────────────
    if let Some(dem_id) = demandeur_id {
        ws_server.send_to_user(
            &dem_id.to_string(),
            ServerMessage::Notification {
                type_: "attestation_recue".to_string(),
                titre: "Attestation recue".to_string(),
                contenu: format!("@{} a atteste votre identite ({}/{})",
                    &user.username, result.parrainages_actuels, result.parrainages_requis),
                lien: Some("/civis/verification".to_string()),
            },
        );

        if result.verification_complete {
            ws_server.send_to_user(
                &dem_id.to_string(),
                ServerMessage::Notification {
                    type_: "verification_complete".to_string(),
                    titre: "Verification terminee !".to_string(),
                    contenu: "Votre identite est verifiee. Vous etes maintenant citoyen.".to_string(),
                    lien: Some("/civis/verification".to_string()),
                },
            );
            ws_server.broadcast(ServerMessage::ActivityFeed {
                type_: "verification_complete".to_string(),
                message: "Un nouveau citoyen a ete verifie".to_string(),
                timestamp: chrono::Utc::now().to_rfc3339(),
            });
        }
    }

    Ok(HttpResponse::Ok().json(result))
}

#[derive(Debug, Deserialize)]
pub struct RefuserBody {
    pub motif: String,
}

/// POST /api/v1/identity/parrainages/{id}/refuser
pub async fn refuser_parrainage(
    pool: web::Data<PgPool>,
    user: AuthUser,
    path: web::Path<Uuid>,
    body: web::Json<RefuserBody>,
) -> Result<HttpResponse, VitaError> {
    require_verified(&user)?;
    let user_id = parse_user_uuid(&user)?;
    let parrainage_id = path.into_inner();

    parrainage::refuser(pool.get_ref(), parrainage_id, user_id, &body.motif).await?;

    audit::audit(
        pool.get_ref().clone(),
        Some(&user),
        "identity.refuse",
        "identity",
        "info",
        &format!("@{} refuse le parrainage {}", &user.username, parrainage_id),
        Some(serde_json::json!({ "motif": &body.motif })),
        Some(("parrainage", parrainage_id)),
    );

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "message": "Parrainage refuse"
    })))
}

/// GET /api/v1/identity/parrainages/compteur
pub async fn get_compteur(
    pool: web::Data<PgPool>,
    user: AuthUser,
) -> Result<HttpResponse, VitaError> {
    require_verified(&user)?;
    let user_id = parse_user_uuid(&user)?;

    let (utilises, max) = parrainage::get_compteur_annuel(pool.get_ref(), user_id).await?;

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "parrainages_utilises": utilises,
        "parrainages_max": max,
        "restants": max - utilises
    })))
}

// ── Web of Trust — Cooldown status ────────────────────────────────

/// GET /api/v1/identity/parrainages/cooldown
pub async fn get_cooldown_status(
    pool: web::Data<PgPool>,
    user: AuthUser,
) -> Result<HttpResponse, VitaError> {
    require_verified(&user)?;
    let user_id = parse_user_uuid(&user)?;

    let status = parrainage::check_cooldown(pool.get_ref(), user_id).await?;

    Ok(HttpResponse::Ok().json(status))
}

// ── Web of Trust — Revocation ────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct RevoquerBody {
    pub motif: String,
}

/// DELETE /api/v1/identity/parrainages/{id}/revoquer
pub async fn revoquer_parrainage(
    pool: web::Data<PgPool>,
    ws_server: web::Data<WsServer>,
    user: AuthUser,
    path: web::Path<Uuid>,
    body: web::Json<RevoquerBody>,
) -> Result<HttpResponse, VitaError> {
    require_verified(&user)?;
    let user_id = parse_user_uuid(&user)?;
    let parrainage_id = path.into_inner();

    // Look up the demandeur before revocation
    let demandeur_id: Option<Uuid> = sqlx::query_scalar(
        r#"SELECT dv.demandeur_id FROM parrainages p
           JOIN demandes_verification dv ON p.demande_id = dv.id
           WHERE p.id = $1"#,
    )
    .bind(parrainage_id)
    .fetch_optional(pool.get_ref())
    .await?;

    let result = parrainage::revoquer_parrainage(
        pool.get_ref(),
        parrainage_id,
        user_id,
        &body.motif,
    )
    .await?;

    audit::audit(
        pool.get_ref().clone(),
        Some(&user),
        "identity.revoke",
        "identity",
        "warning",
        &format!(
            "@{} revoque le parrainage {} (invalidation: {})",
            &user.username, parrainage_id, result.verification_invalidated
        ),
        Some(serde_json::json!({
            "motif": &body.motif,
            "verification_invalidated": result.verification_invalidated,
        })),
        Some(("parrainage", parrainage_id)),
    );

    // WebSocket notifications
    if let Some(dem_id) = demandeur_id {
        if result.verification_invalidated {
            ws_server.send_to_user(
                &dem_id.to_string(),
                ServerMessage::Notification {
                    type_: "verification_revoked".to_string(),
                    titre: "Verification invalidee".to_string(),
                    contenu: format!(
                        "@{} a revoque son attestation. Votre verification n'est plus valide.",
                        &user.username
                    ),
                    lien: Some("/civis/verification".to_string()),
                },
            );
        } else {
            ws_server.send_to_user(
                &dem_id.to_string(),
                ServerMessage::Notification {
                    type_: "attestation_revoked".to_string(),
                    titre: "Attestation revoquee".to_string(),
                    contenu: format!(
                        "@{} a revoque son attestation. Votre verification reste valide.",
                        &user.username
                    ),
                    lien: Some("/civis/verification".to_string()),
                },
            );
        }
    }

    Ok(HttpResponse::Ok().json(result))
}

// ── Recherche de parrains potentiels ───────────────────────────────

#[derive(Debug, Deserialize)]
pub struct SearchQuery {
    pub q: Option<String>,
}

/// GET /api/v1/identity/parrains-potentiels
pub async fn search_parrains(
    pool: web::Data<PgPool>,
    _user: AuthUser,
    query: web::Query<SearchQuery>,
) -> Result<HttpResponse, VitaError> {
    let search = query.q.as_deref().unwrap_or("");

    if search.len() < 2 {
        return Ok(HttpResponse::Ok().json(serde_json::json!([])));
    }

    let pattern = format!("%{}%", search);

    let results = sqlx::query_as::<_, ParrainPotentiel>(
        r#"SELECT id, username,
                  CASE
                    WHEN mode_visibilite = 'complet' THEN prenom_affiche
                    ELSE NULL
                  END AS prenom_affiche,
                  CASE
                    WHEN mode_visibilite = 'complet' THEN nom_affiche
                    ELSE NULL
                  END AS nom_affiche,
                  CASE
                    WHEN mode_visibilite = 'pseudonyme' THEN pseudonyme
                    ELSE NULL
                  END AS pseudonyme,
                  pays_affiche
           FROM users
           WHERE verification_statut = 'verifie'
             AND actif = true
             AND (username ILIKE $1 OR prenom_affiche ILIKE $1 OR nom_affiche ILIKE $1)
           LIMIT 10"#,
    )
    .bind(&pattern)
    .fetch_all(pool.get_ref())
    .await?;

    Ok(HttpResponse::Ok().json(results))
}

#[derive(Debug, serde::Serialize, sqlx::FromRow)]
struct ParrainPotentiel {
    id: Uuid,
    username: String,
    prenom_affiche: Option<String>,
    nom_affiche: Option<String>,
    pseudonyme: Option<String>,
    pays_affiche: Option<String>,
}

// ── Admin ──────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct HistoriqueQuery {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

#[derive(Debug, serde::Serialize, sqlx::FromRow)]
struct HistoriqueVerificationRow {
    id: Uuid,
    user_id: Uuid,
    methode: String,
    statut: String,
    details: Option<String>,
    parrains: Option<serde_json::Value>,
    created_at: chrono::DateTime<chrono::Utc>,
}

/// GET /api/v1/identity/verifications (admin/auditeur)
pub async fn get_historique_verifications(
    pool: web::Data<PgPool>,
    user: AuthUser,
    query: web::Query<HistoriqueQuery>,
) -> Result<HttpResponse, VitaError> {
    require_role(&user, &["dieu", "super_admin", "admin", "auditeur"])?;

    let limit = query.limit.unwrap_or(50).min(100);
    let offset = query.offset.unwrap_or(0).max(0);

    let rows = sqlx::query_as::<_, HistoriqueVerificationRow>(
        r#"SELECT id, user_id, methode, statut, details, parrains, created_at
           FROM historique_verifications
           ORDER BY created_at DESC
           LIMIT $1 OFFSET $2"#,
    )
    .bind(limit)
    .bind(offset)
    .fetch_all(pool.get_ref())
    .await?;

    Ok(HttpResponse::Ok().json(rows))
}

/// POST /api/v1/identity/cron/check-expirations (admin)
pub async fn cron_check_expirations(
    pool: web::Data<PgPool>,
    user: AuthUser,
) -> Result<HttpResponse, VitaError> {
    require_role(&user, &["dieu", "super_admin", "admin"])?;

    let affected = check_expirations(pool.get_ref()).await?;

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "affected_users": affected.len(),
        "user_ids": affected
    })))
}

/// Run expiration checks (called by cron and admin endpoint).
pub async fn check_expirations(pool: &PgPool) -> Result<Vec<Uuid>, VitaError> {
    verification::check_expiration(pool).await
}

// ══════════════════════════════════════════════════════════════════
// Provider-based identity verification (FranceConnect, Signicat)
// ══════════════════════════════════════════════════════════════════

/// POST /api/v1/identity/verify
///
/// Recoit un code OAuth2 et un code_verifier PKCE.
/// Echange le code contre un token, recupere le sub,
/// calcule le nullifier_hash, et verifie l'unicite.
///
/// Retourne 409 DuplicateIdentity si le nullifier existe deja
/// pour un autre compte.
pub async fn verify_provider_endpoint(
    pool: web::Data<PgPool>,
    ws_server: web::Data<WsServer>,
    user: AuthUser,
    body: web::Json<provider::VerifyRequest>,
) -> Result<HttpResponse, VitaError> {
    let user_id = parse_user_uuid(&user)?;

    // Validation du provider
    let allowed_providers = ["franceconnect", "signicat"];
    if !allowed_providers.contains(&body.provider.as_str()) {
        return Err(VitaError::BadRequest(format!(
            "Provider non supporte: {}. Utiliser: {}",
            body.provider,
            allowed_providers.join(", ")
        )));
    }

    // Verification
    let result = provider::verify_provider(pool.get_ref(), user_id, &body).await?;

    // Audit
    audit::audit(
        pool.get_ref().clone(),
        Some(&user),
        "identity.verify_provider",
        "identity",
        "info",
        &format!(
            "@{} verifie via {} (pays: {})",
            &user.username,
            &result.provider,
            result.country_code.as_deref().unwrap_or("?")
        ),
        Some(serde_json::json!({
            "provider": &result.provider,
            "country_code": &result.country_code,
            "assurance_level": &result.assurance_level,
        })),
        None,
    );

    // WebSocket notification
    ws_server.send_to_user(
        &user_id.to_string(),
        ServerMessage::Notification {
            type_: "verification_complete".to_string(),
            titre: "Verification terminee !".to_string(),
            contenu: format!(
                "Votre identite a ete verifiee via {}.",
                &result.provider
            ),
            lien: Some("/civis/verification".to_string()),
        },
    );

    ws_server.broadcast(ServerMessage::ActivityFeed {
        type_: "verification_complete".to_string(),
        message: "Un nouveau citoyen a ete verifie".to_string(),
        timestamp: chrono::Utc::now().to_rfc3339(),
    });

    Ok(HttpResponse::Ok().json(result))
}

/// GET /api/v1/identity/status/{account_id}
///
/// Retourne le statut de verification d'un compte.
pub async fn get_verification_status(
    pool: web::Data<PgPool>,
    _user: AuthUser,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, VitaError> {
    let account_id = path.into_inner();

    let status = provider::get_verification_status(pool.get_ref(), account_id).await?;

    Ok(HttpResponse::Ok().json(status))
}
