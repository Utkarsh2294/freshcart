import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  addPantryItem,
  getBadges,
  getDietaryProfile,
  getNutritionCard,
  getPredictiveReorder,
  getSocialProof,
  listPantry,
  parseVoiceQuickAdd,
  planWeeklyMeals,
  removePantryItem,
  updateDietaryProfile,
} from '../controllers/phase8Controller.js';

const router = Router();

router.use(requireAuth);

router.get('/pantry', listPantry);
router.post('/pantry', addPantryItem);
router.delete('/pantry/:id', removePantryItem);

router.get('/dietary-profile', getDietaryProfile);
router.put('/dietary-profile', updateDietaryProfile);

router.post('/meal-planner/week', planWeeklyMeals);
router.post('/voice-quick-add/parse', parseVoiceQuickAdd);
router.post('/nutrition-card', getNutritionCard);

router.get('/social-proof/products/:productId', getSocialProof);
router.get('/badges', getBadges);
router.get('/predictive-reorder', getPredictiveReorder);

export default router;
