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
// Admin & Vendor Pages
import Admin from "./pages/admin/Admin";
import AdminProducts from "./pages/admin/products/productsList";
import Inventory from "./pages/vendor/Inventory";
// Security
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminCategories from "./pages/admin/category/AdminCategories";
import AdminUserPage from "./pages/admin/users/AdminUserpage";
import AdminOrdersPage from "./pages/admin/orders/AdminOrders";
import VendorOrdersPage from "./pages/vendor/Order";

export const router = createBrowserRouter([
  // --- 1. MAIN PUBLIC & CUSTOMER ROUTES ---
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "products", element: <Products /> },
      { path: "products/:id", element: <ProductDetail /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "verify-email", element: <VerifyEmail /> },
      { path: "unauthorized", element: <Unauthorized /> },
      { path: "cart", element: <Cart /> },
      { path: "checkout", element:(
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

  // protect checkout and my-orders routes for authenticated users only, but allow public access to products and cart
  // --- 2. ADMIN PROTECTED ROUTES ---
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
      {path:"orders", element: <AdminOrdersPage />},
      { path: "categories", element: <AdminCategories /> },
      { path: "users", element: <AdminUserPage /> },
    ],
  },

  // --- 3. VENDOR PROTECTED ROUTES ---
  {
    path: "/vendor",
    element: (
      <ProtectedRoute requiredRole="vendor">
        <VendorLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Inventory /> },
      {
        path: "orders",
        element: <VendorOrdersPage />,
      },
    ],
  },

  // Catch-all for top-level routes
  { path: "*", element: <NotFound /> },
]);
