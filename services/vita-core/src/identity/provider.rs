// Identity Provider Verification — VITA
//
// Gere la verification d'identite via providers externes
// (FranceConnect, Signicat) en echangeant un code OAuth2/OIDC
// contre un sub, puis en calculant un nullifier_hash HMAC-SHA256.
//
// VITA ne stocke JAMAIS de donnees personnelles.
// Seul le nullifier_hash est persiste en base.

use chrono::{DateTime, Utc};
use hmac::{Hmac, Mac};
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::VitaError;

// ── Types ──────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct VerifyRequest {
    /// Provider utilise (franceconnect, signicat, web_of_trust)
    pub provider: String,
    /// Code d'autorisation OAuth2
    pub code: String,
    /// State anti-CSRF
    pub state: String,
    /// PKCE code_verifier
    pub code_verifier: String,
    /// Methode Signicat optionnelle (ex: nbid, spid)
    pub method_id: Option<String>,
    /// URL de callback utilisee lors de l'authorize
    pub redirect_uri: String,
}

#[derive(Debug, Serialize)]
pub struct VerifyResponse {
    pub verified: bool,
    pub nullifier_hash: String,
    pub account_id: Uuid,
    pub provider: String,
    pub country_code: Option<String>,
    pub assurance_level: String,
    pub verified_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct VerificationStatus {
    pub account_id: Uuid,
    pub verified: bool,
    pub provider: Option<String>,
    pub country_code: Option<String>,
    pub assurance_level: Option<String>,
    pub verified_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct IdentityVerificationRow {
    pub id: Uuid,
    pub vita_account_id: Uuid,
    pub nullifier_hash: String,
    pub provider: String,
    pub country_code: Option<String>,
    pub assurance_level: Option<String>,
    pub verified_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

// ── Provider configuration ─────────────────────────────────────────

struct ProviderConfig {
    token_url: String,
    userinfo_url: String,
    client_id: String,
    client_secret: String,
}

fn get_provider_config(provider: &str) -> Result<ProviderConfig, VitaError> {
    match provider {
        "franceconnect" => {
            let base_url = std::env::var("FC_BASE_URL")
                .unwrap_or_else(|_| "https://app.franceconnect.gouv.fr/api/v2".to_string());
            let client_id = std::env::var("FC_CLIENT_ID")
                .map_err(|_| VitaError::Internal("FC_CLIENT_ID not configured".into()))?;
            let client_secret = std::env::var("FC_CLIENT_SECRET")
                .map_err(|_| VitaError::Internal("FC_CLIENT_SECRET not configured".into()))?;
            Ok(ProviderConfig {
                token_url: format!("{}/token", base_url),
                userinfo_url: format!("{}/userinfo", base_url),
                client_id,
                client_secret,
            })
        }
        "signicat" => {
            let base_url = std::env::var("SIGNICAT_BASE_URL")
                .unwrap_or_else(|_| "https://preprod.signicat.com/oidc".to_string());
            let client_id = std::env::var("SIGNICAT_CLIENT_ID")
                .map_err(|_| VitaError::Internal("SIGNICAT_CLIENT_ID not configured".into()))?;
            let client_secret = std::env::var("SIGNICAT_CLIENT_SECRET")
                .map_err(|_| VitaError::Internal("SIGNICAT_CLIENT_SECRET not configured".into()))?;
            Ok(ProviderConfig {
                token_url: format!("{}/token", base_url),
                userinfo_url: format!("{}/userinfo", base_url),
                client_id,
                client_secret,
            })
        }
        _ => Err(VitaError::BadRequest(format!(
            "Provider non supporte: {}. Utiliser: franceconnect, signicat",
            provider
        ))),
    }
}

// ── Token exchange ─────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
struct TokenResponse {
    access_token: String,
    #[allow(dead_code)]
    id_token: Option<String>,
}

#[derive(Debug, Deserialize)]
struct UserInfoResponse {
    sub: String,
    #[serde(default)]
    signicat_country: Option<String>,
}

/// Construit un client HTTP reqwest avec timeout de 10s.
fn build_http_client() -> Result<reqwest::Client, VitaError> {
    reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|e| VitaError::Internal(format!("HTTP client error: {}", e)))
}

/// Echange un code OAuth2 contre un access_token via le token endpoint.
async fn exchange_code(
    config: &ProviderConfig,
    code: &str,
    redirect_uri: &str,
    code_verifier: &str,
) -> Result<TokenResponse, VitaError> {
    let client = build_http_client()?;

    let mut params = vec![
        ("grant_type", "authorization_code"),
        ("code", code),
        ("redirect_uri", redirect_uri),
        ("client_id", &config.client_id),
        ("client_secret", &config.client_secret),
    ];

    // PKCE code_verifier
    if !code_verifier.is_empty() {
        params.push(("code_verifier", code_verifier));
    }

    let response = client
        .post(&config.token_url)
        .form(&params)
        .send()
        .await
        .map_err(|e| VitaError::ProviderError(format!("Token request failed: {}", e)))?;

    if !response.status().is_success() {
        let status = response.status().as_u16();
        let body = response.text().await.unwrap_or_default();

        if status == 400 && body.contains("expired") {
            return Err(VitaError::ProviderError(
                "Authorization code expired. Please try again.".into(),
            ));
        }

        return Err(VitaError::ProviderError(format!(
            "Token exchange failed ({}): {}",
            status, body
        )));
    }

    response
        .json::<TokenResponse>()
        .await
        .map_err(|e| VitaError::ProviderError(format!("Invalid token response: {}", e)))
}

/// Recupere le sub depuis le userinfo endpoint.
async fn fetch_userinfo(
    config: &ProviderConfig,
    access_token: &str,
) -> Result<UserInfoResponse, VitaError> {
    let client = build_http_client()?;

    let response = client
        .get(&config.userinfo_url)
        .bearer_auth(access_token)
        .send()
        .await
        .map_err(|e| VitaError::ProviderError(format!("UserInfo request failed: {}", e)))?;

    if !response.status().is_success() {
        let status = response.status().as_u16();
        return Err(VitaError::ProviderError(format!(
            "UserInfo request failed ({})",
            status
        )));
    }

    response
        .json::<UserInfoResponse>()
        .await
        .map_err(|e| VitaError::ProviderError(format!("Invalid userinfo response: {}", e)))
}

// ── Nullifier hash ─────────────────────────────────────────────────

type HmacSha256 = Hmac<Sha256>;

/// Calcule le nullifier_hash = HMAC-SHA256(message, APP_SECRET).
///
/// Le message est : "vita-nullifier-v1:{provider}:{sub}"
/// Le secret est la variable d'environnement VITA_NULLIFIER_SECRET.
///
/// Proprietes :
///   - Deterministe : meme (sub, provider) → meme hash
///   - Irreversible : impossible de retrouver le sub
///   - Isole par provider : empeche le cross-service tracking
pub fn compute_nullifier_hash(sub: &str, provider: &str) -> Result<String, VitaError> {
    let secret = std::env::var("VITA_NULLIFIER_SECRET")
        .map_err(|_| VitaError::Internal("VITA_NULLIFIER_SECRET not configured".into()))?;

    if secret.len() < 32 {
        return Err(VitaError::Internal(
            "VITA_NULLIFIER_SECRET must be at least 32 characters".into(),
        ));
    }

    let message = format!("vita-nullifier-v1:{}:{}", provider, sub);

    let mut mac = HmacSha256::new_from_slice(secret.as_bytes())
        .map_err(|e| VitaError::CryptoError(format!("HMAC init failed: {}", e)))?;

    mac.update(message.as_bytes());
    let result = mac.finalize();

    Ok(hex::encode(result.into_bytes()))
}

// ── Main verification flow ─────────────────────────────────────────

/// Execute le flux complet de verification d'identite :
///   1. Echange le code contre un token
///   2. Recupere le sub via userinfo
///   3. Calcule le nullifier_hash HMAC-SHA256
///   4. Verifie l'unicite en base (un humain = un compte)
///   5. Insere la verification et met a jour le statut utilisateur
pub async fn verify_provider(
    pool: &PgPool,
    user_id: Uuid,
    request: &VerifyRequest,
) -> Result<VerifyResponse, VitaError> {
    // ── 1. Configuration du provider ─────────────────────────────
    let config = get_provider_config(&request.provider)?;

    // ── 2. Echange code → token ─────────────────────────────────
    let token = exchange_code(
        &config,
        &request.code,
        &request.redirect_uri,
        &request.code_verifier,
    )
    .await?;

    // ── 3. Recuperation du sub via userinfo ──────────────────────
    let userinfo = fetch_userinfo(&config, &token.access_token).await?;

    if userinfo.sub.is_empty() {
        return Err(VitaError::ProviderError(
            "Missing 'sub' claim in userinfo response".into(),
        ));
    }

    // ── 4. Calcul du nullifier hash ─────────────────────────────
    let nullifier_hash = compute_nullifier_hash(&userinfo.sub, &request.provider)?;

    // ── 5. Verification d'unicite ───────────────────────────────
    let existing: Option<Uuid> = sqlx::query_scalar(
        "SELECT vita_account_id FROM identity_verifications WHERE nullifier_hash = $1",
    )
    .bind(&nullifier_hash)
    .fetch_optional(pool)
    .await?;

    if let Some(existing_account_id) = existing {
        if existing_account_id != user_id {
            return Err(VitaError::DuplicateIdentity);
        }
        // Meme compte — re-verification autorisee
    }

    // ── 6. Determine le country_code ────────────────────────────
    let country_code = match request.provider.as_str() {
        "franceconnect" => Some("FR".to_string()),
        "signicat" => userinfo.signicat_country.clone(),
        _ => None,
    };

    // ── 7. Determine l'assurance level ──────────────────────────
    let assurance_level = match request.provider.as_str() {
        "franceconnect" => "substantial".to_string(),
        "signicat" => "substantial".to_string(),
        _ => "low".to_string(),
    };

    let now = Utc::now();

    // ── 8. Transaction atomique : insert + update ────────────────
    let mut tx = pool.begin().await?;

    // Upsert la verification (ON CONFLICT update si meme compte)
    sqlx::query(
        r#"INSERT INTO identity_verifications
               (vita_account_id, nullifier_hash, provider, country_code, assurance_level, verified_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (nullifier_hash)
           DO UPDATE SET verified_at = EXCLUDED.verified_at,
                         assurance_level = EXCLUDED.assurance_level"#,
    )
    .bind(user_id)
    .bind(&nullifier_hash)
    .bind(&request.provider)
    .bind(&country_code)
    .bind(&assurance_level)
    .bind(now)
    .execute(&mut *tx)
    .await?;

    // Mettre a jour le statut de verification de l'utilisateur
    sqlx::query(
        r#"UPDATE users SET
               verification_statut = 'verifie',
               verification_expiration = $2,
               updated_at = NOW()
           WHERE id = $1"#,
    )
    .bind(user_id)
    .bind(now + chrono::Duration::days(90)) // Proof of life interval
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;

    tracing::info!(
        user_id = %user_id,
        provider = %request.provider,
        "Identity verified via provider"
    );

    Ok(VerifyResponse {
        verified: true,
        nullifier_hash,
        account_id: user_id,
        provider: request.provider.clone(),
        country_code,
        assurance_level,
        verified_at: now,
    })
}

/// Retourne le statut de verification d'un compte.
pub async fn get_verification_status(
    pool: &PgPool,
    account_id: Uuid,
) -> Result<VerificationStatus, VitaError> {
    let row = sqlx::query_as::<_, IdentityVerificationRow>(
        r#"SELECT id, vita_account_id, nullifier_hash, provider,
                  country_code, assurance_level, verified_at, created_at
           FROM identity_verifications
           WHERE vita_account_id = $1
           ORDER BY verified_at DESC NULLS LAST
           LIMIT 1"#,
    )
    .bind(account_id)
    .fetch_optional(pool)
    .await?;

    match row {
        Some(r) => Ok(VerificationStatus {
            account_id,
            verified: true,
            provider: Some(r.provider),
            country_code: r.country_code,
            assurance_level: r.assurance_level,
            verified_at: r.verified_at,
        }),
        None => Ok(VerificationStatus {
            account_id,
            verified: false,
            provider: None,
            country_code: None,
            assurance_level: None,
            verified_at: None,
        }),
    }
}

// ── Tests ──────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_nullifier_hash_is_deterministic() {
        std::env::set_var("VITA_NULLIFIER_SECRET", "a]".repeat(16));

        let h1 = compute_nullifier_hash("sub-123", "franceconnect").unwrap();
        let h2 = compute_nullifier_hash("sub-123", "franceconnect").unwrap();
        assert_eq!(h1, h2);
    }

    #[test]
    fn test_nullifier_hash_is_64_hex_chars() {
        std::env::set_var("VITA_NULLIFIER_SECRET", "b".repeat(32));

        let hash = compute_nullifier_hash("test-sub", "signicat").unwrap();
        assert_eq!(hash.len(), 64);
        assert!(hash.chars().all(|c| c.is_ascii_hexdigit()));
    }

    #[test]
    fn test_different_subs_produce_different_hashes() {
        std::env::set_var("VITA_NULLIFIER_SECRET", "c".repeat(32));

        let h1 = compute_nullifier_hash("user-a", "franceconnect").unwrap();
        let h2 = compute_nullifier_hash("user-b", "franceconnect").unwrap();
        assert_ne!(h1, h2);
    }

    #[test]
    fn test_different_providers_produce_different_hashes() {
        std::env::set_var("VITA_NULLIFIER_SECRET", "d".repeat(32));

        let h1 = compute_nullifier_hash("same-sub", "franceconnect").unwrap();
        let h2 = compute_nullifier_hash("same-sub", "signicat").unwrap();
        assert_ne!(h1, h2);
    }

    #[test]
    fn test_nullifier_hash_no_personal_data() {
        std::env::set_var("VITA_NULLIFIER_SECRET", "e".repeat(32));

        let hash = compute_nullifier_hash("my-secret-sub", "franceconnect").unwrap();
        assert!(!hash.contains("my-secret-sub"));
    }

    #[test]
    fn test_short_secret_rejected() {
        std::env::set_var("VITA_NULLIFIER_SECRET", "short");

        let result = compute_nullifier_hash("sub", "fc");
        assert!(result.is_err());
    }

    #[test]
    fn test_provider_config_franceconnect() {
        std::env::set_var("FC_CLIENT_ID", "test-id");
        std::env::set_var("FC_CLIENT_SECRET", "test-secret");
        std::env::set_var("FC_BASE_URL", "https://fc.test/api/v2");

        let config = get_provider_config("franceconnect").unwrap();
        assert_eq!(config.token_url, "https://fc.test/api/v2/token");
        assert_eq!(config.userinfo_url, "https://fc.test/api/v2/userinfo");
        assert_eq!(config.client_id, "test-id");
    }

    #[test]
    fn test_provider_config_signicat() {
        std::env::set_var("SIGNICAT_CLIENT_ID", "sig-id");
        std::env::set_var("SIGNICAT_CLIENT_SECRET", "sig-secret");
        std::env::set_var("SIGNICAT_BASE_URL", "https://sig.test/oidc");

        let config = get_provider_config("signicat").unwrap();
        assert_eq!(config.token_url, "https://sig.test/oidc/token");
        assert_eq!(config.userinfo_url, "https://sig.test/oidc/userinfo");
    }

    #[test]
    fn test_unknown_provider_rejected() {
        let result = get_provider_config("unknown");
        assert!(result.is_err());
    }
}
