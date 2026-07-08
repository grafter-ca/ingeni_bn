import { useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Eye, MapPin, Store } from "lucide-react";
import type { ApiProduct } from "../../types/api";
import { useCartActions } from "../../hooks/useCartActions";

type Props = { product: ApiProduct };

const ProductCard = ({ product }: Props) => {
  const navigate = useNavigate();
  const { handleAddToCart } = useCartActions();

  // 1. Image Resolution
  const mainImage = typeof product.images?.[0] === 'string' 
    ? product.images[0] 
    : (product.images?.[0] as any)?.url || "https://placehold.co/400x400/374151/9CA3AF?text=No+Image";

  const handleAdd = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleAddToCart({
      id: product.id,
      name: product.title,
      price: Number(product.price),
      image: mainImage,
      vendorId: product.vendorId || "default",
      productId: product.id,
    });
  }, [product, handleAddToCart, mainImage]);

  return (
    <motion.div
      className="group bg-gray-800 rounded-xl overflow-hidden cursor-pointer flex flex-col h-full border border-gray-700/50 hover:shadow-2xl hover:shadow-blue-900/20"
      whileHover={{ y: -6, borderColor: "rgba(59, 130, 246, 0.5)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={() => navigate(`/products/${product.id}`)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-square bg-gray-900">
        <img
          src={mainImage}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />

        {/* Action Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAdd}
            className="w-12 h-12 bg-white text-gray-900 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-500 hover:text-white transition-colors"
          >
            <ShoppingCart size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 bg-white text-gray-900 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-200"
          >
            <Eye size={18} />
          </motion.button>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 flex flex-col gap-1 flex-1">
        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
          {product.category?.name || "Marketplace"}
        </span>

        <h3 className="font-poppins font-semibold text-gray-100 text-sm leading-tight line-clamp-2">
          {product.title}
        </h3>

        {/* Dynamic Vendor Information */}
        <div className="flex flex-col gap-1 mt-1">
          <div className="flex items-center gap-2">
            <Store size={12} className="text-blue-400" />
            <span className="text-[11px] text-gray-300 font-medium truncate">
              {product.vendor?.storeName || "Verified Merchant"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <MapPin size={12} />
            <span className="text-[10px] uppercase tracking-wider truncate">
              {product.vendor?.address || "Kigali, Rwanda"}
            </span>
          </div>
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-700/50">
          <p className="font-bold text-white">
            RF {Number(product.price).toLocaleString()}
          </p>
          <div className={`text-[10px] px-2 py-0.5 rounded ${product.stock > 0 ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
            {product.stock > 0 ? `${product.stock} in stock` : "Sold Out"}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;