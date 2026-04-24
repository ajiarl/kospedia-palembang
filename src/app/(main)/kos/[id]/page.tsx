import Link from "next/link";
import { notFound } from "next/navigation";

import FavoritButton from "@/components/shared/FavoritButton";
import MapView from "@/components/shared/MapView";
import ReviewForm from "@/components/shared/ReviewForm";
import { getCurrentUser } from "@/lib/auth";
import { formatRupiah } from "@/lib/utils";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { KosDetail } from "@/types/kos";

type Params = Promise<{ id: string }>;

export default async function HalamanDetailKos({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("kos")
    .select(
      "*, kampus:kampus_id(id, nama, slug, lat, lng), review(id, rating, komentar, created_at)"
    )
    .eq("id", id)
    .eq("tersedia", true)
    .single();

  if (error || !data) {
    notFound();
  }

  const kos = data as KosDetail;
  const harga =
    kos.harga_min === kos.harga_max
      ? formatRupiah(kos.harga_min)
      : `${formatRupiah(kos.harga_min)} - ${formatRupiah(kos.harga_max)}`;
  const averageRating =
    kos.review.length > 0
      ? kos.review.reduce((total, review) => total + review.rating, 0) /
        kos.review.length
      : null;
  const whatsappUrl = `https://wa.me/${kos.kontak}?text=${encodeURIComponent(
    `Halo, saya tertarik dengan ${kos.nama} yang saya lihat di KosPedia Palembang.`
  )}`;
  const mapMarkers = [
    {
      id: kos.id,
      nama: kos.nama,
      alamat: kos.alamat,
      lat: kos.lat,
      lng: kos.lng,
      type: "kos" as const,
    },
    ...(kos.kampus
      ? [
          {
            id: kos.kampus.id,
            nama: kos.kampus.nama,
            lat: kos.kampus.lat,
            lng: kos.kampus.lng,
            type: "kampus" as const,
          },
        ]
      : []),
  ];

  return (
    <div className="container py-8">
      <Link href="/kos" className="text-sm font-medium text-primary hover:underline">
        Kembali ke daftar kos
      </Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_360px]">
        <main className="space-y-6">
          <section className="overflow-hidden rounded-lg border bg-white">
            <div className="flex h-72 items-center justify-center bg-gradient-to-br from-primary-50 via-white to-muted">
              <div className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-primary shadow-sm">
                {kos.jenis.toUpperCase()}
              </div>
            </div>
            <div className="space-y-4 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-primary">
                    {kos.kampus?.nama ?? "Area Palembang"}
                  </p>
                  <h1 className="mt-1 text-3xl font-bold">{kos.nama}</h1>
                  <p className="mt-2 text-muted-foreground">{kos.alamat}</p>
                </div>
                <FavoritButton kosId={kos.id} />
              </div>

              <p className="text-muted-foreground">{kos.deskripsi}</p>
            </div>
          </section>

          <section className="rounded-lg border bg-white p-6">
            <h2 className="text-xl font-semibold">Fasilitas</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {kos.fasilitas.map((fasilitas) => (
                <span
                  key={fasilitas}
                  className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground"
                >
                  {fasilitas}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-lg border bg-white p-6">
            <h2 className="text-xl font-semibold">Lokasi</h2>
            <div className="mt-4">
              <MapView
                center={[kos.lat, kos.lng]}
                zoom={15}
                markers={mapMarkers}
                className="h-80"
              />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Koordinat kos: {kos.lat}, {kos.lng}
            </p>
          </section>

          <section className="rounded-lg border bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Review Mahasiswa</h2>
              <p className="text-sm text-muted-foreground">
                {averageRating ? `${averageRating.toFixed(1)} / 5` : "Belum ada rating"}
              </p>
            </div>
            <div className="mt-4">
              <ReviewForm kosId={kos.id} isLoggedIn={Boolean(user)} />
            </div>
            <div className="mt-4 space-y-3">
              {kos.review.length > 0 ? (
                kos.review.map((review) => (
                  <div key={review.id} className="rounded-md border p-3">
                    <p className="text-sm font-medium">{review.rating} / 5</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {review.komentar ?? "Tanpa komentar"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Jadilah mahasiswa pertama yang memberi review untuk kos ini.
                </p>
              )}
            </div>
          </section>
        </main>

        <aside className="h-fit rounded-lg border bg-white p-5 lg:sticky lg:top-24">
          <p className="text-sm text-muted-foreground">Mulai dari</p>
          <p className="mt-1 text-2xl font-bold text-primary">{harga}</p>
          <p className="text-sm text-muted-foreground">per bulan</p>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Jenis</span>
              <span className="font-medium capitalize">{kos.jenis}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Kampus</span>
              <span className="text-right font-medium">
                {kos.kampus?.nama ?? "Palembang"}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Sumber data</span>
              <span className="font-medium capitalize">{kos.sumber_data}</span>
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 block rounded-md bg-primary px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-primary-600"
          >
            Hubungi Pemilik
          </a>
        </aside>
      </div>
    </div>
  );
}
