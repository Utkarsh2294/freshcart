# `GET /user-affinity`

Returns per-user product affinity without modifying the global `product_scores`
table. Query parameters: `user_id` (required positive integer) and `limit` (1-50,
default 10).

```json
{"products":[{"product_id":12,"score":0.9123}]}
```

Scores combine normalized purchase frequency (60%) and a 30-day exponential
recency decay (40%). Results are ordered highest first.
