import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kampus = searchParams.get("kampus");
  const jenis = searchParams.get("jenis");
  const hargaMin = searchParams.get("hargaMin");
  const hargaMax = searchParams.get("hargaMax");

  const supabase = await createSupabaseServerClient();
  const { data: maxHargaData } = await supabase
    .from("kos")
    .select("harga_max")
    .eq("tersedia", true)
    .order("harga_max", { ascending: false })
    .limit(1)
    .maybeSingle();
  const selectedKampus = kampus
    ? await supabase.from("kampus").select("id").eq("slug", kampus).maybeSingle()
    : null;
  const hargaMaxTersedia = Math.max(2_500_000, maxHargaData?.harga_max ?? 0);
  const parsedMin = Number(hargaMin);
  const parsedMax = Number(hargaMax);
  const normalizedMin =
    Number.isFinite(parsedMin) && parsedMin >= 0
      ? Math.min(parsedMin, hargaMaxTersedia)
      : null;
  const normalizedMax =
    Number.isFinite(parsedMax) && parsedMax >= 0
      ? Math.min(parsedMax, hargaMaxTersedia)
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

  if (normalizedMin !== null) {
    query = query.gte("harga_max", normalizedMin);
  }

  if (normalizedMax !== null) {
    query = query.lte("harga_min", normalizedMax);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { pesan: "Daftar kos belum berhasil dimuat." },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}
