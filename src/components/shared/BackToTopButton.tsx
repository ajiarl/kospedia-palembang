"use client";

import { useEffect, useState } from "react";

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 480);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-5 right-5 z-40 rounded-full border border-border bg-background/95 px-4 py-3 text-sm font-semibold text-foreground shadow-lg backdrop-blur transition hover:border-primary/30 hover:text-primary"
      aria-label="Kembali ke atas"
    >
      Naik
    </button>
  );
}
