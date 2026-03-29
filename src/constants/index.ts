import { Globe, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import type { LoginProps, ReasonProps, RegisterProps, ValueProps } from "../types";


export const RegisterFields : { label: string; type: string; placeholder: string; field: keyof RegisterProps }[] = [
  { label: "Name",     type: "text",     placeholder: "Name",     field: "name"     },
  { label: "Email",    type: "email",    placeholder: "Email",    field: "email"    },
  { label: "Phone",    type: "tel",      placeholder: "Phone",    field: "phone"    },
  { label: "Password", type: "password", placeholder: "Password", field: "password" },
];

export const LoginFields : { label: string; type: string; placeholder: string; field: keyof LoginProps }[] = [
  { label: "Email",    type: "email",    placeholder: "Email",    field: "email"    },
  { label: "Password", type: "password", placeholder: "Password", field: "password" },
];



export const values : ValueProps[] = [
  {
    icon: ShieldCheck,
    title: "Trust & Quality",
    description: "Every product on Ingeni is carefully vetted to meet the highest standards of quality and reliability.",
  },
  {
    icon: Sparkles,
    title: "Premium Curation",
    description: "We don't sell everything — we sell the right things. Each item is handpicked to elevate your lifestyle.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "From local gems to international brands, Ingeni connects you to the world's finest products.",
  },
  {
    icon: HeartHandshake,
    title: "Customer First",
    description: "Your satisfaction is our priority. We're here before, during, and after every purchase.",
  },
];

export const reasons : ReasonProps[] = [
  { stat: "10K+",  label: "Happy Customers"    },
  { stat: "500+",  label: "Premium Products"   },
  { stat: "50+",   label: "Global Brands"      },
  { stat: "24/7",  label: "Customer Support"   },
];

export const navLinks = [
  { label: "Home",     path: "/"         },
  { label: "About",    path: "/about"    },
  { label: "Products", path: "/products" },
];