# Architecture Decision Records (ADR)

This document records the major technical decisions made during the development of KosPedia Palembang.

## ADR 1: Application-Level Distance Filtering
*   **Context**: We need to filter Kos by distance from a selected campus.
*   **Decision**: Implement distance calculation (Haversine) in TypeScript on the application side (`src/lib/haversine.ts`) instead of using PostGIS `ST_Distance` in the database.
*   **Rationale**:
    *   **Coordinate Overrides**: We have a system in `src/lib/kosCoordinates.ts` that overrides database coordinates with geocoded audit results. Performing the filter in the app ensures the math always uses the *corrected* coordinates.
    *   **Simplicity**: Avoids the dependency on PostGIS extensions in the base Supabase setup.
*   **Consequences**: The frontend must fetch all relevant Kos for a campus first, then filter the array. This is performant for current data volumes (~hundreds of rows).

## ADR 2: Batch Filter UI Pattern
*   **Context**: Instant `router.push()` on every checkbox/slider interaction causes layout thrashing and unnecessary network requests.
*   **Decision**: Use a "Draft State" for filters in the `FilterSidebar` component. Changes are only committed to the URL when the user clicks "Terapkan Filter".
*   **Rationale**:
    *   **Performance**: One navigation event vs. many.
    *   **UX**: Users can configure complex multi-criteria filters without the UI jumping or loading multiple times.
*   **Consequences**: Requires visual feedback (e.g., pulsing button) to indicate that there are "unapplied" changes.

## ADR 3: Flat Minimalist Design System
*   **Context**: Previous versions used "card-ception" (nested boxes, borders, and shadows), which cluttered the view.
*   **Decision**: Remove card wrappers from the page layout, header, and sidebar. Only the individual Kos listings remain as cards.
*   **Rationale**:
    *   **Visual Hierarchy**: Makes the content (Kos listings) the primary focus.
    *   **Modern Aesthetic**: Cleaner, "breathable" interface that follows premium design trends.
*   **Consequences**: Relies more on whitespace and typography for sectioning rather than physical borders.

## ADR 4: Fail-Fast Environment Validation
*   **Context**: Missing environment variables are a common cause of silent deployment failures.
*   **Decision**: Use Zod to validate `process.env` at the module-load level in `src/env.ts`.
*   **Rationale**: The app will throw a descriptive error immediately if a key is missing, rather than failing with `undefined` errors deep in the component tree.
*   **Consequences**: Prevents "broken" builds from running in production.
