# Sparks Waitlist (Next.js)

## Run locally

1. `npm install`
2. `npm run dev`
3. Open `http://localhost:3000/waitlist`

## Data storage

- Supabase mode (preferred): set `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
- Fallback mode (development): data is written to `data/waitlist-users.json`.

Table expected in Supabase: `waitlist_users`

Columns:
- `email` text
- `phone` text
- `created_at` timestamp

## Brand assets

Upload spark and gradient SVG/PNG assets to `public/assets`.
