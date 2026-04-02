import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { LoginPayload } from "../../types/api";
import LoginForm from "../../components/forms/LoginForm";
import { useAuth } from "../../context/AuthContext";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { login, isLoading, error, clearError, user } = useAuth();

  const [formData, setFormData] = useState<LoginPayload>({
    email: "",
    password: "",
  });

  /**
   * ROLE-BASED REDIRECT LOGIC
   * Maps the user's role to the specific dashboard route.
   */
  useEffect(() => {
    if (user) {
      // 1. Check if user was redirected from a specific protected page
      const from = (location.state as any)?.from?.pathname;
      
      if (from) {
        navigate(from, { replace: true });
        return;
      }

      // 2. Otherwise, route based on their Prisma Role
      switch (user.role) {
        case "ADMIN":
          navigate("/admin", { replace: true });
          break;
        case "VENDOR":
          navigate("/vendor/inventory", { replace: true });
          break;
        default:
          navigate("/products", { replace: true });
          break;
      }
    }
  }, [user, navigate, location]);

  const handleChange = useCallback(
    (field: keyof LoginPayload, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (error) clearError(); 
    },
    [error, clearError]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!formData.email || !formData.password) return;
      await login(formData);
    },
    [formData, login]
  );

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
      <div className="w-100 max-w-125 mx-auto bg-gray-800 p-8 flex flex-col gap-6 shadow-2xl rounded-xl border border-gray-700">
        <header className="flex flex-col items-center gap-2 text-center">
          <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
          <h1 className="font-poppins font-bold text-2xl text-white">Welcome Back</h1>
          <p className="font-poppins text-xs text-gray-400 uppercase tracking-widest">
            Access your {user?.role || "Ingeri"} account
          </p>
        </header>

        <LoginForm
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          error={error}
          formData={formData}
          loading={isLoading}
        />

        <div className="flex flex-col gap-4">
          <p className="font-poppins text-gray-400 text-xs text-center">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-400 font-semibold hover:text-indigo-300">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;