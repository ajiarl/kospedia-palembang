import Link from "next/link";

import FavoritButton from "@/components/shared/FavoritButton";
import { formatRupiah } from "@/lib/utils";
import type { KosWithKampus } from "@/types/kos";

export default function KosCard({ kos }: { kos: KosWithKampus }) {
  const harga =
    kos.harga_min === kos.harga_max
      ? formatRupiah(kos.harga_min)
      : `${formatRupiah(kos.harga_min)} - ${formatRupiah(kos.harga_max)}`;

  return (
    <article className="overflow-hidden rounded-lg border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/kos/${kos.id}`} className="block">
        <div className="flex h-40 items-center justify-center bg-gradient-to-br from-primary-50 via-white to-muted">
          <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm">
            {kos.jenis.toUpperCase()}
          </div>
        </div>
      </Link>

      <div className="space-y-4 p-4">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-3">
            <Link
              href={`/kos/${kos.id}`}
              className="line-clamp-2 text-lg font-semibold hover:text-primary"
            >
              {kos.nama}
            </Link>
            <FavoritButton kosId={kos.id} />
          </div>
          <p className="text-sm text-muted-foreground">{kos.kampus?.nama ?? "Area Palembang"}</p>
          <p className="line-clamp-2 text-sm text-muted-foreground">{kos.alamat}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {kos.fasilitas.slice(0, 4).map((fasilitas) => (
            <span
              key={fasilitas}
              className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
            >
              {fasilitas}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t pt-4">
          <p className="text-sm">
            <span className="font-bold text-primary">{harga}</span>
            <span className="text-muted-foreground"> / bulan</span>
          </p>
          <Link
            href={`/kos/${kos.id}`}
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition hover:bg-primary-600"
          >
            Detail
          </Link>
        </div>
      </div>
    </article>
  );
}
