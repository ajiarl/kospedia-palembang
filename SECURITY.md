# Security Documentation - KosPedia Palembang

KosPedia Palembang implements a "Defense in Depth" strategy across the stack.

## 🛡️ Security Layers

### 1. Input Validation (Zod)
We use **Zod** schema validation for both environment variables and API request bodies.
*   **Env Validation**: `src/env.ts` ensures the application fails to start if critical keys are missing or malformed.
*   **API Validation**: Routes like `/api/favorit` and `/api/review` use `safeParseJson` and Zod schemas to prevent payload injection and ensure type safety.

### 2. CSRF & Origin Protection
We protect state-changing mutations (POST, DELETE) by validating the `Origin` header in the `validateOrigin` middleware (`src/lib/csrf.ts`). This prevents Cross-Site Request Forgery (CSRF) by ensuring requests only come from our own domain or authorized local development hosts.

### 3. Rate Limiting
To prevent spam and brute-force attacks on mutations (Favorit/Review), we implement a database-backed rate limiter:
*   **Storage**: `rate_limit_log` table in Supabase.
*   **Logic**: `checkRateLimit` in `src/lib/security.ts`.
*   **Config**: 
    *   Favorit: 20 requests per minute.
    *   Review: 5 requests per minute.
*   **Headers**: Returns standard `Retry-After` and `X-RateLimit-*` headers on `429 Too Many Requests`.

### 4. Content Security Policy (CSP)
A dynamic CSP is defined in `next.config.ts`.
*   **Strict Source**: Defaults to `'self'`.
*   **Env-Aware**: `unsafe-eval` is only enabled in `development` to support Next.js HMR.
*   **Third-Party Whitelist**: Strictly limited to Supabase, Google Analytics (GTM), and OpenStreetMap tiles.

### 5. Supabase Row Level Security (RLS)
The database is not "open". Every table has RLS enabled (`supabase/schema.sql`):
*   `kampus` / `kos`: Publicly readable, but not writable.
*   `favorit` / `review`: Users can only read/write/delete their own data (`auth.uid() = user_id`).

### 6. Environment Hardening
*   `SUPABASE_SERVICE_ROLE_KEY` is explicitly guarded and never exposed to the client.
*   `src/lib/supabase/admin.ts` throws an error if called in a browser environment.
