"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type Kampus = { nama: string; slug: string };

export default function HeroSearch({ kampus }: { kampus: Kampus[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Kampus[]>([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length >= 1) {
      const filtered = kampus.filter((k) =>
        k.nama.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
      setOpen(filtered.length > 0);
    } else {
      setSuggestions([]);
      setOpen(false);
    }
  }, [query, kampus]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectKampus(slug: string) {
    setOpen(false);
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
    setOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative mx-auto w-full max-w-xl">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5">
          <svg
            className="ml-3 h-5 w-5 shrink-0 text-muted-foreground"
            xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari kos dekat kampus mana?"
            className="flex-1 bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            autoComplete="off"
          />
          <button
            type="submit"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-600 active:scale-95"
          >
            Cari
          </button>
        </div>
      </form>

      {/* Autocomplete Dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border bg-white shadow-xl">
          {suggestions.map((k) => (
            <button
              key={k.slug}
              type="button"
              onClick={() => selectKampus(k.slug)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-muted"
            >
              <svg className="h-4 w-4 shrink-0 text-teal-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              {k.nama}
            </button>
          ))}
          <div className="border-t px-4 py-2.5">
            <button
              type="button"
              onClick={() => { router.push("/kos"); setOpen(false); }}
              className="text-xs font-medium text-primary hover:underline"
            >
              Lihat semua kos →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
