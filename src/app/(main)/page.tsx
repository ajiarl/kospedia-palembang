import Link from "next/link";

import HeroSearch from "@/components/shared/HeroSearch";
import MapViewClient from "@/components/shared/MapViewClient";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { KampusRow } from "@/types/kos";


const statsItems = [
  {
    icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
    label: "150+ kos tersedia",
  },
  {
    icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
    label: "6 kampus",
  },
  {
    icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    label: "Gratis digunakan",
  },
];

const jenisChips = [
  { value: "putra", label: "Putra", color: "bg-blue-500/20 text-blue-700 hover:bg-blue-500/30" },
  { value: "putri", label: "Putri", color: "bg-pink-500/20 text-pink-700 hover:bg-pink-500/30" },
  { value: "campur", label: "Campur", color: "bg-amber-500/20 text-amber-700 hover:bg-amber-500/30" },
];

export default async function HalamanUtama() {
  const supabase = await createSupabaseServerClient();

  const [{ data: kampusData }, { data: kosData, count: kosCount }] = await Promise.all([
    supabase.from("kampus").select("*").order("nama"),
    supabase
      .from("kos")
      .select("id, nama, alamat, lat, lng", { count: "exact" })
      .eq("tersedia", true)
      .limit(50),
  ]);

  const daftarKampus = (kampusData ?? []) as KampusRow[];

  const mapMarkers = [
    ...(kosData ?? []).map((k) => ({
      id: k.id,
      nama: k.nama,
      alamat: k.alamat,
      lat: k.lat,
      lng: k.lng,
      href: `/kos/${k.id}`,
      type: "kos" as const,
    })),
    ...daftarKampus.map((k) => ({
      id: k.id,
      nama: k.nama,
      lat: k.lat,
      lng: k.lng,
      type: "kampus" as const,
    })),
  ];

  return (
    <div>
      {/* ── Hero Section ── */}
      <section className="hero-pattern relative overflow-hidden py-20 md:py-28">
        {/* Gradient overlay bawah agar transisi halus */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

        <div className="container relative z-10 flex flex-col items-center gap-8 text-center">
          {/* Eyebrow */}
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white ring-1 ring-white/30 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            Platform kos mahasiswa Palembang
          </span>

          {/* Heading */}
          <h1 className="max-w-3xl text-4xl font-black text-white md:text-5xl lg:text-6xl">
            Temukan Kos Terbaikmu{" "}
            <span className="text-amber-200">di Palembang</span>
          </h1>

          <p className="max-w-lg text-base text-white/80 md:text-lg">
            Dekat kampus, sesuai budget, langsung hubungi pemilik. Tanpa perantara.
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-xl">
            <HeroSearch />
          </div>

          {/* Quick Filter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-medium text-white/60">Cari berdasarkan:</span>
            {jenisChips.map((chip) => (
              <Link
                key={chip.value}
                href={`/kos?jenis=${chip.value}`}
                className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm transition-all ${chip.color}`}
              >
                {chip.label}
              </Link>
            ))}
            <span className="mx-1 text-white/30">|</span>
            {daftarKampus.slice(0, 3).map((k) => (
              <Link
                key={k.id}
                href={`/kos?kampus=${k.slug}`}
                className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm transition-all hover:bg-white/25"
              >
                {k.nama}
              </Link>
            ))}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
            {statsItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-amber-200"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d={item.icon} />
                </svg>
                <span className="text-sm font-medium text-white/90">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Map Preview ── */}
      <section className="container py-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">Peta Interaktif</p>
            <h2 className="text-2xl font-bold">Jelajahi Lokasi Kos</h2>
          </div>
          <Link
            href="/kos"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-600"
          >
            Lihat semua kos →
          </Link>
        </div>

        <MapViewClient markers={mapMarkers} className="h-72 md:h-96" />

        <p className="mt-3 text-center text-sm text-muted-foreground">
          {kosCount ?? 0} kos tersedia di {daftarKampus.length} kampus Palembang
        </p>
      </section>

      {/* ── CTA Kampus ── */}
      {daftarKampus.length > 0 && (
        <section className="bg-muted/50 py-12">
          <div className="container">
            <p className="text-sm font-medium text-primary">Kampus di Palembang</p>
            <h2 className="mb-6 text-2xl font-bold">Cari Kos per Kampus</h2>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {daftarKampus.map((k) => (
                <Link
                  key={k.id}
                  href={`/kos?kampus=${k.slug}`}
                  className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-500">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold">{k.nama}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}