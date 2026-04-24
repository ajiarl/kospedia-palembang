import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
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
    !Number.isInteger(normalizedRating) ||
    normalizedRating < 1 ||
    normalizedRating > 5
  ) {
    return NextResponse.json(
      { pesan: "kosId dan rating 1-5 wajib diisi" },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
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
    return NextResponse.json({ pesan: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
