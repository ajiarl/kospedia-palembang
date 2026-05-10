"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface FavoritContextValue {
  favorit: string[];
  loading: boolean;
  error: string | null;
  toggleFavorit: (kosId: string) => Promise<void>;
  isFavorit: (kosId: string) => boolean;
}

const FavoritContext = createContext<FavoritContextValue | null>(null);

export function FavoritProvider({
  children,
  isAuthenticated,
}: {
  children: React.ReactNode;
  isAuthenticated: boolean;
}) {
  const [favorit, setFavorit] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const favoritRef = useRef<string[]>(favorit);
  useEffect(() => {
    favoritRef.current = favorit;
  }, [favorit]);

  useEffect(() => {
    if (!isAuthenticated) {
      setFavorit([]);
      setLoading(false);
      return;
    }

    let aktif = true;
    setLoading(true);

    async function fetchFavorit() {
      try {
        const response = await fetch("/api/favorit");
        if (!aktif) return;

        if (response.ok) {
          const data = (await response.json()) as { favorit: string[] };
          if (!aktif) return;
          setFavorit(data.favorit ?? []);
        } else {
          setError("Gagal memuat daftar favorit.");
        }
      } catch {
        if (!aktif) return;
        setError("Gagal memuat daftar favorit.");
      } finally {
        if (aktif) setLoading(false);
      }
    }

    void fetchFavorit();

    return () => {
      aktif = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (loading || !isAuthenticated) return;

    const rawIntent = window.localStorage.getItem("pending-favorit-intent");
    if (!rawIntent) return;

    let isMounted = true;

    let intent: { kosId?: string };
    try {
      intent = JSON.parse(rawIntent) as { kosId?: string };
    } catch {
      window.localStorage.removeItem("pending-favorit-intent");
      return;
    }

    if (!intent.kosId || favoritRef.current.includes(intent.kosId)) {
      window.localStorage.removeItem("pending-favorit-intent");
      return;
    }

    async function consumeIntent() {
      try {
        const response = await fetch("/api/favorit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kosId: intent.kosId }),
        });

        if (!isMounted) return;

        if (response.ok) {
          setFavorit((current) =>
            current.includes(intent.kosId!)
              ? current
              : [...current, intent.kosId!]
          );
        } else {
          setError("Favorit belum berhasil disimpan otomatis.");
        }
      } catch {
        if (!isMounted) return;
        setError("Gagal menyimpan favorit yang tertunda.");
      } finally {
        window.localStorage.removeItem("pending-favorit-intent");
      }
    }

    void consumeIntent();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, loading]);

  const toggleFavorit = useCallback(async (kosId: string) => {
    const isCurrentlyFavorit = favoritRef.current.includes(kosId);

    setFavorit((current) =>
      isCurrentlyFavorit
        ? current.filter((id) => id !== kosId)
        : [...current, kosId]
    );
    setError(null);

    try {
      const method = isCurrentlyFavorit ? "DELETE" : "POST";
      const url = method === "DELETE" ? `/api/favorit?kosId=${kosId}` : "/api/favorit";

      const response = await fetch(url, {
        method,
        headers: method === "POST" ? { "Content-Type": "application/json" } : {},
        body: method === "POST" ? JSON.stringify({ kosId }) : undefined,
      });

      if (!response.ok) {
        setFavorit((current) =>
          isCurrentlyFavorit
            ? [...current, kosId]
            : current.filter((id) => id !== kosId)
        );

        if (response.status === 401) {
          localStorage.setItem(
            "pending-favorit-intent",
            JSON.stringify({ kosId, path: window.location.pathname })
          );
          window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
          return;
        }

        setError("Gagal memperbarui favorit.");
      }
    } catch {
      setFavorit((current) =>
        isCurrentlyFavorit
          ? [...current, kosId]
          : current.filter((id) => id !== kosId)
      );
      setError("Gagal memperbarui favorit.");
    }
  }, []);

  const isFavorit = useCallback(
    (kosId: string) => favorit.includes(kosId),
    [favorit]
  );

  return (
    <FavoritContext.Provider
      value={{ favorit, loading, error, toggleFavorit, isFavorit }}
    >
      {children}
    </FavoritContext.Provider>
  );
}

export function useFavorit(): FavoritContextValue {
  const context = useContext(FavoritContext);
  if (!context) {
    throw new Error("useFavorit harus dipakai di dalam FavoritProvider");
  }
  return context;
}
