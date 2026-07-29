<div align="center">

# 🛒 Freshcart

### Quick-Commerce, Reimagined Around a Single Idea: 

A production-shaped quick-commerce platform built around a live grocery catalog, featuring a pixel-perfect design system, a real-time commerce core, an AI-powered Recipe-to-Cart engine that transforms any dish idea into a fully priced, editable, and brand-swappable shopping cart, and a dual-layer recommendation system that combines trust-scored product intelligence with time-aware behavioral personalization to recommend not only what shoppers are likely to buy, but also when they're most likely to need it.

![Status](https://img.shields.io/badge/status-in--development-blueviolet)
![Frontend](https://img.shields.io/badge/frontend-React%2018%20%2B%20Vite-61DAFB)
![Backend](https://img.shields.io/badge/backend-Node.js%20%2B%20Express-339933)
![Database](https://img.shields.io/badge/database-PostgreSQL%2016-336791)


</div>

---

## Table of Contents

1. [Overview](#overview)
2. [Why Freshcart Is Different](#why-freshcart-is-different)
3. [Feature Set](#feature-set)
4. [The Cook-with-AI Pipeline](#the-cook-with-ai-pipeline)
5. [Quantity-Aware Pack Selection Engine](#quantity-aware-pack-selection-engine)
6. [Pramarsha — Behavioral Personalization Layer](#pramarsha--behavioral-personalization-layer)
7. [Advanced Feature Modules](#advanced-feature-modules)
8. [System Architecture](#system-architecture)
9. [Tech Stack](#tech-stack)
10. [Database Schema](#database-schema)
11. [Design System](#design-system)
12. [Screens & User Journeys](#screens--user-journeys)
13. [Getting Started](#getting-started)
14. [Project Structure](#project-structure)

---

## Overview

**Freshcart** is a full-stack quick-commerce grocery platform — think doorstep delivery, dark-store fulfillment, live rider tracking, wallet and referral economics — built end-to-end on a single, own-brand product catalog. On top of that commerce core sits Freshcart's signature capability: an intelligence layer that converts a *typed or spoken dish idea* into a shoppable, correctly-quantified, in-stock grocery cart in seconds.

Every pixel in this build ships against a **locked design system** (light and true dark mode, both pixel-accurate to a finished reference implementation), every screen is installable as a **Progressive Web App** from day one, and every service boundary — frontend↔API, API↔intelligence services — is documented as an explicit, versioned contract so the system stays auditable as it grows.

This isn't a themed clone. It's a layered platform: a relational commerce core, a trust-scoring recommendation system, a natural-language understanding layer, a semantic product-grounding engine, a genuinely novel deterministic quantity-resolution algorithm, and a behavioral personalization surface — all sitting under one coherent, production-grade UI.

---

## Why Freshcart Is Different

| Typical grocery clone | Freshcart |
|---|---|
| Static "recipe" pages copy-pasted from a content database | A live, on-demand recipe engine that generates fresh, servings-adjusted recipes on request |
| Recipes that link out to ingredients you have to find yourself | Every ingredient is auto-resolved against **your actual, in-stock catalog** — no dead links, no "buy elsewhere" |
| "Add to cart" ignores pack sizes entirely | A dedicated **quantity-resolution algorithm** decides exact packs, multi-pack combinations, or the closest oversized option — and tells you why |
| One generic "recommended for you" rail | **Two independent, visually distinct personalization surfaces** — a trust-scored recommendation engine *and* a temporal-behavior engine that learns *when*, not just *what*, you shop |
| Design system invented ad hoc per screen | A **locked token system** — one source of truth for every color, radius, spacing, and motion value, enforced with zero hardcoded styling anywhere in the codebase |
| Voice search bolted on as a gimmick | Native, zero-latency, zero-cost browser-level voice recognition wired into both global search and the cook flow |

---

## Feature Set

### 🏬 Storefront & Commerce Core
- Typo-tolerant, predictive product search (trigram similarity + purchase-history weighting)
- Full category, brand, and dietary-tag filtering
- Persistent, always-visible cart panel with live price breakdown
- Multi-address management with automatic nearest-dark-store resolution (haversine distance)
- Checkout with test-mode card/UPI payment, wallet balance application (capped and documented), and mock buy-now-pay-later
- Order history with a live status timeline **and** a real-time moving-rider map
- Wallet ledger, referral program with dual-sided crediting
- Role-protected admin console for inventory, dark-store, and order management
- Installable **Progressive Web App** from the very first release — manifest, icons, offline shell, push-ready

### 👨‍🍳 Cook with AI — Recipe to Cart
The flagship feature. A user types (or speaks) a dish name, optionally selects a serving size, and receives:
1. A complete, structured recipe — title, method, and ingredient list, scaled to the requested servings
2. Every ingredient **automatically matched** against real, in-stock products at their resolved dark store
3. Every match **quantity-resolved** to the correct pack size or combination of packs
4. A fully editable, checkbox-driven checklist — uncheck anything, adjust quantities, and the running total updates instantly with zero extra latency
5. One tap to add everything checked straight into the cart, tagged so it's traceable back to its recipe

See [The Cook-with-AI Pipeline](#the-cook-with-ai-pipeline) for the full technical walkthrough.

### 🎙️ Voice Search
Native, browser-level speech recognition wired directly into the topbar search field and reused across the app for hands-free quick-add. Zero server round-trip, zero added latency, gracefully disabled with a clear tooltip on unsupported browsers rather than failing silently.

### 🔁 Smart Brand Swap
Every cart line item — however it got there — can be swapped for a ranked alternative in the same category, shown in a bottom-sheet with rating, price delta, and stock status, applied as an optimistic update with automatic rollback on failure.

### 🎯 Quantity-Aware Pack Selection
A deterministic, fully unit-tested algorithm that decides — for every ingredient — exactly which real-world pack size(s) satisfy the needed quantity, and clearly labels *why* it picked what it picked. Full detail below.

### 🧠 Trust-Scored Recommendations
Every product carries a computed trust score blending its rating, its review sentiment, and its recent sales velocity — the backbone for "best in category," the swap feature's suggestions, and the personalization surfaces.

### 📈 Pramarsha — Temporal Behavior Personalization
A dedicated, visually distinct Home surface that learns *when* a shopper tends to need what — a second, independent personalization layer riding alongside (never replacing) the standard recommendation rail.

### 🧩 Ten Advanced Commerce Modules
Pantry-aware shopping, hands-free cooking mode, weekly meal planning, nutrition and cost breakdowns, dietary filtering, social proof and gamification, hands-free quick-add, push notifications, predictive reorder, and a full referral/cashback economy. Each ships as an independently feature-flagged module — see [Advanced Feature Modules](#advanced-feature-modules).

---

## The Cook-with-AI Pipeline

```
  Dish idea (typed or spoken)
        │
        ▼
  ┌─────────────────────────┐
  │  Intent Understanding    │   Extracts the dish name and, if mentioned,
  │  & Servings Extraction   │   the number of servings from free-form text —
  └───────────┬──────────────┘   English or Hinglish, typed or transcribed.
              │
              ▼
  ┌─────────────────────────┐
  │  Recipe Generation       │   Produces a complete, structured recipe —
  │  Engine                  │   title, method, ingredient list — scaled
  └───────────┬──────────────┘   precisely to the requested serving size.
              │
              ▼
  ┌─────────────────────────┐
  │  Ingredient Grounding    │   Matches every generated ingredient against
  │  Engine                  │   the live catalog using layered exact,
  └───────────┬──────────────┘   fuzzy, and semantic-similarity matching,
              │                  scoped to the shopper's resolved dark store.
              ▼
  ┌─────────────────────────┐
  │  Quantity Resolution     │   Deterministically decides the exact pack(s)
  │  Engine                  │   needed to satisfy the quantity — see below.
  └───────────┬──────────────┘
              │
              ▼
  ┌─────────────────────────┐
  │  Editable Checklist      │   Checkbox-per-ingredient result screen with
  │  → Cart                  │   match-confidence badges, live price totals,
  └─────────────────────────┘   and a single tap to populate the cart.
```

**Resilience by design.** If the recipe-generation step is ever slow or unavailable, the request degrades gracefully to a clear "couldn't generate that recipe, try rephrasing" state — browsing, search, and checkout are entirely unaffected, and a failed request is automatically retried once before surfacing that state to the shopper. Every successful generation is cached against its exact dish name and serving count, so a repeated request never has to regenerate from scratch — keeping the experience fast and consistent on every subsequent ask.

**Nothing about ingredient grounding, quantity math, or cart insertion is generative** — those steps are deterministic, auditable, fully unit-tested logic that runs identically every time, against your real, current stock.

---

## Quantity-Aware Pack Selection Engine

Turning "200g of paneer" into an actual product line is harder than it looks — packs come in fixed sizes, and naively adding "the closest product" produces silently wrong quantities. Freshcart's pack-selection engine resolves this with four explicit, exhaustively tested branches:

| Branch | Behavior | Example |
|---|---|---|
| **Exact Match** | A single pack size at or reasonably close to the needed quantity exists — the smallest such pack is chosen | Need 500g rice → a 500g pack exists → done |
| **Closest Match (multi-pack)** | No single pack covers the quantity, but a whole number of the same pack does, within a sensible margin | Need 500g paneer, only 200g packs exist → 3 packs ≈ 600g, clearly labeled |
| **Oversized-Only** | The only available pack is meaningfully larger than needed | Need 50g of a spice, only a 5kg bag exists → surfaced with an explicit "more than you need" note |
| **Unavailable** | Nothing in the catalog satisfies the ingredient at all | Excluded from auto-cart, flagged for manual search |

Every resolution carries a human-readable explanation and a visible confidence badge (exact/closest shown in green, oversized in amber) — nothing is silently approximated, and nothing is ever added to a cart without the shopper being able to see exactly why.

---

## Pramarsha — Behavioral Personalization Layer

Alongside the standard, trust-score-driven recommendation rail, Freshcart surfaces a second, independent personalization system on the Home screen: a **temporal behavior engine** that mines historical ordering patterns to recognize *when* a shopper tends to need particular staples — a Sunday breakfast run, an end-of-week restock, a recurring Tuesday habit — and surfaces those items proactively, right when they're statistically most relevant.

This surface is intentionally, visually distinct from every other recommendation on the page (its own reserved gradient treatment, its own eyebrow label, its own "why am I seeing this" framing) so shoppers can tell at a glance that it's behavior-driven, not simply "trending" or "top rated." When there's no meaningful pattern for a given shopper or moment, the surface disappears entirely rather than showing a stale or generic placeholder — precision over persistence.

---

## Advanced Feature Modules

Each module below ships independently behind its own feature flag — any can be enabled, disabled, or shipped on its own timeline without affecting the others.

| # | Module | What it does |
|---|---|---|
| 1 | **Smart Pantry** | Tracks what a shopper already has and skips those items during auto-cart, with a clear "already in your pantry" note |
| 2 | **Hands-Free Cooking Mode** | Full-screen, swipe-through step view with large text, screen-wake-lock, and optional read-aloud guidance |
| 3 | **Weekly Meal Planner** | Generates a full week of varied, non-repeating dishes on request and consolidates every ingredient across the week into a single, deduplicated cart |
| 4 | **Nutrition & Cost Card** | Per-recipe calorie, protein, and total cost breakdown scaled to servings |
| 5 | **Dietary & Allergy Filters** | Vegetarian/non-vegetarian and dietary-tag filtering applied across recipe generation and swap suggestions alike |
| 6 | **Social Proof & Gamification** | "X people nearby ordered this today" signals and streak badges for repeat AI-cooked recipes |
| 7 | **Hands-Free Quick-Add** | Direct spoken commands ("add two litres of milk and a loaf of bread") parsed and matched instantly, with a confirmation step before anything hits the cart |
| 8 | **Push Notifications & PWA Enhancements** | Real push delivery for order status, back-in-stock, and price-drop alerts, plus a full notification-preferences center |
| 9 | **Predictive Reorder Feed** | A "you might need these" rail driven by purchase cadence — distinct from, and coexisting alongside, the Pramarsha surface |
| 10 | **Referral & Cashback Wallet** | Full native-share referral flow, dual-sided crediting, wallet transaction history, and admin goodwill credits |

---

## System Architecture

```
                         ┌───────────────────────────┐
                         │   React PWA (Storefront)   │
                         │   + Admin Console          │
                         └──────────────┬─────────────┘
                                        │  REST + WebSocket
                                        ▼
                         ┌───────────────────────────┐
                         │   Node.js / Express API     │
                         │   (validation, orders,      │
                         │    wallet, auth, tracking)  │
                         └──────────────┬─────────────┘
                                        │
                     ┌──────────────────┼──────────────────┐
                     ▼                  ▼                  ▼
        ┌────────────────────┐ ┌────────────────┐ ┌────────────────────┐
        │  Intelligence       │ │  PostgreSQL 16   │ │  Redis (cache +    │
        │  Orchestrator       │ │  (system of      │ │  queues) + MinIO   │
        │  → intent parsing    │ │   record)        │ │  (object storage)  │
        │  → recipe generation │ └────────────────┘ └────────────────────┘
        │  → ingredient        │
        │    grounding         │
        │  → recommendation &  │
        │    trust scoring     │
        └──────────┬──────────┘
                    │
                    ▼
        ┌────────────────────────────┐
        │  Pramarsha (external,       │
        │  independently owned)       │
        │  — consumed, never modified │
        └────────────────────────────┘
```

**Design principles carried through every layer:**
- The API layer never talks to an intelligence service directly — every call routes through a single internal orchestrator, so any individual service can degrade or go offline without taking down browsing or checkout.
- Every service boundary is documented as an explicit, versioned contract, kept in a dedicated `/contracts` folder and treated as load-bearing documentation, not an afterthought.
- The Pramarsha personalization engine is treated as an external system with its own data and its own logic — Freshcart consumes its output through one clean endpoint and never reaches into its internals.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS (built directly against the locked design-token file), Zustand / Redux Toolkit, PropTypes |
| **Backend API** | Node.js, Express (ESM), Socket.IO for live tracking and notifications |
| **Primary Database** | PostgreSQL 16 with trigram search indexing |
| **Cache & Queues** | Redis, background job queues for scoring, caching, and notification delivery |
| **Object Storage** | MinIO (S3-compatible, self-hosted) |
| **Intelligence Services** | A dedicated microservice layer handling intent understanding, ingredient grounding, recipe generation, and trust-based recommendation scoring |
| **Voice Input** | Native browser speech recognition — no server round-trip |
| **Maps & Live Tracking** | Self-hosted map tiles with real-time rider position interpolation |
| **Auth** | JWT with refresh tokens, OTP-based login |
| **Payments** | Test-mode card/UPI processing, internal wallet ledger, mock buy-now-pay-later |
| **PWA & Push** | Installable manifest and service worker from the first release, standards-based web push |
| **DevOps** | Docker Compose for local development, containerized production deployment, CI with mandatory lint and test gates |
| **Observability** | Centralized metrics dashboards tracking per-service latency, cache hit rates, and notification delivery success |

> The entire application layer — frontend and backend alike — is written in plain, un-transpiled JavaScript. Because there's no compiler to catch shape mismatches, every API boundary is validated at runtime, and money is never handled as a raw floating-point value anywhere in the codebase.

---

## Database Schema

The relational core is deliberately compact — every table earns its place, and nothing is duplicated between the commerce layer and the intelligence layer.

| Table | Purpose |
|---|---|
| `users`, `addresses` | Identity, OTP-based auth, delivery addresses with dark-store resolution |
| `categories`, `brands`, `products` | Full catalog, including normalized pack-size data used by the quantity resolution engine |
| `reviews`, `product_scores` | Raw ratings and text reviews, plus a precomputed nightly trust score per product |
| `carts`, `cart_items` | Live cart state, tagged by origin (manually added vs. recipe-generated) |
| `orders`, `order_items` | Order headers, line items, status history, delivery ETA |
| `recipe_cache` | Every successfully generated recipe, keyed by dish name and serving count, so repeats never regenerate |
| `ingredient_product_map` | Every resolved ingredient-to-product match, scoped per dark store, carrying its match type and explanation |
| `ai_interaction_logs` | A full audit trail of every cook-with-AI request, for both debugging and future model improvement |
| `dark_stores` | Fulfillment center locations and service radii |
| `wallet_transactions`, `referral_codes` | Wallet ledger and referral program bookkeeping |
| `push_subscriptions` | Registered devices for push notification delivery |
| `user_pantry` | Smart Pantry module state |

---

## Design System

Freshcart ships against a **locked, pixel-accurate design system** — every color, spacing value, radius, and motion timing lives in a single design-tokens source of truth, imported everywhere and hand-typed nowhere.

**Color language**
- Light mode built on layered whites for depth without heavy borders
- True near-black dark mode — not an inverted light theme — with a distinctly elevated card surface
- A dedicated primary and accent gradient reserved for calls-to-action
- A separate, exclusively-reserved gradient treatment for the Pramarsha personalization surface, never reused elsewhere in the product
- A full semantic palette for success, warning, error, and informational states

**Typography & layout**
- A clean, modern type stack with a disciplined six-step scale from caption to hero, Medium/SemiBold weights only
- Consistent 2px rounded-stroke iconography throughout
- Generous, deliberate whitespace with a defined desktop max-width and consistent section rhythm

**Motion**
- 200–300ms transitions across every interactive surface
- A signature add-to-cart micro-interaction where the product thumbnail visibly arcs into the cart icon
- Skeleton loading states for every asynchronous surface, and optimistic updates for cart and swap actions so the interface never feels like it's waiting on the network

**Dark mode is treated as a first-class theme, not an inversion** — badges, discount tags, and gradient buttons keep their exact light-mode colors in dark mode, which is what keeps the dark theme feeling premium rather than washed out.

---

## Screens & User Journeys

- **Home** — search, category browsing, hero banner, the Pramarsha personalization surface, best-deals rail, persistent cart panel
- **Search & Category Browse** — filterable grid with skeleton loading and typo-tolerant suggestions
- **Product Detail** — stock indicators and the signature add-to-cart micro-interaction
- **Cook with AI Modal** — dish entry (typed or voice), serving-size selection, generation state, and the editable ingredient checklist result screen
- **Swap Bottom Sheet** — ranked alternatives with rating and price-delta comparison
- **Order Tracking** — status timeline paired with a live, moving delivery map
- **Wallet & Payments** — balance, transaction history, and referral sharing
- **Notification Preferences** — granular control over push notification categories
- **Admin Console** — inventory, dark-store, and order management

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/your-org/freshcart.git
cd freshcart

# Install dependencies across the monorepo
npm install

# Copy environment templates and fill in local values
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Bring up the full stack — database, cache, object storage, API, and frontend
docker-compose up

# Seed the catalog and dark stores
npm run seed --workspace=backend
```

The storefront will be available locally with hot reload on both the frontend and backend, the admin console reachable at its dedicated route, and the app installable as a PWA directly from the browser's install prompt.

---

## Project Structure

```
freshcart/
│
├── frontend/                        # React 18 + Vite storefront & admin console
│   ├── public/                      # Static assets — favicon, PWA icons, sprite sheet
│   │   └── icons/
│   ├── src/
│   │   ├── assets/                  # Build-processed images (hero, SVGs)
│   │   ├── components/
│   │   │   ├── common/              # Design-system component library (ProductCard, SearchBar,
│   │   │   │                        #   SwapSheet, CartDrawer, PramarshaBanner, Toast, …)
│   │   │   └── layout/              # AppShell, Header, Footer, Sidebar, MobileNav
│   │   ├── design-tokens/           # Locked token modules — colors, typography,
│   │   │                            #   spacing, radii, elevation, tokens.json
│   │   ├── hooks/                   # Custom hooks — useAuth, useCart, useSearch,
│   │   │                            #   useSocket, usePWA, …
│   │   ├── pages/
│   │   │   ├── admin/               # Dashboard, ProductManagement, OrderManagement,
│   │   │   │                        #   DarkStoreManagement, WalletCredit
│   │   │   ├── Home.jsx
│   │   │   ├── Auth.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── CookThis.jsx
│   │   │   ├── RecipeResult.jsx
│   │   │   ├── SearchCategory.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── OrderHistory.jsx
│   │   │   ├── OrderTracking.jsx
│   │   │   ├── WalletPayments.jsx
│   │   │   └── NotificationPreferences.jsx
│   │   ├── router/                  # Route definitions, ProtectedRoute, AdminRoute
│   │   ├── services/                # API client layer — auth, cart, cook, home,
│   │   │                            #   order, product, search, wallet, socket, …
│   │   ├── store/                   # Zustand stores — auth, cart, order, product,
│   │   │                            #   wallet, ui
│   │   ├── styles/                  # Global CSS — variables, animations, global, tailwind
│   │   ├── utils/                   # Constants, feature flags, formatters, validators,
│   │   │                            #   product image map
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── Dockerfile
│   └── package.json
│
├── backend/                         # Node.js / Express API (ESM)
│   ├── src/
│   │   ├── config/                  # DB, Redis, feature-flag configuration
│   │   ├── controllers/             # Route handlers — auth, cart, cookThis, home,
│   │   │                            #   order, product, search, admin, referral, …
│   │   ├── data/                    # Static data files (festival calendar, etc.)
│   │   ├── db/                      # Connection pool & migration runner
│   │   ├── jobs/                    # Background workers (rider simulator)
│   │   ├── middleware/              # Auth, admin guard, validation, rate limiter,
│   │   │                            #   error handler
│   │   ├── routes/                  # Express route modules — auth, cart, cookThis,
│   │   │                            #   home, order, product, search, tracking,
│   │   │                            #   admin, referral, review, wallet, notification, …
│   │   ├── services/                # Intelligence orchestrator clients — recipe,
│   │   │                            #   ingredient matcher, recommendation, quick-add parser
│   │   ├── app.js                   # Express app factory
│   │   └── server.js                # Server entry point + Socket.IO bootstrap
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── vitest-setup.js
│   ├── vitest.config.js
│   ├── eslint.config.js
│   ├── nodemon.json
│   ├── Dockerfile
│   └── package.json
│
├── ai-services/                     # Intelligence microservice layer (Python / FastAPI)
│   ├── orchestrator/                # Central gateway routing to downstream services
│   ├── input-understanding-service/ # Intent parsing — dish name & servings extraction
│   │   ├── models/
│   │   └── training/
│   ├── recipe-engine-service/       # Structured recipe generation
│   │   ├── models/
│   │   ├── training/
│   │   └── data/
│   ├── matcher-service/             # Ingredient ↔ catalog grounding
│   │   └── models/
│   ├── recommendation-service/      # Trust-scored recommendations & affinity
│   │   ├── models/
│   │   └── training/
│   └── tts-service/                 # Text-to-speech for hands-free cooking mode
│
├── shared/                          # Cross-cutting code shared by frontend & backend
│   ├── schemas/                     # Joi validation schemas — auth, cart, order,
│   │                                #   product, recipe, address, wallet, …
│   ├── enums/                       # Order status, payment method, wallet tx type
│   ├── i18n/                        # Culinary dictionary, recipe step renderer
│   ├── __tests__/                   # Shared package tests (money utilities, etc.)
│   ├── constants.js
│   ├── money.js                     # Safe currency math (no floating-point)
│   ├── index.js
│   ├── vitest.config.js
│   └── package.json
│
├── contracts/                       # Versioned service-boundary contracts
│   ├── generate-recipe.md
│   ├── understand-input.md
│   ├── match-ingredients.md
│   ├── score-review.md
│   ├── best-in-category.md
│   └── user-affinity.md
│
├── design/                          # Canonical design-tokens source of truth
│   └── design-tokens.json
│
├── scripts/                         # Seeding, migration, and maintenance tooling
│   ├── migrations/                  # Numbered SQL migration files (001 → 015)
│   ├── jobs/                        # Scheduled tasks (cadence & streak computation)
│   ├── seed.js                      # Full catalog + dark-store seeder
│   ├── migrate.js                   # Migration runner
│   ├── generateSyntheticProducts.js
│   ├── generateSyntheticReviews.js
│   ├── checkCatalogParity.js
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── ci.yml                   # CI pipeline — lint & test gates
│
├── docker-compose.yml               # Local dev stack (DB, Redis, MinIO, API, frontend)
├── docker-compose.prod.yml          # Production deployment compose
├── .env.example                     # Environment variable template
├── .dockerignore
├── .gitignore
└── package.json                     # Monorepo root — workspaces config
```

The storefront will be available locally with hot reload on both the frontend and backend, the admin console reachable at its dedicated route, and the app installable as a PWA directly from the browser's install prompt.

---


---

## Demo Login Credentials

Login credentials (all accounts use the same password):

**Password:** `password123`

- `admin@freshcart.local`
- `customer@freshcart.local`
- `aditi.rao@freshcart.local`
- `rohan.mehta@freshcart.local`
- `priya.nair@freshcart.local`
- `kabir.sheikh@freshcart.local`
- `meera.iyer@freshcart.local`
