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
]);