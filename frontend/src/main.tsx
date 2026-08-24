import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import "./global.css";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import './libs/socket.client';
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
     <AuthProvider>          
      <RouterProvider router={router} /> 
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            fontFamily: 'Poppins, sans-serif',
            borderRadius: '8px',
          },
          success: {
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#f87171',
              secondary: '#fff',
            },
          },
        }}
      />
     </AuthProvider>
  </React.StrictMode>
);   