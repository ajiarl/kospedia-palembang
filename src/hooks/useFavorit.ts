"use client";

import { useCallback, useEffect, useState } from "react";

export function useFavorit() {
  const [favorit, setFavorit] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let aktif = true;

    async function loadFavorit() {
      const response = await fetch("/api/favorit");

      if (response.ok) {
        const payload = (await response.json()) as {
          data: { kos_id: string }[];
        };

        if (aktif) {
          setFavorit(payload.data.map((item) => item.kos_id));
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

  const tambahFavorit = useCallback(async (kosId: string) => {
    const response = await fetch("/api/favorit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ kosId }),
    });

    if (response.status === 401) {
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    if (response.ok) {
      setFavorit((current) =>
        current.includes(kosId) ? current : [...current, kosId]
      );
    }
  }, []);

  const hapusFavorit = useCallback(async (kosId: string) => {
    const response = await fetch(`/api/favorit?kosId=${encodeURIComponent(kosId)}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setFavorit((current) => current.filter((id) => id !== kosId));
    }
  }, []);

  const isFavorit = useCallback(
    (kosId: string) => favorit.includes(kosId),
    [favorit]
  );

  return {
    favorit,
    loading,
    tambahFavorit,
    hapusFavorit,
    isFavorit,
  };
}
