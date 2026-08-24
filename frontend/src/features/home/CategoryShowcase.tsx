// src/components/vendor/CategoryShowcase.tsx
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Layers } from "lucide-react";
import { useProductStore } from "../../store/productStore";
import CategorySkeleton from "../../components/common/CategorySkeleton";
import CategoryCard from "../../features/admin/category/CategoryCard";

const CategoryShowcase = () => {
  const { categories, fetchCategories, isLoading } = useProductStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <section className="px-6 py-6 border-b border-zinc-200 dark:border-white/5 bg-white dark:bg-[#050505] relative overflow-hidden transition-colors">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/[0.03] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end mb-4 justify-between gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex md:w-[200px] w-auto items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/10 mb-2 backdrop-blur-md shadow-inner">
            <Layers size={14} className="text-blue-600 dark:text-blue-400" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600 dark:text-gray-300">
              Shop by category
            </p>
          </div>
          <p className="font-poppins text-xs md:text-sm text-zinc-500 dark:text-gray-400 max-w-sm leading-relaxed">
            Discover locally sourced commodities, daily goods, and vendor
            supplies organized for seamless browsing.
          </p>
        </motion.div>

        {/* Categories Grid using CategoryCard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <CategorySkeleton key={idx} />
            ))
          ) : categories.length === 0 ? (
            <div className="col-span-full text-center py-16 text-zinc-400 dark:text-gray-500 font-mono text-xs border border-zinc-200 dark:border-white/10 rounded-2xl bg-zinc-50 dark:bg-[#0a0a0a]">
              No marketplace categories available yet!
            </div>
          ) : (
            categories.slice(0, 8).map((cat) => (
              <CategoryCard
                key={cat.id}
                id={cat.id}
                name={cat.name}
                description={cat.description}
                imageUrl={cat.image || cat.imageUrl}
                itemCount={cat.productsCount}
                onClick={() => navigate(`/products?categoryId=${cat.id}`)}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;