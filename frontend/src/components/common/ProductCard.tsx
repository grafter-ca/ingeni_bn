import { useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Eye } from "lucide-react";
import type { ApiProduct } from "../../types/api";
import { useCartActions } from "../../hooks/useCartActions";

type Props = { product: ApiProduct };

const ProductCard = ({ product }: Props) => {
  const navigate = useNavigate();
  const { handleAddToCart } = useCartActions();

  // 1. Robust Image Resolution
  const firstImage = product.images?.[0];
  
  const mainImage = typeof firstImage === 'string' 
    ? firstImage 
    : (firstImage as any)?.url || "https://placehold.co/400x400/374151/9CA3AF?text=No+Image";

  const handleAdd = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      
      // 2. Data Integrity Check
      // We check for vendorId here to ensure the cart doesn't receive bad data
      if (!product.vendorId) {
        console.error(`Product ${product.title} (ID: ${product.id}) is missing a vendorId.`);
        alert("Cannot add to cart: Product data is incomplete.");
        return;
      }

      handleAddToCart({
        id: product.id,
        name: product.title,
        price: Number(product.price), // Ensure it's a number
        image: mainImage,
        vendorId: product.vendorId,
        productId: product.id,
      });
    },
    [product, handleAddToCart, mainImage]
  );

  return (
    <motion.div
      className="group bg-gray-800 rounded-lg overflow-hidden cursor-pointer flex flex-col h-full border border-gray-700/50"
      whileHover={{ y: -6, borderColor: "rgba(255,255,255,0.2)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={() => navigate(`/products/${product.id}`)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-square bg-gray-900">
        <img
          src={mainImage}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placehold.co/400x400/374151/9CA3AF?text=404+Error";
          }}
        />

        {/* Action Overlay */}
        <motion.div
          className="absolute inset-0 bg-black/40 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "#fff" }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAdd}
            className="w-12 h-12 bg-white/90 text-gray-900 rounded-full flex items-center justify-center shadow-xl"
            title="Add to Cart"
          >
            <ShoppingCart size={18} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "#fff" }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); navigate(`/products/${product.id}`); }}
            className="w-12 h-12 bg-white/90 text-gray-900 rounded-full flex items-center justify-center shadow-xl"
            title="Quick View"
          >
            <Eye size={18} />
          </motion.button>
        </motion.div>
      </div>

      {/* Info Section */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="font-poppins text-[10px] uppercase tracking-widest text-blue-400 font-semibold">
          {product.category?.name || "General"}
        </p>
        
        <h3 className="font-poppins font-medium text-gray-100 text-sm leading-tight line-clamp-2 min-h-10">
          {product.title}
        </h3>
        
        <div className="mt-auto pt-3 flex items-center justify-between">
          <p className="font-poppins font-bold text-lg text-white">
            ${Number(product.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;