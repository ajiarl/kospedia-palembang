import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isValidUuid } from "@/lib/security";
import type { KosDetail, KosWithKampus } from "@/types/kos";

type KosSelectMode = "card" | "detail";

export function getKosPath(kos: Pick<KosWithKampus, "id" | "slug">) {
  return `/kos/${kos.slug || kos.id}`;
}

export async function getKosByIdentifier(
  identifier: string,
  mode: "card"
): Promise<KosWithKampus | null>;
export async function getKosByIdentifier(
  identifier: string,
  mode?: "detail"
): Promise<KosDetail | null>;
export async function getKosByIdentifier(
  identifier: string,
  mode: KosSelectMode = "detail"
) {
  const supabase = await createSupabaseServerClient();
  const isUuidIdentifier = isValidUuid(identifier);

  if (mode === "card") {
    if (isUuidIdentifier) {
      const idResult = await supabase
        .from("kos")
        .select("*, kampus:kampus_id(id, nama, slug, lat, lng)")
        .eq("id", identifier)
        .eq("tersedia", true)
        .maybeSingle();

      return (idResult.data as KosWithKampus | null) ?? null;
    }

    const slugResult = await supabase
      .from("kos")
      .select("*, kampus:kampus_id(id, nama, slug, lat, lng)")
      .eq("slug", identifier)
      .eq("tersedia", true)
      .maybeSingle();

    return (slugResult.data as KosWithKampus | null) ?? null;
  }

  if (isUuidIdentifier) {
    const idResult = await supabase
      .from("kos")
      .select(
        "*, kampus:kampus_id(id, nama, slug, lat, lng), review(id, user_id, rating, komentar, created_at)"
      )
      .eq("id", identifier)
      .eq("tersedia", true)
      .maybeSingle();

    return (idResult.data as KosDetail | null) ?? null;
  }

  const slugResult = await supabase
    .from("kos")
    .select(
      "*, kampus:kampus_id(id, nama, slug, lat, lng), review(id, user_id, rating, komentar, created_at)"
    )
    .eq("slug", identifier)
    .eq("tersedia", true)
    .maybeSingle();

  return (slugResult.data as KosDetail | null) ?? null;
}
