import { Router } from 'express';
import { subscribe, unsubscribe } from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { pushSubscribeSchema } from 'freshcart-shared/schemas/notification.schema';

const router = Router();

router.use(requireAuth);
router.post('/subscribe', validate(pushSubscribeSchema, 'body'), subscribe);
router.delete('/subscribe', unsubscribe);

export default router;
