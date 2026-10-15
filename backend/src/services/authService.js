import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

export const hashPassword = (password) => {
  return bcrypt.hash(password, 12);
};

export const verifyPassword = (password, passwordHash) => {
  if (!passwordHash) return false;
  return bcrypt.compare(password, passwordHash);
};

export const signAccessToken = (user, expiresIn = config.JWT_EXPIRES_IN) => {
  return jwt.sign(
    { id: user.id, phone: user.phone, email: user.email, role: user.role },
    config.JWT_SECRET,
    { expiresIn },
  );
};

export const signRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, phone: user.phone, email: user.email, role: user.role },
    config.JWT_REFRESH_SECRET,
    { expiresIn: config.JWT_REFRESH_EXPIRES_IN },
  );
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET);
};
