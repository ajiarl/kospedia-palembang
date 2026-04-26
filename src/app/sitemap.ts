import type { MetadataRoute } from "next";

import { getKosPath } from "@/lib/kos";
import { absoluteUrl } from "@/lib/seo";
import { createSupabasePublicClient } from "@/lib/supabase/public";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createSupabasePublicClient();
  const { data } = await supabase
    .from("kos")
    .select("id, slug, updated_at")
    .eq("tersedia", true)
    .order("updated_at", { ascending: false });

  const publicPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/kos"),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const kosPages =
    data?.map((item) => ({
      url: absoluteUrl(getKosPath(item)),
      lastModified: item.updated_at,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })) ?? [];

  return [...publicPages, ...kosPages];
}
