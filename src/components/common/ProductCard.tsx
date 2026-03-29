import { useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Eye } from "lucide-react";
import type { ApiProduct } from "../../types/api";
import { useCartActions } from "../../hooks/useCartActions";

type Props = { product: ApiProduct };

// Single Responsibility: displays one product
const ProductCard = ({ product }: Props) => {
  const navigate = useNavigate();
  const { handleAddToCart } = useCartActions();

  const handleAdd = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handleAddToCart({
        id: String(product.id),
        name: product.title,
        price: product.price,
        image: product.images[0],
      });
    },
    [product, handleAddToCart]
  );

  return (
    <motion.div
      className="group bg-gray-800 rounded-lg overflow-hidden cursor-pointer flex flex-col"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={() => navigate(`/products/${product.id}`)}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-square bg-gray-700">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placehold.co/400x400/374151/9CA3AF?text=No+Image";
          }}
        />

        {/* Hover overlay actions */}
        <motion.div
          className="absolute inset-0 bg-black/50 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAdd}
            className="w-10 h-10 bg-white text-gray-900 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ShoppingCart size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); navigate(`/products/${product.id}`); }}
            className="w-10 h-10 bg-white text-gray-900 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Eye size={16} />
          </motion.button>
        </motion.div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1 flex-1">
        <p className="font-poppins text-xs uppercase tracking-widest text-gray-400">
          {product.category.name}
        </p>
        <h3 className="font-poppins font-medium text-white text-sm leading-snug line-clamp-2">
          {product.title}
        </h3>
        <p className="font-poppins font-bold text-white mt-auto pt-2">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </motion.div>
  );
};

export default ProductCard;