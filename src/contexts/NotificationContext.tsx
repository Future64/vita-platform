"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
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

// Map WS notification_type to icon/color
function wsNotifToNotification(ws: WsNotification): Notification {
  const iconMap: Record<string, { icone: string; couleur: string }> = {
    vita_recu: { icone: "Wallet", couleur: "green" },
    emission_quotidienne: { icone: "Sunrise", couleur: "violet" },
    attestation_recue: { icone: "ShieldCheck", couleur: "green" },
    verification_complete: { icone: "ShieldCheck", couleur: "green" },
    demande_parrainage: { icone: "UserPlus", couleur: "blue" },
    vote_ouvert: { icone: "Vote", couleur: "blue" },
    vote_resultat: { icone: "BarChart3", couleur: "violet" },
    parametre_modifie: { icone: "Settings", couleur: "amber" },
  };

  const meta = iconMap[ws.notification_type] ?? { icone: "Bell", couleur: "blue" };

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

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load mock notifications on mount
  useEffect(() => {
    setNotifications(
      [...MOCK_NOTIFICATIONS, ...MOCK_VERIFICATION_NOTIFICATIONS].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );
  }, []);

  // Simulate new notification every 60 seconds (mock mode only)
  useEffect(() => {
    const interval = setInterval(() => {
      const newNotif = generateRandomNotification();
      setNotifications((prev) => [newNotif, ...prev]);
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Listen for real-time notifications via WebSocket (singleton — no context needed)
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

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lue: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, lue: true })));
  }, []);

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
