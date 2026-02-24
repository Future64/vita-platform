import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const buttonClasses =
    "mt-4 inline-block rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border py-16 px-6 text-center",
        className
      )}
      style={{ borderColor: "var(--border)" }}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bg-elevated)]">
        <Icon className="h-7 w-7 text-[var(--text-muted)]" />
      </div>
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-xs text-sm text-[var(--text-muted)]">
          {description}
        </p>
      )}
      {action && (
        action.href ? (
          <Link href={action.href} className={buttonClasses}>
            {action.label}
          </Link>
        ) : action.onClick ? (
          <button onClick={action.onClick} className={buttonClasses}>
            {action.label}
          </button>
        ) : null
      )}
    </div>
  );
}
