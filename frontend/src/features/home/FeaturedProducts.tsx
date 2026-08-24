import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useProductStore } from "../../store/productStore";
import ProductCard from "../../components/common/ProductCard";

const FeaturedProducts = () => {
  const { products, isLoading, fetchPublicProducts } = useProductStore();
  const navigate = useNavigate();

  useEffect(() => { 
    fetchPublicProducts({ limit: 8 }); 
  }, [fetchPublicProducts]);

  const featured = useMemo(() => products.slice(0, 10), [products]);

  if (products.length === 0 && !isLoading) {
    return (
      <section className="px-6 py-28 border-b border-zinc-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] transition-colors">
        <div className="max-w-7xl mx-auto text-center">
          <p className="font-poppins text-sm text-zinc-400 dark:text-gray-500 uppercase tracking-widest">
            No featured products available at the moment.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-10 border-b border-zinc-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] relative overflow-hidden transition-colors">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-1/3 right-10 w-[500px] h-[300px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <motion.div
          className="flex items-end justify-between mb-14 flex-wrap gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 mb-3 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
              <p className="font-poppins text-[10px] uppercase tracking-widest text-zinc-600 dark:text-gray-300">
                Handpicked for You
              </p>
            </div>
            <h2 className="font-poppins font-bold text-3xl md:text-5xl text-zinc-900 dark:text-white tracking-wide">
              Featured Products
            </h2>
          </div>

          <button
            onClick={() => navigate("/products")}
            className="group flex items-center gap-2 font-poppins text-xs font-semibold uppercase tracking-widest text-zinc-600 dark:text-gray-300 hover:text-zinc-900 dark:hover:text-white transition-colors bg-zinc-100 dark:bg-white/5 border border-zinc-300 dark:border-white/10 px-4 py-2.5 rounded-full hover:bg-zinc-200 dark:hover:bg-white/10"
          >
            <span>View All Products</span>
            <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Product Grid / Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div 
                key={i} 
                className="h-80 bg-zinc-100 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 animate-pulse rounded-2xl p-4 flex flex-col justify-between"
              >
                <div className="w-full h-48 bg-zinc-200 dark:bg-white/5 rounded-xl" />
                <div className="space-y-2">
                  <div className="w-3/4 h-4 bg-zinc-200 dark:bg-white/5 rounded" />
                  <div className="w-1/2 h-4 bg-zinc-200 dark:bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            {featured.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;