import rateLimit from 'express-rate-limit';

export const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many OTP requests from this IP, please try again after a minute' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many search requests from this IP, please try again after a minute' },
  standardHeaders: true,
  legacyHeaders: false,
});
