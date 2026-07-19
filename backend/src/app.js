import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import './config/index.js'; // initialize dotenv
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import productRoutes from './routes/product.routes.js';
import searchRoutes from './routes/search.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import trackingRoutes from './routes/tracking.routes.js';
import reviewRoutes from './routes/review.routes.js';
import walletRoutes from './routes/wallet.routes.js';
import referralRoutes from './routes/referral.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import adminRoutes from './routes/admin.routes.js';
import cookThisRoutes from './routes/cookThisRoutes.js';

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5175',
    'http://127.0.0.1:5175',
  ],
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/search', searchRoutes);
app.use('/api', cookThisRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api', trackingRoutes); 
app.use('/api', reviewRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

export default app;
