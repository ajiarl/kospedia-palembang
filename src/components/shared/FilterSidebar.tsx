"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { trackEvent } from "@/lib/analytics";
import { cn, formatRupiah } from "@/lib/utils";
import type { KampusRow } from "@/types/kos";

const HARGA_MAX_DEFAULT = 2_500_000;
const HARGA_STEP = 100_000;
const JARAK_OPTIONS_KM = [0.5, 1, 2, 3, 5];

const jenisOptions = [
  { value: "", label: "Semua" },
  { value: "putra", label: "Putra" },
  { value: "putri", label: "Putri" },
  { value: "campur", label: "Campur" },
];

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

  if (map[nama]) return map[nama];
  if (nama.length > 20) return `${nama.slice(0, 18)}...`;
  return nama;
}

export default function FilterSidebar({
  kampus,
  maxHarga = HARGA_MAX_DEFAULT,
}: {
  kampus: KampusRow[];
  maxHarga?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const effectiveMaxHarga = Math.max(HARGA_STEP, maxHarga);

  const currentKampus = searchParams.get("kampus") ?? "";
  const currentJenis = searchParams.get("jenis") ?? "";
  const currentMin = Number(searchParams.get("hargaMin")) || 0;
  const currentJarakMax = Number(searchParams.get("jarakMax")) || 0;
  const currentMax = Math.min(
    Number(searchParams.get("hargaMax")) || effectiveMaxHarga,
    effectiveMaxHarga
  );

  const [localMin, setLocalMin] = useState(currentMin);
  const [localMax, setLocalMax] = useState(currentMax);

  function pushFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key === "kampus") {
      if (!value) params.delete("jarakMax");
      trackEvent("filter_kampus_select", {
        kampus_slug: value || "all",
        source: "listing_sidebar",
      });
    }
    if (window.innerWidth < 1024) setMobileOpen(false);
    const queryString = params.toString();
    router.push(queryString ? `/kos?${queryString}` : "/kos");
  }

  function applyHarga() {
    const params = new URLSearchParams(searchParams.toString());
    if (localMin > 0) params.set("hargaMin", String(localMin));
    else params.delete("hargaMin");

    if (localMax < effectiveMaxHarga) params.set("hargaMax", String(localMax));
    else params.delete("hargaMax");

    if (window.innerWidth < 1024) setMobileOpen(false);
    const queryString = params.toString();
    router.push(queryString ? `/kos?${queryString}` : "/kos");
  }

  function applyJarak(jarakKm: number | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (jarakKm && currentKampus) params.set("jarakMax", String(jarakKm));
    else params.delete("jarakMax");
    if (window.innerWidth < 1024) setMobileOpen(false);
    const queryString = params.toString();
    router.push(queryString ? `/kos?${queryString}` : "/kos");
  }

  function reset() {
    setLocalMin(0);
    setLocalMax(effectiveMaxHarga);
    if (window.innerWidth < 1024) setMobileOpen(false);
    router.push("/kos");
  }

  const hasFilter =
    currentKampus ||
    currentJenis ||
    currentMin > 0 ||
    currentMax < effectiveMaxHarga ||
    currentJarakMax > 0;
  const minValue = localMin === currentMin ? currentMin : localMin;
  const maxValue = localMax === currentMax ? currentMax : localMax;
  const selectedWidth = ((maxValue - minValue) / effectiveMaxHarga) * 100;
  const selectedLeft = (minValue / effectiveMaxHarga) * 100;
  const minimumValueText = minValue > 0 ? formatRupiah(minValue) : "Bebas";
  const maximumValueText =
    maxValue < effectiveMaxHarga ? formatRupiah(maxValue) : "Bebas";
  const focusRingClass =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2";

  const filterContent = (
    <>
      <div className="mb-4 flex items-center justify-between border-b border-black/5 px-5 pt-5 pb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Penyaring
          </p>
          <h2 className="mt-1 text-sm font-bold text-charcoal">Atur pencarian</h2>
        </div>
        <div className="flex items-center gap-3">
          {hasFilter ? (
            <button
              type="button"
              onClick={reset}
              className={`text-xs font-medium text-primary hover:underline ${focusRingClass}`}
            >
              Reset semua
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className={`rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted lg:hidden ${focusRingClass}`}
          >
            Tutup
          </button>
        </div>
      </div>

      <div className="space-y-5 px-5 pb-5">
        <div className="rounded-[1.35rem] border border-black/5 bg-white/60 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Kampus
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => pushFilter("kampus", "")}
              title="Semua kampus"
              className={cn(
                `min-h-10 rounded-full px-3 py-2 text-xs font-semibold transition-all ${focusRingClass}`,
                currentKampus === ""
                  ? "bg-primary text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              Semua
            </button>
            {kampus.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  pushFilter("kampus", currentKampus === item.slug ? "" : item.slug)
                }
                title={item.nama}
                className={cn(
                  `min-h-10 max-w-[130px] truncate rounded-full px-3 py-2 text-xs font-semibold transition-all ${focusRingClass}`,
                  currentKampus === item.slug
                    ? "bg-primary text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                )}
              >
                {singkatNama(item.nama)}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[1.35rem] border border-black/5 bg-white/60 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Jenis Kos
          </p>
          <div className="flex gap-2">
            {jenisOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => pushFilter("jenis", opt.value)}
                className={cn(
                  `min-h-11 flex-1 rounded-lg px-3 py-2 text-xs font-bold transition-all ${focusRingClass}`,
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

        <div className="rounded-[1.35rem] border border-black/5 bg-white/60 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Rentang Harga
          </p>
          <div className="space-y-4">
            <div className="px-1">
              <div className="relative h-2 rounded-full bg-muted">
                <div
                  className="absolute h-2 rounded-full bg-primary"
                  style={{
                    left: `${selectedLeft}%`,
                    width: `${selectedWidth}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex justify-between">
                <span className="text-xs text-muted-foreground">Minimum</span>
                <span className="text-xs font-bold">
                  {minimumValueText}
                </span>
              </div>
              <input
                type="range"
                aria-label="Harga minimum"
                aria-valuemin={0}
                aria-valuemax={effectiveMaxHarga}
                aria-valuenow={minValue}
                aria-valuetext={minimumValueText}
                min={0}
                max={effectiveMaxHarga}
                step={HARGA_STEP}
                value={minValue}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setLocalMin(Math.min(val, maxValue - HARGA_STEP));
                }}
                onKeyUp={applyHarga}
                onMouseUp={applyHarga}
                onTouchEnd={applyHarga}
                className="w-full"
              />
            </div>

            <div>
              <div className="mb-1 flex justify-between">
                <span className="text-xs text-muted-foreground">Maksimum</span>
                <span className="text-xs font-bold">
                  {maximumValueText}
                </span>
              </div>
              <input
                type="range"
                aria-label="Harga maksimum"
                aria-valuemin={0}
                aria-valuemax={effectiveMaxHarga}
                aria-valuenow={maxValue}
                aria-valuetext={maximumValueText}
                min={0}
                max={effectiveMaxHarga}
                step={HARGA_STEP}
                value={maxValue}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setLocalMax(Math.max(val, minValue + HARGA_STEP));
                }}
                onKeyUp={applyHarga}
                onMouseUp={applyHarga}
                onTouchEnd={applyHarga}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="rounded-[1.35rem] border border-black/5 bg-white/60 p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Jarak ke Kampus
            </p>
            {currentJarakMax > 0 ? (
              <span className="text-xs font-bold text-primary">
                Maks. {currentJarakMax} km
              </span>
            ) : null}
          </div>

          {currentKampus ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyJarak(null)}
                className={cn(
                  `min-h-10 rounded-full px-3 py-2 text-xs font-semibold transition-all ${focusRingClass}`,
                  currentJarakMax === 0
                    ? "bg-primary text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                )}
              >
                Bebas
              </button>
              {JARAK_OPTIONS_KM.map((jarak) => (
                <button
                  key={jarak}
                  type="button"
                  onClick={() => applyJarak(jarak)}
                  className={cn(
                    `min-h-10 rounded-full px-3 py-2 text-xs font-semibold transition-all ${focusRingClass}`,
                    currentJarakMax === jarak
                      ? "bg-primary text-white shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  {"<= "}
                  {jarak} km
                </button>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
              Pilih kampus dulu untuk mengaktifkan filter jarak.
            </p>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen((current) => !current)}
        className={`surface-panel sticky top-20 z-30 flex w-full items-center justify-between rounded-[1.4rem] border border-white/80 px-5 py-4 text-left shadow-[0_16px_34px_rgba(17,17,16,0.08)] lg:hidden ${focusRingClass}`}
      >
        <span className="text-sm font-bold">Filter</span>
        <span className="text-xs font-medium text-primary">
          {hasFilter ? "Ada filter aktif" : "Buka"}
        </span>
      </button>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-black/45 lg:hidden">
          <button
            type="button"
            aria-label="Tutup filter"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0"
          />
          <div className="surface-panel absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[2rem] border-t border-white/70 shadow-2xl">
            {filterContent}
          </div>
        </div>
      ) : null}

      <aside className="surface-panel hidden rounded-[1.6rem] border border-white/80 shadow-[0_18px_40px_rgba(17,17,16,0.07)] lg:block">
        {filterContent}
      </aside>
    </>
  );
}
