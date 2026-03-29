import React, { useCallback } from "react";
import type { RegisterProps } from "../../types";
import RegisterForm from "../../components/forms/RegisterForm";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth(); // ✅ real auth

  const [formData, setFormData] = React.useState<RegisterProps>({});
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = React.useState<string>("");

  // Merge local validation error with API error
  const displayError = localError ?? error;

  // useCallback — stable reference
  const handleChange = useCallback(
    (field: keyof RegisterProps, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // ✅ clear both errors when user starts typing
      if (localError) setLocalError(null);
      if (error) clearError();
    },
    [error, localError, clearError]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // ✅ local validation before hitting API
      if (!formData.name || !formData.email || !formData.password) {
        setLocalError("Please fill in all required fields");
        return;
      }

      if (formData.password !== confirmPassword) {
        setLocalError("Passwords do not match");
        return;
      }

      if (formData.password.length < 6) {
        setLocalError("Password must be at least 6 characters");
        return;
      }

      setLocalError(null);

      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      }); // ✅ calls real API → auto-login → sets user in context

      // Only navigate if no API error after registration
      if (!error) {
        setFormData({});
        setConfirmPassword("");
        navigate("/"); // ✅ auto-login redirects home
      }
    },
    [formData, register, error, navigate]
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
            Join Ingeni
          </h1>
          <p className="font-poppins text-sm text-gray-400 uppercase tracking-widest">
            Create your account
          </p>
        </header>

        {/* Form */}
        <RegisterForm
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          error={displayError}      // ✅ shows local or API error
          formData={formData}
          loading={isLoading}       // ✅ loading from context
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
        />

        {/* Footer */}
        <p className="font-poppins text-gray-400 text-xs text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-white underline hover:text-gray-300 transition-colors"
          >
            Login here
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;