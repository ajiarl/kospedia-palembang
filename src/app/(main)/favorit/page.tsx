import KosCard from "@/components/shared/KosCard";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { KosWithKampus } from "@/types/kos";

type FavoritWithKos = {
  id: string;
  kos: KosWithKampus | null;
};

export default async function HalamanFavorit() {
  const user = await getCurrentUser();
  const supabase = await createSupabaseServerClient();

  const { data, error } = user
    ? await supabase
        .from("favorit")
        .select("id, kos:kos_id(*, kampus:kampus_id(id, nama, slug, lat, lng))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [], error: null };

  const favorit = (data ?? []) as FavoritWithKos[];
  const daftarKos = favorit
    .map((item) => item.kos)
    .filter((kos): kos is KosWithKampus => Boolean(kos));

  return (
    <div className="container py-8">
      <div className="mb-6 space-y-2">
        <p className="text-sm font-medium text-primary">Favorit</p>
        <h1 className="text-3xl font-bold">Kos Tersimpan</h1>
        <p className="max-w-2xl text-muted-foreground">
          Simpan kos yang menarik agar mudah dibandingkan saat menentukan pilihan.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-5 text-sm text-destructive">
          {error.message}
        </div>
      ) : daftarKos.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {daftarKos.map((kos) => (
            <KosCard key={kos.id} kos={kos} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-white p-8 text-center">
          <h2 className="text-lg font-semibold">Belum ada kos tersimpan</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Buka halaman cari kos, lalu tekan tombol Simpan pada kos yang kamu suka.
          </p>
        </div>
      )}
    </div>
  );
}
