import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RegisterForm from "../../components/forms/RegisterForm";
import { useAuthState, useAuthActions } from "../../context/AuthContext";
import type { RegisterPayloadProps } from "../../types/api";

const Register: React.FC = () => {
  const navigate = useNavigate();
  
  const { user, isLoading, error } = useAuthState();
  const { register } = useAuthActions();

  const [formData, setFormData] = useState<RegisterPayloadProps>({
    name: "",
    email: "",
    password: "",
    country: "",
    phone: ""
  });

  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [localError, setLocalError] = useState<string | null>(null);

  /**
   * CENTRAL REDIRECT LOGIC
   * Once 'register' succeeds, Better-Auth updates the session.
   * This effect detects the new 'user' and sends them to the right place.
   */
  useEffect(() => {
    if (user && !isLoading) {
      const userRole = user.role?.toLowerCase();
      console.log("Registration successful. Role detected:", userRole);
      
      switch (userRole) {
        case "admin":
          navigate("/admin", { replace: true });
          break;
        case "vendor":
          navigate("/vendor/inventory", { replace: true });
          break;
        case "user":
        default:
          navigate("/products", { replace: true });
          break;
      }
    }
  }, [user, isLoading, navigate]);

  /**
   * FIELD CHANGE HANDLER
   */
  const handleChange = useCallback(
    (field: keyof RegisterPayloadProps, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      
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

      // Local Validations
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

      setLocalError(null);
      
      try {
        // After this call, 'user' state in context will update,
        // triggering the useEffect above.
        await register(formData);
      } catch (err) {
        console.error("Registration flow failed:", err);
      }
    },
    [formData, confirmPassword, register]
  );

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="w-90 md:w-100 max-w-125 mx-auto bg-gray-800 p-8 flex flex-col gap-6 shadow-2xl rounded-xl border border-gray-700">
        
        <header className="flex flex-col items-center text-center gap-2">
          <img src="/logo.png" className="w-16 h-16 object-contain" alt="Ingeri Logo" />
          <h1 className="text-2xl font-bold text-white tracking-tight font-poppins">
            Join Ingeri
          </h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-poppins">
            Create your account today
          </p>
        </header>

        <RegisterForm
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          error={localError || error} 
          formData={formData}
          loading={isLoading}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
        />

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