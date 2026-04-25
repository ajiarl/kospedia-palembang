import KosCardSkeleton from "@/components/shared/KosCardSkeleton";

export default function KosLoading() {
  return (
    <div className="container py-8">
      {/* Page heading skeleton */}
      <div className="mb-6 space-y-2">
        <div className="h-3 w-48 rounded-md skeleton-shimmer" />
        <div className="h-8 w-32 rounded-md skeleton-shimmer" />
        <div className="h-4 w-80 rounded-md skeleton-shimmer" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Filter sidebar skeleton */}
        <div className="h-96 rounded-xl skeleton-shimmer" />

        {/* Grid skeleton */}
        <div className="space-y-4">
          <div className="h-5 w-32 rounded-md skeleton-shimmer" />
          {/* Map skeleton */}
          <div className="h-80 rounded-xl skeleton-shimmer" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <KosCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
