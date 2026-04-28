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
    ...(kos.locationMeta.isMapVisible
      ? [
          {
            id: kos.id,
            nama: kos.nama,
            alamat: kos.alamat,
            lat: kos.lat,
            lng: kos.lng,
            note: kos.locationMeta.note,
            precision: kos.locationMeta.precision,
            type: "kos" as const,
          },
        ]
      : []),
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
    geo: kos.locationMeta.isDistanceReliable
      ? {
          "@type": "GeoCoordinates",
          latitude: kos.lat,
          longitude: kos.lng,
        }
      : undefined,
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
    <div className="container py-8 md:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(detailJsonLd) }}
      />
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
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
        <main>
          <article className="surface-panel overflow-hidden rounded-[2rem] border border-white/80 shadow-[0_18px_44px_rgba(17,17,16,0.07)]">
            <div className="relative h-72 md:h-[25rem]">
              <KosFoto foto={kos.foto} nama={kos.nama} jenis={kos.jenis} className="h-full w-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <span className="absolute left-5 top-5 rounded-full bg-white/92 px-3 py-1 text-xs font-bold capitalize text-charcoal shadow-sm">
                {kos.jenis}
              </span>
              <div className="absolute inset-x-0 bottom-0 p-5 text-white md:p-7">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div className="max-w-3xl">
                    <p className="text-sm font-semibold text-white/78">
                      {kos.kampus?.nama ?? "Area Palembang"}
                    </p>
                    <h1 className="mt-1 text-3xl font-bold leading-tight md:text-5xl">{kos.nama}</h1>
                    <p className="mt-2 max-w-2xl text-sm text-white/80 md:text-base">{kos.alamat}</p>
                  </div>
                  <div className="rounded-full bg-white/10 backdrop-blur-sm">
                    <FavoritButton kosId={kos.id} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-10 p-6 md:p-8">
              <section className="border-b border-black/5 pb-8">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
                  <div>
                    {averageRating ? <StarRating value={averageRating} /> : null}
                    <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
                      {kos.deskripsi}
                    </p>
                    <p className="mt-4 text-xs leading-6 text-muted-foreground">
                      {kos.locationMeta.note}
                    </p>
                  </div>
                  <dl className="grid gap-4 rounded-[1.5rem] bg-white/62 p-5 text-sm">
                    <div className="flex items-start justify-between gap-3 border-b border-black/5 pb-3">
                      <dt className="text-muted-foreground">Harga</dt>
                      <dd className="text-right font-semibold text-charcoal">{harga}/bulan</dd>
                    </div>
                    <div className="flex items-start justify-between gap-3 border-b border-black/5 pb-3">
                      <dt className="text-muted-foreground">Jenis</dt>
                      <dd className="font-semibold capitalize text-charcoal">{kos.jenis}</dd>
                    </div>
                    <div className="flex items-start justify-between gap-3 border-b border-black/5 pb-3">
                      <dt className="text-muted-foreground">Kampus</dt>
                      <dd className="text-right font-semibold text-charcoal">
                        {kos.kampus?.nama ?? "Palembang"}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-muted-foreground">Sumber</dt>
                      <dd className="font-semibold capitalize text-charcoal">{kos.sumber_data}</dd>
                    </div>
                  </dl>
                </div>
              </section>

              <section className="border-b border-black/5 pb-8">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-charcoal">Fasilitas</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Informasi utama yang tersedia di kos ini.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {kos.fasilitas.map((item) => (
                    <div
                      key={item}
                      className="inline-flex items-center gap-2 rounded-full bg-white/72 px-4 py-2 text-sm text-charcoal ring-1 ring-black/5"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4 shrink-0 text-primary"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d={getFasilitasIcon(item)} />
                      </svg>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="border-b border-black/5 pb-8">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-charcoal">Lokasi</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Lihat area kos dan kampus terdekat dalam satu konteks.
                  </p>
                </div>
                <div className="overflow-hidden rounded-[1.8rem] border border-white/80 bg-white/72 p-3 shadow-[0_16px_36px_rgba(17,17,16,0.06)]">
                  <MapViewClient
                    center={
                      kos.locationMeta.isMapVisible
                        ? [kos.lat, kos.lng]
                        : kos.kampus
                          ? [kos.kampus.lat, kos.kampus.lng]
                          : [kos.lat, kos.lng]
                    }
                    zoom={15}
                    markers={mapMarkers}
                    className="h-80 rounded-[1.2rem]"
                  />
                </div>
                {!kos.locationMeta.isMapVisible ? (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Titik kos belum ditampilkan karena koordinatnya masih terlalu umum. Peta sementara
                    menyorot area kampus terdekat.
                  </p>
                ) : null}
              </section>

              <section>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-charcoal">Review Mahasiswa</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Masukan singkat dari penghuni atau pengunjung sebelumnya.
                    </p>
                  </div>
                  {averageRating ? (
                    <StarRating value={averageRating} />
                  ) : (
                    <p className="text-sm text-muted-foreground">Belum ada rating</p>
                  )}
                </div>

                <div className="mt-5">
                  <ReviewForm kosId={kos.id} kosPath={kosPath} isLoggedIn={Boolean(user)} />
                </div>

                <div className="mt-6 divide-y divide-black/5">
                  {kos.review.length > 0 ? (
                    kos.review.map((review) => {
                      const reviewerLabel = getReviewerLabel(review.user_id, user?.id);

                      return (
                        <article key={review.id} className="py-4 first:pt-0 last:pb-0">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {getReviewerInitial(reviewerLabel)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-charcoal">{reviewerLabel}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(review.created_at).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                              <svg viewBox="0 0 20 20" className="h-3 w-3 fill-amber-400">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              {review.rating}/5
                            </span>
                          </div>
                          {review.komentar ? (
                            <p className="mt-3 text-sm leading-7 text-foreground/80">{review.komentar}</p>
                          ) : null}
                        </article>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Jadilah mahasiswa pertama yang memberi review untuk kos ini.
                    </p>
                  )}
                </div>
              </section>
            </div>
          </article>
        </main>

        <aside className="h-fit rounded-[1.8rem] border border-white/80 bg-white/82 p-6 shadow-[0_18px_40px_rgba(17,17,16,0.08)] backdrop-blur-sm lg:sticky lg:top-24">
          <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Harga mulai dari</p>
          <p className="mt-2 text-4xl font-black leading-none text-primary">{harga}</p>
          <p className="mt-2 text-sm text-muted-foreground">per bulan</p>

          <div className="mt-6 space-y-4 border-t border-black/5 pt-5 text-sm">
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
            <div className="mt-5 rounded-[1.2rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Nomor WhatsApp pemilik belum valid, jadi kontak belum bisa dibuka.
            </div>
          )}

          <Link
            href="/kos"
            className="mt-3 block rounded-[1.2rem] border border-black/5 px-4 py-3 text-center text-sm font-medium text-muted-foreground transition hover:border-primary/40 hover:text-primary"
          >
            {"<-"} Kembali ke daftar kos
          </Link>
        </aside>
      </div>
    </div>
  );
}
