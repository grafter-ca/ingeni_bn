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
import Admin from "./pages/Admin";
import AdminLayout from "./components/layout/AdminLayout";
import VendorLayout from "./components/layout/VendorLayout";
import Vendor from "./pages/vendor/VendorPage";
import Inventory from "./pages/vendor/Inventory";
import  VerifyEmail  from "./pages/VerifyEmail";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true,              element: <Home />          },
      { path: "about",            element: <About />         },
      { path: "products",         element: <Products />      },
      { path: "products/:id",     element: <ProductDetail /> },
      { path: "login",            element: <Login />         },
      { path: "register",         element: <Register />      },
      { path: "verify-email",     element: <VerifyEmail />   },
      {
        path: "cart",
        element: (
          <ProtectedRoute>   
            <Cart />
          </ProtectedRoute>
        ),
      },
      { path: "*", element: <NotFound /> },
    ],
    
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <Admin />
          </ProtectedRoute>
        ),
      },
      // Additional admin routes can be added here
    { path: "*", element: <NotFound /> },
    ]
  },
  {
    path: "/vendor",
    element: <VendorLayout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute requiredRole="VENDOR">
            <Vendor />
          </ProtectedRoute>
        ),
      },
      {
       path: "inventory",
       element: (
         <ProtectedRoute requiredRole="VENDOR">
            <Inventory /> 
         </ProtectedRoute>
       )
    },
   { path: "*", element: <NotFound /> },
  ]
  },
  { path: "*", element: <NotFound /> },
]);