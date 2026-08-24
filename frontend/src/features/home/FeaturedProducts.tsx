import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useProductStore } from "../../store/productStore";
import ProductCard from "../../components/common/ProductCard";

const FeaturedProducts = () => {
  const { products, fetchProducts, isLoading } = useProductStore();
  const navigate = useNavigate();

  useEffect(() => { 
    fetchProducts({ limit: 8 }); 
  }, [fetchProducts]);

  const featured = useMemo(() => products.slice(0, 8), [products]);

  if (products.length === 0 && !isLoading) {
    return (
      <section className="px-6 py-28 border-b border-gray-800 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto text-center">
          <p className="font-poppins text-sm text-gray-500 uppercase tracking-widest">
            No featured products available at the moment.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-28 border-b border-gray-800 bg-[#0a0a0a] relative overflow-hidden">
      
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 mb-3 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <p className="font-poppins text-[10px] uppercase tracking-widest text-gray-300">
                Handpicked for You
              </p>
            </div>
            <h2 className="font-poppins font-bold text-3xl md:text-5xl text-white tracking-wide">
              Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-200">Products</span>
            </h2>
          </div>

          <button
            onClick={() => navigate("/products")}
            className="group flex items-center gap-2 font-poppins text-xs font-semibold uppercase tracking-widest text-gray-300 hover:text-white transition-colors bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl hover:bg-white/10"
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
                className="h-80 bg-white/[0.02] border border-white/10 animate-pulse rounded-2xl p-4 flex flex-col justify-between"
              >
                <div className="w-full h-48 bg-white/5 rounded-xl" />
                <div className="space-y-2">
                  <div className="w-3/4 h-4 bg-white/5 rounded" />
                  <div className="w-1/2 h-4 bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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