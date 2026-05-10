# KosPedia Palembang

> Platform pencarian kos mahasiswa di sekitar kampus Palembang yang memudahkan pencarian berdasarkan lokasi presisi, fasilitas lengkap, dan rentang harga yang transparan.

## 🎯 Tujuan Proyek
Proyek ini dibuat untuk menyelesaikan kendala mahasiswa dalam menemukan hunian sementara yang strategis dan sesuai anggaran di sekitar kampus-kampus Palembang. Dengan mengintegrasikan data lokasi yang akurat dan sistem filter yang cerdas, aplikasi ini bertujuan untuk menyederhanakan proses pengambilan keputusan bagi mahasiswa pendatang maupun lokal.

## ✨ Fitur Utama
- **Smart Proximity Search**: Pencarian kos berdasarkan radius jarak (0.5–5 km) dari kampus menggunakan kalkulasi formula Haversine untuk akurasi lokasi.
- **Batch Filter Update**: Sistem pemrosesan filter secara berkelompok (batch) yang menghilangkan reload berulang pada setiap interaksi, memberikan pengalaman pencarian yang jauh lebih cepat.
- **Flat Minimalist UI**: Antarmuka modern yang bersih dengan fokus pada konten, dioptimalkan sepenuhnya untuk kenyamanan penggunaan di perangkat mobile maupun desktop.
- **Hardened Security**: Implementasi keamanan tingkat tinggi melalui validasi schema Zod, proteksi CSRF Origin, dan sistem rate limiting berbasis database.

## 🛠️ Tech Stack
- **Frontend**: Next.js 16 (App Router), Tailwind CSS, React-Leaflet
- **Backend**: Next.js API Routes, Supabase Auth
- **Database**: PostgreSQL (Supabase) dengan Row Level Security (RLS)
- **Hosting**: Vercel

## 🚀 Cara Menjalankan Lokal

### Prasyarat
- Node.js v18+
- Akun Supabase (untuk database dan autentikasi)

### Instalasi
```bash
# 1. Clone repository
git clone https://github.com/ajiarl/kospedia-palembang.git
cd kospedia-palembang

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env.local
# Edit .env.local dan isi dengan kunci API Supabase Anda

# 4. Jalankan dev server
npm run dev
```
