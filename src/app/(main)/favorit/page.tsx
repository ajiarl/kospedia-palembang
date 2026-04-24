import Link from "next/link";

import KosCard from "@/components/shared/KosCard";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { KosWithKampus } from "@/types/kos";

type FavoritWithKos = {
  id: string;
  kos: KosWithKampus | null;
};

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border bg-white px-8 py-16 text-center shadow-sm">
      {/* Ilustrasi SVG rumah + hati */}
      <svg
        viewBox="0 0 120 100"
        className="mb-5 h-28 w-28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Rumah */}
        <path d="M20 55 L60 20 L100 55" stroke="#E85D04" strokeWidth="3" strokeLinecap="round" />
        <rect x="28" y="55" width="64" height="40" rx="2" fill="#FFF3E0" stroke="#E85D04" strokeWidth="2" />
        {/* Pintu */}
        <rect x="52" y="75" width="16" height="20" rx="2" fill="#E85D04" opacity="0.5" />
        {/* Jendela kiri */}
        <rect x="33" y="62" width="14" height="11" rx="2" fill="#E85D04" opacity="0.3" />
        {/* Jendela kanan */}
        <rect x="73" y="62" width="14" height="11" rx="2" fill="#E85D04" opacity="0.3" />
        {/* Hati melayang di atas atap */}
        <path
          d="M60 18 C60 18 52 10 46 14 C40 18 40 26 46 30 L60 42 L74 30 C80 26 80 18 74 14 C68 10 60 18 60 18 Z"
          fill="#E85D04"
          opacity="0.85"
        />
        {/* Bintang kecil */}
        <circle cx="28" cy="25" r="2" fill="#FBBF24" />
        <circle cx="95" cy="18" r="1.5" fill="#FBBF24" />
        <circle cx="15" cy="45" r="1.5" fill="#E85D04" opacity="0.4" />
      </svg>

      <h2 className="text-xl font-bold">Belum ada kos tersimpan</h2>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Simpan kos yang menarik agar mudah dibandingkan saat menentukan pilihan tempat tinggal.
      </p>
      <Link
        href="/kos"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-600 active:scale-95"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        Cari Kos Sekarang
      </Link>
    </div>
  );
}

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
      <div className="mb-6 space-y-1">
        <p className="text-sm font-medium text-primary">Koleksi Kos</p>
        <h1 className="text-3xl font-bold">Kos Tersimpan</h1>
        <p className="max-w-2xl text-muted-foreground">
          Simpan kos yang menarik agar mudah dibandingkan saat menentukan pilihan.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5 text-sm text-destructive">
          {error.message}
        </div>
      ) : daftarKos.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {daftarKos.map((kos) => (
            <KosCard key={kos.id} kos={kos} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
