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
import type { Notification } from "@/types/notifications";
import {
  MOCK_NOTIFICATIONS,
  generateRandomNotification,
} from "@/lib/mockNotifications";
import { MOCK_VERIFICATION_NOTIFICATIONS } from "@/lib/mockVerificationNotifications";

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

  // Simulate new notification every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newNotif = generateRandomNotification();
      setNotifications((prev) => [newNotif, ...prev]);
    }, 60_000);
    return () => clearInterval(interval);
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
