"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Flame, 
  GitBranch, 
  BookOpen, 
  User, 
  Globe, 
  Bell, 
  Sun, 
  Moon,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const modules = [
  { id: "agora", label: "Agora", icon: Flame, path: "/agora" },
  { id: "forge", label: "Forge", icon: GitBranch, path: "/forge" },
  { id: "codex", label: "Codex", icon: BookOpen, path: "/codex" },
  { id: "civis", label: "Civis", icon: User, path: "/civis" },
  { id: "panorama", label: "Panorama", icon: Globe, path: "/panorama" },
];

export function TopNav() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const currentModule = modules.find((m) => pathname.startsWith(m.path))?.id;

  return (
    <>
      <nav className="sticky top-0 z-50 h-16 border-b border-[var(--border)] bg-[var(--bg-card)] dark:bg-[rgba(17,24,39,0.95)] dark:backdrop-blur-xl">
        <div className="flex h-full items-center justify-between px-4 md:px-6">
          {/* Left: Menu + Logo + Nav */}
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] lg:hidden"
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

          {/* Right: Theme + Notifications + Avatar */}
          <div className="flex items-center gap-3 md:gap-4">
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
            <button className="relative flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[0.625rem] font-semibold text-white">
                5
              </span>
            </button>

            {/* Avatar */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-sm font-semibold text-white">
              JD
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200]">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute bottom-0 left-0 top-0 w-[300px] max-w-[90vw] overflow-y-auto border-r border-[var(--border)] bg-[var(--bg-card)] p-5">
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
            </div>
          </div>
        </div>
      )}
    </>
  );
}
