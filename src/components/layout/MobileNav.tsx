"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame,
  GitBranch,
  BookOpen,
  Globe,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "panorama", label: "Panorama", icon: Globe, path: "/panorama" },
  { id: "agora", label: "Agora", icon: Flame, path: "/agora" },
  { id: "bourse", label: "Bourse", icon: Wallet, path: "/bourse" },
  { id: "forge", label: "Forge", icon: GitBranch, path: "/forge" },
  { id: "codex", label: "Codex", icon: BookOpen, path: "/codex" },
];

export function MobileNav() {
  const pathname = usePathname();
  const currentTab = tabs.find((t) => pathname.startsWith(t.path))?.id;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] lg:hidden"
      style={{
        backgroundColor: "color-mix(in srgb, var(--bg-card) 92%, transparent)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
      role="navigation"
      aria-label="Navigation mobile"
    >
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 min-w-0 flex-1 transition-colors",
                isActive
                  ? "text-violet-500"
                  : "text-[var(--text-muted)]"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="text-[0.625rem] font-medium leading-tight truncate">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
