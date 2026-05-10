import { NextResponse } from "next/server";

import { validateOrigin, csrfDeniedResponse } from "@/lib/csrf";

import { safeParseJson, badBodyResponse, zodErrorResponse } from "@/lib/api";
import { reviewPostSchema } from "@/lib/schemas/api";
import { getCurrentUser } from "@/lib/auth";
import { checkRateLimit, isValidUuid } from "@/lib/security";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requestLogger } from "@/lib/logger";

export async function POST(request: Request) {
  const log = requestLogger(request);

  if (!validateOrigin(request)) {
    log.warn("CSRF validasi gagal", { event: "csrf_rejected" });
    return csrfDeniedResponse();
  }

  // 1. Auth check (keep your existing logic exactly as-is)
  const user = await getCurrentUser();
  if (!user) {
    log.info("Akses tanpa autentikasi ditolak", { event: "unauthenticated" });
    return NextResponse.json({ pesan: "Belum login" }, { status: 401 });
  }

  const rateLimit = await checkRateLimit(user.id, "review");
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { pesan: "Terlalu banyak permintaan. Coba lagi dalam satu menit." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Limit": "5",
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // 2. Safe body parse
  const body = await safeParseJson(request);
  if (body === null) {
    log.warn("Request body tidak valid", {
      event: "invalid_body",
      userId: user.id,
    });
    return badBodyResponse();
  }

  // 3. Schema validation
  const parsed = reviewPostSchema.safeParse(body);
  if (!parsed.success) {
    log.warn("Zod validasi gagal", {
      event: "validation_error",
      userId: user.id,
      errors: parsed.error.flatten().fieldErrors,
    });
    return zodErrorResponse(parsed.error);
  }

  const { kosId, rating, komentar } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { data: kos } = await supabase
    .from("kos")
    .select("id")
    .eq("id", kosId)
    .eq("tersedia", true)
    .maybeSingle();

  if (!kos) {
    log.warn("Kos tidak ditemukan atau tidak tersedia", {
      event: "not_found",
      userId: user.id,
      kosId,
    });
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
        rating: rating,
        komentar: komentar,
      },
      {
        onConflict: "user_id,kos_id",
      }
    )
    .select()
    .single();

  if (error) {
    log.error("Gagal menyimpan review", {
      event: "review_save_error",
      userId: user.id,
      kosId,
      error: error.message,
    });
    return NextResponse.json(
      { pesan: "Review belum berhasil disimpan. Coba lagi beberapa saat." },
      { status: 500 }
    );
  }

  log.info("Review berhasil disimpan", {
    event: "review_saved",
    userId: user.id,
    kosId,
    rating,
  });

  return NextResponse.json({ data }, { status: 201 });
}
