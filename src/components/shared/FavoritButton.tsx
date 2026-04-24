"use client";

import { useState } from "react";

import { useFavorit } from "@/hooks/useFavorit";

export default function FavoritButton({ kosId }: { kosId: string }) {
  const { hapusFavorit, isFavorit, loading, tambahFavorit } = useFavorit();
  const [pending, setPending] = useState(false);
  const tersimpan = isFavorit(kosId);

  async function handleClick() {
    setPending(true);

    if (tersimpan) {
      await hapusFavorit(kosId);
    } else {
      await tambahFavorit(kosId);
    }

    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || pending}
      className="shrink-0 rounded-md border px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
    >
      {tersimpan ? "Tersimpan" : "Simpan"}
    </button>
  );
}
