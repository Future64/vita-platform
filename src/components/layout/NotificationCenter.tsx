"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Sparkles,
  Coins,
  Vote,
  ArrowDownLeft,
  MessageSquare,
  CheckCircle2,
  GitMerge,
  SlidersHorizontal,
  ShieldCheck,
  Wrench,
  Rocket,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/contexts/NotificationContext";
import type { Notification } from "@/types/notifications";

// Map icon names to components
const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  Coins,
  Vote,
  ArrowDownLeft,
  MessageSquare,
  CheckCircle2,
  GitMerge,
  SlidersHorizontal,
  ShieldCheck,
  Wrench,
  Rocket,
  TrendingUp,
};

const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  violet: { bg: "bg-violet-500/15", text: "text-violet-500" },
  pink: { bg: "bg-pink-500/15", text: "text-pink-500" },
  cyan: { bg: "bg-cyan-500/15", text: "text-cyan-500" },
  blue: { bg: "bg-blue-500/15", text: "text-blue-500" },
  green: { bg: "bg-green-500/15", text: "text-green-500" },
  orange: { bg: "bg-orange-500/15", text: "text-orange-500" },
  red: { bg: "bg-red-500/15", text: "text-red-500" },
};

function formatRelativeDate(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffH = Math.floor(diffMs / 3_600_000);
  const diffD = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "A l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffH < 24) return `Il y a ${diffH}h`;
  if (diffD === 1) return "Hier";
  if (diffD < 7) return `Il y a ${diffD}j`;
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

function NotificationItem({
  notif,
  onClose,
}: {
  notif: Notification;
  onClose: () => void;
}) {
  const router = useRouter();
  const { markAsRead } = useNotifications();
  const Icon = ICON_MAP[notif.icone] || Bell;
  const colors = COLOR_MAP[notif.couleur] || COLOR_MAP.violet;

  function handleClick() {
    markAsRead(notif.id);
    if (notif.lien) {
      router.push(notif.lien);
      onClose();
    }
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--bg-elevated)]",
        !notif.lue && "bg-violet-500/[0.03]"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          colors.bg
        )}
      >
        <Icon className={cn("h-4 w-4", colors.text)} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-[var(--text-primary)]">
          {notif.titre}
        </div>
        <div className="mt-0.5 line-clamp-2 text-xs text-[var(--text-secondary)]">
          {notif.message}
        </div>
        <div className="mt-1 text-[0.6875rem] text-[var(--text-muted)]">
          {formatRelativeDate(notif.date)}
        </div>
      </div>

      {/* Unread dot */}
      {!notif.lue && (
        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-violet-500" />
      )}
    </button>
  );
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }
  }, [open]);

  const recent = notifications.slice(0, 10);

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
        aria-label={unreadCount > 0 ? `Notifications (${unreadCount} non lues)` : "Notifications"}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white" aria-hidden="true">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] xs:w-[380px] max-w-[380px] overflow-hidden rounded-xl border shadow-lg"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--bg-card)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between border-b px-4 py-3"
            style={{ borderColor: "var(--border)" }}
          >
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs font-medium text-violet-500 transition-colors hover:text-violet-400"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-[400px] overflow-y-auto" aria-live="polite" aria-label="Liste des notifications">
            {recent.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
                Aucune notification
              </div>
            ) : (
              <div
                className="divide-y"
                style={{ borderColor: "var(--border)" }}
              >
                {recent.map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    notif={notif}
                    onClose={() => setOpen(false)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center py-3 text-xs font-medium text-violet-500 transition-colors hover:text-violet-400"
            >
              Voir toutes les notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
