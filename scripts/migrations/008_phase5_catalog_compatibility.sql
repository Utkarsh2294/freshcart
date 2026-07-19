ALTER TABLE products ADD COLUMN IF NOT EXISTS dietary_tags TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS pack_size_value NUMERIC(10,2);

CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_name_parent_unique
  ON categories (name, COALESCE(parent_id, 0));

CREATE UNIQUE INDEX IF NOT EXISTS idx_brands_name_unique
  ON brands (name);
