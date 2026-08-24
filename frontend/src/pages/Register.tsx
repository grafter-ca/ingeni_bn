// src/pages/Register.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { EastAfricanPhoneInput } from "../components/ui/EastAfricanPhoneInput";
import CountrySelect from "../components/ui/CountrySelect";
import { useAuthActions } from "../context/AuthContext";
import { ArrowLeft, MailCheck } from "lucide-react";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuthActions();

  const [step, setStep] = useState(1); 
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "Rwanda",
    phone: "",
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (localError) setLocalError(null);
  };

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.email || !formData.password || !formData.name) {
        setLocalError("Please fill in all required fields.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setLocalError("Passwords do not match.");
        return;
      }
      if (formData.password.length < 8) {
        setLocalError("Password must be at least 8 characters.");
        return;
      }
      setLocalError(null);
      setStep(2); 
    } else {
      await handleSubmitFinal();
    }
  };

  const handleSubmitFinal = async () => {
    if (!formData.phone || formData.phone.length < 10) {
      setLocalError("Please enter a valid phone number.");
      return;
    }

    setLoading(true);
    setLocalError(null);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        country: formData.country,
      });
      setIsSubmitted(true);
    } catch (err: any) {
      setLocalError(err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#050505] flex flex-col justify-between px-4 py-6 md:py-8 text-zinc-900 dark:text-white transition-colors">
        <header className="max-w-md w-full mx-auto">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white bg-white dark:bg-white/[0.03] hover:bg-zinc-100 dark:hover:bg-white/[0.08] border border-zinc-200 dark:border-white/10 px-3.5 py-2 rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            <ArrowLeft size={14} /> Back Home
          </button>
        </header>

        <div className="w-full max-w-md bg-white dark:bg-[#0a0a0a] p-6 md:p-8 flex flex-col items-center text-center gap-6 shadow-2xl rounded-3xl border border-zinc-200 dark:border-white/10 my-auto mx-auto transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-1">
            <MailCheck size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
            <p className="text-sm text-zinc-500 dark:text-gray-400">
              We've sent a verification link to <span className="text-zinc-900 dark:text-white font-medium">{formData.email}</span>. Please check your inbox to activate your account.
            </p>
          </div>

          <div className="w-full pt-4 border-t border-zinc-100 dark:border-white/10">
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium h-11 rounded-xl transition-colors text-sm cursor-pointer shadow-lg shadow-blue-600/25"
            >
              Proceed to Sign In
            </button>
          </div>
        </div>
        <div className="max-w-md w-full mx-auto hidden md:block" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#050505] flex flex-col justify-between px-4 py-6 md:py-8 text-zinc-900 dark:text-white transition-colors">
      <header className="w-full max-w-md mx-auto mb-4">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white bg-white dark:bg-white/[0.03] hover:bg-zinc-100 dark:hover:bg-white/[0.08] border border-zinc-200 dark:border-blue-600 px-3.5 py-2 rounded-xl transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft size={14} /> Back Home
        </button>
      </header>

      <div className="w-full max-w-md bg-white dark:bg-[#0a0a0a] p-6 md:p-8 flex flex-col gap-6 shadow-2xl rounded-3xl border border-zinc-200 dark:border-white/10 my-auto mx-auto transition-colors">
        <div className="flex flex-col items-center text-center gap-2 border-b border-zinc-100 dark:border-white/10 pb-4">
          <h1 className="text-2xl font-bold tracking-tight">Join Ingeri</h1>
          <p className="text-xs text-zinc-500 dark:text-gray-400 uppercase tracking-widest font-mono">
            Step {step} of 2: {step === 1 ? "Account Credentials" : "Personal Information"}
          </p>
        </div>

        <form onSubmit={handleNextStep} className="flex flex-col gap-4">
          {step === 1 ? (
            <>
              <Input
                label="Name"
                type="text"
                placeholder="Full name"
                value={formData.name}
                onChange={(val: string) => handleChange("name", val)}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(val: string) => handleChange("email", val)}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(val: string) => handleChange("password", val)}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(val: string) => handleChange("confirmPassword", val)}
              />
              <div className="pt-2">
                <Button label="Continue" type="submit" />
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-700 dark:text-gray-300 font-mono text-xs ml-1">Phone Number</label>
                <EastAfricanPhoneInput
                  value={formData.phone}
                  onChange={(phone: string) => handleChange("phone", phone)}
                />
              </div>

              <CountrySelect
                value={formData.country}
                onChange={(country: string) => handleChange("country", country)}
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-gray-300 rounded-xl font-medium hover:bg-zinc-200 dark:hover:bg-white/15 transition-colors border border-zinc-200 dark:border-white/10 h-11 text-sm flex items-center justify-center cursor-pointer"
                >
                  Back
                </button>
                <div className="w-2/3">
                  <Button 
                    disabled={loading} 
                    label={
                      loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                          </svg>
                          <span>Registering...</span>
                        </div>
                      ) : (
                        "Complete Signup"
                      )
                    } 
                    type="submit" 
                  />
                </div>
              </div>
            </>
          )}

          {localError && (
            <div className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl">
              <p className="text-red-600 dark:text-red-400 text-xs text-center font-medium">{localError}</p>
            </div>
          )}
        </form>

        <footer className="text-center pt-2 border-t border-zinc-100 dark:border-white/5">
          <p className="text-zinc-500 dark:text-gray-400 text-xs">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
              Sign In
            </Link>
          </p>
        </footer>
      </div>
      <div className="max-w-md w-full mx-auto hidden md:block" />
    </div>
  );
};

export default Register;