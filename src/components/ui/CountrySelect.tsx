// components/CountrySelect.tsx
import { getData } from "country-list";

type CountrySelectProps = {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
};

const CountrySelect = ({
  value,
  onChange,
  label = "Country",
  error,
}: CountrySelectProps) => {
  
    const countries  = getData();

  return (
    <div  className="flex flex-col gap-1 w-full max-w-xs">
      
      {/* Label */}
      {label && (
        <label className="font-poppins text-sm font-medium text-white uppercase tracking-widest">
          {label}
        </label>
      )}

      {/* Select */}
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={`rounded bg-transparent font-poppins w-full px-4 py-3 border text-gray-900 border-gray-300 focus:border-gray-900 focus:outline-none transition-colors
          ${error ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-gray-900"}`}
      >
        <option value="">Select a country</option>
        {countries.map((country) => (
          <option key={country.code} className="max-w-40" value={country.name}>
            {country.name}
          </option>
        ))}
      </select>

      {/* Error */}
      {error && (
        <p className="font-poppins text-xs text-red-500">{error}</p>
      )}

    </div>
  );
};

export default CountrySelect;