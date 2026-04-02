import { useState, useEffect } from "react";
import { useAuthState } from "../../context/AuthContext";
import AuthPromptModal from "./AuthPromptModal";

type Props = { 
  children: React.ReactNode 
  requiredRole?: string; // Optional prop to specify required role for access
};

// Single Responsibility: only handles auth gate logic
const ProtectedRoute = ({ children, requiredRole }: Props) => {
  const { user } = useAuthState();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!user) setShowModal(true);
  }, [user]);


  if (user) {
    if (requiredRole && user.role !== requiredRole) {
      // Handle role-based access control
      return null;
    }
    return <>{children}</>;
  }

  return (
    <>
      {/* Blurred locked background */}
      <div className="min-h-screen bg-gray-900 flex items-center justify-center blur-sm pointer-events-none select-none">
        <p className="text-gray-500 font-poppins text-lg">Your cart is waiting...</p>
      </div>
      <AuthPromptModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};

export default ProtectedRoute;