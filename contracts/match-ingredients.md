# `POST /ai/cook-this/match`

Accepts recipe ingredients and returns one catalog-grounded result per item.
Each result includes `selected`, `product`, `quantity`, `match_type`, `note`,
`confidence_score`, and up to three alternatives.

`match_type` is one of `exact`, `closest`, `oversized`, `out_of_stock`, or
`no_match`. Results below 0.75 confidence are not selected automatically.
`out_of_stock` means matching catalog products exist but have no stock;
`no_match` means the ingredient is absent from the catalog.

Pack selection is deterministic: choose the smallest single pack that covers
the need, otherwise choose the multi-pack combination with the least excess.
Packs over twice the needed quantity are marked `oversized`.
