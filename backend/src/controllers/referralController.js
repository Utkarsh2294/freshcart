import crypto from 'crypto';
import { pool } from '../config/database.js';

export const getMyCode = async (req, res, next) => {
  try {
    const userId = req.user.id;

    let result = await pool.query('SELECT code FROM referral_codes WHERE user_id = $1', [userId]);

    if (result.rows.length === 0) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      result = await pool.query(
        'INSERT INTO referral_codes (user_id, code) VALUES ($1, $2) RETURNING code',
        [userId, code]
      );
    }

    res.json({ code: result.rows[0].code });
  } catch (error) {
    next(error);
  }
};

export const redeemCode = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const userId = req.user.id;
    const { code } = req.body;

    const referralResult = await client.query('SELECT id, user_id FROM referral_codes WHERE code = $1', [code]);
    if (referralResult.rows.length === 0) {
      throw new Error('Invalid referral code');
    }
    const referral = referralResult.rows[0];

    if (referral.user_id === userId) {
      throw new Error('Cannot redeem own referral code');
    }

    const existingBonus = await client.query(
      "SELECT id FROM wallet_transactions WHERE user_id = $1 AND type = 'referral_bonus' LIMIT 1",
      [userId]
    );
    if (existingBonus.rows.length > 0) {
      throw new Error('You have already redeemed a referral code');
    }

    await client.query('UPDATE referral_codes SET times_used = times_used + 1 WHERE id = $1', [referral.id]);

    await client.query(
      "INSERT INTO wallet_transactions (user_id, amount, type) VALUES ($1, $2, 'referral_bonus')",
      [referral.user_id, 50]
    );

    await client.query(
      "INSERT INTO wallet_transactions (user_id, amount, type) VALUES ($1, $2, 'referral_bonus')",
      [userId, 50]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Referral code applied successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
};
