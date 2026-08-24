import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import Button from "../../components/ui/Button";

const HeroSection = () => {
  const navigate = useNavigate();

  // Scroll tracking for parallax depth
  const { scrollY } = useScroll();
  const leftImageY = useTransform(scrollY, [0, 500], [0, 120]);
  const leftImageOpacity = useTransform(scrollY, [0, 300], [1, 0.2]);
  const rightImageY = useTransform(scrollY, [0, 500], [0, -100]);
  const rightImageOpacity = useTransform(scrollY, [0, 300], [0.8, 0.2]);

  // Mouse tracking for interactive tilt/parallax card effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x / 30);
    mouseY.set(y / 30);
  };

  return (
    <section 
      onMouseMove={handleMouseMove}
      className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-28 border-b border-gray-800 relative overflow-hidden"
    >
      
      {/* --- DYNAMIC FLOATING IMAGE (LEFT SIDE) --- */}
      <motion.div
        style={{ opacity: leftImageOpacity, x: smoothX, y: smoothY, translateY: leftImageY }}
        className="absolute left-2 top-[10%] hidden md:block pointer-events-none z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.img 
          src="/dec-1.png" 
          alt="Curated Collection Preview" 
          role="img" 
          className="h-60 w-48 lg:h-72 lg:w-56 object-cover rounded-2xl shadow-2xl border border-white/20"
          animate={{ y: [0, -15, 0], rotate: [0, -2, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Floating Micro-Badge */}
        <motion.div 
          className="absolute -bottom-4 -right-4 bg-black/90 backdrop-blur-md border border-white/20 px-3 py-2 rounded-xl flex items-center gap-2 shadow-xl"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles size={14} className="text-blue-400" />
          <span className="text-[10px] font-mono text-gray-200 uppercase tracking-wider">Verified Stock</span>
        </motion.div>
      </motion.div>

      {/* --- SECOND DECORATION IMAGE (RIGHT SIDE) --- */}
      <motion.div
        style={{ y: rightImageY, opacity: rightImageOpacity }}
        className="absolute right-2 bottom-[10%] hidden md:block pointer-events-none z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.8, scale: 1 }}
        transition={{ duration: 1.2 }}
      >
        <motion.img 
          src="/dec-1.png" 
          alt="Lifestyle Catalog Preview" 
          role="img" 
          className="h-52 w-44 lg:h-60 lg:w-48 object-cover rounded-2xl shadow-2xl border border-white/20"
          animate={{ y: [0, 15, 0], rotate: [0, 3, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* --- INTERACTIVE GLOWING BACKGROUND ORBS --- */}
      <motion.div
        className="absolute w-[450px] h-[450px] bg-blue-600/15 rounded-full blur-[120px] top-1/4 -left-20 pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[120px] bottom-10 -right-20 pointer-events-none"
        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* --- TOP TRUST PILL --- */}
      <motion.div 
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 mb-6 backdrop-blur-md z-20 shadow-inner"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ShieldCheck size={14} className="text-emerald-400" />
        <span className="font-poppins text-[11px] text-gray-300 uppercase tracking-widest">Trusted Multi-Vendor Ecosystem</span>
      </motion.div>

      {/* --- MAIN HERO HEADING --- */}
      <motion.h1
        className="font-poppins font-bold text-5xl md:text-7xl text-white tracking-wide leading-tight max-w-4xl z-20"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        Elevate Every Part of Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-white">World</span>
      </motion.h1>

      {/* --- SUBTITLE --- */}
      <motion.p
        className="font-poppins font-light text-base md:text-lg text-gray-400 mt-6 max-w-xl leading-relaxed z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        From timeless essentials to rare statement pieces — Ingeni brings together 
        the finest independent merchants, handpicked to match your taste.
      </motion.p>

      {/* --- ACTION BUTTONS --- */}
      <motion.div
        className="flex gap-4 mt-10 flex-wrap justify-center z-20"
        initial={{ opacity: 0, y: 15 }}
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
          className="border-gray-700 text-gray-300 hover:bg-white/5"
          onClick={() => navigate("/about")}
        />
      </motion.div>

      {/* --- INFINITE SCROLL INDICATOR --- */}
      <motion.div
        className="absolute bottom-8 flex flex-col items-center gap-1.5 z-20"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-px h-8 bg-gradient-to-b from-gray-400 to-transparent" />
        <p className="font-poppins text-[10px] text-gray-500 uppercase tracking-widest">Scroll to Explore</p>
      </motion.div>
    </section>
  );
};

export default HeroSection;