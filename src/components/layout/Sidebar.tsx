"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Settings, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { ROLE_METADATA } from "@/lib/permissions";
import { PermissionGate } from "@/components/auth/PermissionGate";
import type { Permission } from "@/types/auth";
import { useTranslation } from "@/lib/i18n";

export interface SidebarItem {
  icon: LucideIcon;
  label: string;
  href?: string;
  badge?: string;
  badgeVariant?: "violet" | "pink" | "cyan" | "green" | "orange" | "red" | "yellow";
  onClick?: () => void;
  permission?: Permission;
}

interface SidebarProps {
  items: SidebarItem[];
  title?: string;
}

const badgeColors = {
  violet: "bg-violet-500/15 text-violet-500",
  pink: "bg-pink-500/15 text-pink-500",
  cyan: "bg-cyan-500/15 text-cyan-500",
  green: "bg-green-500/15 text-green-500",
  orange: "bg-orange-500/15 text-orange-500",
  red: "bg-red-500/15 text-red-500",
  yellow: "bg-yellow-500/15 text-yellow-500",
};

function SidebarLink({
  item,
  isActive,
}: {
  item: SidebarItem;
  isActive: boolean;
}) {
  const Icon = item.icon;

  const content = (
    <>
      <Icon
        className={cn(
          "h-[1.125rem] w-[1.125rem] shrink-0",
          isActive ? "opacity-100" : "opacity-70"
        )}
      />
      <span className="flex-1 text-left">{item.label}</span>
      {item.badge && (
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold",
            badgeColors[item.badgeVariant || "violet"]
          )}
        >
          {item.badge}
        </span>
      )}
    </>
  );

  const baseClassName =
    "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all";
  const className = isActive
    ? cn(baseClassName, "bg-gradient-to-r from-violet-500 to-pink-500 text-white")
    : baseClassName;

  const inlineStyle = !isActive
    ? { color: "var(--text-secondary)" }
    : undefined;

  if (item.href) {
    return (
      <Link href={item.href} className={className} style={inlineStyle}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={item.onClick} className={className} style={inlineStyle}>
      {content}
    </button>
  );
}

export function Sidebar({ items, title = "Menu" }: SidebarProps) {
  const pathname = usePathname();
  const { user, activeRole } = useAuth();
  const { unreadCount } = useNotifications();
  const { t } = useTranslation();
  const roleMeta = ROLE_METADATA[activeRole];

  const isSettingsActive = pathname === "/parametres";
  const isNotificationsActive = pathname === "/notifications";
  const isAdminActive = pathname.startsWith("/administration");

  return (
    <aside
      className="hidden w-64 shrink-0 overflow-y-auto border-r lg:block"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
      role="navigation"
      aria-label={title}
    >
      <div className="flex h-full flex-col">
        {/* User info + role badge */}
        {user && (
          <div className="border-b p-4" style={{ borderColor: "var(--border)" }}>
            <div className="text-sm font-semibold text-[var(--text-primary)]">
              {user.prenom} {user.nom}
            </div>
            <div className="text-xs text-[var(--text-muted)]">@{user.username}</div>
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: roleMeta.color }}
              />
              <span
                className="text-xs font-medium"
                style={{ color: roleMeta.color }}
              >
                {roleMeta.label}
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 p-5">
          <div
            className="mb-3 pl-3 text-[0.6875rem] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            {title}
          </div>
          <div className="space-y-1">
            {items.map((item, index) => {
              const isActive = item.href ? pathname === item.href : false;

              if (item.permission) {
                return (
                  <PermissionGate key={index} permission={item.permission}>
                    <SidebarLink item={item} isActive={isActive} />
                  </PermissionGate>
                );
              }

              return (
                <SidebarLink key={index} item={item} isActive={isActive} />
              );
            })}
          </div>
        </div>

        {/* Notifications + Settings at bottom */}
        {activeRole !== "suspendu" && (
          <div className="border-t p-3 space-y-1" style={{ borderColor: "var(--border)" }}>
            <SidebarLink
              item={{
                icon: Bell,
                label: t("nav.notifications"),
                href: "/notifications",
                badge: unreadCount > 0 ? String(unreadCount) : undefined,
                badgeVariant: "red" as const,
              }}
              isActive={isNotificationsActive}
            />
            <SidebarLink
              item={{ icon: Settings, label: t("nav.settings"), href: "/parametres" }}
              isActive={isSettingsActive}
            />
            <PermissionGate permission="access_admin_panel" hide>
              <SidebarLink
                item={{ icon: Shield, label: "Administration", href: "/administration" }}
                isActive={isAdminActive}
              />
            </PermissionGate>
          </div>
        )}
      </div>
    </aside>
  );
}
