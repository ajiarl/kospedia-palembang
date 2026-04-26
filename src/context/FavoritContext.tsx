"use client";

import {
  createContext,
  use,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type FavoritContextValue = {
  favorit: string[];
  loading: boolean;
  error: string | null;
  tambahFavorit: (kosId: string) => Promise<void>;
  hapusFavorit: (kosId: string) => Promise<void>;
  isFavorit: (kosId: string) => boolean;
};

const FavoritContext = createContext<FavoritContextValue | null>(null);

export function FavoritProvider({ children }: { children: ReactNode }) {
  const [favorit, setFavorit] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let aktif = true;

    async function loadFavorit() {
      try {
        const response = await fetch("/api/favorit");

        if (response.ok) {
          const payload = (await response.json()) as {
            data: { kos_id: string }[];
          };

          if (aktif) {
            setIsAuthenticated(true);
            setFavorit(payload.data.map((item) => item.kos_id));
            setError(null);
          }
        } else if (aktif) {
          setIsAuthenticated(false);
          setError("Favorit belum bisa dimuat sekarang.");
        }
      } catch {
        if (aktif) {
          setIsAuthenticated(false);
          setError("Koneksi ke favorit sedang bermasalah. Coba lagi.");
        }
      }

      if (aktif) {
        setLoading(false);
      }
    }

    loadFavorit();

    return () => {
      aktif = false;
    };
  }, []);

  useEffect(() => {
    if (loading || !isAuthenticated) return;

    const rawIntent = window.localStorage.getItem("pending-favorit-intent");
    if (!rawIntent) return;

    const intent = JSON.parse(rawIntent) as { kosId?: string };
    if (!intent.kosId || favorit.includes(intent.kosId)) {
      window.localStorage.removeItem("pending-favorit-intent");
      return;
    }

    async function consumeIntent() {
      const response = await fetch("/api/favorit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ kosId: intent.kosId }),
      });

      if (response.ok) {
        setFavorit((current) =>
          current.includes(intent.kosId!) ? current : [...current, intent.kosId!]
        );
      } else {
        setError("Favorit belum berhasil disimpan otomatis.");
      }

      window.localStorage.removeItem("pending-favorit-intent");
    }

    consumeIntent();
  }, [favorit, isAuthenticated, loading]);

  async function tambahFavorit(kosId: string) {
    const response = await fetch("/api/favorit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ kosId }),
    });

    if (response.status === 401) {
      window.localStorage.setItem(
        "pending-favorit-intent",
        JSON.stringify({
          kosId,
          path: window.location.pathname,
        })
      );
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    if (response.ok) {
      setFavorit((current) =>
        current.includes(kosId) ? current : [...current, kosId]
      );
      setError(null);
    } else {
      setError("Kos belum berhasil ditambahkan ke favorit.");
    }
  }

  async function hapusFavorit(kosId: string) {
    const response = await fetch(`/api/favorit?kosId=${encodeURIComponent(kosId)}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setFavorit((current) => current.filter((id) => id !== kosId));
      setError(null);
    } else {
      setError("Kos belum berhasil dihapus dari favorit.");
    }
  }

  function isFavorit(kosId: string) {
    return favorit.includes(kosId);
  }

  return (
    <FavoritContext
      value={{
        favorit,
        loading,
        error,
        tambahFavorit,
        hapusFavorit,
        isFavorit,
      }}
    >
      {children}
    </FavoritContext>
  );
}

export function useFavoritContext() {
  const context = use(FavoritContext);

  if (!context) {
    throw new Error("useFavoritContext harus dipakai di dalam FavoritProvider");
  }

  return context;
}
