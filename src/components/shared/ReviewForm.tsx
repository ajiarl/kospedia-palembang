"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ReviewForm({
  kosId,
  isLoggedIn,
}: {
  kosId: string;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [komentar, setKomentar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setPesan(null);

    const response = await fetch("/api/review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        kosId,
        rating,
        komentar,
      }),
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
    setPesan("Review kamu sudah tersimpan.");
    router.refresh();
  }

  if (!isLoggedIn) {
    return (
      <div className="rounded-lg border bg-muted/40 p-4">
        <p className="text-sm text-muted-foreground">
          Masuk dulu untuk menulis review kos ini.
        </p>
        <Link
          href={`/login?next=/kos/${kosId}`}
          className="mt-3 inline-flex rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition hover:bg-primary-600"
        >
          Masuk
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-muted/30 p-4">
      <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
        <div>
          <label htmlFor="rating" className="text-sm font-medium">
            Rating
          </label>
          <select
            id="rating"
            value={rating}
            onChange={(event) => setRating(Number(event.target.value))}
            className="mt-2 w-full rounded-md border bg-white px-3 py-2 text-sm"
          >
            <option value={5}>5 - Sangat baik</option>
            <option value={4}>4 - Baik</option>
            <option value={3}>3 - Cukup</option>
            <option value={2}>2 - Kurang</option>
            <option value={1}>1 - Buruk</option>
          </select>
        </div>

        <div>
          <label htmlFor="komentar" className="text-sm font-medium">
            Komentar
          </label>
          <textarea
            id="komentar"
            value={komentar}
            onChange={(event) => setKomentar(event.target.value)}
            rows={3}
            maxLength={500}
            className="mt-2 w-full resize-none rounded-md border bg-white px-3 py-2 text-sm"
            placeholder="Ceritakan pengalaman atau kesanmu tentang kos ini."
          />
        </div>
      </div>

      {error ? (
        <p className="mt-3 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {pesan ? (
        <p className="mt-3 rounded-md border border-primary/30 bg-primary-50 px-3 py-2 text-sm text-primary-700">
          {pesan}
        </p>
      ) : null}

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : "Kirim Review"}
        </button>
      </div>
    </form>
  );
}
