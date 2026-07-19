import { Router } from 'express';
import { createReview } from '../controllers/reviewController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { reviewCreateSchema } from 'freshcart-shared/schemas/review.schema';

const router = Router();

router.use(requireAuth);
router.post('/products/:id/reviews', validate(reviewCreateSchema, 'body'), createReview);

export default router;
