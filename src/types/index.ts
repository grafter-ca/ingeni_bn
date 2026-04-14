import type { LucideIcon } from "lucide-react";
import type { Order } from "./api";

export interface RegisterProps {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    country?: string;
    confirmPassword? : string;
}


export interface LoginProps {
    email?: string;
    password?: string;
}

export interface ButtonProps {
  label: string;
  variant?: "primary" | "outline";
  className?: string;
  type?: "button" | "submit" | "reset";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  onClick?: () => void;
  disabled?: boolean;
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

export type User = {
  id: string ;
  name: string;
  email: string;
  image?: string | null;
  phone?: string;
  role?: "admin" | "vendor" | "user";
  country?: string;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  productId: string;
  image?: string;
};

export type AuthState = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
};

export type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "LOGIN_ERROR"; payload: string }
  | { type: "LOGOUT" }
  | { type: "CLEAR_ERROR" };

export interface VendorDashboardData {
  stats: {
    revenue: string;
    activeOrders: number;
    productCount: string;
  } | null;
  orders: Order[];
}
