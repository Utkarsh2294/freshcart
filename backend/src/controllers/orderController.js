import { pool } from '../config/database.js';
import { featureFlags } from '../config/featureFlags.js';

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180)
    * Math.cos(lat2 * Math.PI / 180)
    * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const orderSelect = `
  SELECT
    id,
    user_id,
    address_id,
    dark_store_id,
    status,
    total::float AS total,
    wallet_amount_applied::float AS wallet_amount_applied,
    payment_method,
    rider_lat,
    rider_lng,
    eta_seconds,
    simulation_step,
    created_at
  FROM orders
`;

export const createOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userId = req.user.id;
    const { apply_wallet, address_id, address, payment_method } = req.body;

    const cartResult = await client.query("SELECT id FROM carts WHERE user_id = $1 AND status = 'active'", [userId]);
    if (cartResult.rows.length === 0) {
      throw new Error('No active cart found');
    }
    const cartId = cartResult.rows[0].id;

    const itemsResult = await client.query(`
      SELECT ci.product_id, ci.qty AS quantity, p.price::float AS price, p.stock_qty
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
      FOR UPDATE OF p
    `, [cartId]);

    const items = itemsResult.rows;
    if (items.length === 0) {
      throw new Error('Cart is empty');
    }

    for (const item of items) {
      if (item.stock_qty < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.product_id}`);
      }
      await client.query(
        'UPDATE products SET stock_qty = stock_qty - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    let resolvedAddressId = address_id;

    if (!resolvedAddressId && address) {
      const fullAddress = address.full_address
        || [address.street, address.city, address.state, address.zip].filter(Boolean).join(', ')
        || 'Default delivery address';
      const insertAddress = await client.query(`
        INSERT INTO addresses (user_id, label, lat, lng, full_address, is_default)
        VALUES ($1, 'Home', $2, $3, $4, true)
        RETURNING id
      `, [userId, address.lat ?? 12.9352, address.lng ?? 77.6140, fullAddress]);
      resolvedAddressId = insertAddress.rows[0].id;
    }

    if (!resolvedAddressId) {
      const defaultAddress = await client.query(
        'SELECT id FROM addresses WHERE user_id = $1 AND is_default = true LIMIT 1',
        [userId]
      );
      resolvedAddressId = defaultAddress.rows[0]?.id;
    }

    const addressResult = await client.query(
      'SELECT lat, lng FROM addresses WHERE id = $1 AND user_id = $2',
      [resolvedAddressId, userId]
    );
    if (addressResult.rows.length === 0) {
      throw new Error('Invalid address');
    }
    const { lat, lng } = addressResult.rows[0];

    const storesResult = await client.query('SELECT id, lat, lng FROM dark_stores WHERE is_active = true');
    let darkStoreId = null;
    let minDistance = Infinity;
    for (const store of storesResult.rows) {
      const dist = haversineKm(lat, lng, store.lat, store.lng);
      if (dist < minDistance) {
        minDistance = dist;
        darkStoreId = store.id;
      }
    }

    if (!darkStoreId) {
      throw new Error('No dark stores available');
    }

    const subtotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    let total = subtotal;
    let walletAmountApplied = 0;

    if (apply_wallet) {
      const walletResult = await client.query(
        'SELECT COALESCE(SUM(amount), 0)::float AS balance FROM wallet_transactions WHERE user_id = $1',
        [userId]
      );
      const balance = Number(walletResult.rows[0].balance || 0);
      const maxWalletUse = Number((subtotal * 0.5).toFixed(2));
      walletAmountApplied = Math.min(balance, maxWalletUse);
      total = Number((subtotal - walletAmountApplied).toFixed(2));

      if (walletAmountApplied > 0) {
        await client.query(
          "INSERT INTO wallet_transactions (user_id, amount, type, related_order_id) VALUES ($1, $2, 'redeemed', NULL)",
          [userId, -walletAmountApplied]
        );
      }
    }

    const orderResult = await client.query(`
      INSERT INTO orders (user_id, total, status, dark_store_id, address_id, wallet_amount_applied, payment_method)
      VALUES ($1, $2, 'pending', $3, $4, $5, $6)
      RETURNING *
    `, [userId, total, darkStoreId, resolvedAddressId, walletAmountApplied, payment_method]);

    const order = orderResult.rows[0];

    for (const item of items) {
      await client.query(`
        INSERT INTO order_items (order_id, product_id, qty, price_at_purchase)
        VALUES ($1, $2, $3, $4)
      `, [order.id, item.product_id, item.quantity, item.price]);
      await client.query(`
        INSERT INTO order_events (user_id, product_id, city, event_type)
        VALUES ($1, $2, $3, 'ordered')
      `, [userId, item.product_id, address?.city || 'demo']);
    }
    await client.query("UPDATE carts SET status = 'checked_out' WHERE id = $1", [cartId]);

    await client.query('COMMIT');

    // Phase 8: fire push notification on order placement if feature is enabled
    if (featureFlags.pushNotificationsPwa) {
      try {
        const subs = await pool.query(
          'SELECT endpoint, keys FROM push_subscriptions WHERE user_id = $1',
          [userId]
        );
        if (subs.rows.length > 0) {
          const webpush = await import('web-push');
          const { config } = await import('../config/index.js');
          if (config.VAPID_PUBLIC_KEY && config.VAPID_PRIVATE_KEY) {
            webpush.default.setVapidDetails(
              'mailto:support@freshcart.local',
              config.VAPID_PUBLIC_KEY,
              config.VAPID_PRIVATE_KEY
            );
            const payload = JSON.stringify({
              title: 'Order placed! 🛒',
              body: `Your order #${order.id} is confirmed and being prepared.`,
              trigger_type: 'order_status',
            });
            for (const sub of subs.rows) {
              await webpush.default.sendNotification(sub, payload).catch(() => {});
            }
          }
        }
      } catch {
        // push failure must never break checkout
      }
    }

    res.status(201).json(order);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
};

export const listOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const result = await pool.query(
      `${orderSelect} WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const orders = result.rows;
    const orderIds = orders.map(order => order.id);
    if (orderIds.length) {
      const itemsResult = await pool.query(`
        SELECT
          oi.id,
          oi.order_id,
          oi.product_id,
          oi.qty AS quantity,
          oi.price_at_purchase::float AS price_at_purchase,
          p.name,
          p.image_url
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ANY($1::int[])
        ORDER BY oi.id ASC
      `, [orderIds]);
      const itemsByOrder = new Map();
      for (const item of itemsResult.rows) {
        const current = itemsByOrder.get(item.order_id) || [];
        current.push({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_purchase: item.price_at_purchase,
          product: {
            id: item.product_id,
            name: item.name,
            image_url: item.image_url,
          },
        });
        itemsByOrder.set(item.order_id, current);
      }
      orders.forEach(order => {
        order.items = itemsByOrder.get(order.id) || [];
      });
    }

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const orderResult = await pool.query(`${orderSelect} WHERE id = $1 AND user_id = $2`, [id, userId]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const itemsResult = await pool.query(`
      SELECT
        oi.id,
        oi.product_id,
        oi.qty AS quantity,
        oi.price_at_purchase::float AS price_at_purchase,
        p.name,
        p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [id]);

    const order = orderResult.rows[0];
    order.items = itemsResult.rows;

    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const getBuyItAgain = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const query = `
      SELECT DISTINCT p.*
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = $1
      LIMIT 10
    `;
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};
