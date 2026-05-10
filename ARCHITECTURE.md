# Architecture Guide - KosPedia Palembang

This document outlines the high-level architecture and technical stack of the KosPedia Palembang project.

## 🛠️ Technical Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Core Framework** | Next.js (App Router) | `16.2.3` |
| **UI Library** | React | `19.2.4` |
| **Database & Auth** | Supabase (@supabase/ssr) | `0.10.2` |
| **Styling** | Tailwind CSS | `3.4.1` |
| **Schema Validation** | Zod | `4.3.6` |
| **Mapping** | Leaflet / React-Leaflet | `1.9.4` / `5.0.0` |
| **Icons** | Lucide React | `1.8.0` |

## 🏗️ System Flow

KosPedia follows a modern **Full-stack React** architecture:

1.  **Client (Browser)**:
    *   React Client Components handle interactivity (Filters, Maps, Favorit toggles).
    *   `FavoritContext` manages shared state with optimistic UI updates.
2.  **Next.js Server (Edge/Node)**:
    *   **Server Components**: Handle initial data fetching directly from Supabase, ensuring minimal client-side JS and fast First Contentful Paint.
    *   **API Routes**: Handle mutations (Favorit, Review) and protected actions with security middleware (CSRF, Rate Limiting).
3.  **Supabase (Backend)**:
    *   **PostgreSQL**: Primary data store with relational constraints.
    *   **Row Level Security (RLS)**: Enforces access control at the database level.
    *   **Auth**: Managed identity provider integrated via cookies.

## 📊 Data Fetching & State Management

### Server-Side Strategy
Most data (Kos listings, Campus lists) is fetched in **Server Components** (`src/app/(main)/kos/page.tsx`). We use **Parallel Data Fetching** (`Promise.all`) to eliminate waterfalls:
```typescript
const [{ data: kampusData }, { data: maxHargaData }] = await Promise.all([
  supabase.from("kampus").select("*"),
  supabase.from("kos").select("harga_max").limit(1)
]);
```

### Client-Side State
*   **Filters**: Managed via URL Search Parameters to allow bookmarking and sharing of search results. A local `draft` state in `FilterSidebar` allows for batch updates.
*   **Favorit**: Managed via `FavoritContext`. It fetches initial state from the API and uses optimistic updates (local state changes before API response) for a snappy UX.

## 🎨 UI/UX Pattern

*   **Flat Minimalist Design**: The application follows a "Seamless" UI pattern where containers blend into the background. Only interactive units (Kos cards) use distinct card styling to maintain focus.
*   **Batch Interaction**: Filter changes are buffered in local state. The user must click "Terapkan Filter" to sync with the URL, preventing excessive re-renders during slider/checkbox interactions.
*   **Responsive Layout**: 
    *   **Desktop**: Sticky sidebar with a scrolling content grid.
    *   **Mobile**: Bottom-sheet drawer for filters to maximize thumb-reachability.
