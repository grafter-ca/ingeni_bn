import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { ArrowRight, UserPlus } from "lucide-react";
import { useAuthState } from "../../context/AuthContext";

const CallToAction = () => {
  const navigate = useNavigate();
  const { user } = useAuthState();

  return (
    <section className="px-6 py-28 flex flex-col items-center text-center gap-6 relative overflow-hidden">
      {/* Infinite shimmer line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-gray-500 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />

      <motion.p
        className="font-poppins text-xs uppercase tracking-widest text-gray-400"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        The Ingeni Experience
      </motion.p>

      <motion.h2
        className="font-poppins font-bold text-4xl md:text-6xl text-white max-w-2xl leading-tight"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
      >
        Ready to Shop the Best?
      </motion.h2>

      <motion.p
        className="font-poppins text-gray-400 max-w-md leading-relaxed"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        Join thousands of happy customers discovering premium products every day.
      </motion.p>

      <motion.div
        className="flex gap-4 flex-wrap justify-center mt-4"
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
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
            onClick={() => navigate("/register")}
          />
        )}
      </motion.div>
    </section>
  );
};

export default CallToAction;