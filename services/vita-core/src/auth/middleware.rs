use actix_web::body::EitherBody;
use actix_web::dev::{forward_ready, Service, ServiceRequest, ServiceResponse, Transform};
use actix_web::{web, Error, HttpMessage, HttpResponse};
use futures::future::{ok, ready, LocalBoxFuture, Ready};
use std::rc::Rc;

use crate::auth::jwt::{validate_token, Claims};

// ── AuthUser extractor ─────────────────────────────────────────────

/// Authenticated user claims, extracted from the JWT token.
/// Use as a handler parameter: `async fn handler(user: AuthUser) -> ...`
#[derive(Debug, Clone)]
pub struct AuthUser {
    pub user_id: String,
    pub role: String,
    pub username: String,
    pub verification_statut: String,
}

impl actix_web::FromRequest for AuthUser {
    type Error = actix_web::Error;
    type Future = Ready<Result<Self, Self::Error>>;

    fn from_request(
        req: &actix_web::HttpRequest,
        _payload: &mut actix_web::dev::Payload,
    ) -> Self::Future {
        match req.extensions().get::<AuthUser>() {
            Some(user) => ready(Ok(user.clone())),
            None => {
                let err = actix_web::error::InternalError::from_response(
                    "Not authenticated",
                    HttpResponse::Unauthorized().json(serde_json::json!({
                        "error": "Not authenticated",
                        "code": "UNAUTHORIZED"
                    })),
                );
                ready(Err(err.into()))
            }
        }
    }
}

impl AuthUser {
    pub fn from_claims(claims: &Claims) -> Self {
        Self {
            user_id: claims.sub.clone(),
            role: claims.role.clone(),
            username: claims.username.clone(),
            verification_statut: claims.verification_statut.clone(),
        }
    }
}

/// Check that the user has one of the required roles.
pub fn require_role(user: &AuthUser, roles: &[&str]) -> Result<(), crate::error::VitaError> {
    if roles.contains(&user.role.as_str()) {
        Ok(())
    } else {
        Err(crate::error::VitaError::Forbidden(format!(
            "Role '{}' not authorized. Required: {:?}",
            user.role, roles
        )))
    }
}

// ── JWT Auth Middleware ─────────────────────────────────────────────

/// JWT secret shared via app_data
#[derive(Clone)]
pub struct JwtSecret(pub String);

pub struct AuthMiddleware;

impl<S, B> Transform<S, ServiceRequest> for AuthMiddleware
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    B: 'static,
{
    type Response = ServiceResponse<EitherBody<B>>;
    type Error = Error;
    type Transform = AuthMiddlewareService<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(AuthMiddlewareService {
            service: Rc::new(service),
        })
    }
}

pub struct AuthMiddlewareService<S> {
    service: Rc<S>,
}

impl<S, B> Service<ServiceRequest> for AuthMiddlewareService<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    B: 'static,
{
    type Response = ServiceResponse<EitherBody<B>>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let service = Rc::clone(&self.service);

        Box::pin(async move {
            // Extract JWT secret from app_data
            let secret = req
                .app_data::<web::Data<JwtSecret>>()
                .map(|s| s.0.clone());

            let secret = match secret {
                Some(s) => s,
                None => {
                    let resp = HttpResponse::InternalServerError().json(serde_json::json!({
                        "error": "JWT secret not configured",
                        "code": "INTERNAL_ERROR"
                    }));
                    return Ok(req.into_response(resp).map_into_right_body());
                }
            };

            // Extract Bearer token from Authorization header
            let auth_header = req
                .headers()
                .get("Authorization")
                .and_then(|v| v.to_str().ok())
                .and_then(|v| v.strip_prefix("Bearer "));

            let token = match auth_header {
                Some(t) => t.to_string(),
                None => {
                    let resp = HttpResponse::Unauthorized().json(serde_json::json!({
                        "error": "Missing or invalid Authorization header",
                        "code": "UNAUTHORIZED"
                    }));
                    return Ok(req.into_response(resp).map_into_right_body());
                }
            };

            // Validate token
            match validate_token(&token, &secret) {
                Ok(claims) => {
                    if claims.token_type != "access" {
                        let resp = HttpResponse::Unauthorized().json(serde_json::json!({
                            "error": "Invalid token type",
                            "code": "UNAUTHORIZED"
                        }));
                        return Ok(req.into_response(resp).map_into_right_body());
                    }
                    let auth_user = AuthUser::from_claims(&claims);
                    req.extensions_mut().insert(auth_user);
                    let res = service.call(req).await?;
                    Ok(res.map_into_left_body())
                }
                Err(_) => {
                    let resp = HttpResponse::Unauthorized().json(serde_json::json!({
                        "error": "Invalid or expired token",
                        "code": "UNAUTHORIZED"
                    }));
                    Ok(req.into_response(resp).map_into_right_body())
                }
            }
        })
    }
}
