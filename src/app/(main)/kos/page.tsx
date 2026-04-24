import FilterSidebar from "@/components/shared/FilterSidebar";
import KosCard from "@/components/shared/KosCard";
import MapViewClient from "@/components/shared/MapViewClient";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { KampusRow, KosWithKampus } from "@/types/kos";


type SearchParams = Promise<{
  kampus?: string;
  jenis?: string;
  hargaMin?: string;
  hargaMax?: string;
}>;

type KosWithRating = KosWithKampus & {
  review: { rating: number }[];
};

export default async function HalamanListingKos({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const filters = await searchParams;
  const supabase = await createSupabaseServerClient();

  const { data: kampusData } = await supabase
    .from("kampus")
    .select("*")
    .order("nama", { ascending: true });

  const selectedKampus =
    filters.kampus && kampusData
      ? kampusData.find((k) => k.slug === filters.kampus)
      : null;

  let query = supabase
    .from("kos")
    .select("*, kampus:kampus_id(id, nama, slug, lat, lng), review(rating)")
    .eq("tersedia", true)
    .order("harga_min", { ascending: true });

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

  const parsedMin = Number(filters.hargaMin);
  const parsedMax = Number(filters.hargaMax);

  if (filters.hargaMin && !isNaN(parsedMin) && parsedMin >= 0) {
    query = query.gte("harga_max", parsedMin);
  }
  if (filters.hargaMax && !isNaN(parsedMax) && parsedMax >= 0) {
    query = query.lte("harga_min", parsedMax);
  }

  const { data: kosData, error } = await query;
  const daftarKos = (kosData ?? []) as KosWithRating[];
  const daftarKampus = (kampusData ?? []) as KampusRow[];

  const mapMarkers = [
    ...daftarKos.map((kos) => ({
      id: kos.id,
      nama: kos.nama,
      alamat: kos.alamat,
      lat: kos.lat,
      lng: kos.lng,
      href: `/kos/${kos.id}`,
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

  return (
    <div className="container py-8">
      <div className="mb-6 space-y-1">
        <p className="text-sm font-medium text-primary">Kos sekitar kampus Palembang</p>
        <h1 className="text-3xl font-bold">Cari Kos</h1>
        <p className="max-w-2xl text-muted-foreground">
          Temukan kos berdasarkan kampus, jenis, dan rentang harga yang cocok untuk
          kebutuhan kuliahmu.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <FilterSidebar kampus={daftarKampus} />

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{daftarKos.length}</span> kos ditemukan
            </p>
          </div>

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
                      ? kos.review.reduce((s, r) => s + r.rating, 0) / kos.review.length
                      : null;
                  return (
                    <KosCard key={kos.id} kos={kos} averageRating={avgRating} />
                  );
                })}
              </div>
            </>
          ) : (
            <div className="rounded-xl border bg-white p-10 text-center">
              <svg className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
              </svg>
              <h2 className="text-lg font-semibold">Belum ada kos yang cocok</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Coba longgarkan filter harga, jenis kos, atau pilih semua kampus.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
