# Freshcart deployment runbook

## Render deployment

### Free preview: one web service and one database

1. Sign in at <https://dashboard.render.com/> with GitHub and authorize this repository.
2. Choose **New → Postgres**. Name it `freshcart-db`, set database/user to `freshcart`, choose **Singapore** and **Free**. Copy its **Internal Database URL** when available.
3. Choose **New → Web Service**, connect `Utkarsh2294/freshcart`, and select branch `main`.
4. Choose **Docker**, **Singapore**, **Free**, leave Root Directory blank, use Dockerfile Path `backend/Dockerfile` and Docker Build Context `.`. Leave Docker Command blank so the image's startup command runs.
5. Add these environment variables:

| Variable             | Value                                                          |
| -------------------- | -------------------------------------------------------------- |
| `NODE_ENV`           | `production`                                                   |
| `DATABASE_URL`       | The database's Internal Database URL                           |
| `JWT_SECRET`         | A private random secret, different from the refresh secret     |
| `JWT_REFRESH_SECRET` | A second private random secret                                 |
| `CORS_ORIGINS`       | Your assigned public HTTPS origin, or `*` during initial setup |
| `GROQ_API_KEY`       | A current private Groq key                                     |
| `GROQ_MODEL`         | `openai/gpt-oss-120b`                                          |
| `GROQ_BASE_URL`      | `https://api.groq.com/openai/v1`                               |
| `GROQ_TIMEOUT_MS`    | `12000`                                                        |

6. Set Health Check Path to `/api/health`, enable auto deploy, and create the service. Render supplies `PORT`.
7. Wait for migrations, the initial catalog seed, and the server to complete. Open the assigned HTTPS URL; `/api/health` must return `{"status":"ok"}`.
8. Verify an anonymous cart, checkout with a real address, orders, and Cook with AI. Generate a recipe, add its matched products, and check the cart total. `/admin` must redirect a customer away, and unauthenticated `/api/admin/products` must return 401.

The two Python helpers are optional for this preview: the Node API has browsing/intent/recommendation fallbacks, and Groq recipe generation remains in the API. For the complete multi-service setup, use the Blueprint below.

Free web services sleep after 15 minutes without traffic and share 750 instance hours per workspace each month. Free Postgres expires after 30 days, has a 1 GB limit, and has no managed backups. These are preview resources, not permanent production infrastructure. See [Render's free-instance limits](https://render.com/docs/free).

### Full multi-service Blueprint

1. Create a new Render Blueprint from this GitHub repository. Render reads `render.yaml` and creates the public Freshcart service, both AI helper web services, and PostgreSQL.
2. In the Blueprint environment prompt, set `GROQ_API_KEY`. Never add this key to Git.
3. Apply the Blueprint and wait for `/api/health` to report `{"status":"ok"}`.

The public service serves the built React PWA and API from one origin. On startup it applies additive migrations and seeds the catalog only when the products table is empty. Customer sessions are created automatically; `/admin` remains role-protected.

The free helper services use their public HTTPS URLs through `RENDER_EXTERNAL_URL`, because [free web services cannot receive private-network traffic](https://render.com/docs/private-network). The application falls back when a helper is cold or unavailable. All three web services consume the same workspace free-hour allowance; upgrade the compute plans for sustained production traffic. Do not enable unauthenticated public helpers for sensitive workloads without adding service authentication.

JWT secrets can be generated in Windows PowerShell 5 or newer:

```powershell
1..2 | ForEach-Object {
  $bytes = New-Object byte[] 48
  $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
  $rng.GetBytes($bytes)
  [Convert]::ToBase64String($bytes)
  $rng.Dispose()
}
```

Use the first output for `JWT_SECRET` and the second for `JWT_REFRESH_SECRET`. Save them only in Render. The Blueprint generates these values automatically.

## Required configuration

For Compose, copy `.env.example` to `.env` on the deployment host and set strong `POSTGRES_PASSWORD`, `JWT_SECRET`, and `JWT_REFRESH_SECRET` values. Set `CORS_ORIGINS` to the public origin. Cook with AI additionally requires `GROQ_API_KEY`.

Push notifications are optional and require HTTPS. Generate VAPID keys with `npx web-push generate-vapid-keys`. On Render, set `VAPID_PUBLIC_KEY` and `VITE_VAPID_PUBLIC_KEY` to the same public key, set `VAPID_PRIVATE_KEY` only in the server environment, and set `VAPID_SUBJECT` to a valid `mailto:` address. Save, rebuild, and deploy: the public key must be compiled into the PWA. Render [passes environment values to Docker build arguments](https://render.com/docs/docker); only the public key is declared as a build argument. Compose maps `VAPID_PUBLIC_KEY` to both frontend builds automatically. Never prefix a private key or Groq key with `VITE_`.

## First deployment

```sh
docker compose -f docker-compose.prod.yml config --quiet
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec backend node scripts/seed.js
docker compose -f docker-compose.prod.yml ps
```

The API container applies migrations on every start; migrations are idempotent. It seeds only an empty product catalog. The additional explicit seed command is for intentional catalog refreshes and is unnecessary for normal startup. The Compose frontend uses Nginx; the API container also serves the built PWA for Render. Both revalidate the service worker and HTML while caching hashed assets for one year.

## Verification

Check `/api/health`, open the storefront without signing in, run one cached and one uncached recipe, add its ingredients to the cart, and place a test order. Inspect `/api/ai/cook-this/metrics` with an admin token. Confirm a browser Push subscription is stored and send a test notification from Settings. Then run all three k6 scripts and save their summaries beside `docs/load-test-report.md`.

## Rollback

Deploy the prior immutable image tag and run `docker compose up -d`. Do not roll back the Postgres volume. Database migrations in this repository are additive; restore from the pre-deploy database backup only if a migration itself caused data damage.
