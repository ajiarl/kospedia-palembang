import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";
  const safePath = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const loginPath = `/login?error=${encodeURIComponent("Sesi login belum berhasil diproses. Coba masuk lagi.")}&next=${encodeURIComponent(safePath)}`;

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(new URL(loginPath, requestUrl.origin));
    }
  } else {
    return NextResponse.redirect(new URL(loginPath, requestUrl.origin));
  }

  return NextResponse.redirect(new URL(safePath, requestUrl.origin));
}
