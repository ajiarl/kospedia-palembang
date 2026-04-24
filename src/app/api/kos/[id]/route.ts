import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("kos")
    .select(
      "*, kampus:kampus_id(id, nama, slug, lat, lng), review(id, rating, komentar, created_at)"
    )
    .eq("id", id)
    .eq("tersedia", true)
    .single();

  if (error) {
    return NextResponse.json({ pesan: error.message }, { status: 404 });
  }

  return NextResponse.json({ data });
}
