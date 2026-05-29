// components/CountrySelect.tsx
import Select from "react-select";
import { getData } from "country-list";

type CountrySelectProps = {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
};

const CountrySelect = ({ value, onChange, label = "Country", error }: CountrySelectProps) => {
  const options = getData().map((c) => ({
    value: c.code,
    label: c.name,
  }));

  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <div className="flex flex-col gap-1 w-full mb-4">

      {label && (
        <label className="font-poppins text-sm font-medium text-white capitalize tracking-widest">
          {label}
        </label>
      )}

      <Select
        options={options}
        value={selected}
        onChange={(option) => onChange?.(option?.value ?? "")}
        placeholder="Select a country"
        styles={{
          control: (base) => ({
            ...base,
            fontFamily: "Poppins, sans-serif",
            borderColor: error ? "#ef4444" : "#d1d5db",
            boxShadow: "none",
            "&:hover": { borderColor: error ? "#ef4444" : "#111827" },
          }),
          menu: (base) => ({
            ...base,
            width: "100%",       // ✅ dropdown matches input width
            fontFamily: "Poppins, sans-serif",
            fontSize: "0.875rem",
          }),
          option: (base, state) => ({
            ...base,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",   // ✅ long names get truncated
            backgroundColor: state.isSelected ? "transparent" : state.isFocused ? "#f3f4f6" : "white",
            color: state.isSelected ? "white" : "#111827",
          }),
        }}
      />

      {error && (
        <p className="font-poppins text-xs text-red-500">{error}</p>
      )}

    </div>
  );
};

export default CountrySelect;