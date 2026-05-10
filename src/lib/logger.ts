// src/lib/logger.ts
//
// Lightweight structured logger for KosPedia.
// - Development : pretty-prints coloured, human-readable output to the terminal.
// - Production  : emits newline-delimited JSON (NDJSON) — the format expected
//                 by every major log-ingestion platform (Axiom, Logtail, Datadog,
//                 Sentry breadcrumbs, AWS CloudWatch, etc.).

// ─── Types ────────────────────────────────────────────────────────────────────

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  /** Short machine-readable event name, e.g. "rate_limit_exceeded" */
  event?: string;
  /** The originating request path, e.g. "/api/favorit" */
  path?: string;
  /** Opaque request identifier for correlation across log lines */
  requestId?: string;
  /** Supabase / auth user UUID */
  userId?: string;
  /** HTTP status code about to be returned */
  statusCode?: number;
  /** Duration in milliseconds */
  durationMs?: number;
  /** Any additional arbitrary key/value pairs */
  [key: string]: unknown;
}

interface LogEntry extends LogContext {
  timestamp: string;
  level: LogLevel;
  message: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IS_PRODUCTION = process.env.NODE_ENV === "production";

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// In development, suppress debug logs unless explicitly enabled.
// In production, suppress debug logs always (they are too verbose for a sink).
const MIN_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ?? (IS_PRODUCTION ? "info" : "debug");

// ANSI colours for terminal pretty-printing (dev only)
const LEVEL_COLOUR: Record<LogLevel, string> = {
  debug: "\x1b[90m", // grey
  info: "\x1b[36m", // cyan
  warn: "\x1b[33m", // yellow
  error: "\x1b[31m", // red
};
const RESET = "\x1b[0m";

// ─── Core emit function ───────────────────────────────────────────────────────

function emit(level: LogLevel, message: string, context?: LogContext): void {
  // Respect minimum log level
  if (LEVEL_WEIGHT[level] < LEVEL_WEIGHT[MIN_LEVEL]) return;

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  if (IS_PRODUCTION) {
    // ── PRODUCTION: emit NDJSON ──────────────────────────────────────────
    console[level === "debug" ? "log" : level](JSON.stringify(entry));
    return;
  }

  // ── DEVELOPMENT: pretty-print ────────────────────────────────────────────
  const colour = LEVEL_COLOUR[level];
  const levelTag = `${colour}[${level.toUpperCase().padEnd(5)}]${RESET}`;
  const ts = `\x1b[90m${entry.timestamp}\x1b[0m`;

  // Separate the known top-level fields from the extra context
  const { timestamp, level: _l, message: _m, ...rest } = entry;
  const hasContext = Object.keys(rest).length > 0;

  if (hasContext) {
    console[level === "debug" || level === "info" ? "log" : level](
      `${ts} ${levelTag} ${message}`,
      rest
    );
  } else {
    console[level === "debug" || level === "info" ? "log" : level](
      `${ts} ${levelTag} ${message}`
    );
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const logger = {
  debug: (message: string, context?: LogContext) => emit("debug", message, context),
  info: (message: string, context?: LogContext) => emit("info", message, context),
  warn: (message: string, context?: LogContext) => emit("warn", message, context),
  error: (message: string, context?: LogContext) => emit("error", message, context),
};

// ─── Request-scoped child logger ─────────────────────────────────────────────

export function requestLogger(request: Request) {
  const requestId =
    request.headers.get("x-request-id") ??
    // Generate a lightweight ID when the header is absent (most dev setups)
    Math.random().toString(36).slice(2, 10);

  const path = new URL(request.url).pathname;

  return {
    debug: (message: string, ctx?: LogContext) =>
      emit("debug", message, { requestId, path, ...ctx }),

    info: (message: string, ctx?: LogContext) =>
      emit("info", message, { requestId, path, ...ctx }),

    warn: (message: string, ctx?: LogContext) =>
      emit("warn", message, { requestId, path, ...ctx }),

    error: (message: string, ctx?: LogContext) =>
      emit("error", message, { requestId, path, ...ctx }),
  };
}
