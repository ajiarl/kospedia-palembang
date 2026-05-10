# Panduan Arsitektur - KosPedia Palembang

Dokumen ini menjelaskan arsitektur tingkat tinggi dan tech stack yang digunakan dalam proyek KosPedia Palembang.

## 🛠️ Tech Stack

| Layer | Teknologi | Versi |
|-------|------------|---------|
| **Core Framework** | Next.js (App Router) | `16.2.3` |
| **UI Library** | React | `19.2.4` |
| **Database & Auth** | Supabase (@supabase/ssr) | `0.10.2` |
| **Styling** | Tailwind CSS | `3.4.1` |
| **Schema Validation** | Zod | `4.3.6` |
| **Mapping** | Leaflet / React-Leaflet | `1.9.4` / `5.0.0` |
| **Icons** | Lucide React | `1.8.0` |

## 🏗️ System Flow

KosPedia menggunakan arsitektur **Full-stack React** modern:

1.  **Client (Browser)**:
    *   React Client Components menangani interaktivitas (Filter, Map, toggle Favorit).
    *   `FavoritContext` mengelola shared state dengan optimistic UI update.
2.  **Next.js Server (Edge/Node)**:
    *   **Server Components**: Menangani data fetching awal langsung dari Supabase, memastikan JS di sisi client tetap minimal dan First Contentful Paint yang cepat.
    *   **API Routes**: Menangani mutasi (Favorit, Review) dan aksi terproteksi dengan middleware keamanan (CSRF, Rate Limiting).
3.  **Supabase (Backend)**:
    *   **PostgreSQL**: Penyimpanan data utama dengan relational constraints.
    *   **Row Level Security (RLS)**: Menjalankan kontrol akses di tingkat database.
    *   **Auth**: Pengelola identitas yang terintegrasi melalui cookie.

## 📊 Data Fetching & State Management

### Server-Side Strategy
Sebagian besar data (listing Kos, daftar Kampus) di-fetch di dalam **Server Components** (`src/app/(main)/kos/page.tsx`). Digunakan **Parallel Data Fetching** (`Promise.all`) untuk menghilangkan waterfall:
```typescript
const [{ data: kampusData }, { data: maxHargaData }] = await Promise.all([
  supabase.from("kampus").select("*"),
  supabase.from("kos").select("harga_max").limit(1)
]);
```

### Client-Side State
*   **Filters**: Dikelola melalui URL Search Parameters untuk memungkinkan bookmarking dan berbagi hasil pencarian. State `draft` lokal di `FilterSidebar` memungkinkan Batch update.
*   **Favorit**: Dikelola melalui `FavoritContext`. Context ini mengambil state awal dari API dan menggunakan optimistic update (perubahan state lokal sebelum respon API) untuk UX yang lebih responsif.

## 🎨 UI/UX Pattern

*   **Flat Minimalist Design**: Aplikasi ini mengikuti pola UI "Seamless" di mana container menyatu dengan latar belakang. Hanya unit interaktif (kartu Kos) yang menggunakan styling kartu yang berbeda untuk menjaga fokus.
*   **Batch Interaction**: Perubahan filter disimpan dalam state lokal (buffer). Pengguna harus menekan "Terapkan Filter" untuk sinkronisasi dengan URL, mencegah re-render berlebihan selama interaksi slider/checkbox.
*   **Responsive Layout**: 
    *   **Desktop**: Sidebar sticky dengan grid konten yang dapat di-scroll.
    *   **Mobile**: Bottom-sheet drawer untuk filter guna memaksimalkan jangkauan jempol.
