// src/router.ts (or your routes file)
import { createBrowserRouter } from "react-router-dom";
// Layouts
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/layout/AdminLayout";
import VendorLayout from "./components/layout/VendorLayout";

// Public & User Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import VerifyEmail from "./pages/VerifyEmail";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccess from "./pages/OrderSuccess";
import MyOrders from "./pages/MyOrders";
import Wishlist from "./pages/Wishlist";
import { ProfilePage } from "./pages/ProfilePage";

// Admin Pages
import Admin from "./pages/admin/Admin";
import AdminProducts from "./pages/admin/products/AdminProduct";
import AdminCategories from "./pages/admin/category/AdminCategories";
import AdminUserPage from "./pages/admin/users/AdminUserpage";
import AdminOrdersPage from "./pages/admin/orders/AdminOrders";
import AdminVendorPage from "./pages/admin/vendors/AdminVendorPage";

// Vendor Views
import { VendorOverview } from "./features/vendor/VendorOverview";
import { ProductManagement } from "./features/vendor/ProductManagement";
import { VendorOrdersView } from "./features/vendor/VendorOrdersView";
import { VendorSettingsView } from "./features/vendor/VendorSettingsView";

// Security
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminVendorRequests from "./features/admin/home/AdminVendorRequests";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

export const router = createBrowserRouter([
  // --- 1. STANDALONE AUTHENTICATION ROUTES ---
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/privacy", element: <Privacy /> },
  { path: "/terms", element: <Terms /> },

  // --- 1.1 PROFILE PAGE ---
  {
    path: "/profile",
    children: [
      {
        index: true, 
        element: <ProfilePage />
      },
    ],
  },

  // --- 2. MAIN PUBLIC & CUSTOMER ROUTES ---
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "products", element: <Products /> },
      { path: "products/:id", element: <ProductDetail /> },
      { path: "verify-email", element: <VerifyEmail /> },
      { path: "unauthorized", element: <Unauthorized /> },
      { path: "cart", element: <Cart /> },
      { path: "wishlist", element: <Wishlist /> },
      { 
        path: "checkout", 
        element: (
          <ProtectedRoute requiredRole="user">
            <CheckoutPage />
          </ProtectedRoute>
        ) 
      },
      { path: "order-success/:orderNumber", element: <OrderSuccess /> },
      { path: "my-orders", element: <MyOrders /> },
      { path: "*", element: <NotFound /> },
    ],
  },

  // --- 3. ADMIN PROTECTED ROUTES ---
  {
    path: "/admin",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Admin /> },
      { path: "products", element: <AdminProducts /> },
      { path: "orders", element: <AdminOrdersPage /> },
      { path: "categories", element: <AdminCategories /> },
      { path: "vendors", element: <AdminVendorPage /> },
      { path: "vendor-requests", element: <AdminVendorRequests /> },
      { path: "users", element: <AdminUserPage /> },
    ],
  },

  // --- 4. VENDOR PROTECTED ROUTES ---
  {
    path: "/vendor",
    element: (
      <ProtectedRoute requiredRole="vendor">
        <VendorLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <VendorOverview /> },
      { path: "products", element: <ProductManagement /> },
      { path: "orders", element: <VendorOrdersView /> },
      { path: "settings", element: <VendorSettingsView /> },
    ],
  },

  // Catch-all for top-level routes
  { path: "*", element: <NotFound /> },
]);