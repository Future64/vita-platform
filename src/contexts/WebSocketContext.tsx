"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useState,
  type ReactNode,
} from "react";
import { vitaWs } from "@/lib/websocket";
import type {
  WsBalanceUpdate,
  WsVoteUpdate,
  WsActivityFeed,
  WsNotification,
} from "@/lib/websocket";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WsCallback = (data: any) => void;

interface WebSocketContextType {
  connected: boolean;
  authenticated: boolean;
  subscribe: (event: string, callback: WsCallback) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

// ── Polling fallback ──────────────────────────────────────────────────

function usePollingFallback(
  wsConnected: boolean,
  isAuthenticated: boolean,
  onBalanceUpdate: (data: WsBalanceUpdate) => void,
  onVoteUpdate: (data: WsVoteUpdate) => void,
) {
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Only poll when WS is NOT connected but user IS authenticated
    if (wsConnected || !isAuthenticated) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    console.info("[VITA WS] Fallback polling active (30s)");
    pollingRef.current = setInterval(async () => {
      try {
        const me = await api.getMe();
        if (me.solde_vita) {
          onBalanceUpdate({
            type: "balance_update",
            nouvelle_balance: me.solde_vita,
            raison: "polling",
          });
        }
      } catch {
        // Ignore polling errors
      }

      try {
        const propositions = (await api.getPropositions({ statut: "vote" })) as Array<{
          id: string;
          votes_pour?: number;
          votes_contre?: number;
          votes_abstention?: number;
          taux_participation?: number;
        }>;
        for (const p of propositions) {
          if (p.votes_pour !== undefined) {
            onVoteUpdate({
              type: "vote_update",
              proposition_id: p.id,
              pour: p.votes_pour ?? 0,
              contre: p.votes_contre ?? 0,
              abstention: p.votes_abstention ?? 0,
              participation: p.taux_participation ?? 0,
            });
          }
        }
      } catch {
        // Ignore polling errors
      }
    }, 30_000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [wsConnected, isAuthenticated, onBalanceUpdate, onVoteUpdate]);
}

// ── Provider ──────────────────────────────────────────────────────────

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isMockMode } = useAuth();
  const [connected, setConnected] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const listenersRef = useRef<Map<string, Set<WsCallback>>>(new Map());

  // Connect/disconnect based on auth state
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isAuthenticated && !isMockMode) {
      const token = api.getToken();
      if (token) {
        vitaWs.connect(token);
      }
    } else {
      vitaWs.disconnect();
      setConnected(false);
      setAuthenticated(false);
    }

    return () => {
      // Don't disconnect on cleanup — the singleton persists
    };
  }, [isAuthenticated, isMockMode]);

  // Listen to connection state changes
  useEffect(() => {
    const offConnected = vitaWs.on("connected", () => setConnected(true));
    const offDisconnected = vitaWs.on("disconnected", () => {
      setConnected(false);
      setAuthenticated(false);
    });
    const offAuth = vitaWs.on("authenticated", () => setAuthenticated(true));
    const offAuthErr = vitaWs.on("auth_error", () => setAuthenticated(false));

    return () => {
      offConnected();
      offDisconnected();
      offAuth();
      offAuthErr();
    };
  }, []);

  // Forward WS events to context subscribers
  useEffect(() => {
    const messageTypes = [
      "notification",
      "balance_update",
      "vote_update",
      "activity_feed",
      "system_message",
    ];

    const unsubscribes = messageTypes.map((type) =>
      vitaWs.on(type, (data) => {
        const listeners = listenersRef.current.get(type);
        listeners?.forEach((cb) => cb(data));
      })
    );

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, []);

  const subscribe = useCallback((event: string, callback: WsCallback): (() => void) => {
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event)!.add(callback);

    return () => {
      listenersRef.current.get(event)?.delete(callback);
    };
  }, []);

  // Polling fallback dispatchers
  const dispatchBalance = useCallback((data: WsBalanceUpdate) => {
    listenersRef.current.get("balance_update")?.forEach((cb) => cb(data));
  }, []);

  const dispatchVote = useCallback((data: WsVoteUpdate) => {
    listenersRef.current.get("vote_update")?.forEach((cb) => cb(data));
  }, []);

  usePollingFallback(connected, isAuthenticated, dispatchBalance, dispatchVote);

  return (
    <WebSocketContext.Provider value={{ connected, authenticated, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────

export function useWebSocket(): WebSocketContextType {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
