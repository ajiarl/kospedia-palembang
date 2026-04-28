"use client";

import { useDeferredValue, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Kampus = { nama: string; slug: string };

export default function HeroSearch({ kampus }: { kampus: Kampus[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isDismissed, setIsDismissed] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const deferredQuery = useDeferredValue(query);
  const suggestions =
    deferredQuery.length >= 1
      ? kampus.filter((k) =>
          k.nama.toLowerCase().includes(deferredQuery.toLowerCase())
        )
      : [];
  const open = !isDismissed && deferredQuery.length >= 1 && suggestions.length > 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsDismissed(true);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectKampus(slug: string) {
    setIsDismissed(true);
    setQuery("");
    router.push(`/kos?kampus=${slug}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (q) {
      const match = kampus.find((k) => k.nama.toLowerCase().includes(q));
      router.push(match ? `/kos?kampus=${match.slug}` : "/kos");
    } else {
      router.push("/kos");
    }
    setIsDismissed(true);
  }

  return (
    <div ref={wrapperRef} className="relative mx-auto w-full max-w-xl">
      <form onSubmit={handleSubmit}>
        <div className="surface-panel flex flex-col gap-2 rounded-[1.1rem] border border-white/60 p-1.5 shadow-[0_14px_30px_rgba(17,17,16,0.14)] ring-1 ring-black/5 md:flex-row md:items-center md:gap-1.5">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-[0.85rem] bg-white/84 px-3 py-1.5 ring-1 ring-black/5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-coral-50 text-coral-500">
              <svg
                className="h-3.5 w-3.5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsDismissed(false);
              }}
              placeholder="Cari kampus, misalnya Unsri atau Polsri"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              autoComplete="off"
              suppressHydrationWarning
            />
          </div>

          <button
            type="submit"
            suppressHydrationWarning
            className="rounded-[0.85rem] bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-600 active:scale-95 md:min-w-[96px]"
          >
            Cari
          </button>
        </div>
      </form>

      {open && suggestions.length > 0 && (
        <div className="surface-panel absolute left-0 right-0 top-full z-50 mt-3 overflow-hidden rounded-[1.5rem] border border-white/70 shadow-[0_18px_44px_rgba(17,17,16,0.16)]">
          {suggestions.map((k) => (
            <button
              key={k.slug}
              type="button"
              onClick={() => selectKampus(k.slug)}
              className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm transition-colors hover:bg-white/70"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-50 text-forest-500">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </span>
              <span className="font-medium text-foreground">{k.nama}</span>
            </button>
          ))}
          <div className="border-t border-black/5 px-5 py-3">
            <button
              type="button"
              onClick={() => {
                router.push("/kos");
                setIsDismissed(true);
              }}
              className="text-xs font-semibold uppercase tracking-[0.16em] text-primary hover:underline"
            >
              Lihat semua kos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
