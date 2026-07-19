# Manual Test Log — `POST /ai/cook-this/generate`

> **Not yet run.** This sandbox has no route to `openrouter.ai` /
> `api.moonshot.ai` and no `KIMI_API_KEY`, so I can't produce real numbers
> here without fabricating them. Run `scripts/manual-test-kimi.js` with a
> real key and paste its output table below — that's the actual DoD
> evidence, not this template.

## 1. Fifteen dish/servings requests — sensible output

Run:
```
KIMI_API_KEY=sk-... node scripts/manual-test-kimi.js
```

Paste the resulting table here:

```
| Dish | Servings | Time (ms) | Status | Title | # Steps | # Ingredients |
|------|----------|-----------|--------|-------|---------|----------------|
| ...  | ...      | ...       | ...    | ...   | ...     | ...            |
```

Spot-check at least 2–3 rows manually: do the ingredient quantities
actually scale sensibly with `servings` (e.g. doubling servings roughly
doubles quantities), and do the steps reference the ingredients listed?

## 2. Cache hit avoids a second Kimi call

Through the real HTTP endpoint (not the harness above, which bypasses the
DB cache):

1. `POST /ai/cook-this/generate` with `{"dish_name": "paneer butter masala", "servings": 4}`.
   Record wall-clock time and confirm `"source": "kimi_api"`.
2. Repeat the exact same request immediately.
   Record wall-clock time and confirm `"source": "cache"`.
3. Expected: request 2 is dramatically faster (DB lookup vs. LLM round
   trip — should be low tens of ms vs. multiple seconds) and there's no
   corresponding new outbound call in your Kimi provider's dashboard/logs
   between requests 1 and 2.

| Request | Time (ms) | `source` | Notes |
|---------|-----------|----------|-------|
| 1st call | | kimi_api | |
| 2nd call (same dish+servings) | | cache | |

## 3. Malformed/failed response → graceful failure, not a crash

Force a failure to verify the retry-then-fail path, e.g. temporarily point
`KIMI_BASE_URL`/`KIMI_MODEL` at something that returns non-JSON, or stub
`callKimi` to throw. Confirm:

- [ ] The server does not crash or hang.
- [ ] The endpoint returns HTTP 422 with
      `{"success": false, "error": "recipe_generation_failed", "message": "Couldn't generate that recipe — try rephrasing the dish name."}`
- [ ] No row is written to `recipe_cache` for the failed attempt.
- [ ] Logs show exactly 2 attempts (1 call + 1 retry), not more.
