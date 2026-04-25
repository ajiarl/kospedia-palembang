"use client";

import { useState } from "react";
import { useFavorit } from "@/hooks/useFavorit";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
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
  const [justToggled, setJustToggled] = useState(false);
  const tersimpan = isFavorit(kosId);

  async function handleClick() {
    setPending(true);
    setJustToggled(true);

    if (tersimpan) {
      await hapusFavorit(kosId);
    } else {
      await tambahFavorit(kosId);
    }

    setPending(false);
    // Reset animasi setelah selesai
    setTimeout(() => setJustToggled(false), 600);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || pending}
      aria-label={tersimpan ? "Hapus dari favorit" : "Simpan ke favorit"}
      className={[
        "relative shrink-0 rounded-full p-2 transition-all duration-200",
        "disabled:cursor-not-allowed disabled:opacity-50",
        tersimpan
          ? "text-red-500 hover:text-red-600"
          : "text-muted-foreground/50 hover:text-red-400",
        justToggled && tersimpan ? "scale-125" : "hover:scale-110 active:scale-95",
      ].join(" ")}
    >
      <HeartIcon filled={tersimpan} />
      {/* Pulse ring saat baru ditambahkan ke favorit */}
      {justToggled && tersimpan && (
        <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-30" />
      )}
    </button>
  );
}
