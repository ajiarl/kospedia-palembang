import MapViewClient from "@/components/shared/MapViewClient";
import Link from "next/link";
import { notFound } from "next/navigation";

import FavoritButton from "@/components/shared/FavoritButton";
import KosFoto from "@/components/shared/KosFoto";
import ReviewForm from "@/components/shared/ReviewForm";
import { getCurrentUser } from "@/lib/auth";
import { formatRupiah } from "@/lib/utils";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { KosDetail } from "@/types/kos";


type Params = Promise<{ id: string }>;

// Mapping fasilitas → SVG path (sama dengan KosCard)
const fasilitasIconMap: { pattern: RegExp; path: string; label?: string }[] = [
  { pattern: /wi.?fi|internet/i, path: "M1.41 1.41A19.94 19.94 0 0 0 2 20l2-2a16.94 16.94 0 0 1-.5-14.09L1.41 1.41zm4.24 4.25A13.97 13.97 0 0 0 4 12.01L6 14a11.98 11.98 0 0 1 1.64-7.35L5.65 5.66zm4.24 4.25A8 8 0 0 0 9 12l2 2a6 6 0 0 1 .64-3.1l-1.75-1.99zM12 20a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm7.77-14.34A19.94 19.94 0 0 1 22 12l-2-2a17 17 0 0 0-3.41-10.24l1.18-1.1zm-4.24 4.25A11.98 11.98 0 0 1 17 14l-2-2a9.98 9.98 0 0 0-1.32-5.35l1.85-1.74z" },
  { pattern: /\bac\b|pendingin/i, path: "M17 7H7v10h10V7zm-5 9a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" },
  { pattern: /parkir/i, path: "M5 2h14a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm4 5v10h2v-4h3a3 3 0 0 0 0-6H9zm2 4V9h3a1 1 0 0 1 0 2h-3z" },
  { pattern: /dapur|kitchen/i, path: "M6.5 3a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5h-11zM3 7h18v14H3V7zm2 2v10h14V9H5z" },
  { pattern: /kasur|tempat.?tidur|bed/i, path: "M2 12h20M2 7h3a3 3 0 0 1 3 3v2H2V7zm17 0h3v5H16v-2a3 3 0 0 1 3-3zM2 17h20v4H2v-4z" },
  { pattern: /lemari|wardrobe/i, path: "M5 2h14a2 2 0 0 1 2 2v18H3V4a2 2 0 0 1 2-2zM3 20h18M12 2v18M8 10v4M16 10v4" },
  { pattern: /listrik|token/i, path: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" },
  { pattern: /air|shower|kamar.?mandi|km/i, path: "M12 2C6 10 4 14 4 18a8 8 0 0 0 16 0c0-4-2-8-8-16zM9 18a3 3 0 0 1-3-3" },
  { pattern: /\btv\b|televisi/i, path: "M2 7h20v15H2V7zM7 3l5 4 5-4" },
  { pattern: /laundry|cuci|laundri/i, path: "M12 2a9 9 0 0 1 9 9c0 4.2-2.9 7.7-6.8 8.7L12 22l-2.2-2.3C5.9 18.7 3 15.2 3 11A9 9 0 0 1 12 2zm0 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" },
  { pattern: /mushola|masjid/i, path: "M12 2L2 7v2h20V7L12 2zM4 9v10h16V9M8 9v10M16 9v10M12 9v10" },
];

function getFasilitasIcon(nama: string): string {
  for (const item of fasilitasIconMap) {
    if (item.pattern.test(nama)) return item.path;
  }
  // default: checkmark
  return "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z";
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          viewBox="0 0 20 20"
          className={`h-4 w-4 ${star <= Math.round(value) ? "fill-amber-400" : "fill-muted stroke-muted-foreground/30"}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-sm font-semibold">{value.toFixed(1)}</span>
    </div>
  );
}

// WhatsApp icon SVG
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default async function HalamanDetailKos({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("kos")
    .select(
      "*, kampus:kampus_id(id, nama, slug, lat, lng), review(id, rating, komentar, created_at)"
    )
    .eq("id", id)
    .eq("tersedia", true)
    .single();

  if (error || !data) {
    notFound();
  }

  const kos = data as KosDetail;
  const harga =
    kos.harga_min === kos.harga_max
      ? formatRupiah(kos.harga_min)
      : `${formatRupiah(kos.harga_min)} – ${formatRupiah(kos.harga_max)}`;

  const averageRating =
    kos.review.length > 0
      ? kos.review.reduce((t, r) => t + r.rating, 0) / kos.review.length
      : null;

  const whatsappUrl = `https://wa.me/${kos.kontak}?text=${encodeURIComponent(
    `Halo, saya tertarik dengan ${kos.nama} yang saya lihat di KosPedia Palembang.`
  )}`;

  const mapMarkers = [
    {
      id: kos.id,
      nama: kos.nama,
      alamat: kos.alamat,
      lat: kos.lat,
      lng: kos.lng,
      type: "kos" as const,
    },
    ...(kos.kampus
      ? [
          {
            id: kos.kampus.id,
            nama: kos.kampus.nama,
            lat: kos.kampus.lat,
            lng: kos.kampus.lng,
            type: "kampus" as const,
          },
        ]
      : []),
  ];

  return (
    <div className="container py-8">
      {/* Breadcrumb — truncate aman di mobile */}
      <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="shrink-0 hover:text-foreground transition-colors">Beranda</Link>
        <span>/</span>
        <Link href="/kos" className="shrink-0 hover:text-foreground transition-colors">Cari Kos</Link>
        {kos.kampus && (
          <>
            <span>/</span>
            <Link
              href={`/kos?kampus=${kos.kampus.slug}`}
              className="max-w-[120px] truncate hover:text-foreground transition-colors sm:max-w-none"
              title={kos.kampus.nama}
            >
              {kos.kampus.nama}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="max-w-[120px] truncate font-semibold text-foreground sm:max-w-xs" title={kos.nama}>
          {kos.nama}
        </span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <main className="space-y-6">
          {/* Foto + Info Utama */}
          <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="relative h-72">
              <KosFoto foto={kos.foto} nama={kos.nama} jenis={kos.jenis} className="h-full w-full" />
              <span className="absolute left-4 top-4 rounded-full bg-card/95 px-3 py-1 text-xs font-bold capitalize shadow-sm">
                {kos.jenis}
              </span>
            </div>
            <div className="space-y-4 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-primary">{kos.kampus?.nama ?? "Area Palembang"}</p>
                  <h1 className="mt-1 text-3xl font-black">{kos.nama}</h1>
                  <p className="mt-1 text-muted-foreground">{kos.alamat}</p>
                </div>
                <FavoritButton kosId={kos.id} />
              </div>
              {averageRating && <StarRating value={averageRating} />}
              <p className="text-muted-foreground">{kos.deskripsi}</p>
            </div>
          </section>

          {/* Fasilitas — grid dengan ikon */}
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-bold">Fasilitas</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {kos.fasilitas.map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-2.5 rounded-lg bg-muted/60 px-3 py-2.5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 text-primary"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={getFasilitasIcon(f)} />
                    </svg>
                  </div>
                  <span className="text-xs font-medium leading-tight">{f}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Lokasi */}
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-bold">Lokasi</h2>
            <div className="mt-4">
              <MapViewClient
                center={[kos.lat, kos.lng]}
                zoom={15}
                markers={mapMarkers}
                className="h-80"
              />
            </div>
          </section>

          {/* Review */}
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold">Review Mahasiswa</h2>
              {averageRating ? (
                <StarRating value={averageRating} />
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada rating</p>
              )}
            </div>

            <div className="mt-4">
              <ReviewForm kosId={kos.id} isLoggedIn={Boolean(user)} />
            </div>

            <div className="mt-4 space-y-3">
              {kos.review.length > 0 ? (
                kos.review.map((review) => (
                  <div key={review.id} className="rounded-xl border bg-muted/30 p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        M
                      </div>
                      <div>
                        <p className="text-xs font-medium">Mahasiswa</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span className="ml-auto flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600">
                        <svg viewBox="0 0 20 20" className="h-3 w-3 fill-amber-400">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {review.rating}/5
                      </span>
                    </div>
                    {review.komentar && (
                      <p className="mt-2 text-sm text-foreground/80">{review.komentar}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Jadilah mahasiswa pertama yang memberi review untuk kos ini.
                </p>
              )}
            </div>
          </section>
        </main>

        {/* Sticky Sidebar Harga */}
        <aside className="h-fit rounded-xl border bg-card p-6 shadow-sm lg:sticky lg:top-24">
          <p className="text-sm text-muted-foreground">Harga mulai dari</p>
          <p className="mt-1 text-4xl font-black text-primary leading-none">{harga}</p>
          <p className="mt-1 text-sm text-muted-foreground">per bulan</p>

          <div className="mt-5 space-y-3 rounded-lg bg-muted/50 p-3 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Jenis</span>
              <span className="font-semibold capitalize">{kos.jenis}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Kampus</span>
              <span className="text-right font-semibold">{kos.kampus?.nama ?? "Palembang"}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Sumber data</span>
              <span className="font-semibold capitalize">{kos.sumber_data}</span>
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#1fba5a] active:scale-95"
          >
            <WhatsAppIcon />
            Hubungi Pemilik via WhatsApp
          </a>

          <Link
            href="/kos"
            className="mt-3 block rounded-xl border px-4 py-3 text-center text-sm font-medium text-muted-foreground transition hover:border-primary/40 hover:text-primary"
          >
            ← Kembali ke daftar kos
          </Link>
        </aside>
      </div>
    </div>
  );
}
