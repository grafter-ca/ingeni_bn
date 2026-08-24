import { motion } from "framer-motion";
import { Search, ShoppingCart, CreditCard, Package } from "lucide-react";

const steps = [
  { icon: Search,     step: "01", title: "Browse",     description: "Explore thousands of curated products across every category." },
  { icon: ShoppingCart,step: "02", title: "Add",        description: "Add your favourites to cart in one click." },
  { icon: CreditCard,   step: "03", title: "Checkout", description: "Secure and seamless checkout in under a minute." },
  { icon: Package,      step: "04", title: "Receive",    description: "Fast delivery straight to your door, anywhere." },
];

const HowItWorks = () => (
  <section className="px-6 py-28 bg-[#0a0a0a] border-b border-gray-800 relative overflow-hidden">
    
    {/* Subtle Background Glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />

    <div className="max-w-7xl mx-auto relative z-10">
      
      {/* Section Header */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 mb-3 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <p className="font-poppins text-[10px] uppercase tracking-widest text-gray-300">
            Simple Process
          </p>
        </div>
        <h2 className="font-poppins font-bold text-3xl md:text-5xl text-white tracking-wide">
          How <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-200">Ingeni</span> Works
        </h2>
      </motion.div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative">
        
        {/* Connecting line (desktop) */}
        <div className="hidden md:block absolute top-[28%] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent pointer-events-none" />

        {steps.map(({ icon: Icon, step, title, description }, i) => (
          <motion.div
            key={step}
            className="flex flex-col items-center text-center p-8 rounded-2xl bg-white/[0.02] border border-white/10 relative group hover:border-blue-500/40 transition-all duration-500"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            whileHover={{ y: -6 }}
          >
            {/* Step Number Badge */}
            <div className="absolute top-4 right-4 font-mono text-xs text-blue-400/60 font-semibold tracking-wider">
              {step}
            </div>

            {/* Icon with pulse effect */}
            <div className="relative mb-6">
              <motion.div
                className="absolute inset-0 bg-blue-500/20 rounded-full blur-md"
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
              />
              <div className="relative z-10 w-16 h-16 bg-gray-900 border border-white/15 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-xl">
                <Icon size={24} />
              </div>
            </div>

            <h3 className="font-poppins font-semibold text-white text-lg tracking-wide mb-2">
              {title}
            </h3>
            <p className="font-poppins text-xs md:text-sm text-gray-400 leading-relaxed font-light">
              {description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;