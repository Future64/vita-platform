// Client WebSocket VITA — communication temps réel avec le backend
// Gère la connexion, l'authentification JWT, le heartbeat et la reconnexion

export interface WsNotification {
  type: "notification";
  notification_type: string;
  titre: string;
  contenu: string;
  lien?: string;
}

export interface WsBalanceUpdate {
  type: "balance_update";
  nouvelle_balance: string;
  raison: string;
}

export interface WsVoteUpdate {
  type: "vote_update";
  proposition_id: string;
  pour: number;
  contre: number;
  abstention: number;
  participation: number;
}

export interface WsActivityFeed {
  type: "activity_feed";
  activity_type: string;
  message: string;
  timestamp: string;
}

export interface WsSystemMessage {
  type: "system_message";
  system_type: string;
  message: string;
}

export interface WsAuthOk {
  type: "auth_ok";
  user_id: string;
}

export interface WsAuthError {
  type: "auth_error";
  message: string;
}

export interface WsPong {
  type: "pong";
}

export type WsMessage =
  | WsNotification
  | WsBalanceUpdate
  | WsVoteUpdate
  | WsActivityFeed
  | WsSystemMessage
  | WsAuthOk
  | WsAuthError
  | WsPong;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WsCallback = (data: any) => void;

class VitaWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private listeners: Map<string, Set<WsCallback>> = new Map();
  private token: string | null = null;
  private _connected = false;
  private _authenticated = false;

  get connected(): boolean {
    return this._connected;
  }

  get authenticated(): boolean {
    return this._authenticated;
  }

  connect(token: string) {
    if (typeof window === "undefined") return;

    this.token = token;
    this.maxReconnectAttempts = 10;

    // Don't open a new connection if one is already open
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    // In development, Next.js rewrites don't proxy WebSocket connections,
    // so we connect directly to the backend. In production, the reverse proxy
    // handles WS upgrade on the same host.
    let wsUrl: string;
    if (process.env.NODE_ENV === "development") {
      wsUrl = "ws://localhost:8080/api/v1/ws";
    } else {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      wsUrl = `${protocol}//${window.location.host}/api/v1/ws`;
    }

    try {
      this.ws = new WebSocket(wsUrl);
    } catch {
      console.warn("[VITA WS] Impossible de creer le WebSocket");
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      console.info("[VITA WS] Connexion ouverte");
      this._connected = true;
      this.reconnectAttempts = 0;

      // Send auth message
      this.ws?.send(JSON.stringify({ type: "auth", token }));

      // Start client-side ping every 25 seconds
      this.stopPing();
      this.pingTimer = setInterval(() => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 25_000);

      this.emit("connected", {});
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WsMessage;

        if (message.type === "auth_ok") {
          this._authenticated = true;
          console.info("[VITA WS] Authentifie");
          this.emit("authenticated", message);
          return;
        }

        if (message.type === "auth_error") {
          console.warn("[VITA WS] Erreur auth:", message.message);
          this._authenticated = false;
          this.emit("auth_error", message);
          return;
        }

        if (message.type === "pong") {
          return; // Heartbeat response, no action needed
        }

        // Dispatch to type-specific listeners
        this.emit(message.type, message);
      } catch {
        // Not JSON — ignore
      }
    };

    this.ws.onclose = (event) => {
      console.info("[VITA WS] Connexion fermee (code:", event.code, ")");
      this._connected = false;
      this._authenticated = false;
      this.stopPing();
      this.emit("disconnected", { code: event.code });

      // Auto-reconnect unless explicitly disconnected
      if (this.maxReconnectAttempts > 0) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      // Error events are always followed by close events, so we handle reconnect there
    };
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn("[VITA WS] Max tentatives de reconnexion atteint");
      this.emit("max_reconnect", {});
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30_000);
    console.info(`[VITA WS] Reconnexion dans ${delay}ms (tentative ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      if (this.token) {
        this.connect(this.token);
      }
    }, delay);
  }

  private stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  on(event: string, callback: WsCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  off(event: string, callback: WsCallback) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: unknown) {
    this.listeners.get(event)?.forEach((cb) => cb(data));
  }

  disconnect() {
    this.maxReconnectAttempts = 0;
    this.token = null;
    this._connected = false;
    this._authenticated = false;
    this.stopPing();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close(1000, "Client disconnect");
      this.ws = null;
    }
  }
}

// Singleton instance
export const vitaWs = new VitaWebSocket();
