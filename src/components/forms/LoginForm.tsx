import React from "react";
import { LoginFields } from "../../constants";
import Button from "../ui/Button";
import { Input } from "../ui/Input";
import type { LoginProps } from "../../types";

interface LoginFormProps {
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    handleChange: (field: keyof LoginProps, value: string) => void;
    error: string | null;
    formData: LoginProps;
    loading: boolean;
}

export default function LoginForm({handleSubmit, handleChange,error,formData,loading}: LoginFormProps) {
  return (
    <form className="flex flex-col gap-2 mt-4 w-full px-6" onSubmit={handleSubmit}>

        {/* Dynamic fields */}
        {LoginFields.map((field) => (
          <Input
            key={field.label}
            label={field.label}
            type={field.type}
            placeholder={field.placeholder}
            onChange={(value) => handleChange(field.field, value)}
            value={formData[field.field] ?? ""}
          />
        ))}
        {/* Error message */}
        {error && <p className="font-poppins text-xs text-red-500">{error}</p>}

        <Button label={loading ? "Logging in..." : "Login"} className="hover:bg-gray-800 hover:shadow shadow-gray-700 transition-all duration-700" />
      </form>
  )
}
