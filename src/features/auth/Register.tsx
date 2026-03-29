import React from "react";
import type { RegisterProps } from "../../types";
import RegisterForm from "../../components/forms/RegisterForm";

export const Register: React.FC = () => {
  const [error, setError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<RegisterProps>({});
  const [confirmPassword, setConfirmPassword] = React.useState<string>("");
  const [isConfirmEdPassword, setIsConfirmEdPassword] = React.useState<boolean>(false);

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
      alert("Registration successful!");
      console.log("Form submitted", formData);
      setFormData({});
    } catch (err) {
      setError("An error occurred during registration");
    }
  };

  return (
    <div className="Register bg-gray-700 text-white p-6 mb-8">
      <h1 className="text-gray-400 font-bold">Welcome to Ingeni Online Store</h1>
      <h2 className="text-gray-400 font-medium text-sm">Register Account</h2>
      < RegisterForm handleSubmit={handleSubmit} handleChange={handleChange} error={error} formData={formData} />
    </div>
  );
}