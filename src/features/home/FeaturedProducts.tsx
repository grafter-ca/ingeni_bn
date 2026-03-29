import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useProductStore } from "../../store/productStore";
import ProductCard from "../../components/common/ProductCard";

const FeaturedProducts = () => {
  const { products, fetchProducts, isLoading } = useProductStore();
  const navigate = useNavigate();

  useEffect(() => { fetchProducts({ limit: 8 }); }, [fetchProducts]);

  const featured = useMemo(() => products.slice(0, 8), [products]);

  return (
    <section className="px-6 py-20 border-b border-gray-800">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="flex items-end justify-between mb-12 flex-wrap gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <p className="font-poppins text-xs uppercase tracking-widest text-gray-400 mb-2">
              Handpicked for You
            </p>
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-white">
              Featured Products
            </h2>
          </div>
          <button
            onClick={() => navigate("/products")}
            className="font-poppins text-sm uppercase tracking-widest text-gray-400 hover:text-white transition-colors underline underline-offset-4"
          >
            View all
          </button>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 bg-gray-800 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featured.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
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