# Freshcart — Quick-Commerce Grocery Delivery Platform

A full-stack grocery e-commerce MVP featuring an AI Recipe-to-Cart Assistant, built with React 18, Express.js, PostgreSQL 16, and Redis.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS v4 (plain JavaScript, `.jsx`) |
| Backend | Node.js + Express (ESM, plain JavaScript) |
| Database | PostgreSQL 16 (relational, no MongoDB) |
| Cache/Session | Redis 7 |
| Real-time | Socket.IO |
| Maps | Leaflet + OpenStreetMap |
| PWA | vite-plugin-pwa |
| State | Zustand |
| Validation | Joi (shared schemas) |
| Money Math | Custom integer-paise module (`shared/money.js`) |

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 22+ (for local development)

### Using Docker (Recommended)

```bash
# Clone and start all services
git clone https://github.com/Utkarsh2294/freshcart.git
cd freshcart
cp .env.example .env
docker-compose up -d

# Run migrations and seed
docker-compose exec backend node /app/scripts/migrate.js
docker-compose exec backend node /app/scripts/seed.js
```

The app will be available at:
- Frontend: http://localhost:5173
- API: http://localhost:4000/api

### Local Development

```bash
# Install dependencies
npm install

# Start PostgreSQL and Redis (via Docker)
docker-compose up -d postgres redis

# Run migrations
npm run migrate

# Seed database (45 real products + ~250 synthetic = 300+ total)
npm run seed

# Start dev servers
npm run dev:backend   # http://localhost:4000
npm run dev:frontend  # http://localhost:5173
```

### Test Accounts

| Role | Phone | OTP (mock) |
|------|-------|------------|
| Admin | 9999999999 | 123456 |
| Customer | 9876543210 | 123456 |
| Any new number | 6000000000-9999999999 | 123456 |

> **Note:** OTP is mocked for MVP. Any valid 10-digit Indian mobile number works with OTP `123456`.

## Architecture

```
freshcart/
├── frontend/        # React 18 + Vite + Tailwind CSS
├── backend/         # Express.js API (ESM)
├── shared/          # Joi schemas, money.js, constants, enums
├── scripts/         # Migrations + seed scripts
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## Database Schema

14 tables with proper foreign keys, indexes, and constraints:

- **users** — phone (unique), email, name, role
- **addresses** — lat/lng, label, full_address, is_default
- **categories** — self-referencing hierarchy (parent_id)
- **brands** — name, logo
- **products** — price (NUMERIC), TSVECTOR + pg_trgm for typo-tolerant search
- **reviews** — rating (1-5 CHECK), review_text
- **carts** / **cart_items** — active cart per user, source tracking
- **orders** / **order_items** — full order lifecycle with rider tracking fields
- **dark_stores** — lat/lng, service_radius_km
- **wallet_transactions** — cashback/referral_bonus/refund/redeemed
- **referral_codes** — unique per user, tracks usage count
- **push_subscriptions** — Web Push endpoint + keys

## API Endpoints

### Auth
- `POST /api/auth/otp/request` — Request OTP (rate limited: 5/min)
- `POST /api/auth/otp/verify` — Verify OTP → `{accessToken, refreshToken}`
- `POST /api/auth/refresh` — Refresh access token

### Catalog
- `GET /api/categories` — Category tree
- `GET /api/products?category=&search=&page=&sort=` — Typo-tolerant search (pg_trgm + tsvector)
- `GET /api/products/:id` — Product detail with reviews
- `GET /api/products/:id/also-bought` — Same-category recommendations

### Search
- `GET /api/search/suggest?q=` — 6 ranked suggestions (rate limited: 30/min)

### Cart (auth required)
- `GET /api/cart` — Cart with wallet balance + nearest dark store
- `POST /api/cart/items` — Add item
- `PATCH /api/cart/items/:id` — Update quantity
- `DELETE /api/cart/items/:id` — Remove item

### Orders (auth required)
- `POST /api/orders` — Atomic checkout (stock decrement + wallet apply + store resolution)
- `GET /api/orders` — Order history (paginated)
- `GET /api/orders/:id` — Order detail
- `GET /api/orders/:id/tracking` — Live tracking data

### Wallet & Referral (auth required)
- `GET /api/wallet` — Balance + transaction history
- `GET /api/referral/my-code` — Get/create referral code
- `POST /api/referral/redeem` — Redeem code (₹50 each)

### Push Notifications (auth required)
- `POST /api/notifications/subscribe` — Subscribe to push
- `DELETE /api/notifications/subscribe` — Unsubscribe

### Admin (auth + admin role required)
- `POST/PATCH/DELETE /api/admin/products`
- `GET /api/admin/orders`
- `POST/PATCH/DELETE /api/admin/dark-stores`

## Important Business Rules

### Wallet Cap
> **Wallet balance may cover at most 50% of the order value.** For example, if the order total is ₹500 and the wallet balance is ₹400, only ₹250 (50% of ₹500) will be applied. This is enforced atomically in the checkout transaction.

### Referral System
> Each user gets a unique 8-character alphanumeric referral code. When a **new user** redeems a code, both the referrer and the new user receive **₹50** credited to their wallets. A user can only redeem one referral code (enforced server-side).

### Rider Tracking Simulation
> ⚠️ **The live rider tracking is SIMULATED for this MVP.** The rider's position is computed via linear interpolation from the nearest dark store's coordinates to the delivery address coordinates. A server-side job updates the position every 3 seconds over 100 steps (~5 minutes). This is **not** connected to any real fleet-tracking or logistics API. It is designed purely to demonstrate the real-time tracking UI (Leaflet map + Socket.IO) and should never be presented as real GPS tracking in a production context.

### Money Math
> All monetary calculations use the `shared/money.js` module which operates on **integer paise** (1/100 of a rupee) internally to avoid JavaScript floating-point precision bugs. Prices are stored as `NUMERIC(10,2)` in PostgreSQL.

## Search: Typo Tolerance

The search system combines PostgreSQL's `pg_trgm` extension (trigram similarity) with full-text `tsvector` indexing:

```sql
SELECT *, similarity(name, $1) AS sml, 
       ts_rank(search_vector, plainto_tsquery('english', $1)) AS rank
FROM products
WHERE similarity(name, $1) > 0.2 
   OR search_vector @@ plainto_tsquery('english', $1)
ORDER BY sml DESC, rank DESC
```

This means a search for "bananna" will still return "Banana", and "tomatoe" will return "Tomato".

## Dark Stores

3 dark stores seeded in **Bangalore, India**:

| Store | Latitude | Longitude | Radius |
|-------|----------|-----------|--------|
| Koramangala Hub | 12.9352 | 77.6245 | 5 km |
| Indiranagar Hub | 12.9784 | 77.6408 | 5 km |
| HSR Layout Hub | 12.9121 | 77.6446 | 5 km |

The nearest store is resolved at checkout time using the Haversine formula against the delivery address.

## CI/CD

GitHub Actions runs on every push/PR to `main`:
1. Verifies **zero** `.ts`/`.tsx` files exist
2. Runs PostgreSQL 16 + Redis 7 services
3. Applies migrations + seed
4. `npm run lint` — must pass with 0 errors
5. `npm test` — must pass

## PWA

The app is installable as a Progressive Web App:
- Manifest with app name, theme color, icons (192px + 512px, maskable + any-purpose)
- Service worker precaches the app shell for instant repeat loads
- "Add to Home Screen" prompt appears in Chrome

## License

Private — Freshcart © 2026


# Cook-with-AI — Recipe Generation (Phase 4)

Drop this section into the main project README, wherever the other
Cook-with-AI phases are documented.

## What this phase does

Given a dish name and a serving count, this step returns a structured
recipe (`title`, `steps`, `ingredients`) for Phase 5 to turn into cart
items. It replaces the earlier curated-KB + fine-tuned-LLM approach
entirely — there is no `recipes` table, no FAISS retrieval index, and no
local fine-tuning involved anymore.

## Honesty note: why this step calls a third-party API

Freshcart's AI components are self-hosted and deterministic everywhere
else in this project — ingredient matching, quantity math, and cart
insertion all run on our own infrastructure with no external model calls.
Recipe generation is the **one, deliberate, scoped exception**.

The reason is practical, not philosophical: Kimi K3 (Moonshot AI's
2.8-trillion-parameter model) is the model doing the generation, and at
the time this was written its full open weights had not yet been released
— Moonshot had only committed to a later release date. Even once released,
2.8T parameters is far beyond what a single GPU (or realistically, our
whole self-hosting budget) can serve. Self-hosting an open-weight
alternative small enough to run locally would mean giving up the recipe
quality we're aiming for.

So: recipe generation goes out to Kimi K3 via an OpenAI-compatible
endpoint, and every other AI-adjacent step in Cook-with-AI stays exactly
where it was — in our own infrastructure. This isn't a reversal of the
zero-third-party-API principle for the project; it's one narrow, isolated
exception, contained entirely inside `services/kimiRecipeClient.js`. No
other file in the codebase imports an AI SDK, holds an API key for a
model provider, or constructs a prompt for a third-party model.

If Kimi K3's weights become self-hostable at a size we can realistically
serve, this is the file to revisit.

## Cost control

Kimi K3 is billed per token ($3/M input, $15/M output as of this writing —
**recheck OpenRouter's or Moonshot's console before relying on this**,
pricing on newly-launched models changes fast). Two things keep this
sustainable for a demo-scale app:

1. **Caching.** Every successful generation is stored in `recipe_cache`
   keyed on `(normalized dish_name, servings)`. A repeat request for the
   same dish and serving count never calls the API again — it's a Postgres
   lookup.
2. **Retry cap.** On malformed output, `kimiRecipeClient` retries exactly
   once, then fails gracefully rather than looping.

## Failure behavior

If Kimi returns something that isn't valid JSON, or JSON that doesn't
match the required schema, `kimiRecipeClient` retries once. If the retry
also fails, `POST /ai/cook-this/generate` returns a 422 with a
`"couldn't generate that recipe, try rephrasing"` message — never a crash,
never a silently empty cart. See `contracts/generate-recipe.md` for the
exact response shapes.
