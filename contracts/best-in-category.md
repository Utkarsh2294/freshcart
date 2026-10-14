# `GET /best-in-category`

Returns globally ranked, in-stock products for one category. Query parameters:
`category_id` (required positive integer) and `limit` (1-50, default 4).

```json
{"products":[{"product_id":12,"name":"Fresh Paneer","brand":"Amul","price":90,"unit":"200 g","image_url":null,"final_score":0.86}]}
```

`final_score` comes from the nightly `product_scores` rollup. Stock is currently
catalog-wide because the schema has no per-dark-store inventory table.
