use actix_web::{web, HttpResponse};
use chrono::Utc;
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::audit;
use crate::auth::middleware::{AuthUser, require_role};
use crate::error::VitaError;
use crate::governance::{doleances, propositions, votes, parametres, discussions};
use crate::ws::{WsServer, ServerMessage};

// ── Helper ─────────────────────────────────────────────────────────

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

// ── Doléances ──────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct CreateDoleanceBody {
    pub titre: String,
    pub description: String,
    pub categorie: String,
}

/// POST /api/v1/governance/doleances
pub async fn create_doleance(
    pool: web::Data<PgPool>,
    user: AuthUser,
    body: web::Json<CreateDoleanceBody>,
) -> Result<HttpResponse, VitaError> {
    require_verified(&user)?;
    let user_id = parse_user_uuid(&user)?;

    let doleance = doleances::create_doleance(
        pool.get_ref(),
        user_id,
        &body.titre,
        &body.description,
        &body.categorie,
    )
    .await?;

    audit::audit(
        pool.get_ref().clone(),
        Some(&user),
        "doleance.create",
        "governance",
        "info",
        &format!("Doleance creee: {}", &body.titre),
        None,
        Some(("doleance", doleance.id)),
    );

    Ok(HttpResponse::Created().json(doleance))
}

/// GET /api/v1/governance/doleances
pub async fn list_doleances(
    pool: web::Data<PgPool>,
    query: web::Query<doleances::DoleanceFilters>,
) -> Result<HttpResponse, VitaError> {
    let rows = doleances::get_doleances(pool.get_ref(), &query).await?;
    Ok(HttpResponse::Ok().json(rows))
}

/// GET /api/v1/governance/doleances/{id}
pub async fn get_doleance(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, VitaError> {
    let id = path.into_inner();
    let doleance = doleances::get_doleance(pool.get_ref(), id).await?;
    Ok(HttpResponse::Ok().json(doleance))
}

/// POST /api/v1/governance/doleances/{id}/soutenir
pub async fn soutenir_doleance(
    pool: web::Data<PgPool>,
    user: AuthUser,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, VitaError> {
    require_verified(&user)?;
    let user_id = parse_user_uuid(&user)?;
    let doleance_id = path.into_inner();

    let doleance = doleances::soutenir_doleance(pool.get_ref(), doleance_id, user_id).await?;

    audit::audit(
        pool.get_ref().clone(),
        Some(&user),
        "doleance.soutien",
        "governance",
        "info",
        &format!("Soutien a la doleance '{}'", &doleance.titre),
        None,
        Some(("doleance", doleance_id)),
    );

    Ok(HttpResponse::Ok().json(doleance))
}

/// POST /api/v1/governance/doleances/{id}/convertir
pub async fn convertir_doleance(
    pool: web::Data<PgPool>,
    user: AuthUser,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, VitaError> {
    require_verified(&user)?;
    let user_id = parse_user_uuid(&user)?;
    let doleance_id = path.into_inner();

    // Allow author or admin
    let doleance = doleances::get_doleance(pool.get_ref(), doleance_id).await?;
    let is_admin = ["dieu", "super_admin", "admin"].contains(&user.role.as_str());
    if doleance.auteur_id != user_id && !is_admin {
        return Err(VitaError::Forbidden(
            "Seul l'auteur ou un administrateur peut convertir cette doleance".into(),
        ));
    }

    let prop_id = doleances::convertir_en_proposition(pool.get_ref(), doleance_id, user_id).await?;

    audit::audit(
        pool.get_ref().clone(),
        Some(&user),
        "doleance.convert",
        "governance",
        "info",
        &format!("Doleance {} convertie en proposition {}", doleance_id, prop_id),
        Some(serde_json::json!({ "proposition_id": prop_id })),
        Some(("doleance", doleance_id)),
    );

    Ok(HttpResponse::Created().json(serde_json::json!({
        "message": "Doleance convertie en proposition",
        "proposition_id": prop_id
    })))
}

// ── Propositions ───────────────────────────────────────────────────

/// POST /api/v1/governance/propositions
pub async fn create_proposition(
    pool: web::Data<PgPool>,
    ws_server: web::Data<WsServer>,
    user: AuthUser,
    body: web::Json<propositions::CreatePropositionData>,
) -> Result<HttpResponse, VitaError> {
    require_verified(&user)?;
    let user_id = parse_user_uuid(&user)?;

    let prop = propositions::create_proposition(pool.get_ref(), user_id, &body).await?;

    audit::audit(
        pool.get_ref().clone(),
        Some(&user),
        "proposition.create",
        "governance",
        "info",
        &format!("Proposition creee: {}", &prop.titre),
        None,
        Some(("proposition", prop.id)),
    );

    // ── WebSocket: broadcast new proposition ──────────────────────
    ws_server.broadcast(ServerMessage::ActivityFeed {
        type_: "nouvelle_proposition".to_string(),
        message: format!("Nouvelle proposition : {}", &prop.titre),
        timestamp: Utc::now().to_rfc3339(),
    });

    Ok(HttpResponse::Created().json(prop))
}

/// GET /api/v1/governance/propositions
pub async fn list_propositions(
    pool: web::Data<PgPool>,
    query: web::Query<propositions::PropositionFilters>,
) -> Result<HttpResponse, VitaError> {
    let rows = propositions::get_propositions(pool.get_ref(), &query).await?;
    Ok(HttpResponse::Ok().json(rows))
}

/// GET /api/v1/governance/propositions/{id}
pub async fn get_proposition(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, VitaError> {
    let id = path.into_inner();
    let detail = propositions::get_proposition_detail(pool.get_ref(), id).await?;
    Ok(HttpResponse::Ok().json(detail))
}

// ── Votes ──────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct VoteBody {
    pub choix: String,
}

/// POST /api/v1/governance/propositions/{id}/vote
pub async fn voter(
    pool: web::Data<PgPool>,
    ws_server: web::Data<WsServer>,
    user: AuthUser,
    path: web::Path<Uuid>,
    body: web::Json<VoteBody>,
) -> Result<HttpResponse, VitaError> {
    // require_verified is checked inside votes::voter via DB
    let user_id = parse_user_uuid(&user)?;
    let proposition_id = path.into_inner();

    let vote = votes::voter(pool.get_ref(), proposition_id, user_id, &body.choix).await?;

    audit::audit(
        pool.get_ref().clone(),
        Some(&user),
        "vote.cast",
        "vote",
        "info",
        &format!("Vote '{}' sur la proposition {}", &body.choix, proposition_id),
        Some(serde_json::json!({ "choix": &body.choix })),
        Some(("proposition", proposition_id)),
    );

    // ── WebSocket: broadcast updated vote results ─────────────────
    if let Ok(resultats) = votes::get_resultats(pool.get_ref(), proposition_id).await {
        ws_server.broadcast(ServerMessage::VoteUpdate {
            proposition_id: proposition_id.to_string(),
            pour: resultats.votes_pour as i32,
            contre: resultats.votes_contre as i32,
            abstention: resultats.votes_abstention as i32,
            participation: resultats.taux_participation,
        });
    }

    Ok(HttpResponse::Created().json(vote))
}

/// GET /api/v1/governance/propositions/{id}/resultats
pub async fn get_resultats(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, VitaError> {
    let proposition_id = path.into_inner();
    let resultats = votes::get_resultats(pool.get_ref(), proposition_id).await?;
    Ok(HttpResponse::Ok().json(resultats))
}

/// POST /api/v1/governance/propositions/{id}/passage-vote (admin)
pub async fn passage_vote(
    pool: web::Data<PgPool>,
    ws_server: web::Data<WsServer>,
    user: AuthUser,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, VitaError> {
    require_role(&user, &["dieu", "super_admin", "admin"])?;
    let proposition_id = path.into_inner();

    let prop = propositions::passer_en_vote(pool.get_ref(), proposition_id).await?;

    audit::audit(
        pool.get_ref().clone(),
        Some(&user),
        "proposition.vote_start",
        "governance",
        "info",
        &format!("Passage en vote de la proposition '{}'", &prop.titre),
        None,
        Some(("proposition", proposition_id)),
    );

    // ── WebSocket: broadcast vote opened ──────────────────────────
    ws_server.broadcast(ServerMessage::ActivityFeed {
        type_: "vote_ouvert".to_string(),
        message: format!("Vote ouvert : {}", &prop.titre),
        timestamp: Utc::now().to_rfc3339(),
    });

    Ok(HttpResponse::Ok().json(prop))
}

/// POST /api/v1/governance/propositions/{id}/cloturer (admin or auto)
pub async fn cloturer_vote(
    pool: web::Data<PgPool>,
    ws_server: web::Data<WsServer>,
    user: AuthUser,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, VitaError> {
    require_role(&user, &["dieu", "super_admin", "admin"])?;
    let proposition_id = path.into_inner();

    let resultat = propositions::cloturer_vote(pool.get_ref(), proposition_id).await?;

    audit::audit(
        pool.get_ref().clone(),
        Some(&user),
        "proposition.vote_close",
        "governance",
        "info",
        &format!("Vote cloture: proposition {} -> {}", proposition_id, &resultat.statut_final),
        Some(serde_json::json!({
            "resultat": &resultat.statut_final,
            "pour": resultat.votes_pour,
            "contre": resultat.votes_contre,
            "participation": resultat.taux_participation
        })),
        Some(("proposition", proposition_id)),
    );

    // ── WebSocket: broadcast vote closed ──────────────────────────
    ws_server.broadcast(ServerMessage::VoteUpdate {
        proposition_id: proposition_id.to_string(),
        pour: resultat.votes_pour as i32,
        contre: resultat.votes_contre as i32,
        abstention: resultat.votes_abstention as i32,
        participation: resultat.taux_participation,
    });
    ws_server.broadcast(ServerMessage::ActivityFeed {
        type_: "vote_resultat".to_string(),
        message: format!("Vote cloture : {}", &resultat.statut_final),
        timestamp: Utc::now().to_rfc3339(),
    });

    Ok(HttpResponse::Ok().json(resultat))
}

// ── Discussions ────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct CreateFilBody {
    pub sujet: String,
    pub categorie: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateMessageBody {
    pub contenu: String,
    pub reponse_a: Option<Uuid>,
}

#[derive(Debug, Deserialize)]
pub struct ReactionBody {
    pub type_reaction: String,
}

#[derive(Debug, Deserialize)]
pub struct MessageQuery {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

/// POST /api/v1/governance/propositions/{id}/fils
pub async fn create_fil(
    pool: web::Data<PgPool>,
    user: AuthUser,
    path: web::Path<Uuid>,
    body: web::Json<CreateFilBody>,
) -> Result<HttpResponse, VitaError> {
    require_verified(&user)?;
    let user_id = parse_user_uuid(&user)?;
    let proposition_id = path.into_inner();
    let categorie = body.categorie.as_deref().unwrap_or("general");

    let fil = discussions::create_fil(
        pool.get_ref(),
        proposition_id,
        user_id,
        &body.sujet,
        categorie,
    )
    .await?;

    Ok(HttpResponse::Created().json(fil))
}

/// GET /api/v1/governance/propositions/{id}/fils
pub async fn list_fils(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
    query: web::Query<discussions::FilFilters>,
) -> Result<HttpResponse, VitaError> {
    let proposition_id = path.into_inner();
    let fils = discussions::get_fils(pool.get_ref(), proposition_id, &query).await?;
    Ok(HttpResponse::Ok().json(fils))
}

/// POST /api/v1/governance/fils/{fil_id}/messages
pub async fn create_message(
    pool: web::Data<PgPool>,
    user: AuthUser,
    path: web::Path<Uuid>,
    body: web::Json<CreateMessageBody>,
) -> Result<HttpResponse, VitaError> {
    require_verified(&user)?;
    let user_id = parse_user_uuid(&user)?;
    let fil_id = path.into_inner();

    let msg = discussions::create_message(
        pool.get_ref(),
        fil_id,
        user_id,
        &body.contenu,
        body.reponse_a,
    )
    .await?;

    Ok(HttpResponse::Created().json(msg))
}

/// GET /api/v1/governance/fils/{fil_id}/messages
pub async fn list_messages(
    pool: web::Data<PgPool>,
    path: web::Path<Uuid>,
    query: web::Query<MessageQuery>,
) -> Result<HttpResponse, VitaError> {
    let fil_id = path.into_inner();
    let limit = query.limit.unwrap_or(50);
    let offset = query.offset.unwrap_or(0);

    let messages = discussions::get_messages(pool.get_ref(), fil_id, limit, offset).await?;
    Ok(HttpResponse::Ok().json(messages))
}

/// POST /api/v1/governance/messages/{msg_id}/reaction
pub async fn reagir_message(
    pool: web::Data<PgPool>,
    user: AuthUser,
    path: web::Path<Uuid>,
    body: web::Json<ReactionBody>,
) -> Result<HttpResponse, VitaError> {
    require_verified(&user)?;
    let message_id = path.into_inner();

    let msg = discussions::reagir(pool.get_ref(), message_id, &body.type_reaction).await?;
    Ok(HttpResponse::Ok().json(msg))
}

// ── Paramètres ─────────────────────────────────────────────────────

/// GET /api/v1/governance/parametres
pub async fn list_parametres(
    pool: web::Data<PgPool>,
) -> Result<HttpResponse, VitaError> {
    let params = parametres::get_all_parametres(pool.get_ref()).await?;
    Ok(HttpResponse::Ok().json(params))
}

/// GET /api/v1/governance/parametres/{nom}
pub async fn get_parametre(
    pool: web::Data<PgPool>,
    path: web::Path<String>,
) -> Result<HttpResponse, VitaError> {
    let nom = path.into_inner();
    let param = parametres::get_parametre(pool.get_ref(), &nom).await?;
    Ok(HttpResponse::Ok().json(param))
}

/// GET /api/v1/governance/parametres/{nom}/historique
pub async fn get_historique_parametre(
    pool: web::Data<PgPool>,
    path: web::Path<String>,
) -> Result<HttpResponse, VitaError> {
    let nom = path.into_inner();
    let history = parametres::get_historique_parametre(pool.get_ref(), &nom).await?;
    Ok(HttpResponse::Ok().json(history))
}

// ── Cron: Auto-close expired votes ─────────────────────────────────

/// POST /api/v1/governance/cron/close-votes (admin)
pub async fn cron_close_votes(
    pool: web::Data<PgPool>,
    user: AuthUser,
) -> Result<HttpResponse, VitaError> {
    require_role(&user, &["dieu", "super_admin", "admin"])?;

    let results = check_and_close_votes(pool.get_ref()).await?;
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "closed": results.len(),
        "results": results
    })))
}

/// Check for expired votes and close them automatically.
pub async fn check_and_close_votes(
    pool: &PgPool,
) -> Result<Vec<propositions::ResultatVote>, VitaError> {
    // Find all propositions in 'vote' status where date_fin_vote has passed
    let expired_ids: Vec<Uuid> = sqlx::query_scalar(
        "SELECT id FROM propositions WHERE statut = 'vote' AND date_fin_vote < NOW()",
    )
    .fetch_all(pool)
    .await?;

    let mut results = Vec::new();
    for id in expired_ids {
        match propositions::cloturer_vote(pool, id).await {
            Ok(result) => {
                tracing::info!(
                    "Vote cloture automatiquement: proposition {} -> {}",
                    id,
                    result.statut_final
                );
                audit::audit_system(
                    pool.clone(),
                    "proposition.vote_close_auto",
                    "governance",
                    "info",
                    &format!("Vote cloture automatiquement: proposition {} -> {}", id, &result.statut_final),
                    Some(serde_json::json!({
                        "resultat": &result.statut_final,
                        "pour": result.votes_pour,
                        "contre": result.votes_contre,
                        "participation": result.taux_participation
                    })),
                    Some(("proposition", id)),
                );
                results.push(result);
            }
            Err(e) => {
                tracing::error!("Erreur cloture vote {}: {}", id, e);
            }
        }
    }

    Ok(results)
}
