/**
 * routes/cookThisRoutes.js
 *
 * Mounts POST /ai/cook-this/generate. Swap `requireAuth` for whatever your
 * existing auth middleware is called (TIA/StackIT-style projects usually
 * already have one under middleware/).
 */

import express from "express";
import {
  addMatchedItemsHandler,
  generateRecipeHandler,
  getCookThisMetricsHandler,
  matchIngredientsHandler,
} from "../controllers/cookThisController.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import rateLimit from "express-rate-limit";

const router = express.Router();
const generationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many recipe requests; try again in a minute." },
});

router.get(
  "/ai/cook-this/metrics",
  requireAuth,
  requireAdmin,
  getCookThisMetricsHandler,
);
router.post(
  "/ai/cook-this/generate",
  generationLimiter,
  requireAuth,
  generateRecipeHandler,
);
router.post("/ai/cook-this/match", optionalAuth, matchIngredientsHandler);
router.post("/ai/cook-this/add-to-cart", requireAuth, addMatchedItemsHandler);

export default router;
