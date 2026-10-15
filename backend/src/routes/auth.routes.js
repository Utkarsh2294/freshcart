import { Router } from "express";
import {
  createGuestSession,
  loginWithEmail,
  registerWithEmail,
  refreshToken,
} from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import {
  emailLoginSchema,
  emailSignupSchema,
  guestSessionSchema,
  refreshTokenSchema,
} from "freshcart-shared/schemas/auth.schema";
import { guestSessionLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post(
  "/guest",
  guestSessionLimiter,
  validate(guestSessionSchema, "body"),
  createGuestSession,
);
router.post(
  "/register",
  validate(emailSignupSchema, "body"),
  registerWithEmail,
);
router.post("/login", validate(emailLoginSchema, "body"), loginWithEmail);
router.post("/refresh", validate(refreshTokenSchema, "body"), refreshToken);

export default router;
