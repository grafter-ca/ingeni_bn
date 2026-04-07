import type { StatCardProps } from "../../types/admin";

export const StatCard = ({ title, value }: StatCardProps) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 text-center">
      <p className="text-gray-500 capitalize">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );
};