use lettre::message::header::ContentType;
use lettre::transport::smtp::authentication::Credentials;
use lettre::{AsyncSmtpTransport, AsyncTransport, Message, Tokio1Executor};
use tracing::{info, warn};

/// Email service — sends verification emails via SMTP.
/// Falls back to "log only" mode when SMTP env vars are missing.
pub struct EmailService {
    transport: Option<AsyncSmtpTransport<Tokio1Executor>>,
    from: String,
    app_url: String,
}

impl EmailService {
    /// Create a new EmailService. If SMTP env vars are missing, operates in log-only mode.
    pub fn new() -> Self {
        let app_url = std::env::var("APP_URL").unwrap_or_else(|_| "http://localhost:3000".into());
        let from = std::env::var("SMTP_FROM").unwrap_or_else(|_| "noreply@vita.world".into());

        let transport = match (
            std::env::var("SMTP_HOST"),
            std::env::var("SMTP_PORT"),
            std::env::var("SMTP_USERNAME"),
            std::env::var("SMTP_PASSWORD"),
        ) {
            (Ok(host), Ok(port), Ok(username), Ok(password))
                if !host.is_empty() && !username.is_empty() && !password.is_empty() =>
            {
                let port: u16 = port.parse().unwrap_or(587);
                let creds = Credentials::new(username, password);

                match AsyncSmtpTransport::<Tokio1Executor>::starttls_relay(&host) {
                    Ok(builder) => {
                        let t = builder.port(port).credentials(creds).build();
                        info!("EmailService: SMTP transport configured ({}:{})", host, port);
                        Some(t)
                    }
                    Err(e) => {
                        warn!("EmailService: failed to build SMTP transport: {} — falling back to log-only mode", e);
                        None
                    }
                }
            }
            _ => {
                warn!("EmailService: SMTP env vars missing — running in log-only mode");
                None
            }
        };

        Self {
            transport,
            from,
            app_url,
        }
    }

    /// Send a verification email. In log-only mode, prints the verification link.
    pub async fn send_verification_email(
        &self,
        to: &str,
        token: &str,
        username: &str,
    ) -> Result<(), String> {
        let verify_url = format!("{}/auth/verify-email?token={}", self.app_url, token);

        let html_body = format!(
            r#"<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f;padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background-color:#111118;border-radius:16px;border:1px solid rgba(255,255,255,0.1);padding:40px;">
        <tr><td align="center" style="padding-bottom:24px;">
          <div style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#ec4899);border-radius:12px;width:48px;height:48px;line-height:48px;text-align:center;font-size:24px;font-weight:bold;color:white;">&#1142;</div>
          <div style="margin-top:8px;font-size:24px;font-weight:bold;background:linear-gradient(135deg,#8b5cf6,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">VITA</div>
        </td></tr>
        <tr><td align="center" style="padding-bottom:16px;">
          <h1 style="margin:0;font-size:20px;color:#ffffff;">Confirmez votre adresse email</h1>
        </td></tr>
        <tr><td style="padding-bottom:24px;color:rgba(255,255,255,0.7);font-size:14px;line-height:1.6;text-align:center;">
          Bonjour <strong style="color:#ffffff;">@{username}</strong>,<br><br>
          Cliquez sur le bouton ci-dessous pour activer votre compte VITA.
        </td></tr>
        <tr><td align="center" style="padding-bottom:24px;">
          <a href="{verify_url}" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#a855f7);color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600;">
            Verifier mon email
          </a>
        </td></tr>
        <tr><td style="padding-bottom:16px;color:rgba(255,255,255,0.5);font-size:12px;text-align:center;">
          Ou copiez ce lien dans votre navigateur :<br>
          <a href="{verify_url}" style="color:#8b5cf6;word-break:break-all;">{verify_url}</a>
        </td></tr>
        <tr><td style="border-top:1px solid rgba(255,255,255,0.1);padding-top:16px;color:rgba(255,255,255,0.4);font-size:11px;text-align:center;">
          Ce lien expire dans 24 heures.<br>
          Si vous n'avez pas cree de compte VITA, ignorez cet email.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"#,
            username = username,
            verify_url = verify_url,
        );

        match &self.transport {
            Some(transport) => {
                let email = Message::builder()
                    .from(
                        self.from
                            .parse()
                            .map_err(|e| format!("Invalid from address: {}", e))?,
                    )
                    .to(to.parse().map_err(|e| format!("Invalid to address: {}", e))?)
                    .subject("VITA — Confirmez votre adresse email")
                    .header(ContentType::TEXT_HTML)
                    .body(html_body)
                    .map_err(|e| format!("Failed to build email: {}", e))?;

                transport
                    .send(email)
                    .await
                    .map_err(|e| format!("Failed to send email: {}", e))?;

                info!("Verification email sent to {}", to);
                Ok(())
            }
            None => {
                warn!(
                    "EmailService [LOG-ONLY] verification email for @{}: {}",
                    username, verify_url
                );
                Ok(())
            }
        }
    }
}
