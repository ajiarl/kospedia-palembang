"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { trackEvent } from "@/lib/analytics";
import { cn, formatRupiah, singkatNamaKampus } from "@/lib/utils";
import type { KampusRow } from "@/types/kos";

const HARGA_MAX_DEFAULT = 2_500_000;
const HARGA_STEP = 100_000;
const JARAK_OPTIONS_KM = [0.5, 1, 2, 3, 5];

const FASILITAS_OPTIONS = [
  { value: "wifi", label: "WiFi" },
  { value: "ac", label: "AC" },
  { value: "kamar mandi dalam", label: "KM Dalam" },
  { value: "parkir motor", label: "Parkir" },
  { value: "dapur bersama", label: "Dapur" },
  { value: "lemari", label: "Lemari" },
  { value: "kasur", label: "Kasur" },
  { value: "laundry sekitar", label: "Laundry" },
];

const jenisOptions = [
  { value: "", label: "Semua" },
  { value: "putra", label: "Putra" },
  { value: "putri", label: "Putri" },
  { value: "campur", label: "Campur" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

type LocalFilters = {
  kampus: string;
  jenis: string;
  hargaMin: number;
  hargaMax: number;
  jarakMax: number;
  fasilitas: string[];
};

function readFiltersFromParams(
  sp: URLSearchParams,
  effectiveMaxHarga: number
): LocalFilters {
  return {
    kampus: sp.get("kampus") ?? "",
    jenis: sp.get("jenis") ?? "",
    hargaMin: Number(sp.get("hargaMin")) || 0,
    hargaMax: Math.min(
      Number(sp.get("hargaMax")) || effectiveMaxHarga,
      effectiveMaxHarga
    ),
    jarakMax: Number(sp.get("jarakMax")) || 0,
    fasilitas: (sp.get("fasilitas") ?? "").split(",").filter(Boolean),
  };
}

function filtersToParams(f: LocalFilters, effectiveMaxHarga: number): string {
  const params = new URLSearchParams();
  if (f.kampus) params.set("kampus", f.kampus);
  if (f.jenis) params.set("jenis", f.jenis);
  if (f.hargaMin > 0) params.set("hargaMin", String(f.hargaMin));
  if (f.hargaMax < effectiveMaxHarga)
    params.set("hargaMax", String(f.hargaMax));
  if (f.jarakMax > 0 && f.kampus) params.set("jarakMax", String(f.jarakMax));
  if (f.fasilitas.length > 0) params.set("fasilitas", f.fasilitas.join(","));
  return params.toString();
}

function hasAnyFilter(f: LocalFilters, effectiveMaxHarga: number): boolean {
  return !!(
    f.kampus ||
    f.jenis ||
    f.hargaMin > 0 ||
    f.hargaMax < effectiveMaxHarga ||
    f.jarakMax > 0 ||
    f.fasilitas.length > 0
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function FilterSidebar({
  kampus,
  maxHarga = HARGA_MAX_DEFAULT,
}: {
  kampus: KampusRow[];
  maxHarga?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const effectiveMaxHarga = Math.max(HARGA_STEP, maxHarga);

  // ── Local draft state (only pushed on "Terapkan") ─────────────────────────
  const [draft, setDraft] = useState<LocalFilters>(() =>
    readFiltersFromParams(searchParams, effectiveMaxHarga)
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  // Check if local draft differs from URL (show "unsaved" indicator)
  const committed = readFiltersFromParams(searchParams, effectiveMaxHarga);
  const isDirty =
    draft.kampus !== committed.kampus ||
    draft.jenis !== committed.jenis ||
    draft.hargaMin !== committed.hargaMin ||
    draft.hargaMax !== committed.hargaMax ||
    draft.jarakMax !== committed.jarakMax ||
    draft.fasilitas.join(",") !== committed.fasilitas.join(",");

  const hasFilter = hasAnyFilter(draft, effectiveMaxHarga);

  // ── Draft updaters (no navigation) ────────────────────────────────────────

  function setKampus(slug: string) {
    setDraft((prev) => ({
      ...prev,
      kampus: slug,
      jarakMax: slug ? prev.jarakMax : 0,
    }));
    if (slug) {
      trackEvent("filter_kampus_select", {
        kampus_slug: slug,
        source: "listing_sidebar",
      });
    }
  }

  function setJenis(value: string) {
    setDraft((prev) => ({ ...prev, jenis: value }));
  }

  function setHargaMin(val: number) {
    setDraft((prev) => ({
      ...prev,
      hargaMin: Math.min(val, prev.hargaMax - HARGA_STEP),
    }));
  }

  function setHargaMax(val: number) {
    setDraft((prev) => ({
      ...prev,
      hargaMax: Math.max(val, prev.hargaMin + HARGA_STEP),
    }));
  }

  function setJarakMax(km: number) {
    setDraft((prev) => ({ ...prev, jarakMax: km }));
  }

  function toggleFasilitas(value: string) {
    setDraft((prev) => ({
      ...prev,
      fasilitas: prev.fasilitas.includes(value)
        ? prev.fasilitas.filter((v) => v !== value)
        : [...prev.fasilitas, value],
    }));
  }

  // ── Actions (navigate) ────────────────────────────────────────────────────

  function applyFilters() {
    const qs = filtersToParams(draft, effectiveMaxHarga);
    if (window.innerWidth < 1024) setMobileOpen(false);
    router.push(qs ? `/kos?${qs}` : "/kos");
  }

  function resetAll() {
    const clean: LocalFilters = {
      kampus: "",
      jenis: "",
      hargaMin: 0,
      hargaMax: effectiveMaxHarga,
      jarakMax: 0,
      fasilitas: [],
    };
    setDraft(clean);
    if (window.innerWidth < 1024) setMobileOpen(false);
    router.push("/kos");
  }

  // ── Derived display values ────────────────────────────────────────────────

  const selectedWidth =
    ((draft.hargaMax - draft.hargaMin) / effectiveMaxHarga) * 100;
  const selectedLeft = (draft.hargaMin / effectiveMaxHarga) * 100;
  const minimumValueText =
    draft.hargaMin > 0 ? formatRupiah(draft.hargaMin) : "Bebas";
  const maximumValueText =
    draft.hargaMax < effectiveMaxHarga
      ? formatRupiah(draft.hargaMax)
      : "Bebas";
  const focusRingClass =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2";

  // ── JSX ───────────────────────────────────────────────────────────────────

  const filterContent = (
    <div className="p-5">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Penyaring
          </p>
          <h2 className="mt-0.5 text-sm font-bold text-charcoal">Atur pencarian</h2>
        </div>
        <div className="flex items-center gap-3">
          {hasFilter ? (
            <button
              type="button"
              onClick={resetAll}
              aria-label="Reset semua filter"
              className={`text-xs font-medium text-primary hover:underline ${focusRingClass}`}
            >
              Reset
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

      {/* ── Kampus ───────────────────────────────────────────────────── */}
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Kampus
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setKampus("")}
            title="Semua kampus"
            aria-label="Filter semua kampus"
            aria-pressed={draft.kampus === ""}
            className={cn(
              `rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition-all ${focusRingClass}`,
              draft.kampus === ""
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
                setKampus(draft.kampus === item.slug ? "" : item.slug)
              }
              title={item.nama}
              aria-label={`Filter kampus ${item.nama}`}
              aria-pressed={draft.kampus === item.slug}
              className={cn(
                `max-w-[120px] truncate rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition-all ${focusRingClass}`,
                draft.kampus === item.slug
                  ? "bg-primary text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              {singkatNamaKampus(item.nama)}
            </button>
          ))}
        </div>
      </div>

      <hr className="my-5 border-black/5" />

      {/* ── Jenis Kos ────────────────────────────────────────────────── */}
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Jenis Kos
        </p>
        <div className="flex gap-1.5">
          {jenisOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setJenis(opt.value)}
              aria-label={`Filter jenis ${opt.label}`}
              aria-pressed={draft.jenis === opt.value}
              className={cn(
                `flex-1 rounded-lg px-2.5 py-2 text-[11px] font-bold transition-all ${focusRingClass}`,
                draft.jenis === opt.value
                  ? "bg-primary text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <hr className="my-5 border-black/5" />

      {/* ── Rentang Harga ────────────────────────────────────────────── */}
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Rentang Harga
        </p>
        <div className="space-y-3">
          <div className="px-1">
            <div className="relative h-1.5 rounded-full bg-muted">
              <div
                className="absolute h-1.5 rounded-full bg-primary"
                style={{
                  left: `${selectedLeft}%`,
                  width: `${selectedWidth}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex justify-between">
              <span className="text-[11px] text-muted-foreground">Minimum</span>
              <span className="text-[11px] font-bold">{minimumValueText}</span>
            </div>
            <input
              type="range"
              aria-label="Harga minimum"
              aria-valuemin={0}
              aria-valuemax={effectiveMaxHarga}
              aria-valuenow={draft.hargaMin}
              aria-valuetext={minimumValueText}
              min={0}
              max={effectiveMaxHarga}
              step={HARGA_STEP}
              value={draft.hargaMin}
              onChange={(e) => setHargaMin(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="mb-1 flex justify-between">
              <span className="text-[11px] text-muted-foreground">Maksimum</span>
              <span className="text-[11px] font-bold">{maximumValueText}</span>
            </div>
            <input
              type="range"
              aria-label="Harga maksimum"
              aria-valuemin={0}
              aria-valuemax={effectiveMaxHarga}
              aria-valuenow={draft.hargaMax}
              aria-valuetext={maximumValueText}
              min={0}
              max={effectiveMaxHarga}
              step={HARGA_STEP}
              value={draft.hargaMax}
              onChange={(e) => setHargaMax(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <hr className="my-5 border-black/5" />

      {/* ── Fasilitas ────────────────────────────────────────────────── */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Fasilitas
          </p>
          {draft.fasilitas.length > 0 ? (
            <span className="text-[11px] font-bold text-primary">
              {draft.fasilitas.length} dipilih
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FASILITAS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleFasilitas(opt.value)}
              aria-label={`Filter fasilitas ${opt.label}`}
              aria-pressed={draft.fasilitas.includes(opt.value)}
              className={cn(
                `rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition-all ${focusRingClass}`,
                draft.fasilitas.includes(opt.value)
                  ? "bg-primary text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <hr className="my-5 border-black/5" />

      {/* ── Jarak ke Kampus ──────────────────────────────────────────── */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Jarak ke Kampus
          </p>
          {draft.jarakMax > 0 ? (
            <span className="text-[11px] font-bold text-primary">
              Maks. {draft.jarakMax} km
            </span>
          ) : null}
        </div>

        {draft.kampus ? (
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setJarakMax(0)}
              aria-label="Tanpa batas jarak"
              aria-pressed={draft.jarakMax === 0}
              className={cn(
                `rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition-all ${focusRingClass}`,
                draft.jarakMax === 0
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
                onClick={() => setJarakMax(jarak)}
                aria-label={`Filter jarak maksimal ${jarak} km`}
                aria-pressed={draft.jarakMax === jarak}
                className={cn(
                  `rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition-all ${focusRingClass}`,
                  draft.jarakMax === jarak
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
          <p className="rounded-lg border border-dashed border-black/10 bg-muted/30 px-3 py-2.5 text-[11px] text-muted-foreground">
            Pilih kampus dulu untuk mengaktifkan filter jarak.
          </p>
        )}
      </div>

      {/* ── Action Buttons ───────────────────────────────────────────── */}
      <div className="mt-6 space-y-2">
        <button
          type="button"
          onClick={applyFilters}
          className={cn(
            "w-full rounded-xl bg-primary px-5 py-2.5 text-[13px] font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary-600 active:scale-[0.98]",
            isDirty &&
              "animate-pulse ring-2 ring-primary/30 ring-offset-2"
          )}
        >
          Terapkan Filter
        </button>
        {hasFilter ? (
          <button
            type="button"
            onClick={resetAll}
            className="w-full rounded-xl border border-black/10 bg-white/80 px-5 py-2 text-[13px] font-semibold text-muted-foreground transition-all hover:bg-muted/50"
          >
            Reset Semua
          </button>
        ) : null}
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        id="mobile-filter-trigger"
        onClick={() => setMobileOpen((current) => !current)}
        aria-label="Buka filter pencarian"
        aria-expanded={mobileOpen}
        aria-controls="mobile-filter-panel"
        className={`sticky top-20 z-30 flex w-full items-center justify-between border-b border-black/5 bg-white/60 px-4 py-3.5 text-left backdrop-blur-sm lg:hidden ${focusRingClass}`}
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
          <div
            id="mobile-filter-panel"
            className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[1.5rem] border-t border-black/5 bg-white shadow-2xl"
          >
            {filterContent}
          </div>
        </div>
      ) : null}

      <aside className="hidden max-h-[calc(100vh-6rem)] overflow-y-auto lg:sticky lg:top-20 lg:block">
        {filterContent}
      </aside>
    </>
  );
}
