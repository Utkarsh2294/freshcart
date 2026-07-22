/**
 * routes/cookThisRoutes.js
 *
 * Mounts POST /ai/cook-this/generate. Swap `requireAuth` for whatever your
 * existing auth middleware is called (TIA/StackIT-style projects usually
 * already have one under middleware/).
 */

import express from 'express';
import {
  addMatchedItemsHandler,
  generateRecipeHandler,
  matchIngredientsHandler,
} from '../controllers/cookThisController.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/ai/cook-this/generate', generateRecipeHandler);
router.post('/ai/cook-this/match', optionalAuth, matchIngredientsHandler);
router.post('/ai/cook-this/add-to-cart', requireAuth, addMatchedItemsHandler);

export default router;
