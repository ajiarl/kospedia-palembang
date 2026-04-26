import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { checkRateLimit, isValidUuid } from "@/lib/security";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ pesan: "Belum login" }, { status: 401 });
  }

  const { kosId, rating, komentar } = (await request.json()) as {
    kosId?: string;
    rating?: number;
    komentar?: string;
  };
  const normalizedRating = Number(rating);
  const normalizedKomentar = komentar?.trim() || null;

  if (
    !kosId ||
    !isValidUuid(kosId) ||
    !Number.isInteger(normalizedRating) ||
    normalizedRating < 1 ||
    normalizedRating > 5
  ) {
    return NextResponse.json(
      { pesan: "kosId UUID valid dan rating 1-5 wajib diisi" },
      { status: 400 }
    );
  }

  const rateLimit = checkRateLimit(`review:${user.id}`, {
    limit: 10,
    windowMs: 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { pesan: "Terlalu banyak percobaan review. Coba lagi sebentar." },
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
  const { data: kos } = await supabase
    .from("kos")
    .select("id")
    .eq("id", kosId)
    .eq("tersedia", true)
    .maybeSingle();

  if (!kos) {
    return NextResponse.json(
      { pesan: "Kos yang ingin direview tidak tersedia atau tidak ditemukan." },
      { status: 404 }
    );
  }

  const { data, error } = await supabase
    .from("review")
    .upsert(
      {
        user_id: user.id,
        kos_id: kosId,
        rating: normalizedRating,
        komentar: normalizedKomentar,
      },
      {
        onConflict: "user_id,kos_id",
      }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { pesan: "Review belum berhasil disimpan. Coba lagi beberapa saat." },
      { status: 500 }
    );
  }

  return NextResponse.json({ data }, { status: 201 });
}
