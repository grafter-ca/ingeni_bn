import { motion } from "framer-motion";
import type { StatCardProps } from "../../../types/admin";

const StatCard = ({ title, value, icon, color }: StatCardProps) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl hover:border-white/10 transition-all group"
  >
    <div className="flex justify-between items-start mb-6">
      <div className={`p-3 bg-white/5 rounded-2xl ${color}`}>
        {icon}
      </div>
      <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-full">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Live</span>
      </div>
    </div>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{title}</p>
    <p className="text-3xl font-mono font-bold text-white mt-1 tracking-tighter">{value}</p>
  </motion.div>
);

export default StatCard;