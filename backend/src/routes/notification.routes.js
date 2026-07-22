import { Router } from 'express';
import {
  getPreferences,
  sendTestNotification,
  subscribe,
  unsubscribe,
  updatePreferences,
} from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { pushSubscribeSchema } from 'freshcart-shared/schemas/notification.schema';

const router = Router();

router.use(requireAuth);
router.post('/subscribe', validate(pushSubscribeSchema, 'body'), subscribe);
router.delete('/subscribe', unsubscribe);
router.post('/unsubscribe', unsubscribe);
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);
router.post('/test', sendTestNotification);

export default router;
