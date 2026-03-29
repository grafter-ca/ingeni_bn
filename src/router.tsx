import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import  Register  from "./pages/Register";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import App from "./App";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,       // ✅ shared layout wraps all pages
    children: [
      { index: true,            element: <App />     },
      {path: "about",           element: <About /> }, 
      { path: "login",          element: <Login />    },
      { path: "register",       element: <Register /> },
      { path: "*",              element: <NotFound /> }, // 404
    ],
  },
]);