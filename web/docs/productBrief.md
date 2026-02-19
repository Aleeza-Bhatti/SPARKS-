# Product Brief: Pinterest-Based Product Discovery MVP

## Product Context
We are building an MVP website that helps shoppers discover products based on their personal style which is learned from their pinterst board

The core idea:
- A user connects Pinterest
- We import pins from **one board**
- We use AI embeddings to understand the style
- We show a ranked grid of curated products that match the user’s taste

This MVP is **single-user**, **development-only**, and designed to be completed quickly for demo and validation.

No checkout, no partnerships, no scaling concerns in this version.

---

## Scope of Responsibility
This brief covers the following ownership areas:
- UI for all screens
- Pinterest OAuth authentication
- Pinterest pin import for one board only

Product curation, embeddings, and ranking logic are handled separately.

---

## Phase 1: UI Implementation (All Screens)

### Goal
Create a polished, magical-feeling UI that supports the full flow, even before real data is connected.

### Screens to Build

#### 1. Landing Screen
- Clear value proposition
- Primary CTA: **Connect Pinterest**
- Light visual movement to signal creativity and delight

#### 2. Connect Pinterest Screen
- Loading state while redirecting to Pinterest OAuth
- Friendly copy explaining what will be imported
- Reassurance about privacy and limited access

#### 3. Loading / Import Screen
- Shown while pins are being fetched
- Step-based feedback such as:
  - Connecting to Pinterest
  - Importing pins
  - Building your style
- This screen is key for perceived performance

#### 4. Results Screen
- Pinterest-style product grid
- Product card includes:
  - Image
  - Name
  - Brand
  - Price
  - “Spark” button
- Grid should feel visual-first and scrollable

### UI Vibe and Direction
- Color palette: orange to reddish ombre
- Visual tone: magical, warm, celebratory
- Subtle fireworks-inspired accents
- Soft motion in background shapes
- Gentle transitions on hover and load
- No harsh edges, no corporate look
- The UI should feel like discovery, not shopping

keep everything subtle and tasteful and most importantly easy for the user to use

---

## Phase 2: Pinterest OAuth (Development Only)

### Goal
Authenticate Pinterest using **one personal account** to enable board access during development.

### Requirements
- Use Pinterest OAuth properly
- App runs in development mode
- Only one approved user is needed
- No user account system required beyond Pinterest

### What to Implement
- “Connect Pinterest” button initiates OAuth
- Handle redirect and token exchange
- Store token temporarily in memory or server session
- No long-term token storage required for MVP

### Constraints
- No multi-user support
- No refresh token logic needed
- No production approval required at this stage

---

## Phase 3: Pinterest Pin Import (One Board Only)

### Goal
Import pins from a single Pinterest board and cache them for reuse.

### What to Import Per Pin
- Pin ID
- Title
- Description
- Image URL
- Board ID

### Flow
- After OAuth, automatically select one predefined board
- Fetch pins from that board only
- Limit import to a reasonable number, for example 50 to 200 pins
- Save imported pins to a local data store or JSON file

### Storage
Pins should be saved so that:
- We do not re-fetch on every page load
- The AI style embedding can be generated from this data

### Constraints
- No board picker UI needed for V1
- No multiple board support
- No real-time sync required

---

## Non-Goals for This Role
Do not implement:
- Product curation
- Product embeddings
- Ranking logic
- User accounts
- Filters
- Checkout
- Analytics dashboards

Those are handled elsewhere or in later versions.

---

## Definition of Done
This role is complete when:
- All four UI screens exist and are wired together
- Pinterest OAuth works for the dev account
- Pins from one board are successfully imported and stored
- The Results screen can render with placeholder or real product data
- The experience feels magical, smooth, and demo-ready
