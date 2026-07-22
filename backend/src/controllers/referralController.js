import crypto from 'crypto';
import { pool } from '../config/database.js';
import { requireFeature } from '../config/featureFlags.js';

export const getMyCode = async (req, res, next) => {
  if (!requireFeature('referralWallet', res)) return;
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
    if (!requireFeature('referralWallet', res)) return;
    await client.query('BEGIN');
    const userId = req.user.id;
    const { code } = req.body;

    const referralResult = await client.query('SELECT id, user_id FROM referral_codes WHERE code = $1', [code]);
    if (referralResult.rows.length === 0) {
      throw new Error('Invalid referral code');
    }
    const referral = referralResult.rows[0];

    if (Number(referral.user_id) === Number(userId)) {
      throw new Error('Cannot redeem own referral code');
    }

    const existingRedemption = await client.query(
      'SELECT id FROM referral_redemptions WHERE referred_user_id = $1 LIMIT 1',
      [userId]
    );
    if (existingRedemption.rows.length > 0) {
      throw new Error('You have already redeemed a referral code');
    }

    await client.query('UPDATE referral_codes SET times_used = times_used + 1 WHERE id = $1', [referral.id]);

    const referrerTx = await client.query(
      `INSERT INTO wallet_transactions (user_id, amount, type, note, metadata)
       VALUES ($1, $2, 'referral_bonus', $3, $4)
       RETURNING id`,
      [referral.user_id, 50, `Referral bonus for ${code}`, { referred_user_id: userId }]
    );

    const referredTx = await client.query(
      `INSERT INTO wallet_transactions (user_id, amount, type, note, metadata)
       VALUES ($1, $2, 'referral_bonus', $3, $4)
       RETURNING id`,
      [userId, 50, `Referral signup credit for ${code}`, { referrer_user_id: referral.user_id }]
    );

    await client.query(
      `INSERT INTO referral_redemptions
        (code_id, referrer_user_id, referred_user_id, referrer_transaction_id, referred_transaction_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        referral.id,
        referral.user_id,
        userId,
        referrerTx.rows[0].id,
        referredTx.rows[0].id,
      ]
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
