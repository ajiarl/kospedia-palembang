import Link from "next/link";

import HeroSearch from "@/components/shared/HeroSearch";
import MapViewClient from "@/components/shared/MapViewClient";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { KampusRow } from "@/types/kos";

const statsItems = [
  { icon: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",      label: "150+ kos tersedia" },
  { icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z", label: "6 kampus" },
  { icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", label: "Gratis digunakan" },
];

// Earthy quick filter chips — tidak clash satu sama lain
const jenisChips = [
  { value: "putra",  label: "Kos Putra",  cls: "bg-white/15 text-white hover:bg-white/25" },
  { value: "putri",  label: "Kos Putri",  cls: "bg-white/15 text-white hover:bg-white/25" },
  { value: "campur", label: "Campur",     cls: "bg-white/15 text-white hover:bg-white/25" },
];

export default async function HalamanUtama() {
  const supabase = await createSupabaseServerClient();

  const [{ data: kampusData }, { data: kosData, count: kosCount }] = await Promise.all([
    supabase.from("kampus").select("*").order("nama"),
    supabase.from("kos").select("id, nama, alamat, lat, lng", { count: "exact" }).eq("tersedia", true).limit(50),
  ]);

  const daftarKampus = (kampusData ?? []) as KampusRow[];

  const mapMarkers = [
    ...(kosData ?? []).map((k) => ({
      id: k.id, nama: k.nama, alamat: k.alamat,
      lat: k.lat, lng: k.lng, href: `/kos/${k.id}`, type: "kos" as const,
    })),
    ...daftarKampus.map((k) => ({
      id: k.id, nama: k.nama, lat: k.lat, lng: k.lng, type: "kampus" as const,
    })),
  ];

  const kampusForSearch = daftarKampus.map((k) => ({ nama: k.nama, slug: k.slug }));

  return (
    <div>
      {/* ── Hero ── */}
      <section className="hero-pattern relative overflow-hidden py-14 md:py-20">
        {/* Overlay charcoal berlapis untuk kontras teks */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/75" />
        {/* Fade ke background body di bagian bawah */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

        <div className="container relative z-10 flex flex-col items-center gap-6 text-center">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-coral-400" />
            Platform kos mahasiswa Palembang
          </span>

          {/* Heading */}
          <h1 className="max-w-3xl text-5xl font-black text-white drop-shadow-lg md:text-6xl lg:text-7xl">
            Temukan Kos Terbaikmu{" "}
            <span className="text-coral-400">di Palembang</span>
          </h1>

          <p className="max-w-lg text-base text-white/85 drop-shadow md:text-lg">
            Dekat kampus, sesuai budget, langsung hubungi pemilik. Tanpa perantara.
          </p>

          <HeroSearch kampus={kampusForSearch} />

          {/* Filter cepat */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-medium text-white/50">Filter cepat:</span>
            {jenisChips.map((chip) => (
              <Link
                key={chip.value}
                href={`/kos?jenis=${chip.value}`}
                className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm transition-all hover:bg-white/25"
              >
                {chip.label}
              </Link>
            ))}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-1">
            {statsItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <svg className="h-4 w-4 text-coral-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d={item.icon} />
                </svg>
                <span className="text-sm font-medium text-white/90 drop-shadow">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── Map Preview ── */}
      <section className="container py-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">Peta Interaktif</p>
            <h2 className="text-2xl font-bold">Jelajahi Lokasi Kos</h2>
          </div>
          <Link href="/kos" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-600">
            Lihat semua kos
          </Link>
        </div>
        <MapViewClient markers={mapMarkers} className="h-72 md:h-96" />
        <p className="mt-3 text-center text-sm text-muted-foreground">
          {kosCount ?? 0} kos tersedia di {daftarKampus.length} kampus Palembang
        </p>
      </section>

      {/* ── CTA Kampus ── */}
      {daftarKampus.length > 0 && (
        <section className="bg-card py-12">
          <div className="container">
            <p className="text-sm font-semibold text-primary">Kampus di Palembang</p>
            <h2 className="mb-6 text-2xl font-bold">Cari Kos per Kampus</h2>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {daftarKampus.map((k) => (
                <Link
                  key={k.id}
                  href={`/kos?kampus=${k.slug}`}
                  className="flex items-center gap-3 rounded-xl border bg-background px-4 py-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-500">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                  </div>
                  <span className="truncate text-sm font-semibold">{k.nama}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}