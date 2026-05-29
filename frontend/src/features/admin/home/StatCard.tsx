import type { StatCardProps } from "../../../types/admin";

const StatCard = ({ title, value, icon, color }: StatCardProps) => (
  <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-4xl hover:border-blue-500/20 transition-all group relative overflow-hidden">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 bg-white/30 rounded-2xl ${color}`}>
        {icon}
      </div>
      <span className="text-[10px] font-mono text-gray-600 flex items-center gap-1">
        LIVE <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
      </span>
    </div>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{title}</p>
    <p className="text-3xl font-mono font-bold text-white mt-1 tracking-tighter">{value}</p>
  </div>
);

export default StatCard;