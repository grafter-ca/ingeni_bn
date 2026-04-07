import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { LoginPayload } from "../../types/api";
import LoginForm from "../../components/forms/LoginForm";
import { useAuthState, useAuthActions } from "../../context/AuthContext";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user, isLoading, error } = useAuthState();
  const { login } = useAuthActions();

  // Fix: Initialize state properly
  const [captchaToken, setCaptchaToken] = useState<string | undefined>();
   
  const [formData, setFormData] = useState<LoginPayload>({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || "/products";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleChange = useCallback((field: keyof LoginPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const onCaptchaChange = (token: string) => {
    setCaptchaToken(token);
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      
      if (!formData.email || !formData.password) return;

      if (!captchaToken) {
        alert("Please complete the captcha.");
        return;
      }

      try {
        await login(formData, captchaToken);
        // Better-Auth handles session

         useEffect(() => {
           if (user) {
             const userRole = user.role;
             console.log("user role from login",userRole)
             
             switch (userRole) {
               case "admin":
                 navigate("/admin", { replace: true });
                 break;
               case "vendor":
                 // Vendors go to their specific inventory/onboarding
                 navigate("/vendor/inventory", { replace: true });
                 break;
               default:
                 navigate("/products", { replace: true });
                 break;
             }
           }
         }, [user, navigate]);
       


      } catch (err) {
        setCaptchaToken(undefined);
        // Note: The child component's HCaptcha ref would need to be reset here 
        // if you want to force a visual refresh of the widget on error.
      }
    },
    [formData, login, captchaToken]
  );

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
      <div className="w-full md:w-100 max-w-125 mx-auto bg-gray-800 p-8 flex flex-col gap-6 shadow-2xl rounded-xl border border-gray-700">
        <header className="flex flex-col items-center gap-2 text-center">
          <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
          <h1 className="font-poppins font-bold text-2xl text-white">Welcome Back</h1>
          <p className="font-poppins text-xs text-gray-400 uppercase tracking-widest">
            {user ? `Signed in as ${user.role}` : "Secure Member Login"}
          </p>
        </header>

        <LoginForm
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          setCaptchaToken={setCaptchaToken} // Passing the function, not a string
          onCaptchaChange={onCaptchaChange}
          error={error}
          formData={formData}
          loading={isLoading}
        />

        <footer className="flex flex-col gap-4">
          <p className="font-poppins text-gray-400 text-xs text-center">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-400 font-semibold hover:text-indigo-300">
              Register here
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Login;