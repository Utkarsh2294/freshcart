import { Router } from 'express';
import { getWallet } from '../controllers/walletController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/', getWallet);

export default router;
