import React, { useCallback } from "react";
import type { LoginProps } from "../../types";
import LoginForm from "../../components/forms/LoginForm";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth(); // ✅ real auth

  const [formData, setFormData] = React.useState<LoginProps>({});

  // useCallback — stable reference, avoids re-renders
  const handleChange = useCallback(
    (field: keyof LoginProps, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (error) clearError(); // ✅ clear API error when user starts typing
    },
    [error, clearError],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const location = useLocation();
      const from =
        (location.state as { from?: Location })?.from?.pathname ?? "/";
      // After successful login:
      if (!formData.email || !formData.password) return;

      await login({
        email: formData.email,
        password: formData.password,
      }); // ✅ calls real API, sets user in context

      // Only navigate if no error after login attempt
      if (!error) {
        setFormData({});
        navigate(from, { replace: true }); // ✅ returns user to where they came from
      }
    },
    [formData, login, error, navigate],
  );

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-800 p-8 flex flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col items-center gap-2 text-center">
          <img
            src="/logo.png"
            alt="Ingeni Logo"
            className="w-20 h-20 mx-auto object-contain"
          />
          <h1 className="font-poppins font-bold text-2xl text-white tracking-wide">
            Welcome Back
          </h1>
          <p className="font-poppins text-sm text-gray-400 uppercase tracking-widest">
            Login to your account
          </p>
        </header>

        {/* Form */}
        <LoginForm
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          error={error} // ✅ API error from context
          formData={formData}
          loading={isLoading} // ✅ loading state from context
        />

        {/* Footer */}
        <p className="font-poppins text-gray-400 text-xs text-center">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-white underline hover:text-gray-300 transition-colors"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
