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
  Sun,
  Moon,
  Menu,
  Settings,
  LogOut,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
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

interface TopNavProps {
  onOpenMobileSidebar?: () => void;
  onOpenSearch?: () => void;
}

export function TopNav({ onOpenMobileSidebar, onOpenSearch }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, activeRole } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  const currentModule = modules.find((m) => pathname.startsWith(m.path))?.id;

  const mode = user?.identitePublique?.modeVisibilite;
  let initials = "??";
  let displayName = "";
  if (user) {
    switch (mode) {
      case "pseudonyme":
        displayName = user.identitePublique?.pseudonyme || user.username;
        initials = displayName.slice(0, 2).toUpperCase();
        break;
      case "anonyme":
        displayName = `Citoyen #${user.id.slice(-6)}`;
        initials = "??";
        break;
      default:
        // "complet" or missing identitePublique (legacy data)
        initials = `${(user.prenom || "?").charAt(0)}${(user.nom || "?").charAt(0)}`.toUpperCase();
        displayName = `${user.prenom || ""} ${user.nom || ""}`.trim() || user.username;
        break;
    }
  }

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
    <nav className="sticky top-0 z-50 h-14 md:h-16 border-b border-[var(--border)] backdrop-blur-xl" style={{ backgroundColor: "color-mix(in srgb, var(--bg-card) 92%, transparent)" }} role="navigation" aria-label="Navigation principale">
      <div className="flex h-full items-center justify-between px-3 md:px-4 lg:px-6">
        {/* Left: Menu + Logo + Nav */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile menu button — opens sidebar drawer */}
          <button
            onClick={() => onOpenMobileSidebar?.()}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] lg:hidden"
            aria-label={t("nav.openMenu")}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link href="/panorama" className="flex items-center gap-2 md:gap-3">
            <div className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 text-sm md:text-base font-extrabold text-white">
              Ѵ
            </div>
            <span className="hidden xs:inline bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-lg font-bold text-transparent">
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
                  data-tour={module.id}
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

        {/* Right: Search + RoleSimulator + Theme + Notifications + Avatar */}
        <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
          {/* Search bar — desktop */}
          <button
            onClick={() => onOpenSearch?.()}
            data-tour="recherche"
            className="hidden lg:flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-sm text-[var(--text-muted)] transition-colors hover:border-violet-500/50 hover:text-[var(--text-secondary)] w-48 xl:w-64"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left truncate">Rechercher...</span>
            <kbd className="rounded border border-[var(--border)] bg-[var(--bg-card)] px-1.5 py-0.5 text-[0.625rem] font-mono text-[var(--text-muted)]">
              ⌘K
            </kbd>
          </button>

          {/* Search icon — tablet/mobile */}
          <button
            onClick={() => onOpenSearch?.()}
            className="flex lg:hidden h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
            aria-label="Rechercher"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Role Simulator (dieu only — hidden on mobile via RoleSimulator's own hidden md:block) */}
          <RoleSimulator />

          {/* Theme Toggle */}
          <div className="flex rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-0.5 md:p-1" data-tour="theme">
            <button
              onClick={() => {
                setTheme("light");
                document.documentElement.setAttribute("data-theme", "light");
              }}
              className={cn(
                "flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-md transition-all",
                theme === "light"
                  ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              )}
            >
              <Sun className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </button>
            <button
              onClick={() => {
                setTheme("dark");
                document.documentElement.setAttribute("data-theme", "dark");
              }}
              className={cn(
                "flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-md transition-all",
                theme === "dark"
                  ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              )}
            >
              <Moon className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </button>
          </div>

          {/* Notifications */}
          <NotificationCenter />

          {/* Avatar + Dropdown */}
          <div className="relative" ref={avatarMenuRef} data-tour="profil">
            <button
              onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
              className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-xs md:text-sm font-semibold text-white transition-transform hover:scale-105"
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
                    {displayName}
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
  );
}
