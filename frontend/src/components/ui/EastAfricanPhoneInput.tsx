// src/components/ui/EastAfricanPhoneInput.tsx
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface CountryOption {
  code: string;
  name: string;
  dialCode: string;
}

const EAST_AFRICAN_COUNTRIES: CountryOption[] = [
  { code: "RW", name: "Rwanda", dialCode: "+250" },
  { code: "KE", name: "Kenya", dialCode: "+254" },
  { code: "UG", name: "Uganda", dialCode: "+256" },
  { code: "TZ", name: "Tanzania", dialCode: "+255" },
  { code: "BI", name: "Burundi", dialCode: "+257" },
  { code: "SS", name: "South Sudan", dialCode: "+211" },
  { code: "CD", name: "DR Congo", dialCode: "+243" },
];

// Helper to convert country code (e.g., "RW") to flag emoji
const getFlagEmoji = (countryCode: string) => {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

interface EastAfricanPhoneInputProps {
  value: string;
  onChange: (fullNumber: string) => void;
  placeholder?: string;
}

export const EastAfricanPhoneInput: React.FC<EastAfricanPhoneInputProps> = ({
  value,
  onChange,
  placeholder = "780000000",
}) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(EAST_AFRICAN_COUNTRIES[0]);
  const [isOpen, setIsOpen] = useState(false);
  
  // Extract local number if value already has a dial code, or initialize empty
  const getInitialLocalNumber = () => {
    for (const country of EAST_AFRICAN_COUNTRIES) {
      if (value.startsWith(country.dialCode)) {
        return value.slice(country.dialCode.length);
      }
    }
    return value;
  };

  const [localNumber, setLocalNumber] = useState(getInitialLocalNumber);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setLocalNumber(val);
    onChange(`${selectedCountry.dialCode}${val}`);
  };

  const handleSelectCountry = (country: CountryOption) => {
    setSelectedCountry(country);
    setIsOpen(false);
    onChange(`${country.dialCode}${localNumber}`);
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center w-full bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 rounded-xl h-11 focus-within:border-blue-500 transition-colors">
        {/* Country Code Selector Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 h-full border-r border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white text-xs font-mono bg-zinc-50 dark:bg-white/[0.02] hover:bg-zinc-100 dark:hover:bg-white/[0.06] rounded-l-xl transition-colors shrink-0 cursor-pointer"
        >
          <span className="text-sm">{getFlagEmoji(selectedCountry.code)}</span>
          <span>{selectedCountry.dialCode}</span>
          <ChevronDown size={14} className="text-zinc-500 dark:text-gray-400" />
        </button>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={localNumber}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full bg-transparent border-none outline-none text-zinc-900 dark:text-white text-sm px-3 placeholder:text-zinc-400 dark:placeholder:text-gray-600 font-mono"
        />
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute top-12 left-0 z-50 w-60 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden py-1">
          {EAST_AFRICAN_COUNTRIES.map((country) => (
            <button
              key={country.code}
              type="button"
              onClick={() => handleSelectCountry(country)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left text-zinc-700 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-white/[0.08] hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{getFlagEmoji(country.code)}</span>
                <span className="font-medium">{country.name}</span>
              </div>
              <span className="font-mono text-zinc-500 dark:text-gray-400">{country.dialCode}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};