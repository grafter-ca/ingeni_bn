import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Admin from "./pages/admin/Admin";
import AdminLayout from "./components/layout/AdminLayout";
import VendorLayout from "./components/layout/VendorLayout";
import Vendor from "./pages/vendor/VendorPage";
import Inventory from "./pages/vendor/Inventory";
import VerifyEmail from "./pages/VerifyEmail";

// New Order-Related Pages
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccess from "./pages/OrderSuccess";
import MyOrders from "./pages/MyOrders";

export const router = createBrowserRouter([
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

      // --- USER PROTECTED ROUTES ---
      {
        path: "cart",
        element: (
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        ),
      },
      {
        path: "checkout",
        element: (
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "order-success/:orderNumber",
        element: (
          <ProtectedRoute>
            <OrderSuccess />
          </ProtectedRoute>
        ),
      },
      {
        path: "my-orders",
        element: (
          <ProtectedRoute>
            <MyOrders />
          </ProtectedRoute>
        ),
      },
      { path: "*", element: <NotFound /> },
    ],
  },

  // --- ADMIN ROUTES ---
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute requiredRole="admin">
            <Admin />
          </ProtectedRoute>
        ),
      },
      // Admin-specific order management could go here
    ],
  },

  // --- VENDOR ROUTES ---
  {
    path: "/vendor",
    element: <VendorLayout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute requiredRole="vendor">
            <Vendor />
          </ProtectedRoute>
        ),
      },
      {
        path: "inventory",
        element: (
          <ProtectedRoute requiredRole="vendor">
            <Inventory />
          </ProtectedRoute>
        ),
      },
      {
        path: "orders",
        element: (
          <ProtectedRoute requiredRole="vendor">
            {/* Component to see orders containing vendor products */}
            <div className="text-white">Vendor Order Management</div>
          </ProtectedRoute>
        ),
      },
    ],
  },
  { path: "*", element: <NotFound /> },
]);