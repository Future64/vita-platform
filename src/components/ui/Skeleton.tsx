import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-lg skeleton-shimmer",
        className
      )}
      aria-busy="true"
      aria-label="Chargement"
    />
  );
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)} aria-busy="true" aria-label="Chargement du texte">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-5",
        className
      )}
      style={{ borderColor: "var(--border)" }}
      aria-busy="true"
      aria-label="Chargement de la carte"
    >
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="mb-3 h-5 w-3/4" />
      <SkeletonText lines={2} />
      <div className="mt-4 flex gap-3">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonAvatar({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  };

  return (
    <Skeleton
      className={cn("rounded-full", sizeClasses[size], className)}
    />
  );
}

export function SkeletonPanorama() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Chargement du tableau de bord">
      {/* Balance card */}
      <div
        className="rounded-xl border p-6"
        style={{ borderColor: "rgba(139, 92, 246, 0.2)" }}
      >
        <Skeleton className="mb-3 h-4 w-28" />
        <Skeleton className="h-10 w-44 rounded-lg" />
      </div>

      {/* Stat cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border p-4"
            style={{ borderColor: "var(--border)" }}
          >
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <SkeletonAvatar size="md" />
            <div className="flex-1">
              <Skeleton className="mb-1.5 h-4 w-2/5" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
