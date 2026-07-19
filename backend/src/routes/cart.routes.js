import { Router } from 'express';
import { getCart, addItem, updateItem, removeItem } from '../controllers/cartController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { cartItemAddSchema, cartItemUpdateSchema } from 'freshcart-shared/schemas/cart.schema';

const router = Router();

router.use(requireAuth);
router.get('/', getCart);
router.post('/items', validate(cartItemAddSchema, 'body'), addItem);
router.patch('/items/:id', validate(cartItemUpdateSchema, 'body'), updateItem);
router.delete('/items/:id', removeItem);

export default router;
