-- Up
WITH canonical_products AS (
  SELECT id, MIN(id) OVER (PARTITION BY LOWER(name)) AS canonical_id
  FROM products
),
duplicates AS (
  SELECT id, canonical_id
  FROM canonical_products
  WHERE id <> canonical_id
)
UPDATE cart_items ci
SET product_id = d.canonical_id
FROM duplicates d
WHERE ci.product_id = d.id;

WITH canonical_products AS (
  SELECT id, MIN(id) OVER (PARTITION BY LOWER(name)) AS canonical_id
  FROM products
),
duplicates AS (
  SELECT id, canonical_id
  FROM canonical_products
  WHERE id <> canonical_id
)
UPDATE order_items oi
SET product_id = d.canonical_id
FROM duplicates d
WHERE oi.product_id = d.id;

WITH canonical_products AS (
  SELECT id, MIN(id) OVER (PARTITION BY LOWER(name)) AS canonical_id
  FROM products
),
duplicates AS (
  SELECT id, canonical_id
  FROM canonical_products
  WHERE id <> canonical_id
)
UPDATE reviews r
SET product_id = d.canonical_id
FROM duplicates d
WHERE r.product_id = d.id;

WITH ranked_products AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY LOWER(name) ORDER BY id) AS rn
  FROM products
)
DELETE FROM products p
USING ranked_products rp
WHERE p.id = rp.id
  AND rp.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_lower_name_unique
  ON products (LOWER(name));

-- Down
DROP INDEX IF EXISTS idx_products_lower_name_unique;
