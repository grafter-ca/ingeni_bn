import type { LucideIcon } from "lucide-react";

export interface RegisterProps {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    country?: string;
}
export interface LoginProps {
    email?: string;
    password?: string;
}

export interface ButtonProps {
  label: string;
  variant?: "primary" | "outline";
  className?: string;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  onClick?: () => void;
};

export interface ValueProps {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
}

export interface ReasonProps {
  stat: string;
  label: string;
}