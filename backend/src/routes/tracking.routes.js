import { Router } from 'express';
import { getTracking } from '../controllers/trackingController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/orders/:id/tracking', getTracking);

export default router;
