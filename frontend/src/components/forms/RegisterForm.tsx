import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css"; // Required styles
import { RegisterFields } from "../../constants";
import Button from "../ui/Button";
import { Input } from "../ui/Input";
import CountrySelect from "../ui/CountrySelect";

export default function RegisterForm({
  handleSubmit,
  handleChange,
  error,
  formData,
  loading,
  confirmPassword,
  setConfirmPassword,
}: any) {
  return (
    <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
      {/* Standard Fields */}
      {RegisterFields.map((field) => (
        <Input
          key={field.label}
          label={field.label}
          type={field.type}
          placeholder={field.placeholder}
          onChange={(value) => handleChange(field.field, value)}
          value={formData[field.field] ?? ""}
        />
      ))}

      <Input
        label="Confirm Password"
        type="password"
        placeholder="Confirm Password"
        onChange={(value) => setConfirmPassword(value)}
        value={confirmPassword}
      />

      {/* Flag & Phone Number Input */}
      <div className="flex flex-col gap-1 ">
        <label className="text-white font-mono capitalize ml-1">
          Phone Number
        </label>
        <PhoneInput
          defaultCountry="rw" // Sets Rwanda as default
          value={formData.phone}
          onChange={(phone) => handleChange("phone", phone)}
          inputClassName="!w-full !bg-gray-700 !text-white !border-gray-600 !h-10 !rounded-r"
          countrySelectorStyleProps={{
            buttonClassName:
              "!bg-gray-700 !border-gray-600 !pl-4 !h-10 !rounded-l",
          }}
        />
      </div>

      <CountrySelect
        value={formData.country}
        onChange={(country) => handleChange("country", country)}
        error={
          error && !formData.country ? "Please select a country." : undefined
        }
      />

      {/* API Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 p-3 rounded">
          <p className="text-red-500 text-xs text-center font-poppins">
            {error}
          </p>
        </div>
      )}

      <Button
        disabled={loading}
        label={loading ? "Creating Account..." : "Register"}
        type="submit"
      />
    </form>
  );
}
