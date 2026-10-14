import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import AppShell from "../components/layout/AppShell";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

const Home = lazy(() => import("../pages/Home"));
const SearchCategory = lazy(() => import("../pages/SearchCategory"));
const ProductDetail = lazy(() => import("../pages/ProductDetail"));
const Cart = lazy(() => import("../pages/Cart"));
const Checkout = lazy(() => import("../pages/Checkout"));
const OrderHistory = lazy(() => import("../pages/OrderHistory"));
const OrderTracking = lazy(() => import("../pages/OrderTracking"));
const WalletPayments = lazy(() => import("../pages/WalletPayments"));
const CookThis = lazy(() => import("../pages/CookThis"));
const RecipeResult = lazy(() => import("../pages/RecipeResult"));
const Auth = lazy(() => import("../pages/Auth"));
const AdminDashboard = lazy(() => import("../pages/admin/Dashboard"));
const ProductManagement = lazy(
  () => import("../pages/admin/ProductManagement"),
);
const OrderManagement = lazy(() => import("../pages/admin/OrderManagement"));
const DarkStoreManagement = lazy(
  () => import("../pages/admin/DarkStoreManagement"),
);
const WalletCredit = lazy(() => import("../pages/admin/WalletCredit"));
const NotificationPreferences = lazy(
  () => import("../pages/NotificationPreferences"),
);

const page = (Component) => (
  <Suspense
    fallback={<div className="p-6 text-center text-gray-500">Loading...</div>}
  >
    <Component />
  </Suspense>
);

const protectedPage = (Component) => (
  <ProtectedRoute>{page(Component)}</ProtectedRoute>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: page(Home) },
      { path: "search", element: page(SearchCategory) },
      { path: "product/:id", element: page(ProductDetail) },
      { path: "cook-this", element: protectedPage(CookThis) },
      { path: "recipe-result", element: page(RecipeResult) },
      { path: "cart", element: page(Cart) },
      { path: "checkout", element: protectedPage(Checkout) },
      { path: "orders", element: protectedPage(OrderHistory) },
      { path: "orders/:id", element: protectedPage(OrderTracking) },
      { path: "wallet", element: protectedPage(WalletPayments) },
      {
        path: "notifications",
        element: protectedPage(NotificationPreferences),
      },
    ],
  },
  {
    path: "/auth",
    element: page(Auth),
  },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AppShell />
      </AdminRoute>
    ),
    children: [
      { index: true, element: page(AdminDashboard) },
      { path: "products", element: page(ProductManagement) },
      { path: "orders", element: page(OrderManagement) },
      { path: "stores", element: page(DarkStoreManagement) },
      { path: "wallet-credit", element: page(WalletCredit) },
    ],
  },
]);
