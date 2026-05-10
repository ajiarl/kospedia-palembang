# KosPedia Palembang 🏠

Platform pencarian kos mahasiswa di sekitar kampus-kampus Palembang. Temukan kos terdekat, bandingkan fasilitas, dan filter berdasarkan kebutuhan — semua dalam satu tempat.

## ✨ Fitur Unggulan

### 🔍 Smart Filtering
- **Jarak ke Kampus** — Filter kos berdasarkan radius (0.5–5 km) dari kampus pilihan menggunakan kalkulasi Haversine.
- **Fasilitas Lengkap** — Filter berdasarkan WiFi, AC, Kamar Mandi Dalam, Parkir, Dapur, dan lainnya.
- **Rentang Harga** — Dual-slider untuk menentukan batas harga minimum dan maksimum.
- **Jenis Kos** — Filter berdasarkan Putra, Putri, atau Campur.

### ⚡ Batch Filter Update
Semua interaksi filter (klik chip, geser slider) hanya mengubah state lokal. Perubahan baru dikirim ke server setelah tombol **"Terapkan Filter"** ditekan — menghilangkan reload berulang dan memberikan pengalaman yang jauh lebih responsif.

### 🎨 Modern-Clean UI
- Layout responsif yang optimal untuk Mobile dan Desktop.
- Sidebar filter dalam satu container bersih dengan divider halus, bukan card-card terpisah.
- Sticky sidebar di desktop agar filter selalu terlihat saat scrolling.
- Bottom-sheet drawer di mobile dengan backdrop blur.

### 🗺️ Peta Interaktif
- Peta Leaflet dengan pin lokasi kos dan kampus.
- Validasi koordinat otomatis via audit geocoding dan sistem override.
- Badge jarak yang menampilkan jarak ke kampus terdekat.

### 🔐 Hardened Security
- **Zod Validation** — Input API divalidasi dengan schema ketat.
- **Rate Limiting** — Proteksi brute-force berbasis IP/User via Supabase SQL.
- **CSRF Protection** — Verifikasi origin pada semua mutation routes.
- **Dynamic CSP** — Content Security Policy yang environment-aware.
- **ENV Validation** — Aplikasi gagal start secara eksplisit jika config tidak valid.

### 📊 Analytics & Monitoring
- Structured logging (NDJSON di produksi, pretty-print di dev).
- Google Tag Manager & GA4 terintegrasi aman dengan CSP.
- Correlation IDs untuk request tracing.

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router + Turbopack) |
| Database & Auth | [Supabase](https://supabase.com/) (PostgreSQL + RLS) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Maps | [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/) |
| Validation | [Zod](https://zod.dev/) |
| Analytics | [Google Tag Manager](https://tagmanager.google.com/) & GA4 |

---

## 🚀 Setup Lokal

```bash
# 1. Install dependencies
npm install

# 2. Salin environment
copy .env.example .env.local

# 3. Jalankan development server
npm run dev
```

Isi variabel berikut di `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000           # opsional, default localhost
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key      # opsional untuk build
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX           # opsional untuk analytics
```

Buka **http://localhost:3000** dan mulai eksplorasi.

---

## 📜 Script

| Perintah | Fungsi |
|----------|--------|
| `npm run dev` | Server development |
| `npm run build` | Build produksi |
| `npm run start` | Jalankan build produksi |
| `npm run lint` | Cek kode dengan ESLint |
| `npx tsc --noEmit` | Validasi integritas tipe |

---

## 📂 Struktur Penting

```
src/
├── app/(main)/kos/         # Halaman listing & detail kos
├── app/api/                 # API routes (favorit, review, kos)
├── components/shared/       # FilterSidebar, KosCard, Navbar, dll.
├── context/                 # FavoritContext (optimistic UI)
├── lib/                     # Utils: haversine, logger, security, csrf
├── env.ts                   # Zod schema untuk environment variables
└── types/                   # TypeScript types & database schema
```

---

## 📝 Catatan

- SEO metadata dan canonical URL bergantung pada `NEXT_PUBLIC_SITE_URL`.
- GA4 otomatis aktif jika `NEXT_PUBLIC_GA_MEASUREMENT_ID` diisi.
- Cookie consent tersimpan di `localStorage` (`kospedia-cookie-consent`).
- Koordinat kos divalidasi via audit otomatis dengan fallback ke geocoder.
