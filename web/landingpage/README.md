# Sparks Waitlist (Next.js)

## Run locally

1. `npm install`
2. `npm run dev`
3. Open `http://localhost:3000/waitlist`

## Data storage

- Supabase mode (preferred): set `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
- Fallback mode (development): data is written to `data/waitlist-users.json`.
- Production safety: if Supabase vars are missing in production, the API now returns an error instead of silently writing to local ephemeral storage.

### Cheapest reliable production setup

1. Create a free Supabase project.
2. Create table `waitlist_users` with:
   - `email` text
   - `phone` text
   - `created_at` timestamp (default `now()`)
3. In Supabase Table Editor, disable public `SELECT` for this table. Allow `INSERT` for anon role.
4. In Vercel Project Settings -> Environment Variables, add:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
5. Redeploy and test one signup from the live site.

Table expected in Supabase: `waitlist_users`

Columns:
- `email` text
- `phone` text
- `created_at` timestamp

## Brand assets

Upload spark and gradient SVG/PNG assets to `public/assets`.
