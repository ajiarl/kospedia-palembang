import Link from "next/link";

import FavoritButton from "@/components/shared/FavoritButton";
import KosFoto from "@/components/shared/KosFoto";
import { haversineKm, formatJarak } from "@/lib/haversine";
import { formatRupiah } from "@/lib/utils";
import type { KosWithKampus } from "@/types/kos";

const fasilitasIcons: Record<string, string> = {
  wifi:   "M1.41 1.41A19.94 19.94 0 0 0 2 20l2-2a16.94 16.94 0 0 1-.5-14.09L1.41 1.41zm4.24 4.25A13.97 13.97 0 0 0 4 12.01L6 14a11.98 11.98 0 0 1 1.64-7.35L5.65 5.66zm4.24 4.25A8 8 0 0 0 9 12l2 2a6 6 0 0 1 .64-3.1l-1.75-1.99zM12 20a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm7.77-14.34A19.94 19.94 0 0 1 22 12l-2-2a17 17 0 0 0-3.41-10.24l1.18-1.1zm-4.24 4.25A11.98 11.98 0 0 1 17 14l-2-2a9.98 9.98 0 0 0-1.32-5.35l1.85-1.74z",
  ac:     "M17 7H7v10h10V7zm-5 9a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83",
  parkir: "M5 2h14a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm4 5v10h2v-4h3a3 3 0 0 0 0-6H9zm2 4V9h3a1 1 0 0 1 0 2h-3z",
  dapur:  "M6.5 3a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5h-11zM3 7h18v14H3V7zm2 2v10h14V9H5z",
  kasur:  "M2 12h20M2 7h3a3 3 0 0 1 3 3v2H2V7zm17 0h3v5H16v-2a3 3 0 0 1 3-3zM2 17h20v4H2v-4z",
  lemari: "M5 2h14a2 2 0 0 1 2 2v18H3V4a2 2 0 0 1 2-2zM3 20h18M12 2v18M8 10v4M16 10v4",
  listrik:"M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  air:    "M12 2C6 10 4 14 4 18a8 8 0 0 0 16 0c0-4-2-8-8-16z",
};

function getFasilitasIcon(nama: string): string | null {
  const n = nama.toLowerCase();
  if (/wi.?fi|internet/i.test(n))   return fasilitasIcons.wifi;
  if (/\bac\b|pendingin/i.test(n))  return fasilitasIcons.ac;
  if (/parkir/i.test(n))            return fasilitasIcons.parkir;
  if (/dapur/i.test(n))             return fasilitasIcons.dapur;
  if (/kasur|tempat.?tidur/i.test(n)) return fasilitasIcons.kasur;
  if (/lemari/i.test(n))            return fasilitasIcons.lemari;
  if (/listrik|token/i.test(n))     return fasilitasIcons.listrik;
  if (/air|shower|kamar.?mandi|km/i.test(n)) return fasilitasIcons.air;
  return null;
}

// Jenis badge — Charcoal+Coral palette
const jenisColors = {
  putra:  "bg-[#FDEBD6] text-[#882E1B]",
  putri:  "bg-[#EDF3F0] text-[#243D33]",
  campur: "bg-[#F5F0EB] text-[#5C4A3A]",
};

export default function KosCard({
  kos,
  averageRating,
}: {
  kos: KosWithKampus;
  averageRating?: number | null;
}) {
  const harga =
    kos.harga_min === kos.harga_max
      ? formatRupiah(kos.harga_min)
      : `${formatRupiah(kos.harga_min)} – ${formatRupiah(kos.harga_max)}`;

  const jarak = kos.kampus
    ? formatJarak(haversineKm(kos.lat, kos.lng, kos.kampus.lat, kos.kampus.lng))
    : null;

  return (
    <article className="group overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/kos/${kos.id}`} className="relative block h-44 overflow-hidden">
        <KosFoto foto={kos.foto} nama={kos.nama} jenis={kos.jenis} className="h-full w-full" />

        {/* Badge jenis */}
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${jenisColors[kos.jenis]}`}>
          {kos.jenis}
        </span>

        {/* Rating badge */}
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
            <Link href={`/kos/${kos.id}`} className="line-clamp-2 text-base font-semibold leading-snug hover:text-primary">
              {kos.nama}
            </Link>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {kos.kampus?.nama ?? "Area Palembang"}
              {jarak && <span className="ml-1.5 text-xs text-primary/80">• ~{jarak}</span>}
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
          <Link href={`/kos/${kos.id}`} className="rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-white transition hover:bg-primary-600">
            Detail
          </Link>
        </div>
      </div>
    </article>
  );
}
