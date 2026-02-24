use actix_web::{web, HttpRequest, HttpResponse};
use chrono::Utc;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sha2::Digest;
use sqlx::PgPool;
use uuid::Uuid;

use crate::audit;
use crate::auth::jwt;
use crate::auth::middleware::{AuthUser, JwtSecret};
use crate::auth::password;
use crate::error::VitaError;
use crate::services::email::EmailService;

// ── Request / Response types ────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub email: String,
    pub password: String,
    pub prenom_legal: String,
    pub nom_legal: String,
    pub date_naissance: String,
    pub nationalite: Option<String>,
    pub pays_residence: Option<String>,
    pub username: String,
    pub mode_visibilite: Option<String>,
    pub pseudonyme: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    /// Legacy field — email only
    pub email: Option<String>,
    /// Preferred field — accepts email or username
    pub username_or_email: Option<String>,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct RefreshRequest {
    pub refresh_token: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProfileRequest {
    pub prenom_affiche: Option<String>,
    pub nom_affiche: Option<String>,
    pub pseudonyme: Option<String>,
    pub bio: Option<String>,
    pub photo_profil: Option<String>,
    pub pays_affiche: Option<String>,
    pub mode_visibilite: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ChangePasswordRequest {
    pub current_password: String,
    pub new_password: String,
}

#[derive(Debug, Deserialize)]
pub struct VerifyEmailRequest {
    pub token: String,
}

#[derive(Debug, Deserialize)]
pub struct ResendVerificationRequest {
    pub email: String,
}

#[derive(Debug, Deserialize)]
pub struct ForgotPasswordRequest {
    pub email: String,
}

#[derive(Debug, Deserialize)]
pub struct ResetPasswordRequest {
    pub token: String,
    pub password: String,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
struct UserRow {
    id: Uuid,
    email: String,
    username: String,
    role: String,
    verification_statut: String,
    mode_visibilite: String,
    prenom_affiche: Option<String>,
    nom_affiche: Option<String>,
    pseudonyme: Option<String>,
    bio: Option<String>,
    photo_profil: Option<String>,
    pays_affiche: Option<String>,
    date_inscription: chrono::DateTime<Utc>,
    derniere_connexion: Option<chrono::DateTime<Utc>>,
    password_hash: String,
    niveau_confiance: i32,
    verification_date: Option<chrono::DateTime<Utc>>,
    verification_expiration: Option<chrono::DateTime<Utc>>,
}

#[derive(Debug, Serialize)]
struct AuthResponse {
    user: UserPublic,
    access_token: String,
    refresh_token: String,
    expires_in: u64,
}

#[derive(Debug, Serialize)]
struct UserPublic {
    id: Uuid,
    username: String,
    email: String,
    role: String,
    verification_statut: String,
    mode_visibilite: String,
    prenom_affiche: Option<String>,
    nom_affiche: Option<String>,
    date_inscription: String,
}

#[derive(Debug, Serialize)]
struct MeResponse {
    id: Uuid,
    username: String,
    email: String,
    role: String,
    identite_publique: IdentitePubliqueResponse,
    verification: VerificationResponse,
    wallet: Option<WalletResponse>,
    date_inscription: String,
    derniere_connexion: Option<String>,
}

#[derive(Debug, Serialize)]
struct IdentitePubliqueResponse {
    mode_visibilite: String,
    prenom_affiche: Option<String>,
    nom_affiche: Option<String>,
    pseudonyme: Option<String>,
    bio: Option<String>,
    photo_profil: Option<String>,
    pays_affiche: Option<String>,
}

#[derive(Debug, Serialize)]
struct VerificationResponse {
    statut: String,
    date: Option<String>,
    expiration: Option<String>,
    niveau_confiance: i32,
}

#[derive(Debug, Serialize)]
struct WalletResponse {
    id: Uuid,
    balance: Decimal,
    total_received: Decimal,
}

#[derive(Debug, sqlx::FromRow)]
struct WalletRow {
    id: Uuid,
    balance: Decimal,
    total_received: Decimal,
}

// ── Config ──────────────────────────────────────────────────────────

fn jwt_expiry_access() -> u64 {
    std::env::var("JWT_ACCESS_EXPIRY")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(3600)
}

fn jwt_expiry_refresh() -> u64 {
    std::env::var("JWT_REFRESH_EXPIRY")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(604800)
}

// ── Validation helpers ──────────────────────────────────────────────

fn validate_email(email: &str) -> Result<(), VitaError> {
    if email.contains('@') && email.contains('.') && email.len() >= 5 {
        Ok(())
    } else {
        Err(VitaError::BadRequest("Email invalide".into()))
    }
}

fn validate_password(pwd: &str) -> Result<(), VitaError> {
    if pwd.len() >= 8 {
        Ok(())
    } else {
        Err(VitaError::BadRequest(
            "Le mot de passe doit contenir au moins 8 caracteres".into(),
        ))
    }
}

fn validate_username(username: &str) -> Result<(), VitaError> {
    let re = regex::Regex::new(r"^[a-zA-Z0-9_]{3,30}$").unwrap();
    if re.is_match(username) {
        Ok(())
    } else {
        Err(VitaError::BadRequest(
            "Username invalide (3-30 caracteres, alphanumerique + underscore)".into(),
        ))
    }
}

// ── Handlers ────────────────────────────────────────────────────────

/// POST /api/v1/auth/register
pub async fn register(
    pool: web::Data<PgPool>,
    _jwt_secret: web::Data<JwtSecret>,
    email_service: web::Data<EmailService>,
    body: web::Json<RegisterRequest>,
) -> Result<HttpResponse, VitaError> {
    // Validate input
    validate_email(&body.email)?;
    validate_password(&body.password)?;
    validate_username(&body.username)?;

    let mode = body.mode_visibilite.as_deref().unwrap_or("complet");
    if mode == "pseudonyme" && body.pseudonyme.is_none() {
        return Err(VitaError::BadRequest(
            "Pseudonyme requis pour le mode pseudonyme".into(),
        ));
    }

    // Parse date
    let date_naissance = chrono::NaiveDate::parse_from_str(&body.date_naissance, "%Y-%m-%d")
        .map_err(|_| VitaError::BadRequest("Date de naissance invalide (format YYYY-MM-DD)".into()))?;

    // Hash password
    let pwd_hash = password::hash_password(&body.password)?;

    // Determine displayed names
    let prenom_affiche = if mode == "complet" {
        Some(body.prenom_legal.clone())
    } else {
        None
    };
    let nom_affiche = if mode == "complet" {
        Some(body.nom_legal.clone())
    } else {
        None
    };
    let pays_affiche = if mode == "complet" {
        body.pays_residence.clone()
    } else {
        None
    };

    // Insert user (email_verified = false by default)
    let user = sqlx::query_as::<_, UserRow>(
        r#"INSERT INTO users (
            email, password_hash, prenom_legal, nom_legal, date_naissance,
            nationalite, pays_residence, username, mode_visibilite,
            prenom_affiche, nom_affiche, pseudonyme, pays_affiche,
            role, verification_statut, niveau_confiance
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'nouveau', 'non_verifie', 0)
        RETURNING id, email, username, role, verification_statut, mode_visibilite,
                  prenom_affiche, nom_affiche, pseudonyme, bio, photo_profil,
                  pays_affiche, date_inscription, derniere_connexion, password_hash,
                  niveau_confiance, verification_date, verification_expiration"#,
    )
    .bind(&body.email)
    .bind(&pwd_hash)
    .bind(&body.prenom_legal)
    .bind(&body.nom_legal)
    .bind(date_naissance)
    .bind(&body.nationalite)
    .bind(&body.pays_residence)
    .bind(&body.username)
    .bind(mode)
    .bind(&prenom_affiche)
    .bind(&nom_affiche)
    .bind(&body.pseudonyme)
    .bind(&pays_affiche)
    .fetch_one(pool.get_ref())
    .await
    .map_err(|e| match e {
        sqlx::Error::Database(ref db_err) if db_err.constraint().is_some() => {
            VitaError::BadRequest("Email ou username deja utilise".into())
        }
        _ => VitaError::Database(e),
    })?;

    // Generate Ed25519 keypair for the new user
    let keypair = crate::crypto::keys::generate_keypair();
    let pubkey_bytes = keypair.verifying_key.as_bytes().to_vec();
    let seed = keypair.signing_key.to_bytes();
    let encrypted_key = crate::crypto::keys::encrypt_private_key(&seed, &body.password);

    // Store encrypted private key on the user record
    sqlx::query("UPDATE users SET encrypted_private_key = $1 WHERE id = $2")
        .bind(&encrypted_key)
        .bind(user.id)
        .execute(pool.get_ref())
        .await?;

    // Create associated wallet/account with the real public key
    sqlx::query(
        r#"INSERT INTO accounts (public_key, display_name, user_id, verified)
           VALUES ($1, $2, $3, false)"#,
    )
    .bind(&pubkey_bytes)
    .bind(Some(&body.username))
    .bind(user.id)
    .execute(pool.get_ref())
    .await?;

    // Generate email verification token
    let token = hex::encode(rand::random::<[u8; 32]>());
    let expires_at = Utc::now() + chrono::Duration::hours(24);

    sqlx::query(
        r#"INSERT INTO email_verification_tokens (user_id, token, expires_at)
           VALUES ($1, $2, $3)"#,
    )
    .bind(user.id)
    .bind(&token)
    .bind(expires_at)
    .execute(pool.get_ref())
    .await?;

    // Send verification email (fire-and-forget — don't fail register if email fails)
    let _ = email_service
        .send_verification_email(&user.email, &token, &user.username)
        .await;

    // Audit
    audit::audit(
        pool.get_ref().clone(),
        None,
        "user.register",
        "auth",
        "info",
        &format!("Inscription de @{}", &user.username),
        None,
        Some(("user", user.id)),
    );

    Ok(HttpResponse::Created().json(serde_json::json!({
        "message": "verification_email_sent",
        "email": user.email,
        "user_id": user.id.to_string()
    })))
}

/// POST /api/v1/auth/login
pub async fn login(
    pool: web::Data<PgPool>,
    jwt_secret: web::Data<JwtSecret>,
    body: web::Json<LoginRequest>,
) -> Result<HttpResponse, VitaError> {
    // Resolve identifier: prefer username_or_email, fallback to email
    let identifier = body.username_or_email.as_deref()
        .or(body.email.as_deref())
        .ok_or_else(|| VitaError::BadRequest("Email ou nom d'utilisateur requis".into()))?;

    // Find user by email OR username
    let user = sqlx::query_as::<_, UserRow>(
        r#"SELECT id, email, username, role, verification_statut, mode_visibilite,
                  prenom_affiche, nom_affiche, pseudonyme, bio, photo_profil,
                  pays_affiche, date_inscription, derniere_connexion, password_hash,
                  niveau_confiance, verification_date, verification_expiration
           FROM users WHERE (email = $1 OR username = $1) AND actif = true"#,
    )
    .bind(identifier)
    .fetch_optional(pool.get_ref())
    .await?
    .ok_or_else(|| VitaError::Unauthorized("Email ou mot de passe incorrect".into()))?;

    // Verify password
    if !password::verify_password(&body.password, &user.password_hash)? {
        audit::audit(
            pool.get_ref().clone(),
            None,
            "user.login_failed",
            "auth",
            "warning",
            &format!("Tentative de connexion echouee pour {}", identifier),
            Some(serde_json::json!({ "identifier": identifier })),
            Some(("user", user.id)),
        );
        return Err(VitaError::Unauthorized(
            "Email ou mot de passe incorrect".into(),
        ));
    }

    // Check email verified
    let email_verified: bool = sqlx::query_scalar(
        "SELECT email_verified FROM users WHERE id = $1",
    )
    .bind(user.id)
    .fetch_one(pool.get_ref())
    .await?;

    if !email_verified {
        return Ok(HttpResponse::Forbidden().json(serde_json::json!({
            "error": "email_not_verified",
            "email": user.email,
            "message": "Veuillez confirmer votre email avant de vous connecter"
        })));
    }

    // Check suspension
    if user.role == "suspendu" {
        return Err(VitaError::Forbidden("Compte suspendu".into()));
    }

    // Update last login
    sqlx::query("UPDATE users SET derniere_connexion = NOW() WHERE id = $1")
        .bind(user.id)
        .execute(pool.get_ref())
        .await?;

    // Generate tokens
    let access_expiry = jwt_expiry_access();
    let refresh_expiry = jwt_expiry_refresh();
    let user_id_str = user.id.to_string();

    let access_token = jwt::generate_access_token(
        &user_id_str,
        &user.role,
        &user.username,
        &user.verification_statut,
        &jwt_secret.0,
        access_expiry,
    )?;
    let refresh_token = jwt::generate_refresh_token(
        &user_id_str,
        &user.role,
        &user.username,
        &user.verification_statut,
        &jwt_secret.0,
        refresh_expiry,
    )?;

    // Store session
    let token_hash = format!("{:x}", sha2::Digest::finalize(sha2::Sha256::new_with_prefix(access_token.as_bytes())));
    let refresh_hash = format!("{:x}", sha2::Digest::finalize(sha2::Sha256::new_with_prefix(refresh_token.as_bytes())));
    let expires_at = Utc::now() + chrono::Duration::seconds(access_expiry as i64);

    sqlx::query(
        r#"INSERT INTO sessions (user_id, token_hash, refresh_token_hash, expires_at)
           VALUES ($1, $2, $3, $4)"#,
    )
    .bind(user.id)
    .bind(&token_hash)
    .bind(&refresh_hash)
    .bind(expires_at)
    .execute(pool.get_ref())
    .await?;

    // Audit
    audit::audit(
        pool.get_ref().clone(),
        None,
        "user.login",
        "auth",
        "info",
        &format!("Connexion de @{}", &user.username),
        None,
        Some(("user", user.id)),
    );

    Ok(HttpResponse::Ok().json(AuthResponse {
        user: UserPublic {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            verification_statut: user.verification_statut,
            mode_visibilite: user.mode_visibilite,
            prenom_affiche: user.prenom_affiche,
            nom_affiche: user.nom_affiche,
            date_inscription: user.date_inscription.to_rfc3339(),
        },
        access_token,
        refresh_token,
        expires_in: access_expiry,
    }))
}

/// POST /api/v1/auth/refresh
pub async fn refresh(
    pool: web::Data<PgPool>,
    jwt_secret: web::Data<JwtSecret>,
    body: web::Json<RefreshRequest>,
) -> Result<HttpResponse, VitaError> {
    // Validate the refresh token
    let claims = jwt::validate_token(&body.refresh_token, &jwt_secret.0)?;

    if claims.token_type != "refresh" {
        return Err(VitaError::Unauthorized("Invalid token type".into()));
    }

    // Check session not revoked
    let refresh_hash = format!("{:x}", sha2::Digest::finalize(sha2::Sha256::new_with_prefix(body.refresh_token.as_bytes())));
    let session_exists = sqlx::query_scalar::<_, bool>(
        "SELECT EXISTS(SELECT 1 FROM sessions WHERE refresh_token_hash = $1 AND revoked = false)",
    )
    .bind(&refresh_hash)
    .fetch_one(pool.get_ref())
    .await?;

    if !session_exists {
        return Err(VitaError::Unauthorized("Session revoked or not found".into()));
    }

    // Generate new access token
    let access_expiry = jwt_expiry_access();
    let access_token = jwt::generate_access_token(
        &claims.sub,
        &claims.role,
        &claims.username,
        &claims.verification_statut,
        &jwt_secret.0,
        access_expiry,
    )?;

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "access_token": access_token,
        "expires_in": access_expiry
    })))
}

/// POST /api/v1/auth/logout (protected)
pub async fn logout(
    pool: web::Data<PgPool>,
    user: AuthUser,
    req: HttpRequest,
) -> Result<HttpResponse, VitaError> {
    // Get the current token
    let token = req
        .headers()
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .ok_or_else(|| VitaError::Unauthorized("Missing token".into()))?;

    let token_hash = format!("{:x}", sha2::Digest::finalize(sha2::Sha256::new_with_prefix(token.as_bytes())));

    // Revoke the session
    sqlx::query("UPDATE sessions SET revoked = true WHERE token_hash = $1 AND user_id = $2")
        .bind(&token_hash)
        .bind(uuid::Uuid::parse_str(&user.user_id).unwrap_or_default())
        .execute(pool.get_ref())
        .await?;

    // Audit
    audit::audit(
        pool.get_ref().clone(),
        Some(&user),
        "user.logout",
        "auth",
        "info",
        &format!("Deconnexion de @{}", &user.username),
        None,
        None,
    );

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "message": "Deconnexion reussie"
    })))
}

/// GET /api/v1/auth/me (protected)
pub async fn get_me(
    pool: web::Data<PgPool>,
    user: AuthUser,
) -> Result<HttpResponse, VitaError> {
    let user_id = uuid::Uuid::parse_str(&user.user_id)
        .map_err(|_| VitaError::Internal("Invalid user ID in token".into()))?;

    let row = sqlx::query_as::<_, UserRow>(
        r#"SELECT id, email, username, role, verification_statut, mode_visibilite,
                  prenom_affiche, nom_affiche, pseudonyme, bio, photo_profil,
                  pays_affiche, date_inscription, derniere_connexion, password_hash,
                  niveau_confiance, verification_date, verification_expiration
           FROM users WHERE id = $1"#,
    )
    .bind(user_id)
    .fetch_optional(pool.get_ref())
    .await?
    .ok_or_else(|| VitaError::NotFound("User not found".into()))?;

    // Get wallet
    let wallet = sqlx::query_as::<_, WalletRow>(
        "SELECT id, balance, total_received FROM accounts WHERE user_id = $1",
    )
    .bind(user_id)
    .fetch_optional(pool.get_ref())
    .await?;

    Ok(HttpResponse::Ok().json(MeResponse {
        id: row.id,
        username: row.username,
        email: row.email,
        role: row.role,
        identite_publique: IdentitePubliqueResponse {
            mode_visibilite: row.mode_visibilite,
            prenom_affiche: row.prenom_affiche,
            nom_affiche: row.nom_affiche,
            pseudonyme: row.pseudonyme,
            bio: row.bio,
            photo_profil: row.photo_profil,
            pays_affiche: row.pays_affiche,
        },
        verification: VerificationResponse {
            statut: row.verification_statut,
            date: row.verification_date.map(|d| d.to_rfc3339()),
            expiration: row.verification_expiration.map(|d| d.to_rfc3339()),
            niveau_confiance: row.niveau_confiance,
        },
        wallet: wallet.map(|w| WalletResponse {
            id: w.id,
            balance: w.balance,
            total_received: w.total_received,
        }),
        date_inscription: row.date_inscription.to_rfc3339(),
        derniere_connexion: row.derniere_connexion.map(|d| d.to_rfc3339()),
    }))
}

/// PUT /api/v1/auth/me (protected)
pub async fn update_me(
    pool: web::Data<PgPool>,
    user: AuthUser,
    body: web::Json<UpdateProfileRequest>,
) -> Result<HttpResponse, VitaError> {
    let user_id = uuid::Uuid::parse_str(&user.user_id)
        .map_err(|_| VitaError::Internal("Invalid user ID in token".into()))?;

    // Validate mode_visibilite if changing
    if let Some(ref mode) = body.mode_visibilite {
        if mode == "pseudonyme" && body.pseudonyme.is_none() {
            // Check if user already has a pseudonyme
            let existing: Option<String> = sqlx::query_scalar(
                "SELECT pseudonyme FROM users WHERE id = $1",
            )
            .bind(user_id)
            .fetch_one(pool.get_ref())
            .await?;

            if existing.is_none() {
                return Err(VitaError::BadRequest(
                    "Pseudonyme requis pour le mode pseudonyme".into(),
                ));
            }
        }
    }

    // Validate bio length
    if let Some(ref bio) = body.bio {
        if bio.len() > 300 {
            return Err(VitaError::BadRequest(
                "Bio trop longue (max 300 caracteres)".into(),
            ));
        }
    }

    // Build dynamic update
    sqlx::query(
        r#"UPDATE users SET
            prenom_affiche = COALESCE($2, prenom_affiche),
            nom_affiche = COALESCE($3, nom_affiche),
            pseudonyme = COALESCE($4, pseudonyme),
            bio = COALESCE($5, bio),
            photo_profil = COALESCE($6, photo_profil),
            pays_affiche = COALESCE($7, pays_affiche),
            mode_visibilite = COALESCE($8, mode_visibilite),
            updated_at = NOW()
        WHERE id = $1"#,
    )
    .bind(user_id)
    .bind(&body.prenom_affiche)
    .bind(&body.nom_affiche)
    .bind(&body.pseudonyme)
    .bind(&body.bio)
    .bind(&body.photo_profil)
    .bind(&body.pays_affiche)
    .bind(&body.mode_visibilite)
    .execute(pool.get_ref())
    .await?;

    // Audit
    let mut champs_modifies = Vec::new();
    if body.prenom_affiche.is_some() { champs_modifies.push("prenom_affiche"); }
    if body.nom_affiche.is_some() { champs_modifies.push("nom_affiche"); }
    if body.pseudonyme.is_some() { champs_modifies.push("pseudonyme"); }
    if body.bio.is_some() { champs_modifies.push("bio"); }
    if body.photo_profil.is_some() { champs_modifies.push("photo_profil"); }
    if body.pays_affiche.is_some() { champs_modifies.push("pays_affiche"); }
    if body.mode_visibilite.is_some() { champs_modifies.push("mode_visibilite"); }

    audit::audit(
        pool.get_ref().clone(),
        Some(&user),
        "user.profile_update",
        "auth",
        "info",
        &format!("Modification du profil de @{}", &user.username),
        Some(serde_json::json!({ "champs_modifies": champs_modifies })),
        Some(("user", user_id)),
    );

    // Return updated profile
    get_me(pool, user).await
}

/// PUT /api/v1/auth/me/password (protected)
pub async fn change_password(
    pool: web::Data<PgPool>,
    user: AuthUser,
    body: web::Json<ChangePasswordRequest>,
) -> Result<HttpResponse, VitaError> {
    let user_id = uuid::Uuid::parse_str(&user.user_id)
        .map_err(|_| VitaError::Internal("Invalid user ID in token".into()))?;

    validate_password(&body.new_password)?;

    // Verify current password
    let current_hash: String = sqlx::query_scalar("SELECT password_hash FROM users WHERE id = $1")
        .bind(user_id)
        .fetch_one(pool.get_ref())
        .await?;

    if !password::verify_password(&body.current_password, &current_hash)? {
        return Err(VitaError::Unauthorized(
            "Mot de passe actuel incorrect".into(),
        ));
    }

    // Update password
    let new_hash = password::hash_password(&body.new_password)?;
    sqlx::query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2")
        .bind(&new_hash)
        .bind(user_id)
        .execute(pool.get_ref())
        .await?;

    // Revoke all other sessions
    sqlx::query("UPDATE sessions SET revoked = true WHERE user_id = $1")
        .bind(user_id)
        .execute(pool.get_ref())
        .await?;

    // Audit
    audit::audit(
        pool.get_ref().clone(),
        Some(&user),
        "user.password_change",
        "auth",
        "info",
        &format!("Changement de mot de passe de @{}", &user.username),
        None,
        Some(("user", user_id)),
    );

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "message": "Mot de passe mis a jour. Toutes les sessions ont ete revoquees."
    })))
}

/// POST /api/v1/auth/verify-email (public)
pub async fn verify_email(
    pool: web::Data<PgPool>,
    jwt_secret: web::Data<JwtSecret>,
    body: web::Json<VerifyEmailRequest>,
) -> Result<HttpResponse, VitaError> {
    // Look up token
    #[derive(sqlx::FromRow)]
    struct TokenRow {
        id: Uuid,
        user_id: Uuid,
        used: bool,
        expires_at: chrono::DateTime<Utc>,
    }

    let token_row = sqlx::query_as::<_, TokenRow>(
        r#"SELECT id, user_id, used, expires_at
           FROM email_verification_tokens
           WHERE token = $1"#,
    )
    .bind(&body.token)
    .fetch_optional(pool.get_ref())
    .await?
    .ok_or_else(|| VitaError::BadRequest("invalid_token".into()))?;

    if token_row.used {
        return Err(VitaError::BadRequest("invalid_token".into()));
    }

    if token_row.expires_at < Utc::now() {
        return Err(VitaError::BadRequest("token_expired".into()));
    }

    // Mark email as verified
    sqlx::query("UPDATE users SET email_verified = TRUE WHERE id = $1")
        .bind(token_row.user_id)
        .execute(pool.get_ref())
        .await?;

    // Mark token as used
    sqlx::query("UPDATE email_verification_tokens SET used = TRUE WHERE id = $1")
        .bind(token_row.id)
        .execute(pool.get_ref())
        .await?;

    // Fetch user to generate tokens
    let user = sqlx::query_as::<_, UserRow>(
        r#"SELECT id, email, username, role, verification_statut, mode_visibilite,
                  prenom_affiche, nom_affiche, pseudonyme, bio, photo_profil,
                  pays_affiche, date_inscription, derniere_connexion, password_hash,
                  niveau_confiance, verification_date, verification_expiration
           FROM users WHERE id = $1"#,
    )
    .bind(token_row.user_id)
    .fetch_one(pool.get_ref())
    .await?;

    // Generate tokens (same logic as login)
    let access_expiry = jwt_expiry_access();
    let refresh_expiry = jwt_expiry_refresh();
    let user_id_str = user.id.to_string();

    let access_token = jwt::generate_access_token(
        &user_id_str,
        &user.role,
        &user.username,
        &user.verification_statut,
        &jwt_secret.0,
        access_expiry,
    )?;
    let refresh_token = jwt::generate_refresh_token(
        &user_id_str,
        &user.role,
        &user.username,
        &user.verification_statut,
        &jwt_secret.0,
        refresh_expiry,
    )?;

    // Store session
    let token_hash = format!("{:x}", sha2::Digest::finalize(sha2::Sha256::new_with_prefix(access_token.as_bytes())));
    let refresh_hash = format!("{:x}", sha2::Digest::finalize(sha2::Sha256::new_with_prefix(refresh_token.as_bytes())));
    let expires_at = Utc::now() + chrono::Duration::seconds(access_expiry as i64);

    sqlx::query(
        r#"INSERT INTO sessions (user_id, token_hash, refresh_token_hash, expires_at)
           VALUES ($1, $2, $3, $4)"#,
    )
    .bind(user.id)
    .bind(&token_hash)
    .bind(&refresh_hash)
    .bind(expires_at)
    .execute(pool.get_ref())
    .await?;

    // Audit
    audit::audit(
        pool.get_ref().clone(),
        None,
        "user.email_verified",
        "auth",
        "info",
        &format!("Email verifie pour @{}", &user.username),
        None,
        Some(("user", user.id)),
    );

    Ok(HttpResponse::Ok().json(AuthResponse {
        user: UserPublic {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            verification_statut: user.verification_statut,
            mode_visibilite: user.mode_visibilite,
            prenom_affiche: user.prenom_affiche,
            nom_affiche: user.nom_affiche,
            date_inscription: user.date_inscription.to_rfc3339(),
        },
        access_token,
        refresh_token,
        expires_in: access_expiry,
    }))
}

/// POST /api/v1/auth/resend-verification (public)
pub async fn resend_verification(
    pool: web::Data<PgPool>,
    email_service: web::Data<EmailService>,
    body: web::Json<ResendVerificationRequest>,
) -> Result<HttpResponse, VitaError> {
    // Find user by email (non-verified, active) — always return 200 to avoid info leak
    let user_opt = sqlx::query_as::<_, UserRow>(
        r#"SELECT id, email, username, role, verification_statut, mode_visibilite,
                  prenom_affiche, nom_affiche, pseudonyme, bio, photo_profil,
                  pays_affiche, date_inscription, derniere_connexion, password_hash,
                  niveau_confiance, verification_date, verification_expiration
           FROM users
           WHERE email = $1 AND email_verified = FALSE AND actif = TRUE"#,
    )
    .bind(&body.email)
    .fetch_optional(pool.get_ref())
    .await?;

    if let Some(user) = user_opt {
        // Invalidate old tokens
        sqlx::query(
            "UPDATE email_verification_tokens SET used = TRUE WHERE user_id = $1 AND used = FALSE",
        )
        .bind(user.id)
        .execute(pool.get_ref())
        .await?;

        // Generate new token
        let token = hex::encode(rand::random::<[u8; 32]>());
        let expires_at = Utc::now() + chrono::Duration::hours(24);

        sqlx::query(
            r#"INSERT INTO email_verification_tokens (user_id, token, expires_at)
               VALUES ($1, $2, $3)"#,
        )
        .bind(user.id)
        .bind(&token)
        .bind(expires_at)
        .execute(pool.get_ref())
        .await?;

        // Send email
        let _ = email_service
            .send_verification_email(&user.email, &token, &user.username)
            .await;
    }

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "message": "Si cette adresse est associee a un compte non verifie, un email a ete envoye."
    })))
}

/// POST /api/v1/auth/forgot-password (public)
pub async fn forgot_password(
    pool: web::Data<PgPool>,
    email_service: web::Data<EmailService>,
    body: web::Json<ForgotPasswordRequest>,
) -> Result<HttpResponse, VitaError> {
    validate_email(&body.email)?;

    // Always return 200 even if email doesn't exist (prevent email enumeration)
    let user_opt = sqlx::query_as::<_, UserRow>(
        r#"SELECT id, email, username, role, verification_statut, mode_visibilite,
                  prenom_affiche, nom_affiche, pseudonyme, bio, photo_profil,
                  pays_affiche, date_inscription, derniere_connexion, password_hash,
                  niveau_confiance, verification_date, verification_expiration
           FROM users
           WHERE email = $1 AND email_verified = TRUE AND actif = TRUE"#,
    )
    .bind(&body.email)
    .fetch_optional(pool.get_ref())
    .await?;

    if let Some(user) = user_opt {
        // Invalidate any existing unused reset tokens for this user
        sqlx::query(
            "UPDATE password_reset_tokens SET used = TRUE WHERE user_id = $1 AND used = FALSE",
        )
        .bind(user.id)
        .execute(pool.get_ref())
        .await?;

        // Generate new reset token
        let token = hex::encode(rand::random::<[u8; 32]>());
        let expires_at = Utc::now() + chrono::Duration::hours(1);

        sqlx::query(
            r#"INSERT INTO password_reset_tokens (user_id, token, expires_at)
               VALUES ($1, $2, $3)"#,
        )
        .bind(user.id)
        .bind(&token)
        .bind(expires_at)
        .execute(pool.get_ref())
        .await?;

        // Send reset email (fire-and-forget)
        let _ = email_service
            .send_password_reset_email(&user.email, &token, &user.username)
            .await;

        // Audit
        audit::audit(
            pool.get_ref().clone(),
            None,
            "user.password_reset_requested",
            "auth",
            "info",
            &format!("Demande de reinitialisation de mot de passe pour @{}", &user.username),
            None,
            Some(("user", user.id)),
        );
    }

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "message": "Si cet email est associe a un compte, un lien de reinitialisation a ete envoye."
    })))
}

/// POST /api/v1/auth/reset-password (public)
pub async fn reset_password(
    pool: web::Data<PgPool>,
    body: web::Json<ResetPasswordRequest>,
) -> Result<HttpResponse, VitaError> {
    validate_password(&body.password)?;

    // Look up the token
    #[derive(sqlx::FromRow)]
    struct ResetTokenRow {
        id: Uuid,
        user_id: Uuid,
        used: bool,
        expires_at: chrono::DateTime<Utc>,
    }

    let token_row = sqlx::query_as::<_, ResetTokenRow>(
        r#"SELECT id, user_id, used, expires_at
           FROM password_reset_tokens
           WHERE token = $1"#,
    )
    .bind(&body.token)
    .fetch_optional(pool.get_ref())
    .await?
    .ok_or_else(|| VitaError::BadRequest("Lien invalide ou expire".into()))?;

    if token_row.used {
        return Err(VitaError::BadRequest("Ce lien a deja ete utilise".into()));
    }

    if token_row.expires_at < Utc::now() {
        return Err(VitaError::BadRequest(
            "Ce lien a expire (validite 1 heure). Veuillez recommencer.".into(),
        ));
    }

    // Hash the new password
    let new_hash = password::hash_password(&body.password)?;

    // Update the user's password
    sqlx::query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2")
        .bind(&new_hash)
        .bind(token_row.user_id)
        .execute(pool.get_ref())
        .await?;

    // Mark the token as used
    sqlx::query("UPDATE password_reset_tokens SET used = TRUE WHERE id = $1")
        .bind(token_row.id)
        .execute(pool.get_ref())
        .await?;

    // Revoke all existing sessions (security: force re-login)
    sqlx::query("UPDATE sessions SET revoked = true WHERE user_id = $1")
        .bind(token_row.user_id)
        .execute(pool.get_ref())
        .await?;

    // Audit
    audit::audit(
        pool.get_ref().clone(),
        None,
        "user.password_reset_completed",
        "auth",
        "info",
        "Mot de passe reinitialise avec succes",
        None,
        Some(("user", token_row.user_id)),
    );

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "message": "Mot de passe modifie avec succes."
    })))
}
