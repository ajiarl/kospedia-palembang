import Link from "next/link";

import FavoritButton from "@/components/shared/FavoritButton";
import KosFoto from "@/components/shared/KosFoto";
import { getFasilitasIcon } from "@/lib/fasilitas";
import { haversineKm, formatJarak } from "@/lib/haversine";
import { getKosPath } from "@/lib/kos";
import { formatRupiah } from "@/lib/utils";
import type { KosWithKampus } from "@/types/kos";

// Jenis badge - Charcoal+Coral palette
const jenisColors = {
  putra: "bg-[#FDEBD6] text-[#882E1B]",
  putri: "bg-[#EDF3F0] text-[#243D33]",
  campur: "bg-[#F5F0EB] text-[#5C4A3A]",
};

export default function KosCard({
  kos,
  averageRating,
}: {
  kos: KosWithKampus;
  averageRating?: number | null;
}) {
  const kosPath = getKosPath(kos);
  const harga =
    kos.harga_min === kos.harga_max
      ? formatRupiah(kos.harga_min)
      : `${formatRupiah(kos.harga_min)} - ${formatRupiah(kos.harga_max)}`;

  const jarak = kos.kampus
    ? formatJarak(haversineKm(kos.lat, kos.lng, kos.kampus.lat, kos.kampus.lng))
    : null;

  return (
    <article className="group overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={kosPath} className="relative block h-44 overflow-hidden">
        <KosFoto foto={kos.foto} nama={kos.nama} jenis={kos.jenis} className="h-full w-full" />

        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${jenisColors[kos.jenis]}`}
        >
          {kos.jenis}
        </span>

        {averageRating != null && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-xs font-bold text-amber-600 shadow-sm">
            <svg viewBox="0 0 20 20" className="h-3 w-3 fill-amber-400">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {averageRating.toFixed(1)}
          </span>
        )}
      </Link>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={kosPath} className="line-clamp-2 text-base font-semibold leading-snug hover:text-primary">
              {kos.nama}
            </Link>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {kos.kampus?.nama ?? "Area Palembang"}
              {jarak && <span className="ml-1.5 text-xs text-primary/80">- ~{jarak}</span>}
            </p>
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{kos.alamat}</p>
          </div>
          <FavoritButton kosId={kos.id} />
        </div>

        {kos.fasilitas.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {kos.fasilitas.slice(0, 4).map((f) => {
              const iconPath = getFasilitasIcon(f);
              return (
                <span key={f} className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                  {iconPath && (
                    <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={iconPath} />
                    </svg>
                  )}
                  {f}
                </span>
              );
            })}
            {kos.fasilitas.length > 4 && (
              <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">+{kos.fasilitas.length - 4}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t pt-3">
          <p className="text-sm">
            <span className="font-bold text-primary">{harga}</span>
            <span className="text-muted-foreground"> / bulan</span>
          </p>
          <Link href={kosPath} className="rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-white transition hover:bg-primary-600">
            Detail
          </Link>
        </div>
      </div>
    </article>
  );
}
