import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RegisterForm from "../../components/forms/RegisterForm";
import { useAuthState, useAuthActions } from "../../context/AuthContext";
import type { RegisterPayloadProps } from "../../types/api";

const Register: React.FC = () => {
  const navigate = useNavigate();
  
  // 1. Destructure from the updated context hooks
  const { user, isLoading, error } = useAuthState();
  const { register } = useAuthActions();

  const [formData, setFormData] = useState<RegisterPayloadProps>({
    name: "",
    email: "",
    password: "",
    country: "",
    phone: "",
    storeName: "",
  });

  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [localError, setLocalError] = useState<string | null>(null);

  /**
   * SEAMLESS REDIRECT LOGIC
   * Watches the 'user' state. As soon as Better-Auth logs them in, 
   * we push them to the correct dashboard based on their role.
   */
  useEffect(() => {
    if (user) {
      const userRole = user.role?.toLowerCase();
      
      switch (userRole) {
        case "ADMIN":
          navigate("/admin", { replace: true });
          break;
        case "VENDOR":
          // Vendors go to their specific inventory/onboarding
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
      
      // Clear local validation errors when user starts fixing the field
      if (localError) setLocalError(null);
    },
    [localError]
  );

  /**
   * FORM SUBMISSION
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // 2. Comprehensive Local Validations
      if (!formData.name || !formData.email || !formData.password) {
        setLocalError("Please fill in all required fields.");
        return;
      }

      if (formData.password !== confirmPassword) {
        setLocalError("Passwords do not match.");
        return;
      }

      if (formData.password.length < 8) {
        setLocalError("Password must be at least 8 characters.");
        return;
      }

      if (!formData.phone || formData.phone.length < 10) {
        setLocalError("Please enter a valid phone number.");
        return;
      }

      // 3. Clear local errors and trigger Context Register
      setLocalError(null);
      
      try {
        await register(formData);
      } catch (err) {
        console.error("Registration flow failed:", err);
      }
    },
    [formData, confirmPassword, register]
  );


  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg mx-auto bg-gray-800 p-8 flex flex-col gap-6 shadow-2xl rounded-xl border border-gray-700">
        
        {/* Branding */}
        <header className="flex flex-col items-center text-center gap-2">
          <img src="/logo.png" className="w-16 h-16 object-contain" alt="Ingeri Logo" />
          <h1 className="text-2xl font-bold text-white tracking-tight font-poppins">
            Join Ingeri
          </h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-poppins">
            {formData.role === "VENDOR" ? "Setup your vendor store" : "Create your account today"}
          </p>
        </header>

        {/* The Register Form Component */}
        <RegisterForm
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          // Display local validation errors first, then API errors from context
          error={localError || error} 
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