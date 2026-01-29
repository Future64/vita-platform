"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface SidebarItem {
  icon: LucideIcon;
  label: string;
  href?: string;
  badge?: string;
  badgeVariant?: "violet" | "pink" | "cyan" | "green" | "orange" | "red" | "yellow";
  onClick?: () => void;
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

export function Sidebar({ items, title = "Menu" }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-[var(--border)] bg-[var(--bg-card)] p-5 lg:block">
      <div className="mb-3 pl-3 text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        {title}
      </div>
      <div className="space-y-1">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.href ? pathname === item.href : false;

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

          const className = cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all",
            isActive
              ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white"
              : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
          );

          if (item.href) {
            return (
              <Link key={index} href={item.href} className={className}>
                {content}
              </Link>
            );
          }

          return (
            <button key={index} onClick={item.onClick} className={className}>
              {content}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
