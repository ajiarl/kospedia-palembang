// Re-export domain types from database-backed modules to avoid duplicate entity models.

export type {
  KampusRow as Kampus,
  KosRow as Kos,
  ReviewRow as Review,
} from "@/types/kos";

export type JenisKos = import("@/types/database").Database["public"]["Enums"]["jenis_kos"];
export type SumberDataKos =
  import("@/types/database").Database["public"]["Enums"]["sumber_data_kos"];

export type FilterKos = {
  kampus?: string;
  hargaMin?: number;
  hargaMax?: number;
  jenis?: JenisKos;
  fasilitas?: string[];
};
