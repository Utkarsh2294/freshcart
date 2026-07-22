-- Up
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS sentiment_score NUMERIC(5,4) DEFAULT 0;

CREATE TABLE IF NOT EXISTS product_scores (
  product_id INTEGER PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  weighted_rating NUMERIC(5,4) NOT NULL DEFAULT 0,
  sentiment_avg NUMERIC(5,4) NOT NULL DEFAULT 0,
  sales_velocity NUMERIC(10,4) NOT NULL DEFAULT 0,
  final_score NUMERIC(6,4) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_scores_final_score
  ON product_scores(final_score DESC);

INSERT INTO product_scores (product_id, weighted_rating, sentiment_avg, sales_velocity, final_score)
SELECT
  p.id,
  COALESCE(AVG(r.rating), 4.0)::numeric(5,4) AS weighted_rating,
  COALESCE(AVG(r.sentiment_score), 0.35)::numeric(5,4) AS sentiment_avg,
  (LEAST(p.stock_qty, 200)::numeric / 200.0)::numeric(10,4) AS sales_velocity,
  (
    0.5 * (COALESCE(AVG(r.rating), 4.0) / 5.0)
    + 0.3 * ((COALESCE(AVG(r.sentiment_score), 0.35) + 1.0) / 2.0)
    + 0.2 * (LEAST(p.stock_qty, 200)::numeric / 200.0)
  )::numeric(6,4) AS final_score
FROM products p
LEFT JOIN reviews r ON r.product_id = p.id
GROUP BY p.id, p.stock_qty
ON CONFLICT (product_id) DO UPDATE
SET weighted_rating = EXCLUDED.weighted_rating,
    sentiment_avg = EXCLUDED.sentiment_avg,
    sales_velocity = EXCLUDED.sales_velocity,
    final_score = EXCLUDED.final_score,
    updated_at = NOW();
