"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Flame,
  GitBranch,
  BookOpen,
  User,
  Globe,
  Wallet,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { ROLE_METADATA } from "@/lib/permissions";
import { RoleSimulator } from "./RoleSimulator";
import { NotificationCenter } from "./NotificationCenter";
import { useToast } from "@/components/ui/Toast";
import { useTranslation } from "@/lib/i18n";

const modules = [
  { id: "agora", label: "Agora", icon: Flame, path: "/agora" },
  { id: "forge", label: "Forge", icon: GitBranch, path: "/forge" },
  { id: "codex", label: "Codex", icon: BookOpen, path: "/codex" },
  { id: "civis", label: "Civis", icon: User, path: "/civis" },
  { id: "bourse", label: "Bourse", icon: Wallet, path: "/bourse" },
  { id: "panorama", label: "Panorama", icon: Globe, path: "/panorama" },
];

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, activeRole } = useAuth();
  const { unreadCount } = useNotifications();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  const currentModule = modules.find((m) => pathname.startsWith(m.path))?.id;

  const initials = user
    ? `${user.prenom.charAt(0)}${user.nom.charAt(0)}`.toUpperCase()
    : "??";

  const roleMeta = ROLE_METADATA[activeRole];

  // Close avatar menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false);
      }
    }
    if (avatarMenuOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [avatarMenuOpen]);

  function handleLogout() {
    setAvatarMenuOpen(false);
    logout();
    toast.info("Vous avez ete deconnecte");
    router.push("/auth/connexion");
  }

  return (
    <>
      <nav className="sticky top-0 z-50 h-16 border-b border-[var(--border)] backdrop-blur-xl" style={{ backgroundColor: "color-mix(in srgb, var(--bg-card) 92%, transparent)" }} role="navigation" aria-label="Navigation principale">
        <div className="flex h-full items-center justify-between px-4 md:px-6">
          {/* Left: Menu + Logo + Nav */}
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] lg:hidden"
              aria-label={t("nav.openMenu")}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo */}
            <Link href="/panorama" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 text-base font-extrabold text-white">
                Ѵ
              </div>
              <span className="bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-lg font-bold text-transparent">
                VITA
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-1 lg:flex">
              {modules.map((module) => {
                const Icon = module.icon;
                const isActive = currentModule === module.id;
                return (
                  <Link
                    key={module.id}
                    href={module.path}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all",
                      isActive
                        ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white"
                        : "text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    <Icon className="h-[1.125rem] w-[1.125rem]" />
                    {module.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: RoleSimulator + Theme + Notifications + Avatar */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Role Simulator (dieu only) */}
            <RoleSimulator />

            {/* Theme Toggle */}
            <div className="flex rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-1">
              <button
                onClick={() => {
                  setTheme("light");
                  document.documentElement.setAttribute("data-theme", "light");
                }}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md transition-all",
                  theme === "light"
                    ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                )}
              >
                <Sun className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setTheme("dark");
                  document.documentElement.setAttribute("data-theme", "dark");
                }}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md transition-all",
                  theme === "dark"
                    ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                )}
              >
                <Moon className="h-4 w-4" />
              </button>
            </div>

            {/* Notifications */}
            <NotificationCenter />

            {/* Avatar + Dropdown */}
            <div className="relative" ref={avatarMenuRef}>
              <button
                onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-sm font-semibold text-white transition-transform hover:scale-105"
                aria-label={t("nav.userMenu")}
                aria-expanded={avatarMenuOpen}
                aria-haspopup="true"
              >
                {initials}
              </button>

              {avatarMenuOpen && (
                <div
                  className="absolute right-0 top-12 z-50 w-64 rounded-xl border shadow-lg"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--bg-card)",
                  }}
                >
                  {/* User info */}
                  <div className="border-b p-4" style={{ borderColor: "var(--border)" }}>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">
                      {user?.prenom} {user?.nom}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      @{user?.username}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: roleMeta.color }}
                      />
                      <span className="text-xs font-medium" style={{ color: roleMeta.color }}>
                        {roleMeta.label}
                      </span>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="p-1.5">
                    <Link
                      href="/civis"
                      onClick={() => setAvatarMenuOpen(false)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                    >
                      <User className="h-4 w-4" />
                      {t("nav.profile")}
                    </Link>
                    <Link
                      href="/parametres"
                      onClick={() => setAvatarMenuOpen(false)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                    >
                      <Settings className="h-4 w-4" />
                      {t("nav.settings")}
                    </Link>
                  </div>

                  {/* Separator */}
                  <div className="mx-3 h-px" style={{ backgroundColor: "var(--border)" }} />

                  {/* Logout */}
                  <div className="p-1.5">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      {t("nav.logout")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true" aria-label="Menu de navigation" id="mobile-menu">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <nav className="absolute bottom-0 left-0 top-0 w-[300px] max-w-[90vw] overflow-y-auto border-r border-[var(--border)] bg-[var(--bg-card)] p-5" aria-label="Navigation mobile">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between border-b border-[var(--border)] pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 text-base font-extrabold text-white">
                  Ѵ
                </div>
                <span className="bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-lg font-bold text-transparent">
                  VITA
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
                aria-label={t("nav.closeMenu")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <div className="space-y-1">
              {modules.map((module) => {
                const Icon = module.icon;
                const isActive = currentModule === module.id;
                return (
                  <Link
                    key={module.id}
                    href={module.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-4 py-3.5 text-[0.9375rem] font-medium transition-all",
                      isActive
                        ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {module.label}
                  </Link>
                );
              })}

              {/* Notifications */}
              <Link
                href="/notifications"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-4 py-3.5 text-[0.9375rem] font-medium transition-all",
                  pathname === "/notifications"
                    ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                )}
              >
                <Bell className="h-5 w-5" />
                {t("nav.notifications")}
                {unreadCount > 0 && (
                  <span className="ml-auto rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-500">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
