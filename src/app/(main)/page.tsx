import type { Metadata } from "next";
import Link from "next/link";

import HeroSearch from "@/components/shared/HeroSearch";
import MapViewClient from "@/components/shared/MapViewClient";
import { getKosPath } from "@/lib/kos";
import {
  absoluteImageUrl,
  absoluteUrl,
  serializeJsonLd,
} from "@/lib/seo";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { KampusRow } from "@/types/kos";

export const metadata: Metadata = {
  title: "Direktori Kos Mahasiswa Palembang",
  description:
    "Direktori kos mahasiswa khusus Palembang yang fokus pada kampus lokal, gratis digunakan, tanpa komisi, dan langsung terhubung ke WhatsApp pemilik.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Direktori Kos Mahasiswa Palembang",
    description:
      "Direktori kos mahasiswa khusus Palembang yang fokus pada kampus lokal, gratis digunakan, tanpa komisi, dan langsung terhubung ke WhatsApp pemilik.",
    url: "/",
  },
  twitter: {
    title: "Direktori Kos Mahasiswa Palembang",
    description:
      "Direktori kos mahasiswa khusus Palembang yang fokus pada kampus lokal, gratis digunakan, tanpa komisi, dan langsung terhubung ke WhatsApp pemilik.",
  },
};

const jenisChips = [
  { value: "putra", label: "Kos Putra" },
  { value: "putri", label: "Kos Putri" },
  { value: "campur", label: "Campur" },
];

export default async function HalamanUtama() {
  const supabase = await createSupabaseServerClient();

  const [{ data: kampusData }, { data: kosData, count: kosCount }] = await Promise.all([
    supabase.from("kampus").select("*").order("nama"),
    supabase
      .from("kos")
      .select("id, slug, nama, alamat, lat, lng, harga_min, harga_max, jenis, foto", { count: "exact" })
      .eq("tersedia", true)
      .limit(50),
  ]);

  const daftarKampus = (kampusData ?? []) as KampusRow[];
  const statsItems = [
    {
      icon: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
      label: `${kosCount ?? 0} kos tersedia`,
    },
    {
      icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
      label: `${daftarKampus.length} kampus`,
    },
    {
      icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
      label: "Gratis digunakan",
    },
  ];

  const mapMarkers = [
    ...(kosData ?? []).map((item) => ({
      id: item.id,
      nama: item.nama,
      alamat: item.alamat,
      lat: item.lat,
      lng: item.lng,
      href: getKosPath(item),
      type: "kos" as const,
    })),
    ...daftarKampus.map((item) => ({
      id: item.id,
      nama: item.nama,
      lat: item.lat,
      lng: item.lng,
      type: "kampus" as const,
    })),
  ];

  const kampusForSearch = daftarKampus.map((item) => ({
    nama: item.nama,
    slug: item.slug,
  }));
  const homeJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Kos dekat kampus di Palembang",
    url: absoluteUrl("/"),
    numberOfItems: (kosData ?? []).length,
    itemListElement: (kosData ?? []).map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Accommodation",
        name: item.nama,
        url: absoluteUrl(getKosPath(item)),
        image: absoluteImageUrl(item.foto[0]),
        address: {
          "@type": "PostalAddress",
          streetAddress: item.alamat,
          addressLocality: "Palembang",
          addressCountry: "ID",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: item.lat,
          longitude: item.lng,
        },
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "IDR",
          lowPrice: item.harga_min,
          highPrice: item.harga_max,
          offerCount: 1,
        },
      },
    })),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(homeJsonLd) }}
      />
      <section className="hero-pattern relative -mt-14 overflow-hidden pt-28 md:-mt-16 md:pt-32">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/75" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

        <div className="container relative z-10 flex flex-col items-center gap-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-coral-400" />
            Direktori kos mahasiswa khusus Palembang
          </span>

          <h1 className="max-w-3xl text-5xl font-black text-white drop-shadow-lg md:text-6xl lg:text-7xl">
            Kos mahasiswa dekat kampus di{" "}
            <span className="text-coral-400">Palembang</span>
          </h1>

          <p className="max-w-3xl text-base text-white/85 drop-shadow md:text-lg">
            Fokus pada {daftarKampus.length} kampus lokal, gratis digunakan, tanpa biaya komisi,
            dan langsung terhubung ke WhatsApp pemilik kos.
          </p>

          <HeroSearch kampus={kampusForSearch} />

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

          <div className="flex flex-wrap items-center justify-center gap-6 pt-1">
            {statsItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <svg className="h-4 w-4 text-coral-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d={item.icon} />
                </svg>
                <span className="text-sm font-medium text-white/90 drop-shadow">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">Peta Interaktif</p>
            <h2 className="text-2xl font-bold">Jelajahi Lokasi Kos</h2>
          </div>
          <Link
            href="/kos"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-600"
          >
            Lihat semua kos
          </Link>
        </div>
        <MapViewClient markers={mapMarkers} className="h-72 md:h-96" />
        <p className="mt-3 text-center text-sm text-muted-foreground">
          {kosCount ?? 0} kos tersedia di {daftarKampus.length} kampus Palembang
        </p>
      </section>

      {daftarKampus.length > 0 ? (
        <section className="bg-card py-12">
          <div className="container">
            <p className="text-sm font-semibold text-primary">Kampus di Palembang</p>
            <h2 className="mb-6 text-2xl font-bold">Cari Kos per Kampus</h2>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {daftarKampus.map((item) => (
                <Link
                  key={item.id}
                  href={`/kos?kampus=${item.slug}`}
                  className="flex min-w-0 items-center gap-3 rounded-xl border bg-background px-4 py-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-500">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                  </div>
                  <span className="min-w-0 break-words text-sm font-semibold leading-snug">
                    {item.nama}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
