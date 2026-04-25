import KosCardSkeleton from "@/components/shared/KosCardSkeleton";

export default function FavoritLoading() {
  return (
    <div className="container py-8">
      <div className="mb-6 space-y-2">
        <div className="h-3 w-32 rounded-md skeleton-shimmer" />
        <div className="h-8 w-44 rounded-md skeleton-shimmer" />
        <div className="h-4 w-64 rounded-md skeleton-shimmer" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <KosCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
