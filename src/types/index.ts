export interface RegisterProps {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    country?: string;
}

export interface ButtonProps {
  label: string;
  variant?: "primary" | "outline";
  className?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
};