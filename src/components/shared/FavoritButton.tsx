"use client";

import { useState } from "react";
import { useFavorit } from "@/hooks/useFavorit";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 transition-transform"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

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
      aria-label={tersimpan ? "Hapus dari favorit" : "Simpan ke favorit"}
      className={`shrink-0 rounded-full p-2 transition-all hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
        tersimpan
          ? "text-red-500 hover:text-red-600"
          : "text-muted-foreground/50 hover:text-red-400"
      }`}
    >
      <HeartIcon filled={tersimpan} />
    </button>
  );
}
