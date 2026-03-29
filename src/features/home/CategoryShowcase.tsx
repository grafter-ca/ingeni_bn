import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useProductStore } from "../../store/productStore";

const CategoryShowcase = () => {
  const { categories, fetchCategories } = useProductStore();
  const navigate = useNavigate();

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  return (
    <section className="px-6 py-20 border-b border-gray-800">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="font-poppins text-xs uppercase tracking-widest text-gray-400 mb-2">
            Browse by Category
          </p>
          <h2 className="font-poppins font-bold text-3xl md:text-4xl text-white">
            Shop Your World
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.slice(0, 10).map((cat, i) => (
            <motion.div
              key={cat.id}
              className="relative group overflow-hidden cursor-pointer rounded-lg aspect-square"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => navigate(`/products?categoryId=${cat.id}`)}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-linear-to-t from-gray-900/90 via-gray-900/30 to-transparent" />
              <p className="absolute bottom-3 left-3 font-poppins font-semibold text-sm text-white uppercase tracking-widest">
                {cat.name}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;