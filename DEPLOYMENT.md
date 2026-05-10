# Deployment Guide

Follow these steps to deploy KosPedia Palembang to a production environment.

## 1. Supabase Setup (Database)

1.  Create a new project on [Supabase](https://supabase.com/).
2.  Open the **SQL Editor** in the Supabase Dashboard.
3.  Run the contents of `supabase/schema.sql` to initialize tables, types, and RLS policies.
4.  (Optional) Run `supabase/seed.sql` to populate initial campus and kos data.
5.  Go to **Project Settings > API** to retrieve your `URL` and `anon` key.

## 2. Environment Variables

Configure the following variables in your hosting provider (e.g., Vercel):

| Key | Required | Description |
|-----|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Your Supabase Anon Key |
| `NEXT_PUBLIC_SITE_URL` | No | Production domain (defaults to localhost) |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Used for server-side admin scripts |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`| No | Google Analytics ID (e.g., `G-XXXXXX`) |

## 3. Frontend Deployment (Vercel)

1.  Connect your GitHub repository to Vercel.
2.  Vercel will automatically detect the Next.js project.
3.  Add the environment variables listed above.
4.  Click **Deploy**.

## 4. Post-Deployment Checks

*   **Geocoding Audit**: Run the coordinate audit script if you add new Kos data:
    ```bash
    npm run audit:coords
    ```
*   **Analytics**: Verify that GA4 events are flowing by checking the real-time dashboard in Google Analytics.
*   **Security**: Verify that API routes return `401` when accessed without a session.
