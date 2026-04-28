import type { Database } from "@/types/database";

export type KampusRow = Database["public"]["Tables"]["kampus"]["Row"];
export type KosRow = Database["public"]["Tables"]["kos"]["Row"];
export type ReviewRow = Database["public"]["Tables"]["review"]["Row"];
export type CoordinatePrecision = "exact" | "approximate" | "area";
export type CoordinateSource = "user" | "geocoder" | "database";

export type CoordinateMeta = {
  precision: CoordinatePrecision;
  source: CoordinateSource;
  note: string;
  isMapVisible: boolean;
  isDistanceReliable: boolean;
};

export type KosWithKampus = KosRow & {
  kampus: Pick<KampusRow, "id" | "nama" | "slug" | "lat" | "lng"> | null;
};

export type KosWithLocationMeta<T> = T & {
  locationMeta: CoordinateMeta;
};

export type KosDetail = KosWithKampus & {
  review: Pick<ReviewRow, "id" | "user_id" | "rating" | "komentar" | "created_at">[];
};
