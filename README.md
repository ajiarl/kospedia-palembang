# KosPedia Palembang 🚀

Platform pencarian kos mahasiswa di sekitar kampus-kampus Palembang, dibangun dengan **Hardened Architecture** menggunakan Next.js App Router dan Supabase.

## 🏗️ Hardened Architecture (Phases 1-13)

Project ini telah melewati audit keamanan, performa, dan reliabilitas menyeluruh untuk memastikan kualitas produksi:

### 🔐 Security & Reliability
- **Type-Safe Input Validation**: Seluruh API mutation (Favorit, Review) diproteksi menggunakan **Zod** untuk validasi schema dan `safeParseJson` wrapper untuk mencegah payload injection.
- **CSRF & Origin Protection**: Pengamanan mutation routes dengan verifikasi host dan origin untuk mencegah serangan Cross-Site Request Forgery.
- **Advanced Rate Limiting**: Limitasi request berbasis IP/User menggunakan backend **Supabase SQL** untuk mencegah brute-force dan spamming.
- **Fail-Safe ENV Validation**: Validasi variabel lingkungan (Supabase keys, Site URL) menggunakan Zod di level module-load. Aplikasi akan gagal start secara eksplisit jika config tidak valid.
- **Security Headers**: Implementasi **Dynamic Content Security Policy (CSP)** via `next.config.ts`. Header ini bersifat *environment-aware*: mengizinkan `unsafe-eval` hanya di development (untuk HMR) dan mendukung Google Tag Manager tanpa mengorbankan keamanan di produksi.
- **Service Role Key Isolation**: Audit menyeluruh untuk memastikan `SUPABASE_SERVICE_ROLE_KEY` hanya diakses di lingkungan server-side admin yang terisolasi.

### ⚡ Performance
- **Parallel Data Fetching**: Eliminasi waterfall data-fetching pada halaman listing `/kos` menggunakan `Promise.all` untuk query kampus dan kos secara bersamaan.
- **Coordinate Map Singletons**: Pengelolaan titik koordinat menggunakan singleton pattern dan lazy-loading untuk optimasi memori dan render map.
- **Memory Leak Fixes**: Refactor React Context (Favorit) dengan stable refs dan `isMounted` guards untuk mencegah memory leak dan loop re-render.

### 📊 Monitoring & DX
- **Structured Logging**: Implementasi logger kustom yang mendukung **NDJSON** di produksi (siap ingest ke Axiom/Datadog) dan *pretty-printing* berwarna di lingkungan development.
- **Correlation IDs**: Setiap log request otomatis menyertakan `requestId` unik untuk kemudahan tracing transaksi antar modul.
- **Analytics & Tracking**: Integrasi **Google Tag Manager (GTM)** dan **GA4** yang telah dikonfigurasi aman dengan CSP untuk tracking event tanpa memblokir proses hidrasi Next.js.
- **Accessibility (A11y)**: Audit WCAG untuk komponen interaktif, penambahan ARIA labels, dan perbaikan UX map scroll-trap.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router + Turbopack)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + RLS)
- **Validation**: [Zod](https://zod.dev/)
- **Analytics**: [Google Tag Manager](https://tagmanager.google.com/) & [GA4](https://analytics.google.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Maps**: [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/)

---

## 🚀 Setup Lokal

1. **Install dependency**:
   ```bash
   npm install
   ```

2. **Salin environment**:
   ```bash
   copy .env.example .env.local
   ```

3. **Isi minimal variabel berikut di `.env.local`**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Jalankan development server**:
   ```bash
   npm run dev
   ```

5. **Buka `http://localhost:3000`**.

---

## 📜 Script Utama

- `npm run dev`: Menjalankan server development.
- `npm run build`: Build aplikasi untuk produksi.
- `npm run start`: Menjalankan hasil build produksi.
- `npm run lint`: Cek kualitas kode dengan ESLint.
- `npx tsc --noEmit`: Validasi integritas tipe TypeScript.

---

## 📂 Struktur Project Penting

- `src/env.ts`: Skema validasi environment variables.
- `src/lib/logger.ts`: Utilitas logging terstruktur.
- `src/lib/api.ts`: Helper shared untuk respon API standard.
- `src/lib/csrf.ts`: Middleware validasi origin.
- `src/lib/security.ts`: Implementasi rate limiter persisten.

---

## 📝 Catatan Implementasi

- Metadata SEO, canonical URL, sitemap, dan robots bergantung pada `NEXT_PUBLIC_SITE_URL`.
- Google Analytics 4 otomatis aktif jika `NEXT_PUBLIC_GA_MEASUREMENT_ID` diisi.
- Banner consent menyimpan pilihan analytics di `localStorage` dengan key `kospedia-cookie-consent`.
