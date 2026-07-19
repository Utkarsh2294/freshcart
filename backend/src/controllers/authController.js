import { pool } from '../config/database.js';
import { redisClient } from '../config/redis.js';
import * as authService from '../services/authService.js';

const publicUser = (user) => ({
  id: user.id,
  phone: user.phone,
  email: user.email,
  name: user.name,
  role: user.role,
});

const sendAuthResponse = (res, user) => {
  const accessToken = authService.signAccessToken(user);
  const refreshToken = authService.signRefreshToken(user);

  res.json({
    accessToken,
    token: accessToken,
    refreshToken,
    user: publicUser(user),
  });
};

export const signupWithEmail = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [normalizedEmail]);

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await authService.hashPassword(password);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, 'customer')
       RETURNING *`,
      [normalizedEmail, passwordHash, name.trim()]
    );

    sendAuthResponse(res, result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const loginWithEmail = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
    const user = result.rows[0];

    if (!user || !(await authService.verifyPassword(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    sendAuthResponse(res, user);
  } catch (error) {
    next(error);
  }
};

export const requestOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const otp = authService.generateOTP();

    await redisClient.setex(`otp:${phone}`, 300, otp);

    console.log(`[MOCK SMS] OTP for ${phone} is ${otp}`);

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp, name } = req.body;

    const storedOtp = await redisClient.get(`otp:${phone}`);
    if (!storedOtp || !authService.verifyOTP(phone, otp, storedOtp)) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    await redisClient.del(`otp:${phone}`);

    let result = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    let user = result.rows[0];

    if (!user) {
      result = await pool.query(
        'INSERT INTO users (phone, name, role) VALUES ($1, $2, $3) RETURNING *',
        [phone, name || null, 'customer']
      );
      user = result.rows[0];
    }

    sendAuthResponse(res, user);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    const decoded = authService.verifyRefreshToken(token);
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    sendAuthResponse(res, user);
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};
