use actix_web::{web, HttpResponse};
use sqlx::PgPool;
use uuid::Uuid;

use crate::audit;
use crate::auth::middleware::{AuthUser, require_role};
use crate::error::VitaError;

// ── Handlers ───────────────────────────────────────────────────────

/// GET /api/v1/audit/logs
pub async fn get_logs(
    pool: web::Data<PgPool>,
    user: AuthUser,
    query: web::Query<audit::AuditFilters>,
) -> Result<HttpResponse, VitaError> {
    require_role(&user, &["dieu", "super_admin", "admin", "auditeur"])?;

    let logs = audit::get_logs(pool.get_ref(), &query).await?;
    Ok(HttpResponse::Ok().json(logs))
}

/// GET /api/v1/audit/logs/{id}
pub async fn get_log_detail(
    pool: web::Data<PgPool>,
    user: AuthUser,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, VitaError> {
    require_role(&user, &["dieu", "super_admin", "admin", "auditeur"])?;

    let id = path.into_inner();
    let detail = audit::get_log_detail(pool.get_ref(), id).await?;
    Ok(HttpResponse::Ok().json(detail))
}

/// POST /api/v1/audit/verify
pub async fn verify_integrity(
    pool: web::Data<PgPool>,
    user: AuthUser,
) -> Result<HttpResponse, VitaError> {
    require_role(&user, &["dieu", "super_admin", "admin"])?;

    let report = audit::verify_integrity(pool.get_ref()).await?;

    // Log the verification itself
    audit::audit(
        pool.get_ref().clone(),
        Some(&user),
        "audit.verify",
        "system",
        "info",
        &format!("Verification d'integrite: {} entrees, ok={}", report.total_entries, report.verified_ok),
        Some(serde_json::json!({
            "total_entries": report.total_entries,
            "verified_ok": report.verified_ok,
        })),
        None,
    );

    Ok(HttpResponse::Ok().json(report))
}

/// GET /api/v1/audit/status
pub async fn get_status(
    pool: web::Data<PgPool>,
    user: AuthUser,
) -> Result<HttpResponse, VitaError> {
    require_role(&user, &["dieu", "super_admin", "admin", "auditeur"])?;

    let status = audit::get_integrity_status(pool.get_ref()).await?;
    Ok(HttpResponse::Ok().json(status))
}

/// GET /api/v1/audit/export
pub async fn export_logs(
    pool: web::Data<PgPool>,
    user: AuthUser,
    query: web::Query<audit::AuditFilters>,
) -> Result<HttpResponse, VitaError> {
    require_role(&user, &["dieu", "super_admin", "admin"])?;

    // Use a large limit for export
    let mut filters = audit::AuditFilters {
        categorie: query.categorie.clone(),
        severite: query.severite.clone(),
        acteur_id: query.acteur_id,
        entite_type: query.entite_type.clone(),
        date_from: query.date_from,
        date_to: query.date_to,
        limit: Some(10000),
        offset: Some(0),
    };
    if let Some(l) = query.limit {
        filters.limit = Some(l.min(10000));
    }

    let logs = audit::get_logs(pool.get_ref(), &filters).await?;

    Ok(HttpResponse::Ok()
        .insert_header(("Content-Type", "application/json"))
        .insert_header(("Content-Disposition", "attachment; filename=\"audit_export.json\""))
        .json(logs))
}
