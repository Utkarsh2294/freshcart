import rateLimit from 'express-rate-limit';

export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many search requests from this IP, please try again after a minute' },
  standardHeaders: true,
  legacyHeaders: false,
});
