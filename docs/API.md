# Dokumentasi API & Database

Dokumen ini menjelaskan skema database Supabase dan logika Query yang digunakan di KosPedia Palembang.

## 🗄️ Database Schema

### 1. `kampus` (Campus)
Menyimpan lokasi kampus-kampus di Palembang.
| Kolom | Tipe | Deskripsi |
|--------|------|-------------|
| `id` | `uuid` | Primary Key |
| `nama` | `text` | Nama kampus |
| `slug` | `text` | Nama unik yang ramah URL |
| `lat` | `double` | Latitude |
| `lng` | `double` | Longitude |

### 2. `kos` (Accommodations)
Tabel utama untuk listing akomodasi.
| Kolom | Tipe | Deskripsi |
|--------|------|-------------|
| `id` | `uuid` | Primary Key |
| `kampus_id`| `uuid` | Foreign Key ke `kampus` |
| `slug` | `text` | Nama unik yang ramah URL |
| `nama` | `text` | Nama tampilan |
| `harga_min`| `integer`| Harga bulanan minimum |
| `harga_max`| `integer`| Harga bulanan maksimum |
| `jenis` | `enum` | `putra`, `putri`, `campur` |
| `fasilitas`| `text[]` | Array tag fasilitas (WiFi, AC, dll.) |
| `lat`/`lng` | `double` | Geokoordinat |
| `tersedia` | `boolean` | Status ketersediaan |

### 3. `favorit` (User Favorites)
| Kolom | Tipe | Deskripsi |
|--------|------|-------------|
| `user_id` | `uuid` | Referensi ke `auth.users` |
| `kos_id` | `uuid` | Referensi ke `kos` |

### 4. `review`
| Kolom | Tipe | Deskripsi |
|--------|------|-------------|
| `user_id` | `uuid` | Referensi ke `auth.users` |
| `kos_id` | `uuid` | Referensi ke `kos` |
| `rating` | `integer`| 1 hingga 5 bintang |
| `komentar` | `text` | Teks ulasan |

## 🔍 Logika Query (`buildKosQuery`)

Logika pencarian diimplementasikan di `src/app/(main)/kos/page.tsx`. Perilaku utama:

1.  **Price Overlap**: Pencarian untuk rentang harga `[min, max]` menggunakan:
    *   `.gte('harga_max', min)`
    *   `.lte('harga_min', max)`
    Ini memastikan pencarian menemukan item Kos yang rentang harganya *beririsan* dengan rentang yang diinginkan pengguna.
2.  **Facility Filter**: Menggunakan operator `.contains()` PostgreSQL untuk pencocokan array. Jika beberapa fasilitas dipilih, Query akan mengembalikan item Kos yang memiliki **semua** fasilitas yang dipilih.
3.  **Distance Calculation**: Jarak dihitung di sisi aplikasi menggunakan **Haversine Formula** (`src/lib/haversine.ts`). Hal ini memungkinkan pemfilteran radius dinamis berdasarkan koordinat override.

## 🌐 URL Search Parameters

Interface pemfilteran sepenuhnya digerakkan oleh parameter URL:

| Parameter | Tipe | Contoh |
|-----------|------|---------|
| `kampus` | `string` (slug) | `?kampus=unsri-bukit` |
| `jenis` | `string` | `?jenis=putri` |
| `hargaMin`| `number` | `?hargaMin=500000` |
| `hargaMax`| `number` | `?hargaMax=1500000` |
| `jarakMax`| `number` (km) | `?jarakMax=2` |
| `fasilitas`| `csv` | `?fasilitas=WiFi,AC` |
| `sort` | `string" | `?sort=rating` |
