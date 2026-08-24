// src/pages/Login.tsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuthActions, useAuthState } from "../context/AuthContext";
import { Store, ArrowLeft } from "lucide-react";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthActions();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, isLoading } = useAuthState();

  useEffect(() => {
    if (user && !isLoading) {
      // 1. Check if the user was trying to access a specific guarded route
      const from = (location.state as any)?.from?.pathname;
      
      if (from) {
        navigate(from, { replace: true });
        return;
      }

      const userRole = user.role?.toLowerCase();

      console.log("Auth success. Role detected:", userRole);

      switch (userRole) {
        case "admin":
          navigate("/admin", { replace: true });
          break;
        case "vendor":
          navigate("/vendor", { replace: true });
          break;
        case "user":
        default:
          navigate("/products", { replace: true });
          break;
      }
    }
  }, [user, isLoading, navigate, location]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (localError) setLocalError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setLocalError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setLocalError(null);

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
      
    } catch (err: any) {
      setLocalError(err?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#050505] flex flex-col justify-between px-4 py-6 md:py-8 text-zinc-900 dark:text-white transition-colors">
      {/* Top Header with Back to Home button */}
      <header className="w-full max-w-md mb-4 mx-auto">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white bg-white dark:bg-white/[0.03] hover:bg-zinc-100 dark:hover:bg-white/[0.08] border border-zinc-200 dark:border-blue-600 px-3.5 py-2 rounded-xl transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft size={14} /> Back Home
        </button>
      </header>

      {/* Main Form Container */}
      <div className="w-full max-w-md bg-white dark:bg-[#0a0a0a] p-6 md:p-8 flex flex-col gap-6 shadow-2xl rounded-3xl border border-zinc-200 dark:border-white/10 my-auto mx-auto transition-colors">
        <div className="flex flex-col items-center text-center gap-2 border-b border-zinc-100 dark:border-white/10 pb-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-1">
            <Store size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-xs text-zinc-500 dark:text-gray-400">
            Sign in to access your Ingeri storefront and manage your marketplace activities.
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="space-y-1">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(val: string) => handleChange("email", val)}
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center ml-1">
              <label className="text-zinc-700 dark:text-gray-300 font-mono text-xs">Password</label>
              <Link 
                to="#" 
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              label=""
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(val: string) => handleChange("password", val)}
            />
          </div>

          {localError && (
            <div className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl">
              <p className="text-red-600 dark:text-red-400 text-xs text-center font-medium">{localError}</p>
            </div>
          )}

          <div className="pt-2">
            <Button 
              disabled={loading} 
              label={
                loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )
              } 
              type="submit" 
            />
          </div>
        </form>

        <footer className="text-center pt-2 border-t border-zinc-100 dark:border-white/5">
          <p className="text-zinc-500 dark:text-gray-400 text-xs">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
              Create an account
            </Link>
          </p>
        </footer>
      </div>

      {/* Empty footer space to balance flex layout */}
      <div className="max-w-md w-full mx-auto hidden md:block" />
    </div>
  );
};

export default Login;