import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ListItemProps {
  icon: LucideIcon;
  iconVariant?: "violet" | "green" | "cyan" | "orange" | "pink";
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const iconVariants = {
  violet: "bg-violet-500/15 text-violet-500",
  green: "bg-green-500/15 text-green-500",
  cyan: "bg-cyan-500/15 text-cyan-500",
  orange: "bg-orange-500/15 text-orange-500",
  pink: "bg-pink-500/15 text-pink-500",
};

export function ListItem({
  icon: Icon,
  iconVariant = "violet",
  title,
  subtitle,
  rightContent,
  onClick,
  className,
}: ListItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl bg-[var(--bg-elevated)] p-3.5 transition-all",
        onClick && "cursor-pointer hover:bg-[var(--bg-card-hover)]",
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          iconVariants[iconVariant]
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--text-primary)]">
          {title}
        </p>
        {subtitle && (
          <p className="truncate text-xs text-[var(--text-muted)]">{subtitle}</p>
        )}
      </div>

      {/* Right content */}
      {rightContent && <div className="shrink-0">{rightContent}</div>}
    </div>
  );
}
