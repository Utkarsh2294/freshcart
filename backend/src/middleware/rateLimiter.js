import rateLimit from "express-rate-limit";

export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    error:
      "Too many search requests from this IP, please try again after a minute",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const guestSessionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    error: "Too many guest session requests, please try again after a minute",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
