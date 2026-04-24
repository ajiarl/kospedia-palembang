import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kampus = searchParams.get("kampus");
  const jenis = searchParams.get("jenis");
  const hargaMin = searchParams.get("hargaMin");
  const hargaMax = searchParams.get("hargaMax");

  const supabase = await createSupabaseServerClient();
  const selectedKampus = kampus
    ? await supabase.from("kampus").select("id").eq("slug", kampus).maybeSingle()
    : null;

  let query = supabase
    .from("kos")
    .select("*, kampus:kampus_id(id, nama, slug, lat, lng)")
    .eq("tersedia", true)
    .order("harga_min", { ascending: true });

  if (selectedKampus?.data) {
    query = query.eq("kampus_id", selectedKampus.data.id);
  }

  if (jenis === "putra" || jenis === "putri" || jenis === "campur") {
    query = query.eq("jenis", jenis);
  }

  if (hargaMin) {
    query = query.gte("harga_max", Number(hargaMin));
  }

  if (hargaMax) {
    query = query.lte("harga_min", Number(hargaMax));
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ pesan: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
