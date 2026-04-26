import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { checkRateLimit, isValidUuid } from "@/lib/security";
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
    return NextResponse.json(
      { pesan: "Favorit belum berhasil dimuat." },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ pesan: "Belum login" }, { status: 401 });
  }

  const { kosId } = (await request.json()) as { kosId?: string };

  if (!kosId || !isValidUuid(kosId)) {
    return NextResponse.json(
      { pesan: "kosId UUID valid wajib diisi" },
      { status: 400 }
    );
  }

  const rateLimit = checkRateLimit(`favorit:post:${user.id}`, {
    limit: 30,
    windowMs: 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { pesan: "Terlalu banyak percobaan favorit. Coba lagi sebentar." },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000))
          ),
        },
      }
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("favorit")
    .insert({ user_id: user.id, kos_id: kosId })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { pesan: "Kos belum berhasil ditambahkan ke favorit." },
      { status: 500 }
    );
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

  if (!kosId || !isValidUuid(kosId)) {
    return NextResponse.json(
      { pesan: "kosId UUID valid wajib diisi" },
      { status: 400 }
    );
  }

  const rateLimit = checkRateLimit(`favorit:delete:${user.id}`, {
    limit: 30,
    windowMs: 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { pesan: "Terlalu banyak percobaan favorit. Coba lagi sebentar." },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000))
          ),
        },
      }
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("favorit")
    .delete()
    .eq("user_id", user.id)
    .eq("kos_id", kosId);

  if (error) {
    return NextResponse.json(
      { pesan: "Kos belum berhasil dihapus dari favorit." },
      { status: 500 }
    );
  }

  return NextResponse.json({ pesan: "Favorit dihapus" });
}
