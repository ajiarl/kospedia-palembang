# API & Database Documentation

This document describes the Supabase database schema and the query logic used in KosPedia Palembang.

## 🗄️ Database Schema

### 1. `kampus` (Campus)
Stores locations of campuses in Palembang.
| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary Key |
| `nama` | `text` | Name of the campus |
| `slug` | `text` | Unique URL-friendly name |
| `lat` | `double` | Latitude |
| `lng` | `double` | Longitude |

### 2. `kos` (Accommodations)
The primary table for accommodation listings.
| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary Key |
| `kampus_id`| `uuid` | Foreign Key to `kampus` |
| `slug` | `text` | Unique URL-friendly name |
| `nama` | `text` | Display name |
| `harga_min`| `integer`| Minimum monthly price |
| `harga_max`| `integer`| Maximum monthly price |
| `jenis` | `enum` | `putra`, `putri`, `campur` |
| `fasilitas`| `text[]` | Array of facility tags (WiFi, AC, etc.) |
| `lat`/`lng` | `double` | Geocoordinates |
| `tersedia` | `boolean` | Availability status |

### 3. `favorit` (User Favorites)
| Column | Type | Description |
|--------|------|-------------|
| `user_id` | `uuid` | References `auth.users` |
| `kos_id` | `uuid` | References `kos` |

### 4. `review`
| Column | Type | Description |
|--------|------|-------------|
| `user_id` | `uuid` | References `auth.users` |
| `kos_id` | `uuid` | References `kos` |
| `rating` | `integer`| 1 to 5 stars |
| `komentar` | `text` | Review text |

## 🔍 Query Logic (`buildKosQuery`)

The search logic is implemented in `src/app/(main)/kos/page.tsx`. Key behaviors:

1.  **Price Overlap**: Filtering for a price range `[min, max]` uses:
    *   `.gte('harga_max', min)`
    *   `.lte('harga_min', max)`
    This ensures we find Kos items where their price range *overlaps* with the user's desired range.
2.  **Facility Filter**: Uses the PostgreSQL `.contains()` operator for array matching. If multiple facilities are selected, the query returns Kos items that have **all** selected facilities.
3.  **Distance Calculation**: Distance is calculated on the application side using the **Haversine Formula** (`src/lib/haversine.ts`). This allows for dynamic radius filtering based on coordinate overrides.

## 🌐 URL Search Parameters

The filtering interface is entirely driven by URL parameters:

| Parameter | Type | Example |
|-----------|------|---------|
| `kampus` | `string` (slug) | `?kampus=unsri-bukit` |
| `jenis` | `string` | `?jenis=putri` |
| `hargaMin`| `number` | `?hargaMin=500000` |
| `hargaMax`| `number` | `?hargaMax=1500000` |
| `jarakMax`| `number` (km) | `?jarakMax=2` |
| `fasilitas`| `csv` | `?fasilitas=WiFi,AC` |
| `sort` | `string` | `?sort=rating` |
