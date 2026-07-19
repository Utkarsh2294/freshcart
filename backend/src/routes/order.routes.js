import { Router } from 'express';
import { createOrder, listOrders, getOrder, getBuyItAgain } from '../controllers/orderController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { orderCreateSchema } from 'freshcart-shared/schemas/order.schema';

const router = Router();

router.use(requireAuth);
router.post('/', validate(orderCreateSchema, 'body'), createOrder);
router.get('/', listOrders);
router.get('/buy-it-again', getBuyItAgain);
router.get('/:id', getOrder);

export default router;
