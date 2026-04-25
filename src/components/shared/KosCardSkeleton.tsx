export default function KosCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Foto placeholder */}
      <div className="h-44 skeleton-shimmer" />

      <div className="space-y-3 p-4">
        {/* Nama & kampus */}
        <div className="space-y-2">
          <div className="h-4 w-3/4 rounded-md skeleton-shimmer" />
          <div className="h-3 w-1/2 rounded-md skeleton-shimmer" />
          <div className="h-3 w-2/3 rounded-md skeleton-shimmer" />
        </div>

        {/* Fasilitas chips */}
        <div className="flex gap-2">
          <div className="h-6 w-14 rounded-md skeleton-shimmer" />
          <div className="h-6 w-16 rounded-md skeleton-shimmer" />
          <div className="h-6 w-12 rounded-md skeleton-shimmer" />
        </div>

        {/* Harga & tombol */}
        <div className="flex items-center justify-between border-t pt-3">
          <div className="h-4 w-28 rounded-md skeleton-shimmer" />
          <div className="h-8 w-16 rounded-lg skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}
