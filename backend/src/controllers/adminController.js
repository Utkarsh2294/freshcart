import { pool } from '../config/database.js';

async function resolveBrandId(client, brandNameOrId) {
  if (Number.isInteger(Number(brandNameOrId))) return Number(brandNameOrId);

  const brandName = String(brandNameOrId || 'Freshcart').trim() || 'Freshcart';
  const result = await client.query(
    'INSERT INTO brands (name) VALUES ($1) ON CONFLICT DO NOTHING RETURNING id',
    [brandName]
  );

  if (result.rows[0]?.id) return result.rows[0].id;

  const existing = await client.query('SELECT id FROM brands WHERE name = $1', [brandName]);
  return existing.rows[0].id;
}

export const createProduct = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { name, category_id, brand_id, brand, price, mrp, unit = '1 pc', stock_qty, image_url, attributes = {} } = req.body;
    const resolvedBrandId = brand_id || await resolveBrandId(client, brand);
    const result = await client.query(
      `INSERT INTO products (name, category_id, brand_id, price, mrp, unit, stock_qty, image_url, attributes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [name, category_id, resolvedBrandId, price, mrp || price, unit, stock_qty ?? 100, image_url || null, attributes]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

export const updateProduct = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { name, category_id, brand_id, brand, price, mrp, unit, stock_qty, image_url, attributes } = req.body;
    const resolvedBrandId = brand_id || (brand ? await resolveBrandId(client, brand) : undefined);

    const result = await client.query(
      `UPDATE products
       SET name = COALESCE($1, name),
           category_id = COALESCE($2, category_id),
           brand_id = COALESCE($3, brand_id),
           price = COALESCE($4, price),
           mrp = COALESCE($5, mrp),
           unit = COALESCE($6, unit),
           stock_qty = COALESCE($7, stock_qty),
           image_url = COALESCE($8, image_url),
           attributes = COALESCE($9, attributes)
       WHERE id = $10
       RETURNING *`,
      [name, category_id, resolvedBrandId, price, mrp, unit, stock_qty, image_url, attributes, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const listOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const createDarkStore = async (req, res, next) => {
  try {
    const { name, lat, lng, service_radius_km = 5, is_active = true } = req.body;
    const result = await pool.query(
      'INSERT INTO dark_stores (name, lat, lng, service_radius_km, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, lat, lng, service_radius_km, is_active]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const updateDarkStore = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, lat, lng, service_radius_km, is_active } = req.body;
    const result = await pool.query(
      `UPDATE dark_stores
       SET name = COALESCE($1, name),
           lat = COALESCE($2, lat),
           lng = COALESCE($3, lng),
           service_radius_km = COALESCE($4, service_radius_km),
           is_active = COALESCE($5, is_active)
       WHERE id = $6
       RETURNING *`,
      [name, lat, lng, service_radius_km, is_active, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const deleteDarkStore = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM dark_stores WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
