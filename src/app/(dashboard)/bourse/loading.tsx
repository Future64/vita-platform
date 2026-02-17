import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

export default function BourseLoading() {
  return (
    <div className="min-h-screen p-4 md:p-6" style={{ backgroundColor: "var(--bg-base)" }}>
      {/* Header */}
      <div className="mb-6">
        <Skeleton className="h-8 w-36 mb-2" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Balance card */}
      <div className="mb-6 rounded-xl border p-6" style={{ borderColor: "var(--border)" }}>
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-10 w-40 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
