"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  X,
  Flame,
  GitBranch,
  BookOpen,
  User,
  Globe,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { ROLE_METADATA } from "@/lib/permissions";
import { PermissionGate } from "@/components/auth/PermissionGate";
import type { Permission } from "@/types/auth";
import { useTranslation } from "@/lib/i18n";

const MAIN_MODULES = [
  { id: "agora", label: "Agora", icon: Flame, path: "/agora" },
  { id: "forge", label: "Forge", icon: GitBranch, path: "/forge" },
  { id: "codex", label: "Codex", icon: BookOpen, path: "/codex" },
  { id: "civis", label: "Civis", icon: User, path: "/civis" },
  { id: "bourse", label: "Bourse", icon: Wallet, path: "/bourse" },
  { id: "panorama", label: "Panorama", icon: Globe, path: "/panorama" },
];

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
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
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
  collapsed = false,
  onNavigate,
}: {
  item: SidebarItem;
  isActive: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
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
      {!collapsed && (
        <>
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
      )}
    </>
  );

  const baseClassName = cn(
    "flex items-center gap-3 rounded-xl text-sm font-medium transition-all",
    collapsed ? "justify-center w-10 h-10 mx-auto" : "w-full px-3 py-3"
  );
  const className = isActive
    ? cn(baseClassName, "bg-gradient-to-r from-violet-500 to-pink-500 text-white")
    : baseClassName;

  const inlineStyle = !isActive
    ? { color: "var(--text-secondary)" }
    : undefined;

  if (item.href) {
    return (
      <div className="relative group">
        <Link href={item.href} className={className} style={inlineStyle} onClick={onNavigate}>
          {content}
        </Link>
        {collapsed && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover:block z-50 pointer-events-none">
            <div className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-white bg-gray-900 shadow-lg">
              {item.label}
              {item.badge && <span className="ml-1.5 opacity-75">({item.badge})</span>}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative group">
      <button onClick={() => { item.onClick?.(); onNavigate?.(); }} className={className} style={inlineStyle}>
        {content}
      </button>
      {collapsed && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover:block z-50 pointer-events-none">
          <div className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-white bg-gray-900 shadow-lg">
            {item.label}
          </div>
        </div>
      )}
    </div>
  );
}

export function Sidebar({
  items,
  title = "Menu",
  mobileOpen = false,
  onMobileClose,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, activeRole } = useAuth();
  const { unreadCount } = useNotifications();
  const { t } = useTranslation();
  const roleMeta = ROLE_METADATA[activeRole];

  const isSettingsActive = pathname === "/parametres";
  const isNotificationsActive = pathname === "/notifications";
  const isAdminActive = pathname.startsWith("/administration");

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* User info — full mode */}
      {user && !collapsed && (
        <div className="border-b p-4" style={{ borderColor: "var(--border)" }}>
          <div className="text-sm font-semibold text-[var(--text-primary)]">
            {user.identitePublique?.modeVisibilite === "pseudonyme"
              ? user.identitePublique.pseudonyme || user.username
              : user.identitePublique?.modeVisibilite === "anonyme"
              ? `Citoyen #${user.id.slice(-6)}`
              : `${user.prenom || ""} ${user.nom || ""}`.trim() || user.username}
          </div>
          <div className="text-xs text-[var(--text-muted)]">@{user.username}</div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: roleMeta.color }} />
            <span className="text-xs font-medium" style={{ color: roleMeta.color }}>{roleMeta.label}</span>
          </div>
        </div>
      )}

      {/* User info — collapsed mode: just role dot */}
      {user && collapsed && (
        <div className="flex justify-center py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: roleMeta.color }} title={roleMeta.label} />
        </div>
      )}

      {/* Navigation */}
      <div className={cn("flex-1", collapsed ? "p-2" : "p-5")}>
        {!collapsed && (
          <div className="mb-3 pl-3 text-[0.6875rem] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            {title}
          </div>
        )}
        <div className={cn("space-y-1", collapsed && "space-y-2")}>
          {items.map((item, index) => {
            const isActive = item.href ? pathname === item.href : false;
            if (item.permission) {
              return (
                <PermissionGate key={index} permission={item.permission}>
                  <SidebarLink item={item} isActive={isActive} collapsed={collapsed} onNavigate={onMobileClose} />
                </PermissionGate>
              );
            }
            return <SidebarLink key={index} item={item} isActive={isActive} collapsed={collapsed} onNavigate={onMobileClose} />;
          })}
        </div>
      </div>

      {/* Bottom: Notifications + Settings + Admin */}
      {activeRole !== "suspendu" && (
        <div className={cn("border-t space-y-1", collapsed ? "p-2" : "p-3")} style={{ borderColor: "var(--border)" }}>
          <SidebarLink
            item={{
              icon: Bell,
              label: t("nav.notifications"),
              href: "/notifications",
              badge: unreadCount > 0 ? String(unreadCount) : undefined,
              badgeVariant: "red" as const,
            }}
            isActive={isNotificationsActive}
            collapsed={collapsed}
            onNavigate={onMobileClose}
          />
          <SidebarLink
            item={{ icon: Settings, label: t("nav.settings"), href: "/parametres" }}
            isActive={isSettingsActive}
            collapsed={collapsed}
            onNavigate={onMobileClose}
          />
          <PermissionGate permission="access_admin_panel" hide>
            <SidebarLink
              item={{ icon: Shield, label: "Administration", href: "/administration" }}
              isActive={isAdminActive}
              collapsed={collapsed}
              onNavigate={onMobileClose}
            />
          </PermissionGate>
        </div>
      )}

      {/* Collapse toggle — desktop only */}
      {onToggleCollapse && (
        <div className="border-t p-2" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={onToggleCollapse}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--bg-elevated)]"
            style={{ color: "var(--text-muted)" }}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && <span>Reduire</span>}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile sidebar overlay — visible < lg */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm backdrop-fade-in" onClick={onMobileClose} />
          <aside
            className="sidebar-slide-in absolute bottom-0 left-0 top-0 w-[280px] max-w-[85vw] overflow-y-auto border-r"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
            role="navigation"
            aria-label={title}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 text-sm font-extrabold text-white">Ѵ</div>
                <span className="bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-base font-bold text-transparent">VITA</span>
              </div>
              <button onClick={onMobileClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]">
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Main modules navigation — mobile only */}
            <div className="border-b px-3 py-3" style={{ borderColor: "var(--border)" }} data-tour="sidebar">
              <div className="mb-2 pl-3 text-[0.6875rem] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Modules
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {MAIN_MODULES.map((mod) => {
                  const Icon = mod.icon;
                  const isActive = pathname.startsWith(mod.path);
                  return (
                    <Link
                      key={mod.id}
                      href={mod.path}
                      onClick={onMobileClose}
                      data-tour={mod.id}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-xs font-medium transition-all",
                        isActive
                          ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {mod.label}
                    </Link>
                  );
                })}
              </div>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop/Tablet sidebar — visible >= lg */}
      <aside
        className={cn(
          "hidden lg:block shrink-0 overflow-y-auto border-r transition-all duration-200",
          collapsed ? "w-16" : "w-64"
        )}
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
        role="navigation"
        aria-label={title}
        data-tour="sidebar"
      >
        {sidebarContent}
      </aside>
    </>
  );
}
