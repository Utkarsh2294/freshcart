import { pool } from '../config/database.js';
import webpush from 'web-push';
import { config } from '../config/index.js';
import { requireFeature } from '../config/featureFlags.js';

if (config.VAPID_PUBLIC_KEY && config.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    config.VAPID_SUBJECT,
    config.VAPID_PUBLIC_KEY,
    config.VAPID_PRIVATE_KEY
  );
}

export const subscribe = async (req, res, next) => {
  if (!requireFeature('pushNotificationsPwa', res)) return;
  try {
    const userId = req.user.id;
    const { endpoint, keys } = req.body;

    await pool.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, keys) 
       VALUES ($1, $2, $3)
       ON CONFLICT (endpoint) DO UPDATE SET user_id = $1, keys = $3`,
      [userId, endpoint, keys]
    );

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const unsubscribe = async (req, res, next) => {
  if (!requireFeature('pushNotificationsPwa', res)) return;
  try {
    const { endpoint } = req.body;
    await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const getPreferences = async (req, res, next) => {
  if (!requireFeature('pushNotificationsPwa', res)) return;
  try {
    await pool.query(`
      INSERT INTO notification_preferences (user_id)
      VALUES ($1)
      ON CONFLICT (user_id) DO NOTHING
    `, [req.user.id]);
    const { rows } = await pool.query(`
      SELECT order_status, back_in_stock, price_drop
      FROM notification_preferences
      WHERE user_id = $1
    `, [req.user.id]);
    res.json({ preferences: rows[0] || { order_status: true, back_in_stock: true, price_drop: true } });
  } catch (error) {
    next(error);
  }
};

export const updatePreferences = async (req, res, next) => {
  if (!requireFeature('pushNotificationsPwa', res)) return;
  try {
    const preferences = {
      order_status: Boolean(req.body.order_status),
      back_in_stock: Boolean(req.body.back_in_stock),
      price_drop: Boolean(req.body.price_drop),
    };
    const { rows } = await pool.query(`
      INSERT INTO notification_preferences (user_id, order_status, back_in_stock, price_drop)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id)
      DO UPDATE SET
        order_status = EXCLUDED.order_status,
        back_in_stock = EXCLUDED.back_in_stock,
        price_drop = EXCLUDED.price_drop,
        updated_at = NOW()
      RETURNING order_status, back_in_stock, price_drop
    `, [req.user.id, preferences.order_status, preferences.back_in_stock, preferences.price_drop]);
    res.json({ preferences: rows[0] });
  } catch (error) {
    next(error);
  }
};

async function sendPushToUser(userId, payload) {
  if (!config.VAPID_PUBLIC_KEY || !config.VAPID_PRIVATE_KEY) {
    return { sent: 0, skipped: 'missing_vapid_keys' };
  }

  const { rows } = await pool.query(
    'SELECT endpoint, keys FROM push_subscriptions WHERE user_id = $1',
    [userId]
  );
  let sent = 0;
  for (const subscription of rows) {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    sent += 1;
  }
  return { sent };
}

export const sendTestNotification = async (req, res, next) => {
  if (!requireFeature('pushNotificationsPwa', res)) return;
  try {
    const payload = {
      title: req.body.title || 'Freshcart order update',
      body: req.body.body || 'Your test notification is working.',
      trigger_type: req.body.trigger_type || 'order_status',
    };
    const result = await sendPushToUser(req.user.id, payload);
    await pool.query(
      `INSERT INTO notification_jobs (user_id, trigger_type, payload, status, sent_at)
       VALUES ($1, $2, $3, $4, CASE WHEN $4 = 'sent' THEN NOW() ELSE NULL END)`,
      [req.user.id, payload.trigger_type, payload, result.sent ? 'sent' : 'queued']
    );
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
