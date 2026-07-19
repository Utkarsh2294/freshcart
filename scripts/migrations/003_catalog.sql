-- Catalog: Categories, Brands, Products, Reviews

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  icon_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_parent ON categories(parent_id);

CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  logo_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  brand_id INTEGER NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
  price NUMERIC(10,2) NOT NULL CHECK (price > 0),
  unit VARCHAR(50) NOT NULL,
  stock_qty INTEGER NOT NULL DEFAULT 100 CHECK (stock_qty >= 0),
  image_url VARCHAR(500),
  attributes JSONB DEFAULT '{}',
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GIN index on tsvector for full-text search
CREATE INDEX idx_products_search ON products USING GIN(search_vector);

-- GIN trigram index on name for typo-tolerant search
CREATE INDEX idx_products_name_trgm ON products USING GIN(name gin_trgm_ops);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_price ON products(price);

-- Auto-update search_vector on INSERT/UPDATE
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.name, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_product_search_vector
  BEFORE INSERT OR UPDATE OF name ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_search_vector();

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
