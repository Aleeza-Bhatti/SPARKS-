# Sparks — Product Brief

## What it is
Sparks is an AI shopping assistant for modest fashion. Users connect Pinterest,
take a swipe quiz, and describe their personal standards in plain English. The
app then surfaces clothing matched to both their aesthetic and their boundaries,
with verification details (like fabric opacity) drawn from customer reviews.

## Who it's for
Women who want clothing that respects specific personal standards (neckline,
sleeve length, opacity, fit) without sacrificing style. Underserved by mainstream
e-commerce because filters don't capture modesty nuances and brands rarely tag
products as "modest."

## The core insight
Pinterest shows what looks like what you love. It can't enforce rules. Sparks
does both: learns aesthetic preferences from Pinterest, then strictly applies
user-defined standards — including reading reviews to verify claims like
opacity that aren't in product listings.

## Tone & voice
- Warm, direct, never preachy or judgmental
- Treats user's standards as ordinary preferences
- Conversational ("Tell us what's off-limits") not clinical
- The product is the user's friend, not their parent

## Visual identity
- Earthy, calm palette: cream (#FAEEDA), sage (#97C459), terracotta (#D85A30),
  amber (#BA7517), warm stones (#F1EFE8 to #2C2C2A)
- Generous whitespace, serif italics for accents (font-serif on emphasized
  words inside sans-serif headings)
- Sans-serif primary: Inter
- Single sparkle motif used sparingly — only as the logo mark
- Logo: "sparks" lowercase with rotated amber square mark

## User journey (target: 3-4 minutes from cold to first results)
1. Land → "Continue with Pinterest"
2. Pinterest OAuth → user signed in, Sparks account created from Pinterest data
3. Pick a board → pins pulled
4. Style summary → human sentence + tags + color swatches → confirm or correct
5. Swipe quiz → 25 cards, three-way swipe (love/like/skip)
6. Standards → single open text field with examples
7. Confirm parsed standards
8. Today feed → 8 picks
9. Search → open chat → visible agent thinking → verified results

## Monetization (post-demo)
- Affiliate revenue from partner brands
- Premium tier later

## What Sparks is NOT
- Not a marketplace — no payments or inventory
- Not a social network
- Not a multi-turn stylist chat — single-shot search
- Not a closet manager

## Demo priorities (in order)
1. The "we get you" trust moment (style summary screen)
2. The visible agent thinking (search loading state)
3. Verification details on product cards (the see-through warning moment)
4. Daily feed retention loop

## Demo data
Local file at `data/products.json` with 50 real products split into
two style buckets: "chic" (25 products) and "gothic" (25 products). Each
product has: id, brand, title, price_cents, image_urls, product_url, style_tag
("chic" | "gothic"), attributes (neckline, sleeves, hem, opacity), modesty_score,
review_signals, why_picked. The two-style split exists so the demo can show
how the same query produces different results for different style profiles.

## LLM provider
Using OpenAI's API. GPT-4o for heavy reasoning (style summary, query parsing,
standards parsing), GPT-4o-mini for cheap classification (review reading,
annotations). Vision uses GPT-4o.
