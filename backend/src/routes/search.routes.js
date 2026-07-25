import { Router } from 'express';
import { suggest, understandSearchIntent } from '../controllers/searchController.js';
import { searchLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/suggest', searchLimiter, suggest);
router.get('/understand', understandSearchIntent);

export default router;
