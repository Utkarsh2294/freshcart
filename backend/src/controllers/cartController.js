import { pool } from '../config/database.js';

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
      SELECT ci.id, ci.product_id, ci.qty AS quantity, p.name, p.price, p.image_url, p.stock_qty 
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
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
    
    if (quantity <= 0) {
      await pool.query("DELETE FROM cart_items WHERE id = $1", [id]);
    } else {
      await pool.query("UPDATE cart_items SET qty = $1 WHERE id = $2", [quantity, id]);
    }
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const removeItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM cart_items WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
