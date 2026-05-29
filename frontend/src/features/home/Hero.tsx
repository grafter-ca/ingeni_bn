import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Button from "../../components/ui/Button";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-28 border-b border-gray-800 relative overflow-hidden">

      {/* Infinite floating background orbs */}
      <motion.div
        className="absolute w-96 h-96 bg-gray-700 rounded-full blur-3xl opacity-20 top-10 -left-20"
        animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-72 h-72 bg-gray-600 rounded-full blur-3xl opacity-10 bottom-10 -right-10"
        animate={{ y: [0, -25, 0], x: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.p
        className="font-poppins text-xs uppercase tracking-widest text-gray-400 mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        Curated for the Discerning Few
      </motion.p>

      <motion.h1
        className="font-poppins font-bold text-5xl md:text-7xl text-white tracking-wide leading-tight max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        Elevate Every Part of Your World
      </motion.h1>

      <motion.p
        className="font-poppins font-light text-lg text-gray-400 mt-6 max-w-xl leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        From timeless essentials to statement pieces — Ingeni brings together
        the finest products, handpicked to match your lifestyle and taste.
      </motion.p>

      <motion.div
        className="flex gap-4 mt-10 flex-wrap justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button
          label="Explore Collection"
          icon={ArrowRight}
          iconPosition="right"
          onClick={() => navigate("/products")}
        />
        <Button
          label="Our Story"
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
          onClick={() => navigate("/about")}
        />
      </motion.div>

      {/* Infinite scroll indicator */}
      <motion.div
        className="absolute bottom-10 flex flex-col items-center gap-1"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-px h-10 bg-linear-to-b from-gray-500 to-transparent" />
        <p className="font-poppins text-xs text-gray-500 uppercase tracking-widest">Scroll</p>
      </motion.div>
    </section>
  );
};

export default HeroSection;