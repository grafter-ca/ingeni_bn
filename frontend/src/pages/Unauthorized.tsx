import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { useAuthState } from "../context/AuthContext";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuthState();

  // Helper to send users to the right "home" based on their role
  const getHomePath = () => {
    if (user?.role === "admin") return "/admin/dashboard";
    if (user?.role === "vendor") return "/vendor/dashboard";
    return "/";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon with a subtle pulse effect */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6 animate-pulse">
          <ShieldAlert className="text-red-600" size={40} />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-8">
          Sorry, you don't have the required permissions to view this page. 
          If you believe this is an error, please contact the administrator.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
          
          <button
            onClick={() => navigate(getHomePath())}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-medium shadow-sm shadow-green-200"
          >
            <Home size={18} />
            Return Home
          </button>
        </div>

        {user && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
              Logged in as: <span className="text-gray-600">{user.role}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Unauthorized;