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

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_lower_name_unique
  ON products (LOWER(name));
