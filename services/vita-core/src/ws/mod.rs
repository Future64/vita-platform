use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{Duration, Instant};

use actix_web::{web, HttpRequest, HttpResponse};
use actix_ws::Message;
use serde::{Deserialize, Serialize};
use tokio::sync::broadcast;
use tracing::{info, warn};

use crate::auth::jwt::validate_token;
use crate::auth::middleware::{AuthUser, JwtSecret};

// ── Server messages (sent from server to clients) ─────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ServerMessage {
    /// Acknowledge successful authentication
    AuthOk {
        user_id: String,
    },
    /// Auth failure
    AuthError {
        message: String,
    },
    /// New notification for a specific user
    Notification {
        #[serde(rename = "notification_type")]
        type_: String,
        titre: String,
        contenu: String,
        lien: Option<String>,
    },
    /// Balance update after a transfer/emission
    BalanceUpdate {
        nouvelle_balance: String,
        raison: String,
    },
    /// Vote results changed in real time
    VoteUpdate {
        proposition_id: String,
        pour: i32,
        contre: i32,
        abstention: i32,
        participation: f64,
    },
    /// Activity feed item (global)
    ActivityFeed {
        #[serde(rename = "activity_type")]
        type_: String,
        message: String,
        timestamp: String,
    },
    /// System message (maintenance, etc)
    SystemMessage {
        #[serde(rename = "system_type")]
        type_: String,
        message: String,
    },
    /// Pong response to client ping
    Pong,
}

// ── Client messages (received from client) ────────────────────────────

#[derive(Debug, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
enum ClientMessage {
    Auth { token: String },
    Ping,
}

// ── WsServer — shared broadcast hub ───────────────────────────────────

/// Global WebSocket server state, shared across all sessions via `web::Data`.
/// Uses a broadcast channel for global messages and per-user channels for targeted messages.
pub struct WsServer {
    /// Per-user broadcast senders — one user can have multiple sessions
    user_channels: Mutex<HashMap<String, broadcast::Sender<ServerMessage>>>,
    /// Global broadcast channel for messages to all connected clients
    global_tx: broadcast::Sender<ServerMessage>,
}

impl WsServer {
    pub fn new() -> Self {
        let (global_tx, _) = broadcast::channel(256);
        Self {
            user_channels: Mutex::new(HashMap::new()),
            global_tx,
        }
    }

    /// Get or create a per-user broadcast channel
    fn get_or_create_user_channel(&self, user_id: &str) -> broadcast::Sender<ServerMessage> {
        let mut channels = self.user_channels.lock().unwrap();
        channels
            .entry(user_id.to_string())
            .or_insert_with(|| {
                let (tx, _) = broadcast::channel(64);
                tx
            })
            .clone()
    }

    /// Subscribe to a user's personal channel
    pub fn subscribe_user(&self, user_id: &str) -> broadcast::Receiver<ServerMessage> {
        self.get_or_create_user_channel(user_id).subscribe()
    }

    /// Subscribe to the global broadcast channel
    pub fn subscribe_global(&self) -> broadcast::Receiver<ServerMessage> {
        self.global_tx.subscribe()
    }

    /// Send a message to a specific user (all their sessions)
    pub fn send_to_user(&self, user_id: &str, msg: ServerMessage) {
        let channels = self.user_channels.lock().unwrap();
        if let Some(tx) = channels.get(user_id) {
            let _ = tx.send(msg);
        }
    }

    /// Broadcast a message to all connected clients
    pub fn broadcast(&self, msg: ServerMessage) {
        let _ = self.global_tx.send(msg);
    }

    /// Remove a user channel if no more receivers are listening
    fn cleanup_user(&self, user_id: &str) {
        let mut channels = self.user_channels.lock().unwrap();
        if let Some(tx) = channels.get(user_id) {
            if tx.receiver_count() == 0 {
                channels.remove(user_id);
            }
        }
    }
}

// ── WebSocket upgrade handler ─────────────────────────────────────────

const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(10);
const CLIENT_TIMEOUT: Duration = Duration::from_secs(30);

pub async fn ws_handler(
    req: HttpRequest,
    body: web::Payload,
    ws_server: web::Data<WsServer>,
    jwt_secret: web::Data<JwtSecret>,
) -> Result<HttpResponse, actix_web::Error> {
    let (response, mut session, mut msg_stream) = actix_ws::handle(&req, body)?;

    // Spawn the session task
    actix_web::rt::spawn(async move {
        let mut authenticated_user: Option<AuthUser> = None;
        let mut last_heartbeat = Instant::now();
        let mut user_rx: Option<broadcast::Receiver<ServerMessage>> = None;
        let mut global_rx = ws_server.subscribe_global();

        // Heartbeat interval
        let mut hb_interval = tokio::time::interval(HEARTBEAT_INTERVAL);

        // Auth timeout — client has 10 seconds to authenticate
        let auth_deadline = tokio::time::sleep(Duration::from_secs(10));
        tokio::pin!(auth_deadline);

        loop {
            tokio::select! {
                // Incoming WebSocket messages from the client
                Some(msg) = msg_stream.recv() => {
                    match msg {
                        Ok(Message::Text(text)) => {
                            last_heartbeat = Instant::now();

                            match serde_json::from_str::<ClientMessage>(&text) {
                                Ok(ClientMessage::Auth { token }) => {
                                    if authenticated_user.is_some() {
                                        // Already authenticated
                                        continue;
                                    }
                                    match validate_token(&token, &jwt_secret.0) {
                                        Ok(claims) => {
                                            if claims.token_type != "access" {
                                                let err = ServerMessage::AuthError {
                                                    message: "Invalid token type".to_string(),
                                                };
                                                let _ = session.text(serde_json::to_string(&err).unwrap()).await;
                                                let _ = session.close(None).await;
                                                break;
                                            }
                                            let auth = AuthUser::from_claims(&claims);
                                            info!("[WS] User {} ({}) authenticated", auth.username, auth.user_id);

                                            // Subscribe to this user's personal channel
                                            user_rx = Some(ws_server.subscribe_user(&auth.user_id));

                                            let ok_msg = ServerMessage::AuthOk {
                                                user_id: auth.user_id.clone(),
                                            };
                                            let _ = session.text(serde_json::to_string(&ok_msg).unwrap()).await;
                                            authenticated_user = Some(auth);
                                        }
                                        Err(_) => {
                                            let err = ServerMessage::AuthError {
                                                message: "Invalid or expired token".to_string(),
                                            };
                                            let _ = session.text(serde_json::to_string(&err).unwrap()).await;
                                            let _ = session.close(None).await;
                                            break;
                                        }
                                    }
                                }
                                Ok(ClientMessage::Ping) => {
                                    let pong = ServerMessage::Pong;
                                    let _ = session.text(serde_json::to_string(&pong).unwrap()).await;
                                }
                                Err(_) => {
                                    // Unknown message, ignore
                                    warn!("[WS] Unknown client message: {}", text);
                                }
                            }
                        }
                        Ok(Message::Ping(bytes)) => {
                            last_heartbeat = Instant::now();
                            let _ = session.pong(&bytes).await;
                        }
                        Ok(Message::Pong(_)) => {
                            last_heartbeat = Instant::now();
                        }
                        Ok(Message::Close(_)) | Err(_) => {
                            break;
                        }
                        _ => {}
                    }
                }

                // Forward per-user messages
                msg = async {
                    match user_rx.as_mut() {
                        Some(rx) => rx.recv().await,
                        None => {
                            // No user channel yet — wait forever
                            std::future::pending::<Result<ServerMessage, broadcast::error::RecvError>>().await
                        }
                    }
                } => {
                    if let Ok(server_msg) = msg {
                        let text = serde_json::to_string(&server_msg).unwrap();
                        if session.text(text).await.is_err() {
                            break;
                        }
                    }
                }

                // Forward global broadcast messages
                msg = global_rx.recv() => {
                    if authenticated_user.is_some() {
                        if let Ok(server_msg) = msg {
                            let text = serde_json::to_string(&server_msg).unwrap();
                            if session.text(text).await.is_err() {
                                break;
                            }
                        }
                    }
                }

                // Heartbeat tick
                _ = hb_interval.tick() => {
                    if Instant::now().duration_since(last_heartbeat) > CLIENT_TIMEOUT {
                        warn!("[WS] Client timeout, closing");
                        let _ = session.close(None).await;
                        break;
                    }
                    // Send ping
                    if session.ping(b"").await.is_err() {
                        break;
                    }
                }

                // Auth deadline
                _ = &mut auth_deadline => {
                    if authenticated_user.is_none() {
                        warn!("[WS] Client did not authenticate within 10s, closing");
                        let _ = session.close(None).await;
                        break;
                    }
                }
            }
        }

        // Cleanup
        if let Some(user) = &authenticated_user {
            info!("[WS] User {} disconnected", user.username);
            ws_server.cleanup_user(&user.user_id);
        }
    });

    Ok(response)
}
