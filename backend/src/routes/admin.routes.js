import { Router } from 'express';
import { 
  createProduct, updateProduct, deleteProduct, 
  listOrders, 
  createDarkStore, updateDarkStore, deleteDarkStore 
} from '../controllers/adminController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.post('/products', createProduct);
router.patch('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

router.get('/orders', listOrders);

router.post('/dark-stores', createDarkStore);
router.patch('/dark-stores/:id', updateDarkStore);
router.delete('/dark-stores/:id', deleteDarkStore);

export default router;
