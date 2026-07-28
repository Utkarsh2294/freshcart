import { Router } from 'express';
import {
  loginWithEmail,
  registerWithEmail,
  refreshToken,
} from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import {
  emailLoginSchema,
  emailSignupSchema,
  refreshTokenSchema,
} from 'freshcart-shared/schemas/auth.schema';

const router = Router();

router.post('/register', validate(emailSignupSchema, 'body'), registerWithEmail);
router.post('/login', validate(emailLoginSchema, 'body'), loginWithEmail);
router.post('/refresh', validate(refreshTokenSchema, 'body'), refreshToken);

export default router;
