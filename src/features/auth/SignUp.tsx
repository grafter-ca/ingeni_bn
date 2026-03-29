import React from "react";
import type { RegisterProps } from "../../types";
import RegisterForm from "../../components/forms/RegisterForm";
import { Link, useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<RegisterProps>({});
  const [confirmPassword, setConfirmPassword] = React.useState<string>("");
  const [isConfirmEdPassword, setIsConfirmEdPassword] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleChange = (field: keyof RegisterProps, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (isConfirmEdPassword && formData.password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      setIsConfirmEdPassword(true);
      setConfirmPassword(formData.password ?? "");
      setError(null);
      console.log("Form submitted", formData);
      setFormData({});
      setTimeout(() => {
        navigate('/login');
      }, 500);
    } catch (err) {
      setError("An error occurred during registration");
    }finally {      
      setLoading(false);
    }
  };

  return (
    <div className="Register bg-gray-700 text-white p-6 mb-8">
      <header className="flex flex-col items-center gap-2">
      <img src="/logo.png" alt="Ingeni Logo" className="w-32 h-32 mx-auto" />
      <h1 className="text-gray-400 font-bold text-2xl">Welcome to Ingeni Online Store</h1>
      <h2 className="text-gray-400 font-medium text-xl">Create New Account</h2>
      </header>
      < RegisterForm handleSubmit={handleSubmit} handleChange={handleChange} error={error} formData={formData} loading={loading} />
      <div>
        <p className="text-gray-400 text-xs mt-4">
          Already have an account? <Link to="/login" className="text-gray-200 underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;