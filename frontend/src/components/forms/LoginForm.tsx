// import React, { useRef } from "react";
import Button from "../ui/Button";
import { Input } from "../ui/Input";
import type { LoginPayload } from "../../types/api";
import { Link } from "react-router-dom";
// import HCaptcha from "@hcaptcha/react-hcaptcha";

interface LoginFormProps {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleChange: (field: keyof LoginPayload, value: string) => void;
  error: string | null;
  formData: LoginPayload;
  loading?: boolean;
// setCaptchaToken: Dispatch<SetStateAction<string | undefined>>;
//   onCaptchaChange: (token:string) => void;
}


const LoginForm: React.FC<LoginFormProps> = ({ 
  handleSubmit, 
  handleChange, 
  // onCaptchaChange,
  error, 
  formData, 
  loading 
}) => {
  // const captchaRef = useRef<HCaptcha>(null);
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
       
       {/* <div className="flex justify-center my-4">
                   <HCaptcha
                     sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY || "72ca1ee4-305c-4888-a7f2-47ca0c2ef752"}
                     onVerify={onCaptchaChange}
                     ref={captchaRef}
                      theme="dark"
                  {...(import.meta.env.MODE === "development" ? { disabled: true } : {})}
                   />
                 </div> */}

      {/* API Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 p-3 rounded">
          <p className="text-red-500 text-xs text-center font-poppins">{error}</p>
        </div>
      )}
      <div className="flex -mb-2 justify-end">
        <Link to="#forgot-password" className="text-xs text-gray-400 hover:text-white transition-colors">
          Forgot Password?
        </Link>
      </div>

      <Button
        type="submit"
        disabled={loading}
        label={loading ? "Verifying..." : "Login"}
      />
      
    </form>
  );
};

export default LoginForm;