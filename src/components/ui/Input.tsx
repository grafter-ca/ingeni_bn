type InputProps = {
    label: string;
    type: string;
    placeholder?: string;
    value?: string;
    name?: string;
    onChange?: (value: string) => void;
    error?: string;
};


export const Input = ({ label, type, placeholder, value, onChange, error }: InputProps) => {
    return(
        <div className="flex flex-col -tracking-tight">
        <label htmlFor={label} className="font-poppins text-sm font-medium text-white capitalize tracking-widest">{label}</label>
            <input type={type} placeholder={placeholder} value={value} name={label} onChange={(e) => onChange?.(e.target.value)} />
            {error && <p className="font-poppins text-xs text-red-500">{error}</p>}
    </div>
    )
}