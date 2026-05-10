# Architecture Decision Records (ADR)

Dokumen ini mencatat keputusan teknis utama yang diambil selama pengembangan KosPedia Palembang.

## ADR 1: Application-Level Distance Filtering
*   **Konteks**: Diperlukan fitur untuk memfilter Kos berdasarkan jarak dari kampus yang dipilih.
*   **Keputusan**: Mengimplementasikan perhitungan jarak (Haversine) di TypeScript pada sisi aplikasi (`src/lib/haversine.ts`) alih-alih menggunakan `ST_Distance` PostGIS di database.
*   **Rasional**:
    *   **Coordinate Overrides**: Terdapat sistem di `src/lib/kosCoordinates.ts` yang menimpa koordinat database dengan hasil audit geocoding. Melakukan pemfilteran di aplikasi memastikan perhitungan selalu menggunakan koordinat yang sudah *dikoreksi*.
    *   **Kesederhanaan**: Menghindari ketergantungan pada ekstensi PostGIS dalam setup dasar Supabase.
*   **Konsekuensi**: Frontend harus mengambil semua Kos yang relevan untuk suatu kampus terlebih dahulu, lalu memfilter array tersebut. Ini berperforma baik untuk volume data saat ini (~ratusan baris).

## ADR 2: Batch Filter UI Pattern
*   **Konteks**: Penggunaan `router.push()` instan pada setiap interaksi checkbox/slider menyebabkan layout thrashing dan permintaan jaringan yang tidak perlu.
*   **Keputusan**: Menggunakan "Draft State" untuk filter pada komponen `FilterSidebar`. Perubahan hanya akan dikirim (commit) ke URL ketika pengguna mengklik "Terapkan Filter".
*   **Rasional**:
    *   **Performa**: Satu event navigasi dibandingkan banyak event.
    *   **UX**: Pengguna dapat mengonfigurasi filter multi-kriteria yang kompleks tanpa UI yang melompat-lompat atau loading berkali-kali.
*   **Konsekuensi**: Memerlukan umpan balik visual (misalnya, tombol yang berdenyut/pulse) untuk menunjukkan bahwa ada perubahan yang "belum diterapkan".

## ADR 3: Flat Minimalist Design System
*   **Konteks**: Versi sebelumnya menggunakan "card-ception" (kotak bersarang, border, dan shadow), yang membuat tampilan terlihat penuh.
*   **Keputusan**: Menghapus container kartu dari layout halaman, header, dan sidebar. Hanya listing Kos individu yang tetap menggunakan styling kartu.
*   **Rasional**:
    *   **Visual Hierarchy**: Membuat konten (listing Kos) menjadi fokus utama.
    *   **Estetika Modern**: Antarmuka yang lebih bersih dan "breathable" mengikuti tren desain premium.
*   **Konsekuensi**: Lebih mengandalkan whitespace dan tipografi untuk pemisahan bagian daripada border fisik.

## ADR 4: Fail-Fast Environment Validation
*   **Konteks**: Variabel lingkungan yang hilang adalah penyebab umum kegagalan deployment yang sulit dideteksi.
*   **Keputusan**: Menggunakan Zod untuk memvalidasi `process.env` pada tingkat module-load di `src/env.ts`.
*   **Rasional**: Aplikasi akan langsung melempar error yang deskriptif jika ada kunci yang hilang, daripada gagal dengan error `undefined` di tengah pohon komponen.
*   **Konsekuensi**: Mencegah build yang "rusak" dijalankan di lingkungan produksi.
