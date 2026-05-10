import type { Metadata } from "next";
import BackToTopButton from "@/components/shared/BackToTopButton";
import FilterSidebar from "@/components/shared/FilterSidebar";
import KosCard from "@/components/shared/KosCard";
import KosSortSelect from "@/components/shared/KosSortSelect";
import MapViewClient from "@/components/shared/MapViewClient";
import { haversineKm } from "@/lib/haversine";
import { applyKosCoordinateOverrides } from "@/lib/kosCoordinates";
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
  jarakMax?: string;
  fasilitas?: string;
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
    filters.kampus ||
      filters.jenis ||
      filters.hargaMin ||
      filters.hargaMax ||
      filters.jarakMax ||
      filters.sort
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

  const [
    { data: kampusData },
    { data: maxHargaData },
    { data: selectedKampusData },
  ] = await Promise.all([
    supabase.from("kampus").select("id, nama, slug, lat, lng").order("nama"),
    supabase
      .from("kos")
      .select("harga_max")
      .eq("tersedia", true)
      .order("harga_max", { ascending: false })
      .limit(1)
      .maybeSingle(),
    filters.kampus
      ? supabase
          .from("kampus")
          .select("id, nama, slug, lat, lng")
          .eq("slug", filters.kampus as string)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const selectedKampus = selectedKampusData ?? null;
  const { data: kosData, error: kosError } = await buildKosQuery(
    supabase,
    filters,
    selectedKampus?.id
  );

  const maxHarga = maxHargaData?.harga_max ?? 5_000_000;
  const error = kosError;

  const hargaMaxTersedia = Math.max(2_500_000, maxHargaData?.harga_max ?? 0);
  const parsedMinRaw = Number(filters.hargaMin);
  const parsedMaxRaw = Number(filters.hargaMax);
  const parsedJarakMaxRaw = Number(filters.jarakMax);
  const parsedMin =
    Number.isFinite(parsedMinRaw) && parsedMinRaw >= 0
      ? Math.min(parsedMinRaw, hargaMaxTersedia)
      : NaN;
  const parsedMax =
    Number.isFinite(parsedMaxRaw) && parsedMaxRaw >= 0
      ? Math.min(parsedMaxRaw, hargaMaxTersedia)
      : NaN;
  const parsedJarakMax =
    Number.isFinite(parsedJarakMaxRaw) && parsedJarakMaxRaw > 0 ? parsedJarakMaxRaw : NaN;
  const hasJarakFilter = selectedKampus !== null && !Number.isNaN(parsedJarakMax);
  const jarakFilterLabel = hasJarakFilter ? `<= ${parsedJarakMax} km` : null;
  const normalizedKos = applyKosCoordinateOverrides((kosData ?? []) as KosWithRating[]);
  const filteredKos = normalizedKos.filter((kos) => {
    if (!hasJarakFilter || !selectedKampus) return true;
    if (!kos.locationMeta.isDistanceReliable) return false;

    return (
      haversineKm(kos.lat, kos.lng, selectedKampus.lat, selectedKampus.lng) <= parsedJarakMax
    );
  });
  const daftarKos = filteredKos.sort((a, b) => {
    const sort = filters.sort ?? "termurah";
    const avgA =
      a.review.length > 0
        ? a.review.reduce((sum, review) => sum + review.rating, 0) / a.review.length
        : 0;
    const avgB =
      b.review.length > 0
        ? b.review.reduce((sum, review) => sum + review.rating, 0) / b.review.length
        : 0;
    const jarakA = selectedKampus && a.locationMeta.isDistanceReliable
      ? haversineKm(a.lat, a.lng, selectedKampus.lat, selectedKampus.lng)
      : Number.POSITIVE_INFINITY;
    const jarakB = selectedKampus && b.locationMeta.isDistanceReliable
      ? haversineKm(b.lat, b.lng, selectedKampus.lat, selectedKampus.lng)
      : Number.POSITIVE_INFINITY;

    if (hasJarakFilter) {
      const selisihJarak = jarakA - jarakB;
      if (Math.abs(selisihJarak) > 0.01) return selisihJarak;
    }

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
    ...(filters.fasilitas
      ? filters.fasilitas.split(",").filter(Boolean).map((f) => `Fasilitas: ${f}`)
      : []),
    selectedKampus && filters.jarakMax ? `Jarak: <= ${filters.jarakMax} km` : null,
  ].filter(Boolean) as string[];
  const visibleKosForMap = daftarKos.filter((kos) => kos.locationMeta.isMapVisible);
  const hiddenKosCount = daftarKos.length - visibleKosForMap.length;

  const mapMarkers = [
    ...visibleKosForMap.map((kos) => ({
      id: kos.id,
      nama: kos.nama,
      alamat: kos.alamat,
      lat: kos.lat,
      lng: kos.lng,
      href: getKosPath(kos),
      note: kos.locationMeta.note,
      precision: kos.locationMeta.precision,
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
        geo: kos.locationMeta.isDistanceReliable
          ? {
              "@type": "GeoCoordinates",
              latitude: kos.lat,
              longitude: kos.lng,
            }
          : undefined,
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
    <div className="container py-8 md:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(listJsonLd) }}
      />
      <div className="mb-8 space-y-3">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Direktori kos mahasiswa Palembang
            </p>
            <h1 className="text-3xl font-bold leading-tight text-charcoal md:text-4xl">
              Temukan kos yang terasa pas, bukan sekadar tersedia.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              Temukan kos berdasarkan kampus, jenis, rentang harga, dan jarak yang paling cocok
              dengan ritme kuliahmu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <span>
              <span className="font-bold text-charcoal">{daftarKos.length}</span> kos
            </span>
            <span className="hidden sm:inline text-black/10">|</span>
            <span className="font-medium text-charcoal">
              {selectedKampus?.nama ?? "Semua kampus"}
            </span>
            <span className="hidden sm:inline text-black/10">|</span>
            <span className="capitalize">
              {filters.sort ?? "termurah"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[300px_1fr]">
        <FilterSidebar kampus={daftarKampus} maxHarga={hargaMaxTersedia} />

        <section className="min-w-0 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{daftarKos.length}</span> kos ditemukan
              {selectedKampus ? ` di sekitar ${selectedKampus.nama}` : ""}
            </p>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <label htmlFor="sort" className="text-sm text-muted-foreground">
                Urutkan
              </label>
              <KosSortSelect defaultValue={filters.sort ?? "termurah"} />
            </div>
          </div>

          {hasJarakFilter ? (
            <p className="text-xs font-medium text-primary">
              Hasil diurutkan dari jarak terdekat ke {selectedKampus.nama}, lalu
              disesuaikan dengan pilihan urutanmu.
            </p>
          ) : null}

          {activeFilters.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-primary/10 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
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
              <div className="overflow-hidden rounded-xl">
                <MapViewClient markers={mapMarkers} className="h-80 rounded-xl" />
              </div>
              {hiddenKosCount > 0 ? (
                <p className="text-xs text-muted-foreground">
                  {hiddenKosCount} kos tidak ditampilkan pada peta karena koordinatnya masih terlalu
                  umum untuk dianggap titik yang cukup akurat.
                </p>
              ) : null}
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {daftarKos.map((kos) => {
                  const avgRating =
                    kos.review.length > 0
                      ? kos.review.reduce((sum, review) => sum + review.rating, 0) /
                        kos.review.length
                      : null;

                  return (
                    <KosCard
                      key={kos.id}
                      kos={kos}
                      averageRating={avgRating}
                      jarakFilterLabel={jarakFilterLabel}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            <div className="py-10 text-center">
              <svg
                className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30"
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
                Coba longgarkan filter harga, jenis kos, jarak, atau pilih semua kampus.
              </p>
            </div>
          )}
        </section>
      </div>
      <BackToTopButton />
    </div>
  );
}

function buildKosQuery(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  filters: { [key: string]: string | string[] | undefined },
  selectedKampusId?: string
) {
  let query = supabase
    .from("kos")
    .select(`*, kampus:kampus_id (id, nama, slug, lat, lng), review(rating)`)
    .eq("tersedia", true);

  if (selectedKampusId) query = query.eq("kampus_id", selectedKampusId);

  const hargaMin = Number(filters.hargaMin);
  const hargaMax = Number(filters.hargaMax);
  if (!isNaN(hargaMin) && hargaMin > 0) query = query.gte("harga_max", hargaMin);
  if (!isNaN(hargaMax) && hargaMax > 0) query = query.lte("harga_min", hargaMax);

  if (
    filters.jenis === "putra" ||
    filters.jenis === "putri" ||
    filters.jenis === "campur"
  ) {
    query = query.eq("jenis", filters.jenis);
  }

  if (filters.fasilitas) {
    const fasilitas = typeof filters.fasilitas === "string"
      ? filters.fasilitas.split(",").filter(Boolean)
      : Array.isArray(filters.fasilitas)
        ? filters.fasilitas
        : [filters.fasilitas];
    if (fasilitas.length > 0) query = query.contains("fasilitas", fasilitas);
  }

  query = query.order("created_at", { ascending: false });
  return query;
}
