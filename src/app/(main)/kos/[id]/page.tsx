import Link from "next/link";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import FavoritButton from "@/components/shared/FavoritButton";
import KosFoto from "@/components/shared/KosFoto";
import MapViewClient from "@/components/shared/MapViewClient";
import ReviewForm from "@/components/shared/ReviewForm";
import WhatsAppButton from "@/components/shared/WhatsAppButton";
import { getCurrentUser } from "@/lib/auth";
import { normalizeWhatsAppNumber } from "@/lib/contact";
import { getFasilitasIcon } from "@/lib/fasilitas";
import { getKosByIdentifier, getKosPath } from "@/lib/kos";
import {
  absoluteImageUrl,
  absoluteUrl,
  buildKosDescription,
  buildKosTitle,
  serializeJsonLd,
  SITE_DESCRIPTION,
} from "@/lib/seo";
import { formatRupiah } from "@/lib/utils";

type Params = Promise<{ id: string }>;


function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          viewBox="0 0 20 20"
          className={`h-4 w-4 ${star <= Math.round(value) ? "fill-amber-400" : "fill-muted stroke-muted-foreground/30"}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-sm font-semibold">{value.toFixed(1)}</span>
    </div>
  );
}

function getReviewerLabel(reviewUserId: string, currentUserId?: string) {
  return reviewUserId === currentUserId ? "Anda" : "Pengguna terverifikasi";
}

function getReviewerInitial(label: string) {
  return label.charAt(0).toUpperCase();
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id: identifier } = await params;
  const kos = await getKosByIdentifier(identifier);

  if (!kos) {
    return {
      title: "Kos tidak ditemukan",
      description: SITE_DESCRIPTION,
      alternates: {
        canonical: "/kos",
      },
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = buildKosTitle(kos.nama, kos.kampus?.nama);
  const description = buildKosDescription(kos.deskripsi, kos.alamat, kos.kampus?.nama);
  const image = absoluteImageUrl(kos.foto[0]);

  return {
    title,
    description,
    alternates: {
      canonical: getKosPath(kos),
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: absoluteUrl(getKosPath(kos)),
      images: image ? [{ url: image, alt: kos.nama }] : undefined,
    },
    twitter: {
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function HalamanDetailKos({ params }: { params: Params }) {
  const { id: identifier } = await params;
  const kos = await getKosByIdentifier(identifier);
  const user = await getCurrentUser();

  if (!kos) {
    notFound();
  }

  const kosPath = getKosPath(kos);

  if (identifier !== kos.slug) {
    permanentRedirect(kosPath);
  }

  const harga =
    kos.harga_min === kos.harga_max
      ? formatRupiah(kos.harga_min)
      : `${formatRupiah(kos.harga_min)} - ${formatRupiah(kos.harga_max)}`;

  const averageRating =
    kos.review.length > 0
      ? kos.review.reduce((t, r) => t + r.rating, 0) / kos.review.length
      : null;

  const whatsappNumber = normalizeWhatsAppNumber(kos.kontak);
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Halo, saya tertarik dengan ${kos.nama} yang saya lihat di KosPedia Palembang.`
      )}`
    : null;

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
  const detailJsonLd = {
    "@context": "https://schema.org",
    "@type": "Accommodation",
    name: kos.nama,
    description: buildKosDescription(kos.deskripsi, kos.alamat, kos.kampus?.nama),
    url: absoluteUrl(kosPath),
    image: kos.foto.map((item) => absoluteImageUrl(item)).filter(Boolean),
    address: {
      "@type": "PostalAddress",
      streetAddress: kos.alamat,
      addressLocality: "Palembang",
      addressCountry: "ID",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: kos.lat,
      longitude: kos.lng,
    },
    amenityFeature: kos.fasilitas.map((item) => ({
      "@type": "LocationFeatureSpecification",
      name: item,
      value: true,
    })),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "IDR",
      lowPrice: kos.harga_min,
      highPrice: kos.harga_max,
      offerCount: 1,
      availability: "https://schema.org/InStock",
    },
    aggregateRating: averageRating
      ? {
          "@type": "AggregateRating",
          ratingValue: Number(averageRating.toFixed(1)),
          reviewCount: kos.review.length,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
    additionalProperty: kos.kampus
      ? [
          {
            "@type": "PropertyValue",
            name: "Kampus terdekat",
            value: kos.kampus.nama,
          },
        ]
      : undefined,
  };

  return (
    <div className="container py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(detailJsonLd) }}
      />
      <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="shrink-0 transition-colors hover:text-foreground">
          Beranda
        </Link>
        <span>/</span>
        <Link href="/kos" className="shrink-0 transition-colors hover:text-foreground">
          Cari Kos
        </Link>
        {kos.kampus ? (
          <>
            <span>/</span>
            <Link
              href={`/kos?kampus=${kos.kampus.slug}`}
              className="max-w-[120px] truncate transition-colors hover:text-foreground sm:max-w-none"
              title={kos.kampus.nama}
            >
              {kos.kampus.nama}
            </Link>
          </>
        ) : null}
        <span>/</span>
        <span
          className="max-w-[120px] truncate font-semibold text-foreground sm:max-w-xs"
          title={kos.nama}
        >
          {kos.nama}
        </span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <main className="space-y-6">
          <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="relative h-72">
              <KosFoto foto={kos.foto} nama={kos.nama} jenis={kos.jenis} className="h-full w-full" />
              <span className="absolute left-4 top-4 rounded-full bg-card/95 px-3 py-1 text-xs font-bold capitalize shadow-sm">
                {kos.jenis}
              </span>
            </div>
            <div className="space-y-4 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-primary">
                    {kos.kampus?.nama ?? "Area Palembang"}
                  </p>
                  <h1 className="mt-1 text-3xl font-black">{kos.nama}</h1>
                  <p className="mt-1 text-muted-foreground">{kos.alamat}</p>
                </div>
                <FavoritButton kosId={kos.id} />
              </div>
              {averageRating ? <StarRating value={averageRating} /> : null}
              <p className="text-muted-foreground">{kos.deskripsi}</p>
            </div>
          </section>

          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-bold">Fasilitas</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {kos.fasilitas.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2.5 rounded-lg bg-muted/60 px-3 py-2.5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 text-primary"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={getFasilitasIcon(item)} />
                    </svg>
                  </div>
                  <span className="text-xs font-medium leading-tight">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-bold">Lokasi</h2>
            <div className="mt-4">
              <MapViewClient center={[kos.lat, kos.lng]} zoom={15} markers={mapMarkers} className="h-80" />
            </div>
          </section>

          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold">Review Mahasiswa</h2>
              {averageRating ? (
                <StarRating value={averageRating} />
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada rating</p>
              )}
            </div>

            <div className="mt-4">
              <ReviewForm kosId={kos.id} kosPath={kosPath} isLoggedIn={Boolean(user)} />
            </div>

            <div className="mt-4 space-y-3">
              {kos.review.length > 0 ? (
                kos.review.map((review) => {
                  const reviewerLabel = getReviewerLabel(review.user_id, user?.id);

                  return (
                    <div key={review.id} className="rounded-xl border bg-muted/30 p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {getReviewerInitial(reviewerLabel)}
                        </div>
                        <div>
                          <p className="text-xs font-medium">{reviewerLabel}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <span className="ml-auto flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600">
                          <svg viewBox="0 0 20 20" className="h-3 w-3 fill-amber-400">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {review.rating}/5
                        </span>
                      </div>
                      {review.komentar ? (
                        <p className="mt-2 text-sm text-foreground/80">{review.komentar}</p>
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">
                  Jadilah mahasiswa pertama yang memberi review untuk kos ini.
                </p>
              )}
            </div>
          </section>
        </main>

        <aside className="h-fit rounded-xl border bg-card p-6 shadow-sm lg:sticky lg:top-24">
          <p className="text-sm text-muted-foreground">Harga mulai dari</p>
          <p className="mt-1 text-4xl font-black leading-none text-primary">{harga}</p>
          <p className="mt-1 text-sm text-muted-foreground">per bulan</p>

          <div className="mt-5 space-y-3 rounded-lg bg-muted/50 p-3 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Jenis</span>
              <span className="font-semibold capitalize">{kos.jenis}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Kampus</span>
              <span className="text-right font-semibold">
                {kos.kampus?.nama ?? "Palembang"}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Sumber data</span>
              <span className="font-semibold capitalize">{kos.sumber_data}</span>
            </div>
          </div>

          {whatsappUrl ? (
            <WhatsAppButton href={whatsappUrl} kosId={kos.id} kosName={kos.nama} />
          ) : (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Nomor WhatsApp pemilik belum valid, jadi kontak belum bisa dibuka.
            </div>
          )}

          <Link
            href="/kos"
            className="mt-3 block rounded-xl border px-4 py-3 text-center text-sm font-medium text-muted-foreground transition hover:border-primary/40 hover:text-primary"
          >
            {"<-"} Kembali ke daftar kos
          </Link>
        </aside>
      </div>
    </div>
  );
}
