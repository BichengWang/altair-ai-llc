# Altair AI LLC Homepage

Elegant, single-page marketing site for Altair's local services platform.

## Getting started

1. Install Node.js 20+.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the auth environment template and fill in your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```

## Supabase auth setup

1. Create a Supabase project.
2. In the Supabase SQL editor, run [`supabase/profiles.sql`](./supabase/profiles.sql) to create the `profiles` table, row-level security policies, and the auth trigger that seeds profile rows.
3. In Supabase Auth settings, enable:
   - Email/password auth
   - Google provider
4. In the Google Cloud console, create OAuth credentials and add the redirect URI Supabase gives you for the Google provider.
5. In Supabase Auth URL configuration, add these redirect URLs:
   - Local dev: `http://localhost:5173/auth/callback`
   - Production: `https://your-domain.example/auth/callback`
   - Site URL for email confirmation: your deployed homepage origin
6. Add these Vite env vars to `.env.local` and your deployment environment:
   ```bash
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

## Auth routes

- Public: `/`, `/services`, `/services/:slug`, `/enquiry`, `/contact`, `/login`, `/register`, `/auth/callback`
- Protected: `/account`

## Tests

- Unit tests:
  ```bash
  npm run test:unit
  ```
- End-to-end tests:
  ```bash
  npx playwright install
  npm run test:e2e
  ```

## Notes

- The hero section uses a fixed background image at `public/images/background.png`.
- You can adjust the overlay and image treatment in `src/index.css` (`.hero-surface`).
