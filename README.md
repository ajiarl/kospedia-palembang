# KosPedia Palembang

Platform pencarian kos mahasiswa di sekitar kampus-kampus Palembang, dibangun dengan Next.js App Router dan Supabase.

## Stack

- Next.js 16
- React 19
- TypeScript
- Supabase Auth + Database + RLS
- Tailwind CSS
- Leaflet

## Setup Lokal

1. Install dependency:

```bash
npm install
```

2. Salin environment:

```bash
copy .env.example .env.local
```

3. Isi minimal variabel berikut di `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GA_MEASUREMENT_ID=
SUPABASE_SERVICE_ROLE_KEY=
```

4. Jalankan development server:

```bash
npm run dev
```

5. Buka `http://localhost:3000`.

## Database Supabase

Schema lokal ada di:

- `supabase/schema.sql`
- `supabase/migrations/20260427_add_kos_slug.sql`
- `supabase/seed.sql`

Jika database aktif belum sinkron dengan code terbaru, pastikan migration slug sudah dijalankan sebelum membuka halaman detail kos.

## Seed Data

`supabase/seed.sql` berisi data awal kampus dan kos untuk development. Jalankan file ini ke project Supabase lokal atau remote yang kamu pakai setelah schema dan migration terbaru diterapkan.

## Script

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Catatan Implementasi

- Route publik utama ada di `(main)`, auth flow ada di `(auth)`.
- Client dan server Supabase dipisah di `src/lib/supabase`.
- Metadata SEO, canonical URL, sitemap, robots, dan structured data bergantung pada `NEXT_PUBLIC_SITE_URL`.
- Google Analytics 4 otomatis aktif jika `NEXT_PUBLIC_GA_MEASUREMENT_ID` diisi.
- Event yang ditrack saat ini: `whatsapp_click`, `favorite_add`, `favorite_remove`, `review_submit`, dan `filter_kampus_select`.
- Banner consent menyimpan pilihan analytics di `localStorage` dengan key `kospedia-cookie-consent`.
