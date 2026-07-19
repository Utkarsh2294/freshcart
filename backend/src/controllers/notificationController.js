import { pool } from '../config/database.js';

export const subscribe = async (req, res, next) => {
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
  try {
    const { endpoint } = req.body;
    await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
