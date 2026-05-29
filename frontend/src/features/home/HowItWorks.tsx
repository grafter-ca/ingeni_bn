import { motion } from "framer-motion";
import { Search, ShoppingCart, CreditCard, Package } from "lucide-react";

const steps = [
  { icon: Search,      step: "01", title: "Browse",  description: "Explore thousands of curated products across every category." },
  { icon: ShoppingCart,step: "02", title: "Add",     description: "Add your favourites to cart in one click." },
  { icon: CreditCard,  step: "03", title: "Checkout", description: "Secure and seamless checkout in under a minute." },
  { icon: Package,     step: "04", title: "Receive",  description: "Fast delivery straight to your door, anywhere." },
];

const HowItWorks = () => (
  <section className="px-6 py-20 bg-gray-800 border-b border-gray-700">
    <div className="max-w-7xl mx-auto">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <p className="font-poppins text-xs uppercase tracking-widest text-gray-400 mb-2">
          Simple Process
        </p>
        <h2 className="font-poppins font-bold text-3xl md:text-4xl text-white">
          How Ingeni Works
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 relative">
        {/* Connecting line (desktop) */}
        <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-px bg-gray-700" />

        {steps.map(({ icon: Icon, step, title, description }, i) => (
          <motion.div
            key={step}
            className="flex flex-col items-center text-center gap-4 relative"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
          >
            {/* Infinite pulse on icon */}
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-gray-600 rounded-full"
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
              />
              <div className="relative z-10 w-20 h-20 bg-gray-900 border border-gray-700 rounded-full flex items-center justify-center">
                <Icon size={28} className="text-white" />
              </div>
            </div>

            <span className="font-poppins text-xs text-gray-500 uppercase tracking-widest">
              {step}
            </span>
            <h3 className="font-poppins font-semibold text-white text-lg">{title}</h3>
            <p className="font-poppins text-sm text-gray-400 leading-relaxed">{description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;