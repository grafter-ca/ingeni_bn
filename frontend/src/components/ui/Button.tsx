// src/components/ui/Button.tsx
import type { ButtonProps } from "../../types";

const Button = ({
  label,
  variant = "primary",
  className = "",
  type = "button",
  icon: Icon,
  iconPosition = "right",
  onClick,
}: ButtonProps) => {
  const base = "font-poppins font-medium px-4 py-3 text-sm uppercase tracking-widest transition-colors rounded-lg cursor-pointer flex items-center justify-center";

  const styles = {
    primary: "bg-gray-900 text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 shadow-sm",
    outline: "border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5",
  };

  return (
    <button
      className={`${base} ${styles[variant]} ${Icon ? "gap-2" : ""} ${className}`.trim()}
      onClick={onClick}
      type={type}
    >
      {Icon && iconPosition === "left" && <Icon size={18} />}
      {label}
      {Icon && iconPosition === "right" && <Icon size={18} />}
    </button>
  );
};

export default Button;