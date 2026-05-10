import { NextResponse } from "next/server";
import { env } from "@/env";

function getAllowedHost(request: Request): string | null {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      return new URL(siteUrl).host;
    } catch {}
  }
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return vercelUrl;
  return request.headers.get("host");
}

const LOCALHOST_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function validateOrigin(request: Request): boolean {
  const originHeader = request.headers.get("origin");
  if (!originHeader) return true;

  let originHost: string;
  try {
    originHost = new URL(originHeader).hostname;
  } catch {
    return false;
  }

  if (LOCALHOST_HOSTNAMES.has(originHost)) return true;

  const allowedHost = getAllowedHost(request);
  if (!allowedHost) return false;

  const allowedHostname = allowedHost.split(":")[0];
  return originHost === allowedHostname;
}

export function csrfDeniedResponse() {
  return NextResponse.json({ pesan: "Origin tidak diizinkan" }, { status: 403 });
}
