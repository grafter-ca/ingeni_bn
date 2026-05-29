import type { ReactNode } from "react";

export type Stats = {
  users: number;
  products: number;
  orders: number;
};

export type StatCardProps = {
  title: string;
  value: number | string;
  icon: ReactNode;
  color: string;
};

