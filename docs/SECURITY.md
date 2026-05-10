# Dokumentasi Keamanan - KosPedia Palembang

KosPedia Palembang menerapkan strategi "Defense in Depth" di seluruh lapisan stack.

## 🛡️ Lapisan Keamanan

### 1. Input Validation (Zod)
Kami menggunakan validasi schema **Zod** untuk environment variable dan request body API.
*   **Env Validation**: `src/env.ts` memastikan aplikasi gagal dijalankan jika kunci kritikal hilang atau salah format.
*   **API Validation**: Route seperti `/api/favorit` dan `/api/review` menggunakan `safeParseJson` dan schema Zod untuk mencegah payload injection dan memastikan keamanan tipe data.

### 2. CSRF & Origin Protection
Kami melindungi mutasi state (POST, DELETE) dengan memvalidasi header `Origin` di middleware `validateOrigin` (`src/lib/csrf.ts`). Ini mencegah serangan Cross-Site Request Forgery (CSRF) dengan memastikan permintaan hanya datang dari domain kami sendiri atau host pengembangan lokal yang diizinkan.

### 3. Rate Limiting
Untuk mencegah spam dan serangan brute-force pada mutasi (Favorit/Review), kami menerapkan rate limiter berbasis database:
*   **Penyimpanan**: Tabel `rate_limit_log` di Supabase.
*   **Logika**: `checkRateLimit` di `src/lib/security.ts`.
*   **Config**: 
    *   Favorit: 20 permintaan per menit.
    *   Review: 5 permintaan per menit.
*   **Headers**: Mengembalikan header standar `Retry-After` dan `X-RateLimit-*` pada respon `429 Too Many Requests`.

### 4. Content Security Policy (CSP)
CSP dinamis didefinisikan dalam `next.config.ts`.
*   **Strict Source**: Default ke `'self'`.
*   **Env-Aware**: `unsafe-eval` hanya diaktifkan di `development` untuk mendukung Next.js HMR.
*   **Third-Party Whitelist**: Dibatasi ketat pada Supabase, Google Analytics (GTM), dan tile OpenStreetMap.

### 5. Supabase Row Level Security (RLS)
Database tidak bersifat "terbuka". Setiap tabel telah mengaktifkan RLS (`supabase/schema.sql`):
*   `kampus` / `kos`: Dapat dibaca secara publik, tetapi tidak dapat ditulis.
*   `favorit` / `review`: Pengguna hanya dapat membaca/menulis/menghapus data mereka sendiri (`auth.uid() = user_id`).

### 6. Environment Hardening
*   `SUPABASE_SERVICE_ROLE_KEY` dijaga secara eksplisit dan tidak pernah diekspos ke client.
*   `src/lib/supabase/admin.ts` akan melempar error jika dipanggil di lingkungan browser.
