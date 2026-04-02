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
  const base = "font-poppins font-medium px-4 py-3 text-sm uppercase tracking-widest transition-colors rounded-lg cursor-pointer";

  const styles = {
    primary: "bg-gray-900 text-white hover:bg-gray-700",
    outline: "border border-gray-900 text-gray-700 hover:bg-gray-100",
  };

  return (
    <button
      className={`${base} ${styles[variant]} ${Icon ? "flex items-center gap-2" : ""} ${className}`.trim()}
      onClick={onClick}
      type={type}
    >
      {Icon && iconPosition === "left"  && <Icon size={18} />}
      {label}
      {Icon && iconPosition === "right" && <Icon size={18} />}
    </button>
  );
};

export default Button;