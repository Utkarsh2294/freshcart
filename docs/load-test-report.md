# Load-test report

## Test matrix

The repository contains reproducible k6 scenarios for the blueprint targets:

- `core-commerce.js`: 50 concurrent catalog, search, and authenticated-cart users.
- `cook-with-ai.js`: 10 concurrent Cook-with-AI users with separate Groq and matching latency trends.
- `tracking-socket.js`: 20 concurrent Socket.IO tracking transports held open for ten seconds per iteration.

Run these against a production-like deployment, not a developer laptop:

```sh
k6 run -e BASE_URL=https://your-host/api load-tests/core-commerce.js
k6 run -e BASE_URL=https://your-host/api load-tests/cook-with-ai.js
k6 run -e SOCKET_URL=wss://your-host/socket.io/?EIO=4\&transport=websocket load-tests/tracking-socket.js
```

## Current verification result

The phase implementation was verified locally with the full Vitest suite, catalog parity checks, production PWA build, Compose validation, and database-backed integration tests. k6 is not installed in the development environment and no Groq production key was supplied, so no fabricated p50/p95 numbers are recorded here.

The expected slowest uncached stage is the Groq network call. The mitigation is cache-first recipe lookup, a 12-second request timeout, one retry, a three-failure circuit breaker, request rate limiting, and explicit latency/token/cost counters. Matching and pack selection remain local and deterministic. Replace this section with exported k6 summaries after the first staging run; the thresholds in each script are the release gates.
