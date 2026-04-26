import type { Metadata } from "next";
import BackToTopButton from "@/components/shared/BackToTopButton";
import FilterSidebar from "@/components/shared/FilterSidebar";
import KosCard from "@/components/shared/KosCard";
import KosSortSelect from "@/components/shared/KosSortSelect";
import MapViewClient from "@/components/shared/MapViewClient";
import { getKosPath } from "@/lib/kos";
import {
  absoluteImageUrl,
  absoluteUrl,
  buildListingDescription,
  buildListingTitle,
  serializeJsonLd,
} from "@/lib/seo";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { KampusRow, KosWithKampus } from "@/types/kos";

type SearchParams = Promise<{
  kampus?: string;
  jenis?: string;
  hargaMin?: string;
  hargaMax?: string;
  sort?: string;
}>;

type KosWithRating = KosWithKampus & {
  review: { rating: number }[];
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const filters = await searchParams;
  const supabase = await createSupabaseServerClient();

  const selectedKampus = filters.kampus
    ? await supabase.from("kampus").select("nama").eq("slug", filters.kampus).maybeSingle()
    : null;

  const kampusName = selectedKampus?.data?.nama ?? null;
  const title = buildListingTitle(kampusName, filters.jenis);
  const description = buildListingDescription(kampusName, filters.jenis);
  const hasFilters = Boolean(
    filters.kampus || filters.jenis || filters.hargaMin || filters.hargaMax || filters.sort
  );

  return {
    title,
    description,
    alternates: {
      canonical: "/kos",
    },
    openGraph: {
      title,
      description,
      url: hasFilters ? absoluteUrl("/kos") : absoluteUrl("/kos"),
    },
    twitter: {
      title,
      description,
    },
    robots: hasFilters
      ? {
          index: false,
          follow: true,
        }
      : undefined,
  };
}

export default async function HalamanListingKos({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const filters = await searchParams;
  const supabase = await createSupabaseServerClient();

  const [{ data: kampusData }, { data: maxHargaData }] = await Promise.all([
    supabase.from("kampus").select("*").order("nama", { ascending: true }),
    supabase
      .from("kos")
      .select("harga_max")
      .eq("tersedia", true)
      .order("harga_max", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const selectedKampus =
    filters.kampus && kampusData
      ? kampusData.find((item) => item.slug === filters.kampus)
      : null;

  let query = supabase
    .from("kos")
    .select("*, kampus:kampus_id(id, nama, slug, lat, lng), review(rating)")
    .eq("tersedia", true);

  if (selectedKampus) {
    query = query.eq("kampus_id", selectedKampus.id);
  }

  if (
    filters.jenis === "putra" ||
    filters.jenis === "putri" ||
    filters.jenis === "campur"
  ) {
    query = query.eq("jenis", filters.jenis);
  }

  const hargaMaxTersedia = Math.max(2_500_000, maxHargaData?.harga_max ?? 0);
  const parsedMinRaw = Number(filters.hargaMin);
  const parsedMaxRaw = Number(filters.hargaMax);
  const parsedMin =
    Number.isFinite(parsedMinRaw) && parsedMinRaw >= 0
      ? Math.min(parsedMinRaw, hargaMaxTersedia)
      : NaN;
  const parsedMax =
    Number.isFinite(parsedMaxRaw) && parsedMaxRaw >= 0
      ? Math.min(parsedMaxRaw, hargaMaxTersedia)
      : NaN;

  if (filters.hargaMin && !Number.isNaN(parsedMin) && parsedMin >= 0) {
    query = query.gte("harga_max", parsedMin);
  }
  if (filters.hargaMax && !Number.isNaN(parsedMax) && parsedMax >= 0) {
    query = query.lte("harga_min", parsedMax);
  }

  const { data: kosData, error } = await query;
  const daftarKos = ((kosData ?? []) as KosWithRating[]).sort((a, b) => {
    const sort = filters.sort ?? "termurah";
    const avgA =
      a.review.length > 0
        ? a.review.reduce((sum, review) => sum + review.rating, 0) / a.review.length
        : 0;
    const avgB =
      b.review.length > 0
        ? b.review.reduce((sum, review) => sum + review.rating, 0) / b.review.length
        : 0;

    if (sort === "termahal") return b.harga_min - a.harga_min;
    if (sort === "rating") return avgB - avgA || a.harga_min - b.harga_min;
    return a.harga_min - b.harga_min;
  });
  const daftarKampus = (kampusData ?? []) as KampusRow[];
  const activeFilters = [
    selectedKampus ? `Kampus: ${selectedKampus.nama}` : null,
    filters.jenis ? `Jenis: ${filters.jenis}` : null,
    filters.hargaMin ? `Min: Rp${Number(filters.hargaMin).toLocaleString("id-ID")}` : null,
    filters.hargaMax ? `Max: Rp${Number(filters.hargaMax).toLocaleString("id-ID")}` : null,
  ].filter(Boolean) as string[];

  const mapMarkers = [
    ...daftarKos.map((kos) => ({
      id: kos.id,
      nama: kos.nama,
      alamat: kos.alamat,
      lat: kos.lat,
      lng: kos.lng,
      href: getKosPath(kos),
      type: "kos" as const,
    })),
    ...(selectedKampus ? [selectedKampus] : daftarKampus).map((kampus) => ({
      id: kampus.id,
      nama: kampus.nama,
      lat: kampus.lat,
      lng: kampus.lng,
      type: "kampus" as const,
    })),
  ];
  const listJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: selectedKampus
      ? `Daftar kos dekat ${selectedKampus.nama}`
      : "Daftar kos mahasiswa di Palembang",
    url: absoluteUrl("/kos"),
    numberOfItems: daftarKos.length,
    itemListElement: daftarKos.map((kos, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Accommodation",
        name: kos.nama,
        url: absoluteUrl(getKosPath(kos)),
        image: absoluteImageUrl(kos.foto[0]),
        address: {
          "@type": "PostalAddress",
          streetAddress: kos.alamat,
          addressLocality: "Palembang",
          addressCountry: "ID",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: kos.lat,
          longitude: kos.lng,
        },
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "IDR",
          lowPrice: kos.harga_min,
          highPrice: kos.harga_max,
          offerCount: 1,
        },
      },
    })),
  };

  return (
    <div className="container py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(listJsonLd) }}
      />
      <div className="mb-6 space-y-1">
        <p className="text-sm font-medium text-primary">Kos sekitar kampus Palembang</p>
        <h1 className="text-3xl font-bold">Cari Kos</h1>
        <p className="max-w-2xl text-muted-foreground">
          Temukan kos berdasarkan kampus, jenis, dan rentang harga yang cocok untuk
          kebutuhan kuliahmu.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <FilterSidebar kampus={daftarKampus} maxHarga={hargaMaxTersedia} />

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{daftarKos.length}</span> kos ditemukan
            </p>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <label htmlFor="sort" className="text-sm text-muted-foreground">
                Urutkan
              </label>
              <KosSortSelect defaultValue={filters.sort ?? "termurah"} />
            </div>
          </div>

          {activeFilters.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5 text-sm text-destructive">
              {error.message}
            </div>
          ) : daftarKos.length > 0 ? (
            <>
              <MapViewClient markers={mapMarkers} className="h-80" />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {daftarKos.map((kos) => {
                  const avgRating =
                    kos.review.length > 0
                      ? kos.review.reduce((sum, review) => sum + review.rating, 0) /
                        kos.review.length
                      : null;

                  return <KosCard key={kos.id} kos={kos} averageRating={avgRating} />;
                })}
              </div>
            </>
          ) : (
            <div className="rounded-xl border bg-white p-10 text-center">
              <svg
                className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z"
                />
              </svg>
              <h2 className="text-lg font-semibold">Belum ada kos yang cocok</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Coba longgarkan filter harga, jenis kos, atau pilih semua kampus.
              </p>
            </div>
          )}
        </section>
      </div>
      <BackToTopButton />
    </div>
  );
}
