// components/home/HeroSection.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Store, Tag, Zap } from "lucide-react";
import Button from "../../components/ui/Button";

const HeroSection = () => {
  const navigate = useNavigate();

  // Auto-slide state for the Right-Top promotional card
  const [currentSlide, setCurrentSlide] = useState(0);
  const promoSlides = [
    {
      title: "Clothes & Shoes",
      subtitle: "Latest streetwear & local fashion drops",
      image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=600",
      tag: "Trending"
    },
    {
      title: "Electronics & Gadgets",
      subtitle: "Verified tech items with warranty",
      image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=600",
      tag: "Flash Sale"
    },
    {
      title: "Fresh Marketplace",
      subtitle: "Direct from Rural & Kigali vendors",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600",
      tag: "Organic"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promoSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [promoSlides.length]);

  return (
    <section className="max-w-7xl h-full md:h-[400px] mx-auto px-6 py-3 bg-white dark:bg-[#050505] transition-colors">

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        
        {/* --- LEFT BOX: MAIN HERO BANNER (Spans 2 columns) --- */}
        <motion.div 
          className="lg:col-span-2 relative rounded-3xl overflow-hidden border border-zinc-200 dark:border-white/15 flex flex-col justify-end p-4 md:p-8 h-[280px] min-h-[340px] md:min-h-[380px] shadow-2xl group bg-zinc-950"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Background Image with Brightness & Balanced Lighting */}
          <div className="absolute inset-0 z-0 bg-zinc-950">
            <img 
              src="malindi-court.jpg" 
              alt="Ingeni Modern Market" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.75] contrast-[1.1]"
            />
            {/* Dark gradient overlay to keep text clearly readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 space-y-3 max-w-xl">
            <h1 className="font-poppins font-bold text-2xl md:text-4xl text-white tracking-tight leading-tight drop-shadow-md">
              The whole market, delivered to your door
            </h1>

            <p className="font-poppins font-light text-xs md:text-sm text-zinc-200 leading-relaxed drop-shadow">
              Shop hundreds of vendors inside Ingeni Modern Market. One cart, one checkout, paid with MoMo.
            </p>

            <div className="flex gap-3 pt-2 flex-wrap">
              <Button
                label="Start shopping"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => navigate("/products")}
                className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs py-2.5 px-5 rounded-xl transition shadow-lg shadow-blue-600/25 cursor-pointer"
              />
              <Button
                label="Become a Vendor"
                icon={Store}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 font-mono text-xs py-2.5 px-5 rounded-xl transition cursor-pointer"
                onClick={() => navigate("/vendor/register")}
              />
            </div>
          </div>
        </motion.div>

        {/* --- RIGHT COLUMN (2 Stacked Interactive Cards) --- */}
        <div className="flex flex-col gap-5">
          
          {/* TOP RIGHT: Auto-Sliding Promo Box */}
          <motion.div 
            className="relative rounded-3xl overflow-hidden border border-zinc-200 dark:border-white/15 h-[160px] shadow-xl bg-zinc-950 flex flex-col justify-end p-5 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={currentSlide}
                className="absolute inset-0 z-0 bg-zinc-950"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <img 
                  src={promoSlides[currentSlide].image} 
                  alt={promoSlides[currentSlide].title} 
                  className="w-full h-full object-cover brightness-[0.7] contrast-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
              </motion.div>
            </AnimatePresence>

            {/* Slide Badge */}
            <div className="absolute top-3 right-3 z-10 bg-black/50 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[10px] font-mono text-white">
              <Tag size={11} className="text-blue-400" />
              {promoSlides[currentSlide].tag}
            </div>

            <div className="relative z-10 space-y-1">
              <h3 className="font-poppins font-bold text-base text-white drop-shadow">
                {promoSlides[currentSlide].title}
              </h3>
              <p className="font-light text-[11px] text-zinc-200 drop-shadow">
                {promoSlides[currentSlide].subtitle}
              </p>
              
              {/* Pagination Dots */}
              <div className="flex gap-1.5 pt-1">
                {promoSlides.map((_, idx) => (
                  <span 
                    key={idx} 
                    className={`h-1 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-5 bg-blue-500' : 'w-1.5 bg-white/40'}`} 
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* BOTTOM RIGHT: Interactive Animated Asset / Feature Box */}
          <motion.div 
            className="relative rounded-3xl overflow-hidden border border-zinc-200 dark:border-white/15 h-[190px] shadow-xl bg-zinc-50 dark:bg-[#0c0c0e] p-5 flex flex-col justify-between group cursor-pointer transition-colors"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            onClick={() => navigate("/products")}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Background Glow Effect */}
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-600/10 dark:bg-blue-600/25 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-600/20 dark:group-hover:bg-blue-600/40 transition-all" />

            <div className="flex items-center justify-between z-10">
              <span className="text-[10px] font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 font-semibold">Instant MoMo Escrow</span>
              <div className="w-7 h-7 rounded-xl bg-blue-600/10 dark:bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:rotate-12 transition-transform">
                <Zap size={14} />
              </div>
            </div>

            <div className="space-y-1 z-10">
              <h3 className="font-poppins font-bold text-zinc-900 dark:text-white text-sm">
                Secure Mobile Money Checkout
              </h3>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-300 font-light leading-relaxed">
                Funds are held safely in escrow until your order arrives at your doorstep.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-white/10 text-xs font-mono text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 z-10">
              <span>Explore Secure Pay</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};

export default HeroSection;