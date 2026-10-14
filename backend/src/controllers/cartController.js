import { pool } from '../config/database.js';
import { multiply, subtract } from 'freshcart-shared/money';
import { featureFlags } from '../config/featureFlags.js';

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Find or create cart
    let cartResult = await pool.query("SELECT * FROM carts WHERE user_id = $1 AND status = 'active'", [userId]);
    let cart = cartResult.rows[0];
    
    if (!cart) {
      cartResult = await pool.query(
        "INSERT INTO carts (user_id, status) VALUES ($1, 'active') RETURNING *",
        [userId]
      );
      cart = cartResult.rows[0];
    }

    // Get items
    const itemsResult = await pool.query(`
      SELECT
        ci.id,
        ci.product_id,
        ci.qty AS quantity,
        ci.source,
        p.name,
        p.price::float AS price,
        COALESCE(p.mrp, p.price)::float AS mrp,
        p.unit,
        p.image_url,
        p.stock_qty,
        c.name AS category,
        b.name AS brand
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN brands b ON b.id = p.brand_id
      WHERE ci.cart_id = $1
      ORDER BY ci.created_at ASC
    `, [cart.id]);

    // Compute wallet balance
    const walletResult = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as balance 
      FROM wallet_transactions 
      WHERE user_id = $1
    `, [userId]);
    const wallet_balance_available = parseInt(walletResult.rows[0].balance, 10);

    // Resolve dark store
    let dark_store_id = null;
    const addressResult = await pool.query(`
      SELECT lat, lng FROM addresses WHERE user_id = $1 AND is_default = true LIMIT 1
    `, [userId]);
    
    if (addressResult.rows.length > 0) {
      const { lat, lng } = addressResult.rows[0];
      const storesResult = await pool.query("SELECT id, lat, lng FROM dark_stores WHERE is_active = true");
      
      let minDistance = Infinity;
      for (const store of storesResult.rows) {
        const dist = haversineKm(lat, lng, store.lat, store.lng);
        if (dist < minDistance) {
          minDistance = dist;
          dark_store_id = store.id;
        }
      }
    }

    res.json({
      cart: {
        id: cart.id,
        items: itemsResult.rows,
      },
      wallet_balance_available,
      dark_store_id
    });
  } catch (error) {
    next(error);
  }
};

export const addItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity, source } = req.body;

    let cartResult = await pool.query("SELECT id FROM carts WHERE user_id = $1 AND status = 'active'", [userId]);
    if (cartResult.rows.length === 0) {
      cartResult = await pool.query("INSERT INTO carts (user_id, status) VALUES ($1, 'active') RETURNING id", [userId]);
    }
    const cartId = cartResult.rows[0].id;

    const existingItemResult = await pool.query(
      "SELECT id, qty FROM cart_items WHERE cart_id = $1 AND product_id = $2",
      [cartId, product_id]
    );

    if (existingItemResult.rows.length > 0) {
      const newQty = existingItemResult.rows[0].qty + quantity;
      await pool.query("UPDATE cart_items SET qty = $1, source = $2 WHERE id = $3", [newQty, source || 'manual', existingItemResult.rows[0].id]);
    } else {
      await pool.query(
        "INSERT INTO cart_items (cart_id, product_id, qty, source) VALUES ($1, $2, $3, $4)",
        [cartId, product_id, quantity, source || 'manual']
      );
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;
    
    if (quantity <= 0) {
      await pool.query(`
        DELETE FROM cart_items ci
        USING carts c
        WHERE ci.id = $1
          AND ci.cart_id = c.id
          AND c.user_id = $2
          AND c.status = 'active'
      `, [id, userId]);
    } else {
      await pool.query(`
        UPDATE cart_items ci
        SET qty = $1
        FROM carts c
        WHERE ci.id = $2
          AND ci.cart_id = c.id
          AND c.user_id = $3
          AND c.status = 'active'
      `, [quantity, id, userId]);
    }
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const removeItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    await pool.query(`
      DELETE FROM cart_items ci
      USING carts c
      WHERE ci.id = $1
        AND ci.cart_id = c.id
        AND c.user_id = $2
        AND c.status = 'active'
    `, [id, userId]);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

async function getCartItemForUser(client, itemId, userId) {
  const { rows } = await client.query(`
    SELECT
      ci.id,
      ci.cart_id,
      ci.product_id,
      ci.qty,
      ci.source,
      p.name,
      p.category_id,
      p.price::float AS price,
      p.stock_qty
    FROM cart_items ci
    JOIN carts c ON c.id = ci.cart_id
    JOIN products p ON p.id = ci.product_id
    WHERE ci.id = $1
      AND c.user_id = $2
      AND c.status = 'active'
    LIMIT 1
    FOR UPDATE OF ci
  `, [itemId, userId]);
  return rows[0] || null;
}

async function resolveSwapCategoryIds(client, categoryId) {
  const { rows: categoryRows } = await client.query(
    'SELECT id, parent_id FROM categories WHERE id = $1',
    [categoryId]
  );
  const category = categoryRows[0];
  if (!category) return [categoryId];

  const { rows: exactRows } = await client.query(
    'SELECT COUNT(*)::int AS count FROM products WHERE category_id = $1 AND stock_qty > 0',
    [categoryId]
  );

  if (exactRows[0].count >= 3 || !category.parent_id) {
    return [categoryId];
  }

  const { rows: siblingRows } = await client.query(
    'SELECT id FROM categories WHERE parent_id = $1',
    [category.parent_id]
  );
  return siblingRows.map(row => row.id);
}

async function getDietaryTags(client, userId) {
  if (!featureFlags.dietaryFilters) return [];
  const { rows } = await client.query(
    'SELECT dietary_tags FROM user_dietary_profiles WHERE user_id = $1',
    [userId]
  );
  return rows[0]?.dietary_tags || [];
}

async function getSwapOptionsForItem(client, item, limit = 4, dietaryTags = []) {
  const categoryIds = await resolveSwapCategoryIds(client, item.category_id);
  const { rows } = await client.query(`
    SELECT
      p.id AS product_id,
      p.name,
      p.price::float AS price,
      COALESCE(p.mrp, p.price)::float AS mrp,
      p.unit,
      p.image_url,
      p.stock_qty,
      c.name AS category,
      b.name AS brand,
      COALESCE(AVG(r.rating), 4)::float AS rating,
      COALESCE(ps.final_score, 0.55)::float AS final_score
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN brands b ON b.id = p.brand_id
    LEFT JOIN reviews r ON r.product_id = p.id
    LEFT JOIN product_scores ps ON ps.product_id = p.id
    WHERE p.category_id = ANY($1::int[])
      AND p.id <> $2
      AND p.stock_qty > 0
      AND ($4::text[] IS NULL OR p.dietary_tags @> $4::text[])
    GROUP BY p.id, c.name, b.name, ps.final_score
    ORDER BY COALESCE(ps.final_score, 0.55) DESC, rating DESC, p.stock_qty DESC, p.name ASC
    LIMIT $3
  `, [categoryIds, item.product_id, limit, dietaryTags.length ? dietaryTags : null]);

  return rows.map(row => ({
    ...row,
    id: row.product_id,
    price_delta: subtract(row.price, item.price),
    line_price_delta: subtract(multiply(row.price, item.qty), multiply(item.price, item.qty)),
  }));
}

export const getSwapOptions = async (req, res, next) => {
  const start = Date.now();
  const client = await pool.connect();
  try {
    const item = await getCartItemForUser(client, req.params.id, req.user.id);
    if (!item) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const dietaryTags = await getDietaryTags(client, req.user.id);
    const options = await getSwapOptionsForItem(client, item, 4, dietaryTags);
    return res.json({
      item: {
        id: item.id,
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.qty,
        source: item.source,
      },
      options,
      latency_ms: Date.now() - start,
      ranking_source: 'product_scores_with_sql_fallback',
    });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

export const swapItem = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const item = await getCartItemForUser(client, req.params.id, req.user.id);
    if (!item) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const new_product_id = req.body.new_product_id || req.body.product_id;
    if (String(new_product_id) === String(item.product_id)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Choose a different product to swap' });
    }

    const dietaryTags = await getDietaryTags(client, req.user.id);
    const options = await getSwapOptionsForItem(client, item, 12, dietaryTags);
    const selected = options.find(option => String(option.product_id) === String(new_product_id));
    if (!selected) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Selected product is not a valid in-stock swap option' });
    }

    const existing = await client.query(
      'SELECT id, qty FROM cart_items WHERE cart_id = $1 AND product_id = $2 FOR UPDATE',
      [item.cart_id, new_product_id]
    );

    if (existing.rows.length) {
      await client.query(
        'UPDATE cart_items SET qty = qty + $1, source = $2 WHERE id = $3',
        [item.qty, item.source, existing.rows[0].id]
      );
      await client.query('DELETE FROM cart_items WHERE id = $1', [item.id]);
    } else {
      await client.query(
        'UPDATE cart_items SET product_id = $1, source = $2 WHERE id = $3',
        [new_product_id, item.source, item.id]
      );
    }

    await client.query('COMMIT');
    return res.json({
      success: true,
      item_id: existing.rows[0]?.id || item.id,
      product: selected,
      preserved_source: item.source,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};
