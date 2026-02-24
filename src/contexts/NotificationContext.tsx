"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type { Notification, NotificationType } from "@/types/notifications";
import {
  MOCK_NOTIFICATIONS,
  generateRandomNotification,
} from "@/lib/mockNotifications";
import { MOCK_VERIFICATION_NOTIFICATIONS } from "@/lib/mockVerificationNotifications";
import { vitaWs } from "@/lib/websocket";
import type { WsNotification } from "@/lib/websocket";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notif: Notification) => void;
  deleteNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

// Map notification type to icon/color for display
const NOTIF_ICON_MAP: Record<string, { icone: string; couleur: string }> = {
  vita_recu: { icone: "Wallet", couleur: "green" },
  emission_quotidienne: { icone: "Sunrise", couleur: "violet" },
  attestation_recue: { icone: "ShieldCheck", couleur: "green" },
  verification_complete: { icone: "ShieldCheck", couleur: "green" },
  demande_parrainage: { icone: "UserPlus", couleur: "blue" },
  vote_ouvert: { icone: "Vote", couleur: "blue" },
  vote_resultat: { icone: "BarChart3", couleur: "violet" },
  parametre_modifie: { icone: "Settings", couleur: "amber" },
  transfer_received: { icone: "ArrowDownLeft", couleur: "green" },
  daily_vita: { icone: "Sparkles", couleur: "violet" },
};

// Map WS notification_type to Notification
function wsNotifToNotification(ws: WsNotification): Notification {
  const meta = NOTIF_ICON_MAP[ws.notification_type] ?? { icone: "Bell", couleur: "blue" };

  return {
    id: `ws-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: (ws.notification_type || "systeme") as NotificationType,
    titre: ws.titre,
    message: ws.contenu,
    date: new Date().toISOString(),
    lue: false,
    lien: ws.lien,
    icone: meta.icone,
    couleur: meta.couleur,
  };
}

// Map API notification to Notification
function apiNotifToNotification(n: {
  id: string;
  type: string;
  titre: string;
  contenu: string;
  lien: string | null;
  lue: boolean;
  created_at: string;
}): Notification {
  const meta = NOTIF_ICON_MAP[n.type] ?? { icone: "Bell", couleur: "blue" };

  return {
    id: n.id,
    type: (n.type || "systeme") as NotificationType,
    titre: n.titre,
    message: n.contenu,
    date: n.created_at,
    lue: n.lue,
    lien: n.lien ?? undefined,
    icone: meta.icone,
    couleur: meta.couleur,
  };
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isMockMode } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const fetchedRef = useRef(false);

  // ── Load notifications: API or mock ──────────────────────────
  useEffect(() => {
    if (isMockMode || !isAuthenticated) {
      // Mock mode: load mock data
      setNotifications(
        [...MOCK_NOTIFICATIONS, ...MOCK_VERIFICATION_NOTIFICATIONS].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      );
      fetchedRef.current = false;
      return;
    }

    // API mode: fetch from backend
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    api
      .getNotifications()
      .then((data) => {
        const mapped = data.notifications.map(apiNotifToNotification);
        setNotifications(mapped);
      })
      .catch(() => {
        // Fallback to mock on error
        setNotifications(
          [...MOCK_NOTIFICATIONS, ...MOCK_VERIFICATION_NOTIFICATIONS].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        );
      });
  }, [isAuthenticated, isMockMode]);

  // ── Polling: refresh notifications every 30s in API mode ─────
  useEffect(() => {
    if (isMockMode || !isAuthenticated) return;

    const interval = setInterval(async () => {
      try {
        const data = await api.getNotifications();
        const mapped = data.notifications.map(apiNotifToNotification);
        setNotifications((prev) => {
          // Merge: keep WS-injected notifications not yet in API response
          const apiIds = new Set(mapped.map((n) => n.id));
          const wsOnly = prev.filter(
            (n) => n.id.startsWith("ws-") && !apiIds.has(n.id)
          );
          return [...wsOnly, ...mapped];
        });
      } catch {
        // Ignore polling errors
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, [isAuthenticated, isMockMode]);

  // ── Mock mode: simulate new notifications every 60s ──────────
  useEffect(() => {
    if (!isMockMode) return;

    const interval = setInterval(() => {
      const newNotif = generateRandomNotification();
      setNotifications((prev) => [newNotif, ...prev]);
    }, 60_000);
    return () => clearInterval(interval);
  }, [isMockMode]);

  // ── Listen for real-time notifications via WebSocket ─────────
  useEffect(() => {
    return vitaWs.on("notification", (data: WsNotification) => {
      const notif = wsNotifToNotification(data);
      setNotifications((prev) => [notif, ...prev]);
    });
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.lue).length,
    [notifications]
  );

  const markAsRead = useCallback(
    (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lue: true } : n))
      );
      // Persist to API (fire-and-forget)
      if (!isMockMode && !id.startsWith("ws-")) {
        api.markNotificationRead(id).catch(() => {});
      }
    },
    [isMockMode]
  );

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, lue: true })));
    // Persist to API (fire-and-forget)
    if (!isMockMode) {
      api.markAllNotificationsRead().catch(() => {});
    }
  }, [isMockMode]);

  const addNotification = useCallback((notif: Notification) => {
    setNotifications((prev) => [notif, ...prev]);
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
