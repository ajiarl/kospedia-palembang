// TypeScript interfaces utama KosPedia.

export type JenisKos = "putra" | "putri" | "campur";
export type SumberDataKos = "manual" | "seed" | "places";

export interface Kos {
  id: string;
  kampusId: string | null;
  nama: string;
  deskripsi: string;
  alamat: string;
  lat: number;
  lng: number;
  hargaMin: number;
  hargaMax: number;
  jenis: JenisKos;
  fasilitas: string[];
  foto: string[];
  kontak: string;
  sumberData: SumberDataKos;
  tersedia: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Kampus {
  id: string;
  nama: string;
  slug: string;
  lat: number;
  lng: number;
  createdAt: string;
}

export interface Favorit {
  id: string;
  userId: string;
  kosId: string;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  kosId: string;
  rating: number;
  komentar: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FilterKos {
  kampus?: string;
  hargaMin?: number;
  hargaMax?: number;
  jenis?: JenisKos;
  fasilitas?: string[];
}
