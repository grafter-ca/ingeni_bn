// src/pages/Register.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { PhoneInput } from "react-international-phone";
import CountrySelect from "../components/ui/CountrySelect";
import { useAuthActions } from "../context/AuthContext";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuthActions();

  const [step, setStep] = useState(1); // Step 1: Credentials, Step 2: Personal Info
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

  const handleNextStep = (e: React.FormEvent) => {
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
      setStep(2); // Move to phone & country step
    } else {
      handleSubmitFinal();
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

      alert("Registration successful! Please check your email to verify your account.");
      navigate("/login", { replace: true });
    } catch (err: any) {
      setLocalError(err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="w-90 md:w-100 max-w-125 mx-auto bg-gray-800 p-8 flex flex-col gap-6 shadow-2xl rounded-xl border border-gray-700">
        <header className="flex flex-col items-center text-center gap-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">Join Ingeri</h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest">
            Step {step} of 2: {step === 1 ? "Account Credentials" : "Personal Information"}
          </p>
        </header>

        <form onSubmit={handleNextStep} className="flex flex-col gap-4">
          {step === 1 ? (
            <>
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
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
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={(val: string) => handleChange("password", val)}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(val: string) => handleChange("confirmPassword", val)}
              />
              <Button label="Continue" type="submit" />
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-white font-mono text-sm ml-1">Phone Number</label>
                <PhoneInput
                  defaultCountry="rw"
                  value={formData.phone}
                  onChange={(phone) => handleChange("phone", phone)}
                  inputClassName="!w-full !bg-gray-700 !text-white !border-gray-600 !h-10 !rounded-r"
                  countrySelectorStyleProps={{
                    buttonClassName: "!bg-gray-700 !border-gray-600 !pl-4 !h-10 !rounded-l",
                  }}
                />
              </div>

              <CountrySelect
                value={formData.country}
                onChange={(country: string) => handleChange("country", country)}
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-gray-700 text-white rounded font-medium hover:bg-gray-600 transition-colors"
                >
                  Back
                </button>
                <Button disabled={loading} label={loading ? "Registering..." : "Complete Signup"} type="submit" />
              </div>
            </>
          )}

          {localError && (
            <div className="bg-red-500/10 border border-red-500/50 p-3 rounded">
              <p className="text-red-500 text-xs text-center">{localError}</p>
            </div>
          )}
        </form>

        <footer className="text-center">
          <p className="text-gray-400 text-xs">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300">
              Sign In
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Register;