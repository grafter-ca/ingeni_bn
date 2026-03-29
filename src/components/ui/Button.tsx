import type { ButtonProps } from "../../types";


const Button = ({ label, variant = "primary", className, icon, onClick }: ButtonProps) => {
  const base = "font-poppins font-medium px-6 py-4 text-sm uppercase tracking-widest transition-colors";
  const styles = {
    primary: "bg-gray-900 text-white hover:bg-gray-700",
    outline: "border border-gray-900 text-gray-700 hover:bg-gray-100",
  };
  
  
  return (
    <button className={`${base} ${className} ${styles[variant]} rounded-lg cursor-pointer ${icon ? "flex items-center gap-2" : " "}`} onClick={onClick}>
      {label}
    </button>
  );
};

export default Button;