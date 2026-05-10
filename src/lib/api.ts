// src/lib/api.ts

import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Safely parses the JSON body of a Request.
 * Returns null if the body is missing, malformed, or has the wrong Content-Type.
 * Never throws.
 */
export async function safeParseJson<T = unknown>(
  request: Request
): Promise<T | null> {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) return null;

    const text = await request.text();
    if (!text.trim()) return null;

    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/**
 * Converts a ZodError into a consistent 400 response.
 */
export function zodErrorResponse(error: ZodError) {
  return NextResponse.json(
    {
      pesan: "Data tidak valid",
      errors: error.flatten().fieldErrors,
    },
    { status: 400 }
  );
}

/**
 * Standard response for a missing/malformed request body.
 */
export function badBodyResponse() {
  return NextResponse.json(
    { pesan: "Request body harus berformat JSON yang valid" },
    { status: 400 }
  );
}
