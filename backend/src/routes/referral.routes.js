import { Router } from 'express';
import { getMyCode, redeemCode } from '../controllers/referralController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { referralRedeemSchema } from 'freshcart-shared/schemas/referral.schema';

const router = Router();

router.use(requireAuth);
router.get('/my-code', getMyCode);
router.post('/redeem', validate(referralRedeemSchema, 'body'), redeemCode);

export default router;
