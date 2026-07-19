import { pool } from '../config/database.js';

export const getTracking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const orderResult = await pool.query(
      'SELECT status, rider_lat, rider_lng, eta_seconds, created_at FROM orders WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    const timeline = [
      { status: 'pending', timestamp: order.created_at }
    ];

    if (order.status !== 'pending') {
      timeline.push({ status: 'confirmed', timestamp: order.created_at });
    }

    res.json({
      status: order.status,
      rider_lat: order.rider_lat,
      rider_lng: order.rider_lng,
      eta_seconds: order.eta_seconds,
      timeline
    });
  } catch (error) {
    next(error);
  }
};
