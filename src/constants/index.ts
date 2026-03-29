import type { RegisterProps } from "../types";

export const filledFields : { label: string; type: string; placeholder: string; field: keyof RegisterProps }[] = [
  { label: "Name",     type: "text",     placeholder: "Name",     field: "name"     },
  { label: "Email",    type: "email",    placeholder: "Email",    field: "email"    },
  { label: "Phone",    type: "tel",      placeholder: "Phone",    field: "phone"    },
  { label: "Password", type: "password", placeholder: "Password", field: "password" },
];