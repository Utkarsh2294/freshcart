import { Router } from 'express';
import { getHomeRecommendations } from '../controllers/homeController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/recommendations', requireAuth, getHomeRecommendations);

export default router;
