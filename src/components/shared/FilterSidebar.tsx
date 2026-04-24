"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/utils";
import type { KampusRow } from "@/types/kos";

const HARGA_MAX_DEFAULT = 2_500_000;
const HARGA_STEP = 100_000;

const jenisOptions = [
  { value: "", label: "Semua" },
  { value: "putra", label: "Putra" },
  { value: "putri", label: "Putri" },
  { value: "campur", label: "Campur" },
];

// Singkatan nama kampus yang panjang
function singkatNama(nama: string): string {
  const map: Record<string, string> = {
    "Universitas Sriwijaya": "Unsri",
    "Universitas Sriwijaya Kampus Palembang": "Unsri Plg",
    "Universitas Muhammadiyah Palembang": "UMP",
    "Politeknik Negeri Sriwijaya": "Polsri",
    "UIN Raden Fatah Palembang": "UIN RF",
    "Universitas MDP": "MDP",
    "Universitas Bina Darma": "Bina Darma",
    "Universitas IBA": "IBA",
  };
  // Cek exact match dulu
  if (map[nama]) return map[nama];
  // Potong kalau >20 karakter
  if (nama.length > 20) return nama.slice(0, 18) + "…";
  return nama;
}

export default function FilterSidebar({ kampus }: { kampus: KampusRow[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentKampus = searchParams.get("kampus") ?? "";
  const currentJenis  = searchParams.get("jenis") ?? "";
  const currentMin    = Number(searchParams.get("hargaMin")) || 0;
  const currentMax    = Number(searchParams.get("hargaMax")) || HARGA_MAX_DEFAULT;

  const [localMin, setLocalMin] = useState(currentMin);
  const [localMax, setLocalMax] = useState(currentMax);

  useEffect(() => {
    setLocalMin(Number(searchParams.get("hargaMin")) || 0);
    setLocalMax(Number(searchParams.get("hargaMax")) || HARGA_MAX_DEFAULT);
  }, [searchParams]);

  function pushFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    router.push(`/kos?${params.toString()}`);
  }

  function applyHarga() {
    const params = new URLSearchParams(searchParams.toString());
    if (localMin > 0) params.set("hargaMin", String(localMin)); else params.delete("hargaMin");
    if (localMax < HARGA_MAX_DEFAULT) params.set("hargaMax", String(localMax)); else params.delete("hargaMax");
    router.push(`/kos?${params.toString()}`);
  }

  function reset() {
    setLocalMin(0);
    setLocalMax(HARGA_MAX_DEFAULT);
    router.push("/kos");
  }

  const hasFilter = currentKampus || currentJenis || currentMin > 0 || currentMax < HARGA_MAX_DEFAULT;

  return (
    <aside className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold">Filter</h2>
        {hasFilter && (
          <button onClick={reset} className="text-xs font-medium text-primary hover:underline">
            Reset semua
          </button>
        )}
      </div>

      <div className="space-y-5">
        {/* Filter Kampus — pill chips dengan singkatan */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kampus</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => pushFilter("kampus", "")}
              title="Semua kampus"
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-all",
                currentKampus === ""
                  ? "bg-primary text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              Semua
            </button>
            {kampus.map((k) => (
              <button
                key={k.id}
                onClick={() => pushFilter("kampus", currentKampus === k.slug ? "" : k.slug)}
                title={k.nama}
                className={cn(
                  "max-w-[130px] truncate rounded-full px-3 py-1 text-xs font-semibold transition-all",
                  currentKampus === k.slug
                    ? "bg-primary text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                )}
              >
                {singkatNama(k.nama)}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Jenis */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Jenis Kos</p>
          <div className="flex gap-2">
            {jenisOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => pushFilter("jenis", opt.value)}
                className={cn(
                  "flex-1 rounded-lg py-1.5 text-xs font-bold transition-all",
                  currentJenis === opt.value
                    ? "bg-primary text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Harga — dual slider */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rentang Harga</p>
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between">
                <span className="text-xs text-muted-foreground">Minimum</span>
                <span className="text-xs font-bold">{localMin > 0 ? formatRupiah(localMin) : "Bebas"}</span>
              </div>
              <input
                type="range" min={0} max={HARGA_MAX_DEFAULT} step={HARGA_STEP}
                value={localMin}
                onChange={(e) => setLocalMin(Number(e.target.value))}
                onMouseUp={applyHarga} onTouchEnd={applyHarga}
                className="w-full"
              />
            </div>
            <div>
              <div className="mb-1 flex justify-between">
                <span className="text-xs text-muted-foreground">Maksimum</span>
                <span className="text-xs font-bold">{localMax < HARGA_MAX_DEFAULT ? formatRupiah(localMax) : "Bebas"}</span>
              </div>
              <input
                type="range" min={0} max={HARGA_MAX_DEFAULT} step={HARGA_STEP}
                value={localMax}
                onChange={(e) => setLocalMax(Number(e.target.value))}
                onMouseUp={applyHarga} onTouchEnd={applyHarga}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
