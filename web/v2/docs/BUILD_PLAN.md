# Sparks — Demo Build Plan

This is the order to build the demo. Each step ends with something visibly
working. Commit after every step. Do not skip ahead — later steps assume the
earlier ones exist.

If anything is unclear, refer back to docs/SCREENS.md for the exact spec of
the screen being built, and docs/ARCHITECTURE.md for file paths and types.

---

## Step 0: Project setup

Create a Next.js 14 app with TypeScript, Tailwind, App Router. Install:
- openai
- framer-motion
- lucide-react
- iron-session (for signed cookies)
- shadcn/ui (just initialize and add: button, input, textarea, card)

Configure tailwind.config.ts with the Sparks color palette:
- cream: #FAEEDA
- sage: #97C459 (and 50/100/600/800 stops)
- terracotta: #D85A30
- amber: #BA7517
- Use stone-* for grays

Set up app/globals.css with the font import (Inter for sans, a serif like
Fraunces or DM Serif Display for the italic emphasis).

Place products.json at /data/products.json (the user already has this file —
move it to that path).

Verify: `npm run dev` opens a blank Next.js page on localhost:3000.

Commit: "Step 0: project scaffolded"

---

## Step 1: Landing page (Screen 1)

Build app/(marketing)/page.tsx exactly per Screen 1 in SCREENS.md. The
"Continue with Pinterest" button is a Link to /onboarding/connect for now —
we'll wire up real OAuth in step 3.

Build components/nav/MarketingNav.tsx for the top nav.

Verify: localhost:3000 shows the landing page. Buttons don't error.

Commit: "Step 1: landing page"

---

## Step 2: Onboarding shell + Pinterest connect (Screen 2)

Build app/onboarding/layout.tsx with the 4-step progress bar component
(components/onboarding/ProgressBar.tsx). It takes a `step` prop (1-4) and
renders 4 horizontal segments, filling those at index < step.

Build app/onboarding/connect/page.tsx per Screen 2. Both cards are Links
for now — primary to /api/auth/pinterest/start, fallback to a stub.

Verify: navigate from landing → connect screen, progress bar shows step 1.

Commit: "Step 2: onboarding shell + connect screen"

---

## Step 3: Pinterest OAuth (real)

Set up Pinterest app at developers.pinterest.com (user does this manually,
follows their OAuth setup guide for sandbox / dev mode). Add credentials to
.env.local.

Build lib/session.ts using iron-session — a server-side helper to get/set
a signed cookie containing the demo session state.

Build:
- app/api/auth/pinterest/start/route.ts — redirects to Pinterest OAuth URL
  with scope=boards:read,pins:read
- app/api/auth/pinterest/callback/route.ts — exchanges code for token,
  stores in session cookie, redirects to /onboarding/select-board

Verify: clicking "Continue with Pinterest" → real Pinterest auth flow →
redirected back, cookie set.

Commit: "Step 3: Pinterest OAuth"

---

## Step 4: Select board (Screen 3)

Build:
- lib/pinterest.ts — wrapper around Pinterest API with methods:
  getBoards(token), getPins(token, boardId, limit)
- app/api/pinterest/boards/route.ts — returns the user's boards
- app/api/pinterest/pins/route.ts — returns up to 25 pins from board

Build app/onboarding/select-board/page.tsx — fetches boards client-side or
via a server component, renders grid. On click, POST to /api/pinterest/pins,
then redirect to /onboarding/style-summary with pin data in session cookie.

Verify: connect Pinterest → see real boards → pick one → see "Reading pins…"
loading → land on style-summary route (which is a stub for now).

Commit: "Step 4: select board, pull pins"

---

## Step 5: Style summary (Screen 4) — the magic moment

Build lib/openai.ts — wrapper around OpenAI SDK with helpers for vision
calls and JSON-mode calls.

Build app/api/style/analyze/route.ts. It reads pins from session, sends a
single GPT-4o call with vision: pass up to 20 pin image URLs, ask for:
1. A one-sentence style summary (warm, descriptive, in our voice)
2. 5-8 style tags with confidence scores 0-1
3. 6 dominant colors as hex codes
4. A style_tag classification: "chic" or "gothic"

Use response_format: { type: "json_object" } with a system prompt that
specifies the exact JSON shape required. Include the warmth instruction
from SCREENS.md to avoid clinical voice.

Save the result to session cookie. Return JSON to client.

Build app/onboarding/style-summary/page.tsx per Screen 4:
- On mount, calls /api/style/analyze
- Shows skeleton/loading state with messages: "Reading 23 pins…",
  "Naming your aesthetic…"
- Renders the result: serif pull quote, color-coded tag chips, color swatches
- "Looks right →" → /onboarding/swipe
- "Not quite" → expands CorrectionPanel component

Build components/onboarding/CorrectionPanel.tsx and
app/api/style/refine/route.ts:
- Panel has textarea + 5 chips + "Try again"/"Cancel" buttons
- Submit POSTs to /api/style/refine with original_summary, correction_text,
  selected_chips
- Refine endpoint does another GPT-4o call referencing prior pins + user's
  feedback, returns revised summary
- Page replaces the displayed summary with the revised one

Verify: real Pinterest connect → real GPT-4o-generated summary based on
your real pins. The "Not quite" flow produces a different summary.

Commit: "Step 5: style summary with correction flow"

---

## Step 6: Swipe quiz (Screen 5)

Build components/onboarding/SwipeCard.tsx using Framer Motion `drag`.
Stamps for LIKE/NOPE/LOVE shown via opacity transforms based on x and y.

Build app/onboarding/swipe/page.tsx:
- Hardcoded array of 25 outfit cards (use image_urls from products.json,
  random mix of chic and gothic)
- Render top 3 cards stacked
- Track swipe direction in local state
- Counter "N / 25"
- Three buttons below for accessibility
- After 25 swipes, redirect to /onboarding/standards

Don't update style_tag from swipes for the demo. Just record them.

If running tight on time, this entire step can be cut. Replace with a
"Skip quiz, set standards →" button on style-summary screen.

Commit: "Step 6: swipe quiz"

---

## Step 7: Standards screen (Screen 6) and parser

Build components/onboarding/StandardsForm.tsx and
app/onboarding/standards/page.tsx per Screen 6. Single textarea + examples
card + CTA.

Build app/api/standards/parse/route.ts. GPT-4o call (with json_object response
format) that takes free text and returns structured JSON like:
```json
{
  "neckline_max_depth": "crew",
  "sleeve_min_length": "elbow",
  "hem_min_length": "knee",
  "requires_opaque": true,
  "no_slits_above": "knee",
  "custom_notes": "no body-con"
}
```

Save result to session cookie.

Build app/onboarding/confirm/page.tsx (Screen 7) — read parsed standards
from cookie, render as readable bullets. "Looks right →" goes to /today.

Verify: type "knees covered, sleeves past elbows, nothing see-through" →
see structured rules generated by GPT-4o → confirm.

Commit: "Step 7: standards capture + parsing"

---

## Step 8: Today / home feed (Screen 8)

Build components/nav/AppNav.tsx for the logged-in nav.

Build lib/products.ts with helpers: loadProducts(), filterByStyle(tag),
filterByStandards(products, standards).

Build app/(app)/layout.tsx — wraps app routes with AppNav, checks session.

Build app/(app)/today/page.tsx per Screen 8:
- Read style_tag from session
- Pull 8 products from products.json matching style_tag
- Render the grid with match% badges, brand, title, price
- Subhead is a hardcoded sentence based on style_tag ("8 finds today —
  heavy on linen since you've been loving it." for chic;
  "8 finds today — bold silhouettes and structured tailoring." for gothic)

Build components/product/ProductCard.tsx (used by today + search results).

Verify: complete onboarding → land on /today → see 8 real products
matching the style profile.

Commit: "Step 8: today feed"

---

## Step 9: Search — the headline demo (Screen 9)

Build components/search/SearchBar.tsx, ThinkingSteps.tsx.

Build app/api/search/route.ts:
- Receives query string
- REAL: makes a single GPT-4o call to parse the query into structured
  intent (occasion, max_price, hard_constraints, search_keywords).
  Returns the parsed intent in the response.
- SCRIPTED: also returns the 8-9 products from products.json matching the
  user's style_tag, plus the hardcoded "stats" for the thinking steps:
  brands_searched: 47, candidates_found: 312, dropped: 247,
  transparency_skipped: 5, slip_warnings: 1
- The verification checks and "why_picked" are read directly from
  products.json — no LLM call to generate these

Build app/(app)/search/page.tsx:
- SearchBar at top
- On submit, POST to /api/search
- Render ThinkingSteps with paced delays:
  - Step 1: "Read your request" — appears immediately, then 800ms later
    the parsed intent appears underneath
  - Step 2: "Searched 47 brands" — 1000ms after step 1
  - Step 3: "Applied your boundaries" — 900ms after step 2
  - Step 4: "Reading reviews for transparency…" — 800ms, shows spinner for
    1500ms, then resolves with checkmark
  - Step 5: "Ranking against your style" — 700ms
  - Step 6: "Writing your picks" — 600ms
- After all steps complete, results grid appears below with the products

Total feel: ~5 seconds of paced thinking before results show.

Build components/product/VerificationChecks.tsx — renders the checks_passed
array with green checks and amber warnings as specified in SCREENS.md.

Verify: type "summer wedding guest, midi, no see-through" → watch thinking
steps animate in sequence → see results grid with verification details
including the "Slip recommended" warning on at least one item.

Commit: "Step 9: search with thinking sequence"

---

## Step 10: Polish pass

In order of priority if time runs out:
1. Verify mobile responsiveness on the search results screen — this is the
   one investors are most likely to pull up on a phone afterward.
2. Add favicon and og:image (any decent placeholder image is fine).
3. Verify "Not quite" correction loop actually feels good — animation
   between summaries should fade, not snap.
4. Add a `?demo=chic` and `?demo=gothic` override on /today and /search to
   force the style profile for showing the comparison.
5. Smooth out loading states everywhere — no flash of unstyled content.
6. Sanity check: every link from every page goes somewhere reasonable. No
   404s, no console errors.

Commit: "Step 10: polish"

---

## Step 11: Deploy

Push to GitHub, connect to Vercel, set env vars in Vercel dashboard,
redirect Pinterest OAuth callback URL to the production domain.

Verify: full flow works on production URL.

Commit: "Step 11: deployed to production"

---

## If you fall behind

Cuts in priority order (cut earliest first):
1. Cut Step 11 (deploy) — demo from localhost with a tunnel like ngrok
2. Cut Step 10 polish (it's polish, accept rough edges)
3. Cut Step 6 (swipe quiz entirely — replace with a skip button)
4. Cut the "Not quite" correction in Step 5 (just have one summary)
5. Cut Step 7's confirm screen — go straight from standards to /today
6. Cut Step 11's product detail page — clicking a product just opens the
   external brand link in a new tab

Do not cut: Step 1 (landing), Step 5 (style summary — the trust moment),
Step 8 (today feed — proves real products), Step 9 (search — the headline).

---

## How to run Claude Code with these docs

After saving all four docs files to your repo:

Open Claude Code:
```
claude
```

First prompt:
```
Read all four files in docs/. Confirm you understand the demo build plan in
docs/BUILD_PLAN.md.

Then execute Step 0 (project setup). Show me the file tree you'll create
before running any commands. Stop after Step 0 and wait for me to verify
before continuing.
```

After Step 0 verifies, every subsequent prompt is just:
```
Execute Step 1 from docs/BUILD_PLAN.md. Stop after the step completes.
```

And so on. The docs are the contract. Claude Code reads them, executes them,
stops at checkpoints. You verify in the browser between each step. Commit.
Move on.

Tips:
- When something looks wrong, screenshot it and paste into Claude Code with
  "this is how it rendered, here's the issue."
- If Claude Code goes off-spec, interrupt: "stop, refer back to
  docs/SCREENS.md screen N — the spec says X."
- If a step takes more than 30 minutes, hit the cut list above.
- Keep products.json accurate — every product needs a real product_url that
  opens a real brand page.
