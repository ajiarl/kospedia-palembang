import type { Database } from "@/types/database";

export type KampusRow = Database["public"]["Tables"]["kampus"]["Row"];
export type KosRow = Database["public"]["Tables"]["kos"]["Row"];
export type ReviewRow = Database["public"]["Tables"]["review"]["Row"];

export type KosWithKampus = KosRow & {
  kampus: Pick<KampusRow, "id" | "nama" | "slug" | "lat" | "lng"> | null;
};

export type KosDetail = KosWithKampus & {
  review: Pick<ReviewRow, "id" | "user_id" | "rating" | "komentar" | "created_at">[];
};
