import React from "react";
import { RegisterFields } from "../../constants";
import Button from "../ui/Button";
import CountrySelect from "../ui/CountrySelect";
import { Input } from "../ui/Input";
import type { RegisterProps } from "../../types";

interface RegisterFormProps {
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    handleChange: (field: keyof RegisterProps, value: string) => void;
    error: string | null;
    formData: RegisterProps;
    loading?: boolean;
    confirmPassword: string;
    setConfirmPassword: React.Dispatch<React.SetStateAction<string>>;
}

export default function RegisterForm({handleSubmit, handleChange,error,formData,loading,confirmPassword,setConfirmPassword}: RegisterFormProps) {
   return(
    <form className="flex flex-col gap-2 mt-4 max-w-md mx-auto w-full px-4" onSubmit={handleSubmit}>

        {/* Dynamic fields */}
        {RegisterFields.map((field) => (
          <Input
            key={field.label}
            label={field.label}
            type={field.type}
            placeholder={field.placeholder}
            onChange={(value) => handleChange(field.field, value)}
            value={formData[field.field] ?? ""}
            error={error ?.includes(field.field) ? error : " " }
          />
        ))}

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm Password"
          onChange={(value) => setConfirmPassword(value)}
          value={confirmPassword}
        />
        
        {/* Error message */}
        {error && <p className="font-poppins text-xs text-red-500">{error}</p>}

        {/* Country — now connected */}
        <CountrySelect
          value={formData.country ?? ""}
          onChange={(val) => handleChange("country", val)} // 
        />

        <Button disabled={loading} label={loading ? "Registering..." : "Register"} className="hover:bg-gray-800 hover:shadow shadow-gray-700 transition-all duration-700" />
      </form>
   )
}
