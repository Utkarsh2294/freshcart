import { Router } from 'express';
import { suggest } from '../controllers/searchController.js';
import { searchLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/suggest', searchLimiter, suggest);

export default router;
