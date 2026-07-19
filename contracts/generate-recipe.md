# `POST /ai/cook-this/generate`

Generates (or retrieves a cached) recipe for a dish name + serving count.
This is Cook-with-AI Phase 4. It does **not** touch ingredient matching,
quantity math, or cart insertion — those are Phase 5 and stay self-hosted
and deterministic.

## Auth

Required. Standard session/JWT auth, same as other authenticated Freshcart
endpoints.

## Request

```
POST /ai/cook-this/generate
Content-Type: application/json
Authorization: <as per existing auth scheme>
```

```json
{
  "dish_name": "paneer butter masala",
  "servings": 4
}
```

| Field       | Type    | Constraints                          |
|-------------|---------|---------------------------------------|
| `dish_name` | string  | 1–200 chars, required                 |
| `servings`  | integer | 1–50, required                        |

## Response — success (200)

Identical shape whether the recipe came from cache or from a live Kimi K3
call. The frontend never branches on this — `source` is informational only.

```json
{
  "title": "Paneer Butter Masala",
  "steps": [
    "Heat butter in a pan and sauté onions until golden.",
    "Add tomato purée and cook until the oil separates.",
    "Stir in cream, spices, and paneer cubes. Simmer 5 minutes."
  ],
  "ingredients": [
    { "name": "paneer, cubed", "qty": 400, "unit": "g" },
    { "name": "butter", "qty": 3, "unit": "tbsp" },
    { "name": "large onion, chopped", "qty": 2, "unit": null },
    { "name": "tomato purée", "qty": 200, "unit": "ml" }
  ],
  "source": "kimi_api",
  "confidence": null
}
```

| Field         | Type                | Notes                                                        |
|---------------|---------------------|----------------------------------------------------------------|
| `title`       | string              |                                                                  |
| `steps`       | string[]            | Ordered instructions                                            |
| `ingredients` | array of objects    | `{ name: string, qty: number, unit: string \| null }`           |
| `source`      | `"kimi_api"` \| `"cache"` | Which path served this response                            |
| `confidence`  | number \| null (optional) | Reserved for future use; Kimi K3 doesn't return a confidence score today, so this is currently always `null`/omitted. Present in the contract so the frontend can start rendering it without a breaking change later. |

## Response — graceful failure (422)

Returned when Kimi's output is missing, malformed, or fails schema
validation after the one automatic retry. Never a crash, never an empty
cart — the frontend shows a "try rephrasing" state.

```json
{
  "success": false,
  "error": "recipe_generation_failed",
  "message": "Couldn't generate that recipe — try rephrasing the dish name."
}
```

## Response — validation error (400)

```json
{
  "success": false,
  "message": "\"servings\" must be a number"
}
```

## Response — unexpected server error (500)

```json
{
  "success": false,
  "error": "internal_error",
  "message": "Couldn't generate that recipe — try again in a moment."
}
```

## Caching behavior

- Cache key: `(normalized dish_name, servings)`, where normalization is
  trim + lowercase + collapse internal whitespace.
- The cache is checked **before** `kimiRecipeClient` is ever invoked.
- A successful live generation is written to `recipe_cache` with
  `source = 'kimi_api'` before the response is returned.
- A cache hit returns `source: "cache"` and never touches the Kimi API.
- Repeat requests for the same dish + servings only call the Kimi API once
  — verified by checking for a second outbound call/timing gap on the
  second request (see manual test log).

## Out of scope for this endpoint

- Ingredient-to-catalog matching (Phase 5)
- Quantity/unit conversion math (Phase 5)
- Cart insertion (Phase 5)
- Any recipe knowledge base, FAISS index, or fine-tuned model — this phase
  fully replaces that approach; recipe generation now comes from Kimi K3
  only, cached in Postgres.
