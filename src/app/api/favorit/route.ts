import { NextResponse } from "next/server";

import { validateOrigin, csrfDeniedResponse } from "@/lib/csrf";

import { safeParseJson, badBodyResponse, zodErrorResponse } from "@/lib/api";
import { favoritPostSchema } from "@/lib/schemas/api";
import { getCurrentUser } from "@/lib/auth";
import { checkRateLimit, isValidUuid } from "@/lib/security";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requestLogger } from "@/lib/logger";

export async function GET(request: Request) {
  const log = requestLogger(request);
  const user = await getCurrentUser();

  if (!user) {
    log.info("Akses tanpa autentikasi ditolak", { event: "unauthenticated" });
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

  return NextResponse.json({ favorit: (data ?? []).map((i: any) => i.kos_id) });
}

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

  const rateLimit = await checkRateLimit(user.id, "favorit");
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { pesan: "Terlalu banyak permintaan. Coba lagi dalam satu menit." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Limit": "20",
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
  const parsed = favoritPostSchema.safeParse(body);
  if (!parsed.success) {
    log.warn("Zod validasi gagal", {
      event: "validation_error",
      userId: user.id,
      errors: parsed.error.flatten().fieldErrors,
    });
    return zodErrorResponse(parsed.error);
  }

  const { kosId } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("favorit")
    .insert({ user_id: user.id, kos_id: kosId })
    .select()
    .single();

  if (error) {
    log.error("Gagal menambahkan favorit", {
      event: "favorit_add_error",
      userId: user.id,
      kosId,
      error: error.message,
    });
    return NextResponse.json(
      { pesan: "Kos belum berhasil ditambahkan ke favorit." },
      { status: 500 }
    );
  }

  log.info("Favorit berhasil ditambahkan", {
    event: "favorit_added",
    userId: user.id,
    kosId,
  });

  return NextResponse.json({ data }, { status: 201 });
}

export async function DELETE(request: Request) {
  const log = requestLogger(request);

  if (!validateOrigin(request)) {
    log.warn("CSRF validasi gagal", { event: "csrf_rejected" });
    return csrfDeniedResponse();
  }

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ pesan: "Belum login" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const kosId = searchParams.get("kosId");

  if (!kosId || !isValidUuid(kosId)) {
    log.warn("kosId tidak valid", {
      event: "invalid_parameter",
      userId: user.id,
      kosId,
    });
    return NextResponse.json(
      { pesan: "kosId UUID valid wajib diisi" },
      { status: 400 }
    );
  }

  const rateLimit = await checkRateLimit(user.id, "favorit");
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { pesan: "Terlalu banyak permintaan. Coba lagi dalam satu menit." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Limit": "20",
          "X-RateLimit-Remaining": "0",
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
    log.error("Gagal menghapus favorit", {
      event: "favorit_delete_error",
      userId: user.id,
      kosId,
      error: error.message,
    });
    return NextResponse.json(
      { pesan: "Kos belum berhasil dihapus dari favorit." },
      { status: 500 }
    );
  }

  log.info("Favorit berhasil dihapus", {
    event: "favorit_removed",
    userId: user.id,
    kosId,
  });

  return NextResponse.json({ pesan: "Favorit dihapus" });
}
