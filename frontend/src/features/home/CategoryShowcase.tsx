import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useProductStore } from "../../store/productStore";

const CategoryShowcase = () => {
  const { categories, fetchCategories } = useProductStore();
  const navigate = useNavigate();

  useEffect(() => { 
    fetchCategories(); 
  }, [fetchCategories]);

  return (
    <section className="px-6 py-28 border-b border-gray-800 bg-[#0a0a0a] relative overflow-hidden">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 mb-3 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <p className="font-poppins text-[10px] uppercase tracking-widest text-gray-300">
                Curated Collections
              </p>
            </div>
            <h2 className="font-poppins font-bold text-3xl md:text-5xl text-white tracking-wide">
              Shop Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-200">World</span>
            </h2>
          </div>
          <p className="font-poppins text-sm text-gray-400 max-w-sm">
            Explore meticulously sorted categories designed for distinct lifestyles and tastes.
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 font-poppins">
              No category available yet!
            </div>
          ) : (
            categories.slice(0, 8).map((cat, i) => {
              // Create a dynamic modern bento span look for specific items
              const isFeatured = i === 0 || i === 3;

              return (
                <motion.div
                  key={cat.id}
                  className={`relative group overflow-hidden cursor-pointer rounded-2xl border border-white/10 bg-gray-900 ${
                    isFeatured ? "md:col-span-2 md:row-span-2 aspect-[16/10] md:aspect-auto" : "aspect-square"
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  whileHover={{ y: -6 }}
                  onClick={() => navigate(`/products?categoryId=${cat.id}`)}
                >
                  {/* Category Image */}
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter brightness-90 group-hover:brightness-100"
                  />

                  {/* Modern Multi-Stop Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

                  {/* Top Action Icon indicator */}
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 text-white">
                    <ArrowUpRight size={18} />
                  </div>

                  {/* Category Details */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end transform transition-transform duration-300">
                    <span className="font-mono text-[10px] text-blue-400 uppercase tracking-widest mb-1 opacity-80">
                      Collection 0{i + 1}
                    </span>
                    <h3 className="font-poppins font-semibold text-lg md:text-xl text-white tracking-wide uppercase group-hover:text-blue-200 transition-colors">
                      {cat.name}
                    </h3>
                  </div>

                  {/* Border Glow on Hover */}
                  <div className="absolute inset-0 border border-blue-500/0 group-hover:border-blue-500/40 rounded-2xl transition-colors duration-500 pointer-events-none" />
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;