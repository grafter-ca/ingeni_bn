import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { ArrowLeft, Compass, AlertOctagon } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-[#050505] text-white font-poppins flex items-center justify-center px-4 overflow-hidden">
      
      {/* Background Ambient Glow Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-md w-full bg-[#0c0c0e] border border-white/10 p-8 sm:p-10 rounded-3xl backdrop-blur-2xl shadow-2xl text-center space-y-6"
      >
        {/* Icon Header */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
          <Compass size={32} className="animate-spin-slow" />
        </div>

        {/* Error Code & Message */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-mono uppercase tracking-widest">
            <AlertOctagon size={12} /> 404 Asset Not Found
          </div>
          <h1 className="text-5xl font-extrabold font-mono tracking-tight text-white">
            4<span className="text-blue-500">0</span>4
          </h1>
          <p className="text-sm font-mono text-gray-400">
            The coordinate matrix or route you requested does not exist in this sector.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-center">
          <Button
            label="Return to Home"
            icon={ArrowLeft}
            onClick={() => navigate("/")}
            iconPosition="left"
            className="w-full justify-center bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs py-3 rounded-xl transition shadow-lg shadow-blue-600/25 cursor-pointer"
          />
        </div>

        {/* Footer Technical Note */}
        <div className="text-[10px] font-mono text-gray-600 pt-2 border-t border-white/5">
          Secure Node Router • Secure Gateway v2.6
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;