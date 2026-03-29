import React from "react";
import type { LoginProps } from "../../types";
import LoginForm from "../../components/forms/LoginForm";
import { Link, useNavigate } from "react-router-dom";

const Login: React.FC = () => {
     const navigate = useNavigate();

  const [error, setError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<LoginProps>({});
    const [loading, setLoading] = React.useState<boolean>(false);


  const handleChange = (field: keyof LoginProps, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setError(null);
      alert("Login successful!");
      console.log("Form submitted", formData);
      setFormData({});
      navigate("/"); // Redirect to home page after successful login
    } catch (err) {
      setError("An error occurred during login");
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="Register bg-gray-700 text-white p-6 mb-8">
      <header className="flex flex-col items-center gap-2">
      <img src="/logo.png" alt="Ingeni Logo" className="w-32 h-32 mx-auto" />
      <h1 className="text-gray-400 font-bold text-2xl">Welcome to Ingeni Online Store</h1>
      <h2 className="text-gray-400 font-medium text-xl">Login To Your Account</h2>
      </header>
      < LoginForm handleSubmit={handleSubmit} handleChange={handleChange} error={error} formData={formData} loading={loading} />
      <div>
        <p className="text-gray-400 text-xs mt-4">
          Don't have an account? <Link to="/register" className="text-gray-200 underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;