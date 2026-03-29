type InputProps = {
    label: string;
    type: string;
    placeholder?: string;
    value?: string;
    name?: string;
    onChange?: (value: string) => void;
    error?: string | undefined;
    className?: string;
};


export const Input = ({ label, type, placeholder, value, onChange, error, className }: InputProps) => {
    return(
        <div className="flex flex-col gap-2 mb-2 -tracking-tight">
        <label htmlFor={label} className="font-poppins form-label text-sm font-medium text-white capitalize tracking-widest">{label}</label>
            <input type={type} placeholder={placeholder} value={value} name={label} onChange={(e) => onChange?.(e.target.value)} className={className ?? "w-full bg-transparent text-gray-400 placeholder:text-gray-600 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 px-3 py-2 rounded"} />
            {error && <p className="font-poppins text-xs text-red-500">{error}</p>}
    </div>
    )
}