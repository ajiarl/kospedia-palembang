import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export const RATE_LIMIT_CONFIG = {
  favorit: { limit: 20, windowSeconds: 60 },
  review: { limit: 5, windowSeconds: 60 },
} as const;

export type RateLimitAction = keyof typeof RATE_LIMIT_CONFIG;

// UUID validation helper (kept for routes not yet fully migrated to Zod)
export function isValidUuid(value: string) {
  const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return UUID_REGEX.test(value);
}

function maybePurge(supabase: ReturnType<typeof createSupabaseAdminClient>) {
  if (Math.random() < 0.02) {
    void supabase.rpc("purge_old_rate_limit_logs");
  }
}

export async function checkRateLimit(
  userId: string,
  action: RateLimitAction
): Promise<RateLimitResult> {
  const { limit, windowSeconds } = RATE_LIMIT_CONFIG[action];
  const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString();
  const resetAt = Date.now() + windowSeconds * 1000;
  const supabase = createSupabaseAdminClient();
  maybePurge(supabase);

  const { count, error: countError } = await supabase
    .from("rate_limit_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("action", action)
    .gte("created_at", windowStart);

  if (countError) {
    logger.error("Rate limit count query gagal — fail open", {
      event: "rate_limit_count_error",
      userId,
      action,
      error: countError.message,
      code: countError.code,
    });
    return { allowed: true, remaining: limit, resetAt };
  }

  const current = count ?? 0;
  if (current >= limit) {
    logger.warn("Rate limit tercapai", {
      event: "rate_limit_exceeded",
      userId,
      action,
      current,
      limit,
    });
    return { allowed: false, remaining: 0, resetAt };
  }

  const { error: insertError } = await supabase
    .from("rate_limit_log")
    .insert({ user_id: userId, action });

  if (insertError) {
    logger.error("Rate limit insert gagal — fail open", {
      event: "rate_limit_insert_error",
      userId,
      action,
      error: insertError.message,
      code: insertError.code,
    });
    return { allowed: true, remaining: limit - current, resetAt };
  }

  return { allowed: true, remaining: limit - current - 1, resetAt };
}
