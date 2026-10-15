# Freshcart deployment runbook

## Render deployment

1. Create a new Render Blueprint from this GitHub repository. Render reads `render.yaml` and creates the public Freshcart service, both internal AI services, and PostgreSQL.
2. In the Blueprint environment prompt, set `GROQ_API_KEY`. Never add this key to Git.
3. Apply the Blueprint and wait for `/api/health` to report `{"status":"ok"}`.

The public service serves the built React PWA and API from one origin. On startup it applies additive migrations and seeds the catalog only when the products table is empty. Customer sessions are created automatically; `/admin` remains role-protected.

## Required configuration

Copy `.env.example` to `.env` on the deployment host and set strong `POSTGRES_PASSWORD`, `JWT_SECRET`, and `JWT_REFRESH_SECRET` values. Set `CORS_ORIGINS` to the public origin. Cook with AI additionally requires `GROQ_API_KEY`. Generate VAPID keys with `npx web-push generate-vapid-keys`; put the private key only in the host secret environment and use the same public key for `VAPID_PUBLIC_KEY` during the frontend image build.

## First deployment

```sh
docker compose -f docker-compose.prod.yml config --quiet
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec backend node scripts/seed.js
docker compose -f docker-compose.prod.yml ps
```

The API container applies migrations on every start; migrations are idempotent. Seeding is an explicit first-deploy operation. Nginx serves the built PWA, proxies `/api` and Socket.IO, caches hashed assets for one year, and forces `sw.js` and `index.html` to revalidate so releases do not retain a stale shell.

## Verification

Check `/api/health`, open the storefront without signing in, run one cached and one uncached recipe, add its ingredients to the cart, and place a test order. Inspect `/api/ai/cook-this/metrics` with an admin token. Confirm a browser Push subscription is stored and send a test notification from Settings. Then run all three k6 scripts and save their summaries beside `docs/load-test-report.md`.

## Rollback

Deploy the prior immutable image tag and run `docker compose up -d`. Do not roll back the Postgres volume. Database migrations in this repository are additive; restore from the pre-deploy database backup only if a migration itself caused data damage.
