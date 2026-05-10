# Panduan Deployment

Ikuti langkah-langkah berikut untuk men-deploy KosPedia Palembang ke lingkungan produksi.

## 1. Setup Supabase (Database)

1.  Buat proyek baru di [Supabase](https://supabase.com/).
2.  Buka **SQL Editor** di Dashboard Supabase.
3.  Jalankan isi dari `supabase/schema.sql` untuk menginisialisasi tabel, tipe data, dan kebijakan RLS.
4.  (Opsional) Jalankan `supabase/seed.sql` untuk mengisi data awal kampus dan kos.
5.  Buka **Project Settings > API** untuk mengambil `URL` dan `anon` key Anda.

## 2. Environment Variables

Konfigurasikan variabel berikut di penyedia layanan hosting Anda (misalnya, Vercel):

| Kunci | Wajib | Deskripsi |
|-----|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Ya | URL Proyek Supabase Anda |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Ya | Anon Key Supabase Anda |
| `NEXT_PUBLIC_SITE_URL` | Tidak | Domain produksi (default ke localhost) |
| `SUPABASE_SERVICE_ROLE_KEY` | Tidak | Digunakan untuk script admin di sisi server |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`| Tidak | ID Google Analytics (contoh: `G-XXXXXX`) |

## 3. Frontend Deployment (Vercel)

1.  Hubungkan repositori GitHub Anda ke Vercel.
2.  Vercel akan secara otomatis mendeteksi proyek Next.js.
3.  Tambahkan environment variable yang tercantum di atas.
4.  Klik **Deploy**.

## 4. Pemeriksaan Pasca-Deployment

*   **Geocoding Audit**: Jalankan script audit koordinat jika Anda menambahkan data Kos baru:
    ```bash
    npm run audit:coords
    ```
*   **Analytics**: Pastikan event GA4 masuk dengan memeriksa dashboard real-time di Google Analytics.
*   **Security**: Pastikan route API mengembalikan `401` saat diakses tanpa sesi login.
