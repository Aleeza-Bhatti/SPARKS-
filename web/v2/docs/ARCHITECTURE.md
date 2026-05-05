# Sparks — Architecture

## Production stack (full vision)
- Frontend: Next.js 14 App Router, TypeScript, Tailwind, shadcn/ui, Framer Motion
- Auth: Supabase, Pinterest as custom OAuth provider, Google fallback
- Database: Supabase Postgres with pgvector extension
- Agent service: FastAPI in Python on Fly.io
- LLMs: OpenAI GPT-4o (heavy reasoning), GPT-4o-mini (cheap classification)
- Vision: GPT-4o for pin and product image analysis
- Embeddings: OpenAI text-embedding-3-small
- Data sources: Pinterest API + ShareASale + direct brand partnerships
- Hosting: Vercel (web) + Fly.io (agent)

## Demo stack (what we build tonight)
- Frontend: Next.js 14, TypeScript, Tailwind, shadcn/ui, Framer Motion
- Auth: minimal — Pinterest OAuth only, session stored as a signed cookie,
  no Supabase yet
- Database: NONE. All state is either in cookies, local component state,
  or in-memory on the server. Products live in data/products.json.
- LLMs: OpenAI API called from Next.js API routes directly (no Python service)
- Vision: GPT-4o for pin analysis
- Data sources: Pinterest API for the user's style; products.json for results

The demo stack runs on Vercel preview deployments only. No database to set up,
no second service to deploy. Two API keys (Pinterest, OpenAI) and ship.

## File structure (demo build)

```
sparks/
├── app/
│   ├── (marketing)/
│   │   └── page.tsx                          # landing (Screen 1)
│   ├── (app)/
│   │   ├── today/page.tsx                    # Screen 8
│   │   ├── search/page.tsx                   # Screens 9-10
│   │   ├── product/[id]/page.tsx             # Screen 11
│   │   └── layout.tsx                        # logged-in nav
│   ├── onboarding/
│   │   ├── connect/page.tsx                  # Screen 2
│   │   ├── select-board/page.tsx             # Screen 3
│   │   ├── style-summary/page.tsx            # Screen 4
│   │   ├── swipe/page.tsx                    # Screen 5
│   │   ├── standards/page.tsx                # Screen 6
│   │   ├── confirm/page.tsx                  # Screen 7
│   │   └── layout.tsx                        # progress bar wrapper
│   ├── api/
│   │   ├── auth/pinterest/
│   │   │   ├── start/route.ts                # initiate OAuth
│   │   │   └── callback/route.ts             # handle redirect
│   │   ├── pinterest/
│   │   │   ├── boards/route.ts
│   │   │   └── pins/route.ts
│   │   ├── style/
│   │   │   ├── analyze/route.ts              # vision on pins → summary
│   │   │   └── refine/route.ts               # "not quite" correction
│   │   ├── standards/
│   │   │   └── parse/route.ts                # text → structured rules
│   │   └── search/
│   │       └── route.ts                      # query parser + scripted results
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                                   # shadcn primitives
│   ├── nav/
│   │   ├── MarketingNav.tsx
│   │   └── AppNav.tsx
│   ├── onboarding/
│   │   ├── ProgressBar.tsx
│   │   ├── StyleSummary.tsx
│   │   ├── CorrectionPanel.tsx
│   │   ├── SwipeCard.tsx
│   │   └── StandardsForm.tsx
│   ├── product/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   └── VerificationChecks.tsx
│   └── search/
│       ├── SearchBar.tsx
│       ├── ThinkingSteps.tsx
│       └── EmptyState.tsx
├── lib/
│   ├── pinterest.ts                          # Pinterest API wrapper
│   ├── openai.ts                             # OpenAI SDK wrapper
│   ├── session.ts                            # signed cookie helpers
│   ├── products.ts                           # load and filter products.json
│   └── types.ts
├── data/
│   └── products.json                         # 50 products, chic+gothic
├── docs/
│   ├── PRODUCT.md
│   ├── SCREENS.md
│   ├── ARCHITECTURE.md
│   └── BUILD_PLAN.md
├── public/
│   └── (static assets)
├── .env.local.example
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

## Demo session model
- After Pinterest OAuth callback, set a signed cookie containing:
  - user_id (any UUID, generated server-side)
  - pinterest_access_token (encrypted)
  - style_profile (the result from /api/style/analyze, set after that runs)
  - standards (the result from /api/standards/parse)
  - style_tag ("chic" | "gothic") — derived from style_profile
- All onboarding pages read from this cookie
- /today and /search both read style_tag and filter products.json accordingly

## How style_tag gets assigned for demo
After style summary is generated, do a single GPT-4o call asking "given this
style summary, is the user closer to 'chic' or 'gothic'? Reply with one word."
Save to cookie. From then on, /today and /search return only products with
matching style_tag. This is what enables the chic-vs-gothic comparison demo.

For the demo: if you want to GUARANTEE the chic-vs-gothic comparison works
regardless of which Pinterest board the investor connects, you can override
the style_tag from a query param: /today?demo=gothic forces gothic results.

## Data shape: products.json
```typescript
type DemoProduct = {
  id: string                   // "henne-sage-midi-001"
  brand: string                // "Henne"
  title: string                // "Sage linen midi with belted waist"
  price_cents: number
  image_urls: string[]
  product_url: string          // real link to brand site
  style_tag: "chic" | "gothic"
  attributes: {
    neckline: string
    sleeve_length: string
    hem: string
    opacity: string
  }
  modesty_score: number        // 0-1
  match_percent: number        // for the badge on cards
  why_picked: string           // pre-written for demo
  checks_passed: Array<{
    status: "ok" | "warning"
    text: string               // e.g. "3/4 sleeves" or "Slip recommended"
  }>
  review_signals: {
    transparency_concern: boolean
    needs_slip: boolean
    fit_notes: string | null
  }
}
```

## Environment variables (.env.local)
```
OPENAI_API_KEY=sk-...
PINTEREST_APP_ID=...
PINTEREST_APP_SECRET=...
PINTEREST_REDIRECT_URI=http://localhost:3000/api/auth/pinterest/callback
SESSION_SECRET=long-random-string-32-chars-minimum
```

## OpenAI usage by endpoint

| Endpoint | Model | Purpose |
|---|---|---|
| /api/style/analyze | GPT-4o (vision) | Read pin images, generate style summary + tags |
| /api/style/refine | GPT-4o | Revise summary based on user correction |
| /api/standards/parse | GPT-4o | Free text → structured boundaries (use JSON mode) |
| /api/search | GPT-4o | Parse query into structured intent (use JSON mode) |

For all GPT-4o calls that return JSON, use `response_format: { type: "json_object" }`
or structured outputs with a schema for guaranteed valid JSON.

## What to defer past the demo
- Supabase setup (auth, database, storage)
- Python agent service
- Real catalog enrichment pipeline
- ShareASale integration
- pgvector and semantic cache
- Cron jobs for daily feed
- Feedback loop / preference learning
- Product detail page beyond a basic version
- "Not quite" multi-iteration loop (single iteration is fine for demo)
