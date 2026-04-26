"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { trackEvent } from "@/lib/analytics";
import { StarPicker } from "@/components/shared/StarPicker";

export default function ReviewForm({
  kosId,
  kosPath,
  isLoggedIn,
}: {
  kosId: string;
  kosPath: string;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [komentar, setKomentar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const komentarCounterId = "komentar-counter";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setPesan(null);

    const response = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kosId, rating, komentar }),
    });

    const payload = (await response.json()) as { pesan?: string };
    setLoading(false);

    if (response.status === 401) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!response.ok) {
      setError(payload.pesan ?? "Review gagal disimpan.");
      return;
    }

    setKomentar("");
    setPesan("Review kamu berhasil ditambahkan atau diperbarui. Terima kasih!");
    trackEvent("review_submit", {
      kos_id: kosId,
      rating,
      has_comment: Boolean(komentar.trim()),
    });
    router.refresh();
  }

  if (!isLoggedIn) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          Masuk dulu untuk menulis review kos ini.
        </p>
        <Link
          href={`/login?next=${encodeURIComponent(kosPath)}`}
          className="mt-3 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-600"
        >
          Masuk
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-4">
      <div className="space-y-4">
        {/* Star Picker */}
        <div>
          <label className="mb-2 block text-sm font-medium">Rating</label>
          <StarPicker value={rating} onChange={setRating} />
        </div>

        {/* Komentar */}
        <div>
          <label htmlFor="komentar" className="mb-1.5 block text-sm font-medium">
            Komentar <span className="text-muted-foreground">(opsional)</span>
          </label>
          <textarea
            id="komentar"
            aria-describedby={komentarCounterId}
            value={komentar}
            onChange={(e) => setKomentar(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Ceritakan pengalaman atau kesanmu tentang kos ini."
          />
          <p id={komentarCounterId} className="mt-1 text-right text-xs text-muted-foreground">
            {komentar.length}/500
          </p>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      {pesan && (
        <p className="mt-3 rounded-lg border border-primary/30 bg-primary-50 px-3 py-2 text-sm text-primary-700">
          {pesan}
        </p>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : "Kirim Review"}
        </button>
      </div>
    </form>
  );
}
