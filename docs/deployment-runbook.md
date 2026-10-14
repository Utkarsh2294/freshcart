# Freshcart deployment runbook

## Required configuration

Copy `.env.example` to `.env` on the deployment host and set strong `POSTGRES_PASSWORD`, `JWT_SECRET`, and `JWT_REFRESH_SECRET` values. Set `CORS_ORIGINS` to the public origin. Cook with AI additionally requires `OPENROUTER_API_KEY`. Generate VAPID keys with `npx web-push generate-vapid-keys`; put the private key only in the host secret environment and use the same public key for `VAPID_PUBLIC_KEY` during the frontend image build.

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

Check `/api/health`, sign in, run one cached and one uncached recipe, and inspect `/api/ai/cook-this/metrics` as an admin. Confirm a browser Push subscription is stored and send a test notification from Settings. Then run all three k6 scripts and save their summaries beside `docs/load-test-report.md`.

## Rollback

Deploy the prior immutable image tag and run `docker compose up -d`. Do not roll back the Postgres volume. Database migrations in this repository are additive; restore from the pre-deploy database backup only if a migration itself caused data damage.
