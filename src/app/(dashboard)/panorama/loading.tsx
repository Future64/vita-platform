import { Skeleton, SkeletonCard, SkeletonText } from "@/components/ui/Skeleton";

export default function PanoramaLoading() {
  return (
    <div className="min-h-screen p-4 md:p-6" style={{ backgroundColor: "var(--bg-base)" }}>
      {/* Header */}
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Stats grid */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Map placeholder */}
      <Skeleton className="mb-6 h-[400px] w-full rounded-xl" />

      {/* Bottom grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
