// src/components/common/ProductCard.tsx
import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Eye,
  MapPin,
  Store,
  Phone,
  MessageCircle,
  Heart,
  Star,
} from "lucide-react";
import type { ApiProduct } from "../../types/api";
import { useCartActions } from "../../hooks/useCartActions";
import { useProductStore } from "../../store/productStore";
import { useAuthState } from "../../context/AuthContext";
import { ContactActionBtn } from "../common/ContactActionBtn";

// --- MAIN PRODUCT CARD COMPONENT ---
type Props = { 
  product: ApiProduct;
  onOpenAuthModal?: () => void;
};

const ProductCard = ({ product, onOpenAuthModal }: Props) => {
  const navigate = useNavigate();
  const { handleAddToCart } = useCartActions();
  const { wishlistStatusMap, toggleWishlist } = useProductStore();
  const { user } = useAuthState();
  const [isWishloading, setIsWishloading] = useState(false);

  const isWishlisted = wishlistStatusMap[product.id] || false;

  const mainImage =
    typeof product.images?.[0] === "string"
      ? product.images[0]
      : (product.images?.[0] as any)?.url ||
        "https://placehold.co/400x400/18181b/a1a1aa?text=No+Image";

  const calculatedRatingFromReviews = product.reviews && product.reviews.length > 0
    ? product.reviews.reduce((acc, rev) => acc + (Number(rev.rating) || 0), 0) / product.reviews.length
    : 0;

  const averageRating = product.averageRating || product.rating || calculatedRatingFromReviews;
  const reviewCount = product.reviewCount || product.reviews?.length || 0;

  // Resolve vendorId robustly whether it's top-level or nested inside the vendor object
  const resolvedVendorId = product.vendorId || product.vendor?.id;

  const handleAdd = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handleAddToCart({
        id: product.id,
        name: product.title,
        price: Number(product.price),
        image: mainImage,
        vendorId: resolvedVendorId || "default",
        productId: product.id,
      });
    },
    [product, handleAddToCart, mainImage, resolvedVendorId]
  );

  const handleQuickView = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(`/products/${product.id}`);
    },
    [navigate, product.id]
  );

  const handleToggleWishlist = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      
      if (!user) {
        if (onOpenAuthModal) onOpenAuthModal();
        return;
      }

      try {
        setIsWishloading(true);
        await toggleWishlist(product.id);
      } catch (err) {
        console.error("Failed to toggle wishlist", err);
      } finally {
        setIsWishloading(false);
      }
    },
    [user, product.id, toggleWishlist, onOpenAuthModal]
  );

  const cleanPhone = product.vendor?.phone?.replace(/[^0-9+]/g, "") || "";

  return (
    <motion.div
      className="group bg-white dark:bg-[#0a0a0a] rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full border border-zinc-200 dark:border-white/5 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-600/10 transition-all duration-300 max-w-[280px] sm:max-w-none mx-auto w-full"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={() => navigate(`/products/${product.id}`)}
    >
      {/* ── 1. Image & Overlay Container ── */}
      <div className="relative overflow-hidden aspect-[4/3] sm:aspect-square bg-zinc-100 dark:bg-[#121212]">
        <img
          src={mainImage}
          alt={product.title}
          fetchPriority="high"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {user && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleWishlist}
            disabled={isWishloading}
            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center shadow-md transition-colors z-10 ${
              isWishlisted
                ? "bg-red-500 text-white"
                : "bg-black/40 text-white hover:bg-black/60"
            }`}
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart size={15} className={isWishlisted ? "fill-current" : ""} />
          </motion.button>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex items-end sm:items-center justify-end sm:justify-center p-2.5 sm:p-0 gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAdd}
            className="w-9 h-9 sm:w-11 sm:h-11 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-blue-500 transition-colors"
            title="Add to Cart"
          >
            <ShoppingCart size={16} className="sm:w-[18px] sm:h-[18px]" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleQuickView}
            className="w-9 h-9 sm:w-11 sm:h-11 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl flex items-center justify-center shadow-lg hover:bg-white/20 transition-colors"
            title="Quick View"
          >
            <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />
          </motion.button>
        </div>

        <div className="absolute top-2.5 left-2.5">
          <span
            className={`text-[9px] font-mono px-2 py-0.5 rounded-full backdrop-blur-md border shadow-md ${
              product.stock > 0
                ? "bg-black/70 text-emerald-400 border-emerald-500/30"
                : "bg-black/70 text-red-400 border-red-500/30"
            }`}
          >
            {product.stock > 0 ? `${product.stock} left` : "Out of stock"}
          </span>
        </div>
      </div>

      {/* ── 2. Card Information Body ── */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              {product.category?.name || "General"}
            </span>

            <div className="flex items-center gap-1 text-amber-500 font-mono text-[10px]">
              <Star size={12} className="fill-current" />
              <span>{Number(averageRating).toFixed(1)}</span>
              {reviewCount > 0 && (
                <span className="text-zinc-400">({reviewCount})</span>
              )}
            </div>
          </div>

          <h3 className="font-semibold text-zinc-900 dark:text-gray-100 text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {product.title.slice(0, 20) + (product.title.length > 20 ? "..." : "")}
          </h3>
        </div>

        <div className="space-y-1.5 pt-1.5 border-t border-zinc-200 dark:border-white/5">
          <div className="flex items-center gap-1.5 text-zinc-700 dark:text-gray-300">
            <Store size={12} className="text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-[11px] font-medium truncate">
              {product.vendor?.storeName || "Ingeri Official Merchant"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-gray-500">
            <MapPin size={12} className="shrink-0" />
            <span className="text-[10px] uppercase tracking-wider truncate">
              {product.location || "Kigali, Rwanda"}
            </span>
          </div>

          {cleanPhone && (
            <div className="flex items-center gap-1.5 pt-1">
              <ContactActionBtn
                type="whatsapp"
                to={cleanPhone}
                productId={product.id}
                vendorId={resolvedVendorId}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all text-[9px] font-mono"
              >
                <MessageCircle size={10} />
                WhatsApp
              </ContactActionBtn>

              <ContactActionBtn
                type="call"
                to={cleanPhone}
                productId={product.id}
                vendorId={resolvedVendorId}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all text-[9px] font-mono"
              >
                <Phone size={10} />
                Call
              </ContactActionBtn>
            </div>
          )}
        </div>

        {/* ── 3. Footer: Price & Stock ── */}
        <div className="pt-2 flex items-center justify-between border-t border-zinc-200 dark:border-white/5 mt-auto">
          <div>
            <span className="text-[9px] text-zinc-500 dark:text-gray-500 uppercase tracking-widest block">
              Price
            </span>
            <p className="font-mono font-bold text-zinc-900 dark:text-white text-sm sm:text-base">
              RWF {Number(product.price).toLocaleString()}
            </p>
          </div>

          <div
            className={`text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              product.stock > 0
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
            }`}
          >
            {product.stock > 0 ? `${product.stock} in stock` : "Sold Out"}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;