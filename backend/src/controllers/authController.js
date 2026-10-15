import { pool } from "../config/database.js";
import { config } from "../config/index.js";
import * as authService from "../services/authService.js";

const publicUser = (user) => ({
  id: user.id,
  phone: user.phone,
  email: user.email,
  name: user.name,
  role: user.role,
});

const sendAuthResponse = (res, user, expiresIn) => {
  const accessToken = authService.signAccessToken(user, expiresIn);
  const refreshToken = authService.signRefreshToken(user);

  res.json({
    accessToken,
    token: accessToken,
    refreshToken,
    user: publicUser(user),
  });
};

export const createGuestSession = async (req, res, next) => {
  try {
    const { guest_key: guestKey } = req.body;
    const result = await pool.query(
      `INSERT INTO users (guest_key, name, role)
       VALUES ($1, 'Guest shopper', 'customer')
       ON CONFLICT (guest_key) WHERE guest_key IS NOT NULL
       DO UPDATE SET name = EXCLUDED.name
       RETURNING *`,
      [guestKey],
    );

    sendAuthResponse(res, result.rows[0], config.JWT_REFRESH_EXPIRES_IN);
  } catch (error) {
    next(error);
  }
};

export const registerWithEmail = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = $1",
      [normalizedEmail],
    );

    if (existing.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "An account with this email already exists" });
    }

    const passwordHash = await authService.hashPassword(password);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, 'customer')
       RETURNING *`,
      [normalizedEmail, passwordHash, name.trim()],
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
    const result = await pool.query(
      "SELECT * FROM users WHERE LOWER(email) = $1",
      [normalizedEmail],
    );
    const user = result.rows[0];

    if (
      !user ||
      !(await authService.verifyPassword(password, user.password_hash))
    ) {
      return res.status(401).json({ error: "Invalid email or password" });
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
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [
      decoded.id,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    sendAuthResponse(res, user);
  } catch {
    res.status(401).json({ error: "Invalid refresh token" });
  }
};
