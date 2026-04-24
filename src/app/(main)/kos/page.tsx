import FilterSidebar from "@/components/shared/FilterSidebar";
import KosCard from "@/components/shared/KosCard";
import MapView from "@/components/shared/MapView";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { KampusRow, KosWithKampus } from "@/types/kos";

type SearchParams = Promise<{
  kampus?: string;
  jenis?: string;
  hargaMin?: string;
  hargaMax?: string;
}>;

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
      ? kampusData.find((kampus) => kampus.slug === filters.kampus)
      : null;

  let query = supabase
    .from("kos")
    .select("*, kampus:kampus_id(id, nama, slug, lat, lng)")
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

  if (filters.hargaMin) {
    query = query.gte("harga_max", Number(filters.hargaMin));
  }

  if (filters.hargaMax) {
    query = query.lte("harga_min", Number(filters.hargaMax));
  }

  const { data: kosData, error } = await query;
  const daftarKos = (kosData ?? []) as KosWithKampus[];
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
      <div className="mb-6 space-y-2">
        <p className="text-sm font-medium text-primary">Kos sekitar kampus Palembang</p>
        <h1 className="text-3xl font-bold">Cari Kos</h1>
        <p className="max-w-2xl text-muted-foreground">
          Temukan kos berdasarkan kampus, jenis, dan rentang harga yang cocok untuk
          kebutuhan kuliahmu.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <FilterSidebar kampus={daftarKampus} values={filters} />

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {daftarKos.length} kos ditemukan
            </p>
          </div>

          {error ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-5 text-sm text-destructive">
              {error.message}
            </div>
          ) : daftarKos.length > 0 ? (
            <>
              <MapView markers={mapMarkers} className="h-96" />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {daftarKos.map((kos) => (
                  <KosCard key={kos.id} kos={kos} />
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-lg border bg-white p-8 text-center">
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
