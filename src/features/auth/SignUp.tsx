import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RegisterForm from "../../components/forms/RegisterForm";
import { useAuth } from "../../context/AuthContext";
import type { RegisterPayloadProps } from "../../types/api";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError, user } = useAuth();

  // 1. Initial State
  const [formData, setFormData] = useState<RegisterPayloadProps>({
    name: "",
    email: "",
    password: "",
    country: "",
    phone: "", // This will be mapped to phone in the AuthProvider/Service
  });

  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [localError, setLocalError] = useState<string | null>(null);

  /**
   * SEAMLESS REDIRECT
   * Once the user is successfully registered and logged in by Better-Auth,
   * we redirect them to the shop or onboarding.
   */
  useEffect(() => {
    if (user) {
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
  }, [user, navigate]);

  /**
   * FIELD CHANGE HANDLER
   */
  const handleChange = useCallback(
    (field: keyof RegisterPayloadProps, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      
      // Clean up errors as the user types
      if (localError) setLocalError(null);
      if (error) clearError();
    },
    [error, localError, clearError]
  );

  /**
   * FORM SUBMISSION
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // 2. Local Validations (Before hitting the API)
      if (formData.password !== confirmPassword) {
        setLocalError("Passwords do not match.");
        return;
      }

      if (!formData.phone || formData.phone.length < 10) {
        setLocalError("Please enter a valid phone number.");
        return;
      }

      if (!formData.country) {
        setLocalError("Please select your country.");
        return;
      }

      setLocalError(null);
      
      // 3. Trigger the AuthContext register logic
      // Note: AuthContext/AuthService will map 'phone' to 'phone' for Prisma
      console.log("Submitting registration with data:", formData);
      await register(formData);
    },
    [formData, confirmPassword, register]
  );

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="w-100 max-w-125 mx-auto bg-gray-800 p-8 flex flex-col gap-6 shadow-2xl rounded-xl border border-gray-700">
        
        {/* Branding */}
        <header className="flex flex-col items-center text-center gap-2">
          <img src="/logo.png" className="w-16 h-16 object-contain" alt="Ingeri Logo" />
          <h1 className="text-2xl font-bold text-white tracking-tight font-poppins">
            Join Ingeri
          </h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-poppins">
            Create your account today
          </p>
        </header>

        {/* The Register Form Component */}
        <RegisterForm
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          error={localError ?? error} // Priority: show local validation errors first
          formData={formData}
          loading={isLoading}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
        />

        {/* Footer Links */}
        <footer className="flex flex-col gap-4">
          <p className="font-poppins text-gray-400 text-xs text-center">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
            >
              Sign In here
            </Link>
          </p>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-700"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-gray-800 px-2 text-gray-500 font-poppins">
                Secure 256-bit Encryption
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Register;