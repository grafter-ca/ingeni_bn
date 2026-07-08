import { useState, useEffect } from "react";
import { useAuthState } from "../../context/AuthContext";
import AuthPromptModal from "./AuthPromptModal";
import { Navigate, Outlet } from "react-router-dom";
import type { UserRole } from "../../types/api";

type Props = { 
  children?: React.ReactNode; // Optional: used when wrapping a single component
  requiredRole?: UserRole;
};

const ProtectedRoute = ({ children, requiredRole }: Props) => {
  const { user, isLoading, isAuthenticated } = useAuthState();
  const [showModal, setShowModal] = useState(false);
  
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Sync modal visibility with auth state
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowModal(true);
    }
  }, [isAuthenticated, isLoading]);

  // 1. Loading Guard: Prevents UI flickering during session rehydration
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // 2. Authorization Guard
  if (isAuthenticated && user) {
    // If a specific role is required (admin/vendor) and user doesn't have it
    if (requiredRole && user.role !== requiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
    
    // Renders children if provided manually, otherwise renders the nested route via Outlet
    return children ? <>{children}</> : <Outlet />;
  }

  // 3. Guest/Locked State: Blurred UI and Auth Modal
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center blur-md pointer-events-none select-none px-4 text-center">
         <div className="p-8 bg-white rounded-3xl shadow-xl max-w-sm border border-gray-100">
            <div className="h-12 w-12 bg-gray-200 rounded-full mb-4 mx-auto animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 rounded mb-2 mx-auto animate-pulse" />
            <p className="text-gray-400 font-medium font-poppins">Please sign in to access this section</p>
         </div>
      </div>
      
      <AuthPromptModal 
        isOpen={showModal} 
        onClose={handleCloseModal} 
      />
    </div>
  );
};

export default ProtectedRoute;