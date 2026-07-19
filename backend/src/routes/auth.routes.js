import { Router } from 'express';
import {
  loginWithEmail,
  refreshToken,
  requestOtp,
  signupWithEmail,
  verifyOtp,
} from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { otpLimiter } from '../middleware/rateLimiter.js';
import {
  emailLoginSchema,
  emailSignupSchema,
  otpRequestSchema,
  otpVerifySchema,
  refreshTokenSchema,
} from 'freshcart-shared/schemas/auth.schema';

const router = Router();

router.post('/signup', validate(emailSignupSchema, 'body'), signupWithEmail);
router.post('/login', validate(emailLoginSchema, 'body'), loginWithEmail);

router.post('/otp/request', otpLimiter, validate(otpRequestSchema, 'body'), requestOtp);
router.post('/otp/verify', validate(otpVerifySchema, 'body'), verifyOtp);
router.post('/refresh', validate(refreshTokenSchema, 'body'), refreshToken);

export default router;
