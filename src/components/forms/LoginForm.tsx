import React from "react";
import Button from "../ui/Button";
import { Input } from "../ui/Input";
import type { LoginPayload } from "../../types/api";
import { Link } from "react-router-dom";

interface LoginFormProps {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleChange: (field: keyof LoginPayload, value: string) => void;
  error: string | null;
  formData: LoginPayload;
  loading?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  handleSubmit, 
  handleChange, 
  error, 
  formData, 
  loading 
}) => {
  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <Input
        label="Email Address"
        type="email"
        placeholder="name@example.com"
        value={formData.email}
        onChange={(val) => handleChange("email", val)}
        required
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        value={formData.password}
        onChange={(val) => handleChange("password", val)}
        required
      />

      {/* API Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 p-3 rounded">
          <p className="text-red-500 text-xs text-center font-poppins">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        label={loading ? "Verifying..." : "Login"}
      />
      
      <div className="flex justify-end">
        <Link to="#forgot-password" className="text-xs text-gray-400 hover:text-white transition-colors">
          Forgot Password?
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;