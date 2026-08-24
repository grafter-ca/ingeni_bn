import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { ArrowRight, UserPlus, Store } from "lucide-react";
import { useAuthState } from "../../context/AuthContext";
import VendorRequestModal from "../../components/common/VendorRequestModal";

const CallToAction = () => {
  const navigate = useNavigate();
  const { user } = useAuthState();
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);

  return (
    <section className="px-6 py-28 flex flex-col items-center text-center gap-6 relative overflow-hidden bg-[#0a0a0a] border-t border-gray-800">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Infinite shimmer line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />

      <motion.div 
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 mb-2 backdrop-blur-md z-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
        <p className="font-poppins text-[10px] uppercase tracking-widest text-gray-300">
          The Ingeni Experience
        </p>
      </motion.div>

      <motion.h2
        className="font-poppins font-bold text-4xl md:text-6xl text-white max-w-2xl leading-tight z-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
      >
        Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-200">Shop</span> the Best?
      </motion.h2>

      <motion.p
        className="font-poppins text-gray-400 max-w-md leading-relaxed z-10 font-light text-sm md:text-base"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        Join thousands of happy customers discovering premium products every day, or expand your reach by selling with us.
      </motion.p>

      <motion.div
        className="flex gap-4 flex-wrap justify-center mt-4 z-10"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        <Button
          label="Browse Products"
          icon={ArrowRight}
          iconPosition="right"
          onClick={() => navigate("/products")}
        />
        {!user && (
          <Button
            label="Create Account"
            icon={UserPlus}
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-white/5"
            onClick={() => navigate("/register")}
          />
        )}
        {/* Vendor Request Trigger Button */}
        <Button
          label="Become a Vendor"
          icon={Store}
          variant="outline"
          className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
          onClick={() => setIsVendorModalOpen(true)}
        />
      </motion.div>

      {/* Render the Vendor Request Modal */}
      <VendorRequestModal
        isOpen={isVendorModalOpen}
        onClose={() => setIsVendorModalOpen(false)}
      />
    </section>
  );
};

export default CallToAction;