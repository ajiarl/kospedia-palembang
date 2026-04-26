export const SITE_NAME = "KosPedia Palembang";
export const SITE_DESCRIPTION =
  "Direktori kos mahasiswa khusus Palembang dengan fokus kampus lokal, gratis, tanpa biaya komisi, dan kontak langsung ke pemilik.";

function normalizeSiteUrl(value?: string) {
  const fallbackUrl = "http://localhost:3000";

  if (!value) {
    return fallbackUrl;
  }

  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getSiteUrl() {
  return normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
}

export function getMetadataBase() {
  return new URL(getSiteUrl());
}

export function absoluteUrl(path = "/") {
  return new URL(path, getMetadataBase()).toString();
}

export function absoluteImageUrl(image?: string | null) {
  if (!image) {
    return undefined;
  }

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  return absoluteUrl(image.startsWith("/") ? image : `/${image}`);
}

export function truncateDescription(text: string, maxLength = 160) {
  const normalizedText = text.replace(/\s+/g, " ").trim();

  if (normalizedText.length <= maxLength) {
    return normalizedText;
  }

  return `${normalizedText.slice(0, maxLength - 3).trimEnd()}...`;
}

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function buildKosTitle(nama: string, namaKampus?: string | null) {
  if (namaKampus) {
    return `${nama} - Kos dekat ${namaKampus}`;
  }

  return `${nama} - Kos di Palembang`;
}

export function buildKosDescription(deskripsi: string, alamat: string, namaKampus?: string | null) {
  const lokasi = namaKampus ? ` dekat ${namaKampus}` : "";
  return truncateDescription(`${deskripsi} Lokasi di ${alamat}${lokasi}.`);
}

export function buildListingTitle(namaKampus?: string | null, jenis?: string | null) {
  const jenisLabel = jenis ? `Kos ${capitalize(jenis)}` : "Cari Kos";

  if (namaKampus) {
    return `${jenisLabel} dekat ${namaKampus}`;
  }

  return `${jenisLabel} di Palembang`;
}

export function buildListingDescription(namaKampus?: string | null, jenis?: string | null) {
  const segments = [
    "Temukan kos mahasiswa khusus Palembang",
    namaKampus ? `dekat ${namaKampus}` : null,
    jenis ? `dengan pilihan ${jenis}` : null,
    "lengkap dengan harga, lokasi, dan kontak langsung pemilik tanpa komisi.",
  ].filter(Boolean);

  return truncateDescription(segments.join(" "));
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
