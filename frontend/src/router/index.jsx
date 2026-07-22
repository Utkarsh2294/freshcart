import { createBrowserRouter } from 'react-router';
import AppShell from '../components/layout/AppShell';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import Home from '../pages/Home';
import SearchCategory from '../pages/SearchCategory';
import ProductDetail from '../pages/ProductDetail';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import OrderHistory from '../pages/OrderHistory';
import OrderTracking from '../pages/OrderTracking';
import WalletPayments from '../pages/WalletPayments';
import CookThis from '../pages/CookThis';
import RecipeResult from '../pages/RecipeResult';
import Auth from '../pages/Auth';
import AdminDashboard from '../pages/admin/Dashboard';
import ProductManagement from '../pages/admin/ProductManagement';
import OrderManagement from '../pages/admin/OrderManagement';
import DarkStoreManagement from '../pages/admin/DarkStoreManagement';
import WalletCredit from '../pages/admin/WalletCredit';
import NotificationPreferences from '../pages/NotificationPreferences';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Home /> },
      { path: 'search', element: <SearchCategory /> },
      { path: 'product/:id', element: <ProductDetail /> },
      { path: 'cook-this', element: <CookThis /> },
      { path: 'recipe-result', element: <RecipeResult /> },
      { path: 'cart', element: <ProtectedRoute><Cart /></ProtectedRoute> },
      { path: 'checkout', element: <ProtectedRoute><Checkout /></ProtectedRoute> },
      { path: 'orders', element: <ProtectedRoute><OrderHistory /></ProtectedRoute> },
      { path: 'orders/:id', element: <ProtectedRoute><OrderTracking /></ProtectedRoute> },
      { path: 'wallet', element: <ProtectedRoute><WalletPayments /></ProtectedRoute> },
      { path: 'notifications', element: <ProtectedRoute><NotificationPreferences /></ProtectedRoute> }
    ]
  },
  {
    path: '/auth',
    element: <Auth />
  },
  {
    path: '/admin',
    element: <AdminRoute><AppShell /></AdminRoute>,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'products', element: <ProductManagement /> },
      { path: 'orders', element: <OrderManagement /> },
      { path: 'stores', element: <DarkStoreManagement /> },
      { path: 'wallet-credit', element: <WalletCredit /> }
    ]
  }
]);
