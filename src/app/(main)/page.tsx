import type { Metadata } from "next";
import Link from "next/link";

import HeroSearch from "@/components/shared/HeroSearch";
import MapViewClient from "@/components/shared/MapViewClient";
import { applyKosCoordinateOverrides } from "@/lib/kosCoordinates";
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

const valueProps = [
  {
    title: "Fokus dekat kampus",
    description: "Cocok untuk mahasiswa yang ingin mulai dari area kampus lalu mempersempit pilihan dengan cepat.",
  },
  {
    title: "Langsung ke pemilik",
    description: "Kontak bisa langsung lewat WhatsApp tanpa formulir panjang dan tanpa perantara yang bikin ribet.",
  },
  {
    title: "Lebih gampang membandingkan",
    description: "Harga, jenis kos, fasilitas, dan konteks lokasi bisa dibaca dalam satu alur yang lebih jelas.",
  },
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
  const daftarKos = applyKosCoordinateOverrides(kosData ?? []);
  const visibleKosForMap = daftarKos.filter((item) => item.locationMeta.isMapVisible);
  const hiddenKosCount = daftarKos.length - visibleKosForMap.length;
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
    ...visibleKosForMap.map((item) => ({
      id: item.id,
      nama: item.nama,
      alamat: item.alamat,
      lat: item.lat,
      lng: item.lng,
      href: getKosPath(item),
      note: item.locationMeta.note,
      precision: item.locationMeta.precision,
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
    numberOfItems: daftarKos.length,
    itemListElement: daftarKos.map((item, index) => ({
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
        geo: item.locationMeta.isDistanceReliable
          ? {
              "@type": "GeoCoordinates",
              latitude: item.lat,
              longitude: item.lng,
            }
          : undefined,
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
    <div className="pb-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(homeJsonLd) }}
      />
      <section className="hero-pattern relative -mt-14 min-h-[calc(100svh-4.5rem)] overflow-hidden pt-28 md:-mt-16 md:min-h-[calc(100svh-5rem)] md:pt-32">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/80 via-black/62 to-black/85" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(240,128,96,0.22),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(45,74,62,0.26),transparent_28%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/72 to-transparent" />

        <div className="container relative z-10 flex min-h-[calc(100svh-4.5rem)] flex-col items-center justify-center gap-6 pb-12 text-center md:min-h-[calc(100svh-5rem)] md:pb-14">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white ring-1 ring-white/20 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-coral-400" />
            Direktori kos mahasiswa khusus Palembang
          </span>

          <h1 className="max-w-4xl text-5xl font-bold text-white drop-shadow-lg md:text-6xl lg:text-7xl">
            Kos mahasiswa dekat kampus di{" "}
            <span className="text-coral-400">Palembang</span>
          </h1>

          <p className="max-w-3xl text-base text-white/85 drop-shadow md:text-lg">
            Fokus pada {daftarKampus.length} kampus lokal, gratis digunakan, tanpa biaya komisi,
            dan langsung terhubung ke WhatsApp pemilik kos.
          </p>

          <HeroSearch kampus={kampusForSearch} />

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-white/50">
              Filter cepat
            </span>
            {jenisChips.map((chip) => (
              <Link
                key={chip.value}
                href={`/kos?jenis=${chip.value}`}
                className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm transition-all hover:bg-white/25"
              >
                {chip.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-1 md:gap-x-12">
            {statsItems.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <svg className="h-5 w-5 shrink-0 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d={item.icon} />
                </svg>
                <span className="text-sm font-semibold text-white drop-shadow-sm md:text-base">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-wash py-16 md:py-20">
        <div className="container">
          <div className="mb-8 max-w-3xl md:mb-10">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Peta Interaktif
            </span>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-[1.1] text-charcoal md:text-[2.6rem]">
              Jelajahi lokasi kos dengan konteks yang lebih jelas.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground md:text-[1.02rem]">
              Lihat persebaran kos dan kampus secara visual untuk menangkap area yang paling masuk
              akal sebelum mulai membandingkan harga, fasilitas, dan jarak.
            </p>
            <Link
              href="/kos"
              className="mt-4 inline-flex items-center text-sm font-semibold text-primary transition hover:text-primary-600 hover:underline"
            >
              Lihat semua kos
            </Link>
          </div>
        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/72 p-3 shadow-[0_18px_48px_rgba(17,17,16,0.08)] backdrop-blur-sm md:p-4">
          <MapViewClient markers={mapMarkers} className="h-72 rounded-[1.35rem] md:h-96" />
        </div>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          {kosCount ?? 0} kos tersedia di {daftarKampus.length} kampus Palembang
        </p>
        {hiddenKosCount > 0 ? (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {hiddenKosCount} lokasi kos belum ditampilkan di peta karena koordinatnya masih terlalu
            umum dan sedang menunggu verifikasi otomatis yang lebih presisi.
          </p>
        ) : null}
        </div>
      </section>

      {daftarKampus.length > 0 ? (
        <section className="bg-card/55 py-16 md:py-20">
          <div className="container">
            <div className="mb-8 max-w-3xl md:mb-10">
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Kampus di Palembang
              </span>
              <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-[1.1] text-charcoal md:text-[2.6rem]">
                Mulai dari kampus yang kamu tuju.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground md:text-[1.02rem]">
                Masuk dari kampus yang kamu incar dulu, lalu lanjutkan ke filter harga, jenis kos,
                dan jarak agar pencarian terasa lebih fokus.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {daftarKampus.map((item) => (
                <Link
                  key={item.id}
                  href={`/kos?kampus=${item.slug}`}
                  className="surface-panel flex min-w-0 items-center gap-4 rounded-[1.5rem] border border-white/80 px-4 py-4 shadow-[0_12px_30px_rgba(17,17,16,0.06)] transition-all hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_18px_38px_rgba(17,17,16,0.1)]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-50 text-forest-500">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <span className="block min-w-0 break-words text-sm font-semibold leading-snug text-charcoal">
                      {item.nama}
                    </span>
                    <span className="mt-1 block text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Lihat area kos
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section id="nilai" className="section-wash py-16 md:py-20">
        <div className="container">
          <div className="mb-8 max-w-3xl md:mb-10">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Nilai Utama
            </span>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-[1.1] text-charcoal md:text-[2.6rem]">
              Kenapa pengalaman cari kos ini terasa lebih rapi.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground md:text-[1.02rem]">
              Fokusnya bukan sekadar menampilkan daftar kos, tapi membantu pengguna menemukan area,
              membandingkan pilihan, dan lanjut menghubungi pemilik dengan alur yang lebih jelas.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {valueProps.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.6rem] border border-white/70 bg-white/78 p-6 shadow-[0_14px_36px_rgba(17,17,16,0.06)] backdrop-blur-sm"
              >
                <h3 className="text-xl font-bold leading-snug text-charcoal">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
