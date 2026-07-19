-- Add MRP to products for Deals support
ALTER TABLE products ADD COLUMN mrp NUMERIC(10,2);
-- Backfill mrp with price where it doesn't exist (though this is a new column so it's all null)
UPDATE products SET mrp = price;
-- Make mrp NOT NULL after backfilling
ALTER TABLE products ALTER COLUMN mrp SET NOT NULL;
-- Ensure MRP is always >= price
ALTER TABLE products ADD CONSTRAINT check_mrp_gte_price CHECK (mrp >= price);
