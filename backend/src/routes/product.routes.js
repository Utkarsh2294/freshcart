import { Router } from 'express';
import { list, getById, alsoBought } from '../controllers/productController.js';
import { validate } from '../middleware/validate.js';
import { productQuerySchema } from 'freshcart-shared/schemas/product.schema';

const router = Router();

router.get('/', validate(productQuerySchema, 'query'), list);
router.get('/:id', getById);
router.get('/:id/also-bought', alsoBought);

export default router;
