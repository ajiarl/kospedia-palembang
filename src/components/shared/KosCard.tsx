import Link from "next/link";

import FavoritButton from "@/components/shared/FavoritButton";
import KosFoto from "@/components/shared/KosFoto";
import { getFasilitasIcon } from "@/lib/fasilitas";
import { haversineKm, formatJarak } from "@/lib/haversine";
import { getKosPath } from "@/lib/kos";
import { formatRupiah } from "@/lib/utils";
import type { KosWithKampus, KosWithLocationMeta } from "@/types/kos";

// Jenis badge - Charcoal+Coral palette
const jenisColors = {
  putra: "bg-[#FDEBD6] text-[#882E1B]",
  putri: "bg-[#EDF3F0] text-[#243D33]",
  campur: "bg-[#F5F0EB] text-[#5C4A3A]",
};

export default function KosCard({
  kos,
  averageRating,
  jarakFilterLabel,
}: {
  kos: KosWithLocationMeta<KosWithKampus>;
  averageRating?: number | null;
  jarakFilterLabel?: string | null;
}) {
  const kosPath = getKosPath(kos);
  const harga =
    kos.harga_min === kos.harga_max
      ? formatRupiah(kos.harga_min)
      : `${formatRupiah(kos.harga_min)} - ${formatRupiah(kos.harga_max)}`;

  const jarak = kos.kampus && kos.locationMeta.isDistanceReliable
    ? formatJarak(haversineKm(kos.lat, kos.lng, kos.kampus.lat, kos.kampus.lng))
    : null;

  return (
    <article className="group surface-panel overflow-hidden rounded-[1.6rem] border border-white/80 shadow-[0_16px_36px_rgba(17,17,16,0.07)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_54px_rgba(17,17,16,0.12)]">
      <Link href={kosPath} className="relative block h-52 overflow-hidden">
        <KosFoto foto={kos.foto} nama={kos.nama} jenis={kos.jenis} className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 transition-opacity duration-300 group-hover:opacity-80" />

        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold capitalize shadow-sm ${jenisColors[kos.jenis]}`}
        >
          {kos.jenis}
        </span>

        {averageRating != null && (
          <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-amber-600 shadow-sm">
            <svg viewBox="0 0 20 20" className="h-3 w-3 fill-amber-400" aria-hidden="true">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {averageRating.toFixed(1)}
          </span>
        )}

        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
          <div className="rounded-full bg-black/45 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            {kos.kampus?.nama ?? "Area Palembang"}
          </div>
          {jarak ? (
            <div className="rounded-full bg-white/92 px-3 py-1.5 text-xs font-semibold text-charcoal shadow-sm">
              ~{jarak}
            </div>
          ) : null}
        </div>
      </Link>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={kosPath} className="line-clamp-2 text-lg font-semibold leading-snug text-charcoal hover:text-primary">
              {kos.nama}
            </Link>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{kos.alamat}</p>
            {kos.locationMeta.precision !== "exact" ? (
              <p className="mt-2 text-xs text-muted-foreground">{kos.locationMeta.note}</p>
            ) : null}
            {jarak && jarakFilterLabel ? (
              <p className="mt-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Masuk filter jarak {jarakFilterLabel}
              </p>
            ) : null}
          </div>
          <FavoritButton kosId={kos.id} />
        </div>

        {kos.fasilitas.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {kos.fasilitas.slice(0, 4).map((f) => {
              const iconPath = getFasilitasIcon(f);
              return (
                <span
                  key={f}
                  className="flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1.5 text-xs text-muted-foreground ring-1 ring-black/5"
                >
                  {iconPath && (
                    <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d={iconPath} />
                    </svg>
                  )}
                  {f}
                </span>
              );
            })}
            {kos.fasilitas.length > 4 && (
              <span className="rounded-full bg-white/80 px-2.5 py-1.5 text-xs text-muted-foreground ring-1 ring-black/5">
                +{kos.fasilitas.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-black/5 pt-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Harga per bulan
            </p>
            <p className="mt-1 text-sm">
              <span className="font-bold text-primary">{harga}</span>
            </p>
          </div>
          <Link
            href={kosPath}
            className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-600"
          >
            Detail
          </Link>
        </div>
      </div>
    </article>
  );
}
