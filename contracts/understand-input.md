# Input-understanding contracts

## `POST /parse-text`

Request: `{"query":"make paneer butter masala for four people"}`.

Response: `{"dish_name":"paneer butter masala","servings":4,"confidence":0.95}`.
`servings` is `null` when it is not stated. The parser accepts digits, English
number words, and phrases such as `4 logon ke liye`. It makes no external API
call.

## `POST /understand`

Backward-compatible storefront search intent endpoint. Returns `intent`
(`product_search`, `category_browse`, or `recipe_suggestion`), normalized
`query`, and optional `category_hint`.
