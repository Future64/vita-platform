import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  variant: "violet" | "pink" | "cyan" | "green" | "orange";
  label: string;
  value: string | number;
  trend?: {
    value: string;
    direction: "up" | "down";
  };
  className?: string;
}

const variantStyles = {
  violet: {
    card: "bg-gradient-to-br from-violet-500/15 to-violet-500/5 border-violet-500/20",
    glow: "bg-violet-500",
    text: "text-violet-400",
  },
  pink: {
    card: "bg-gradient-to-br from-pink-500/15 to-pink-500/5 border-pink-500/20",
    glow: "bg-pink-500",
    text: "text-pink-400",
  },
  cyan: {
    card: "bg-gradient-to-br from-cyan-500/15 to-cyan-500/5 border-cyan-500/20",
    glow: "bg-cyan-500",
    text: "text-cyan-400",
  },
  green: {
    card: "bg-gradient-to-br from-green-500/15 to-green-500/5 border-green-500/20",
    glow: "bg-green-500",
    text: "text-green-400",
  },
  orange: {
    card: "bg-gradient-to-br from-orange-500/15 to-orange-500/5 border-orange-500/20",
    glow: "bg-orange-500",
    text: "text-orange-400",
  },
};

export function StatCard({ variant, label, value, trend, className }: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-5",
        styles.card,
        className
      )}
    >
      {/* Glow effect */}
      <div
        className={cn(
          "absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-30 blur-[40px]",
          styles.glow
        )}
      />

      {/* Content */}
      <div className="relative">
        <p className="mb-2 text-xs font-medium text-[var(--text-secondary)]">
          {label}
        </p>
        <p className="text-[1.75rem] font-bold text-[var(--text-primary)]">
          {value}
        </p>
        {trend && (
          <span
            className={cn(
              "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              trend.direction === "up"
                ? "bg-green-500/15 text-green-500"
                : "bg-red-500/15 text-red-500"
            )}
          >
            {trend.direction === "up" ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
