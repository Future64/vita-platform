"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Filter,
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
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useNotifications } from "@/contexts/NotificationContext";
import type { Notification, NotificationType } from "@/types/notifications";

// Icon map (same as NotificationCenter)
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

const TYPE_LABELS: Record<NotificationType, string> = {
  vote_ouvert: "Votes ouverts",
  vote_resultat: "Resultats de vote",
  vita_recu: "VITA recus",
  emission_quotidienne: "Emissions",
  proposition_commentee: "Commentaires",
  di_approuvee: "Demandes d'intégration",
  role_change: "Changements de role",
  parametre_modifie: "Parametres",
  systeme: "Systeme",
  bienvenue: "Bienvenue",
};

type FilterMode = "all" | "unread";

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

function getDateGroup(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86_400_000);
  const weekAgo = new Date(today.getTime() - 7 * 86_400_000);

  if (date >= today) return "Aujourd'hui";
  if (date >= yesterday) return "Hier";
  if (date >= weekAgo) return "Cette semaine";
  return "Plus ancien";
}

function NotificationCard({
  notif,
  onNavigate,
}: {
  notif: Notification;
  onNavigate: (notif: Notification) => void;
}) {
  const { markAsRead, deleteNotification } = useNotifications();
  const [hovered, setHovered] = useState(false);
  const Icon = ICON_MAP[notif.icone] || Bell;
  const colors = COLOR_MAP[notif.couleur] || COLOR_MAP.violet;

  return (
    <div
      className={cn(
        "group relative flex items-start gap-4 rounded-xl border p-4 transition-all",
        !notif.lue
          ? "border-violet-500/20 bg-violet-500/[0.03]"
          : "border-[var(--border)]",
        notif.lien && "cursor-pointer hover:bg-[var(--bg-elevated)]"
      )}
      onClick={() => onNavigate(notif)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          colors.bg
        )}
      >
        <Icon className={cn("h-5 w-5", colors.text)} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="text-sm font-medium text-[var(--text-primary)]">
            {notif.titre}
          </div>
          <div className="shrink-0 text-[0.6875rem] text-[var(--text-muted)]">
            {formatRelativeDate(notif.date)}
          </div>
        </div>
        <div className="mt-1 text-sm text-[var(--text-secondary)]">
          {notif.message}
        </div>
      </div>

      {/* Unread dot */}
      {!notif.lue && (
        <div className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-violet-500" />
      )}

      {/* Hover actions */}
      {hovered && (
        <div
          className="absolute right-3 top-3 flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {!notif.lue ? (
            <button
              onClick={() => markAsRead(notif.id)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--bg-elevated)] text-[var(--text-muted)] transition-colors hover:text-green-500"
              title="Marquer comme lu"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={() => {
                // Toggle back to unread — not in context but useful UX
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--bg-elevated)] text-[var(--text-muted)] transition-colors hover:text-violet-500"
              title="Marquer comme non lu"
            >
              <BellOff className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={() => deleteNotification(notif.id)}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--bg-elevated)] text-[var(--text-muted)] transition-colors hover:text-red-500"
            title="Supprimer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState<FilterMode>("all");
  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all");
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  const filtered = useMemo(() => {
    let result = notifications;
    if (filter === "unread") {
      result = result.filter((n) => !n.lue);
    }
    if (typeFilter !== "all") {
      result = result.filter((n) => n.type === typeFilter);
    }
    return result;
  }, [notifications, filter, typeFilter]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    const order = ["Aujourd'hui", "Hier", "Cette semaine", "Plus ancien"];

    for (const notif of filtered) {
      const group = getDateGroup(notif.date);
      if (!groups[group]) groups[group] = [];
      groups[group].push(notif);
    }

    return order
      .filter((g) => groups[g]?.length)
      .map((label) => ({ label, items: groups[label] }));
  }, [filtered]);

  function handleNavigate(notif: Notification) {
    if (notif.lien) {
      router.push(notif.lien);
    }
  }

  // Get available types for filter
  const availableTypes = useMemo(() => {
    const types = new Set(notifications.map((n) => n.type));
    return Array.from(types);
  }, [notifications]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Notifications
            </h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {unreadCount > 0
                ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
                : "Toutes les notifications sont lues"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--bg-elevated)]"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              <CheckCheck className="h-4 w-4" />
              Tout marquer comme lu
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Read/Unread filter */}
          <div className="flex rounded-lg border p-1" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)" }}>
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                filter === "all"
                  ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              )}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                filter === "unread"
                  ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              )}
            >
              Non lues
              {unreadCount > 0 && (
                <span className="ml-1.5 rounded-full bg-violet-500/15 px-1.5 py-0.5 text-[0.625rem] font-semibold text-violet-500">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Type filter */}
          <div className="relative">
            <button
              onClick={() => setShowTypeMenu(!showTypeMenu)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                typeFilter !== "all"
                  ? "border-violet-500/30 text-violet-500"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              )}
              style={{
                borderColor: typeFilter === "all" ? "var(--border)" : undefined,
              }}
            >
              <Filter className="h-3.5 w-3.5" />
              {typeFilter === "all"
                ? "Par type"
                : TYPE_LABELS[typeFilter]}
            </button>

            {showTypeMenu && (
              <div
                className="absolute left-0 top-10 z-50 w-56 max-w-[calc(100vw-2rem)] rounded-xl border p-1.5 shadow-lg"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--bg-card)",
                }}
              >
                <button
                  onClick={() => {
                    setTypeFilter("all");
                    setShowTypeMenu(false);
                  }}
                  className={cn(
                    "flex w-full items-center rounded-lg px-3 py-2 text-xs transition-colors",
                    typeFilter === "all"
                      ? "bg-violet-500/10 text-violet-500"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
                  )}
                >
                  Tous les types
                </button>
                {availableTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setTypeFilter(type);
                      setShowTypeMenu(false);
                    }}
                    className={cn(
                      "flex w-full items-center rounded-lg px-3 py-2 text-xs transition-colors",
                      typeFilter === type
                        ? "bg-violet-500/10 text-violet-500"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
                    )}
                  >
                    {TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notification groups */}
        {grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border py-16" style={{ borderColor: "var(--border)" }}>
            <Bell className="mb-3 h-10 w-10 text-[var(--text-muted)]" />
            <p className="text-sm text-[var(--text-muted)]">
              {filter === "unread"
                ? "Aucune notification non lue"
                : "Aucune notification"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map((group) => (
              <div key={group.label}>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  {group.label}
                </h2>
                <div className="space-y-2">
                  {group.items.map((notif) => (
                    <NotificationCard
                      key={notif.id}
                      notif={notif}
                      onNavigate={handleNavigate}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
