import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ pesan: "Belum login" }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("favorit")
    .select("id, kos_id, created_at, kos:kos_id(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ pesan: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ pesan: "Belum login" }, { status: 401 });
  }

  const { kosId } = (await request.json()) as { kosId?: string };

  if (!kosId) {
    return NextResponse.json({ pesan: "kosId wajib diisi" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("favorit")
    .insert({ user_id: user.id, kos_id: kosId })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ pesan: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ pesan: "Belum login" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const kosId = searchParams.get("kosId");

  if (!kosId) {
    return NextResponse.json({ pesan: "kosId wajib diisi" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("favorit")
    .delete()
    .eq("user_id", user.id)
    .eq("kos_id", kosId);

  if (error) {
    return NextResponse.json({ pesan: error.message }, { status: 500 });
  }

  return NextResponse.json({ pesan: "Favorit dihapus" });
}
