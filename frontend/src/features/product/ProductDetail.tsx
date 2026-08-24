// pages/ProductDetail.tsx
import { useEffect, useCallback, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
  Star,
  Store,
  Check,
  ShoppingCart,
  Shield,
  Share2,
} from "lucide-react";

import { useCartActions } from "../../hooks/useCartActions";
import { productService } from "../../services/productService";
import type { ApiProduct } from "../../types/api";
import Button from "../../components/ui/Button";
import QuantityButton from "../../components/ui/QuantityButton";
import { useProductStore } from "../../store/productStore";
import ProductCard from "../../components/common/ProductCard";
import WishlistButton from "../../components/common/WishlistButton";
import ProductReviews from "../../features/admin/product/ProductReviews";
import type { ReviewItem } from "../../types";
import { motion } from "framer-motion";
import { AuthPromptModal } from "../../features/product/AuthPromptModal";
import { useAuthState } from "../../context/AuthContext"; 

type NormalizedImage = {
  url: string;
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const authState = useAuthState();
  const isAuthenticated = Boolean(authState?.user);

  const { handleAddToCart } = useCartActions();
  const { wishlistStatusMap, checkWishlist, toggleWishlist, products } = useProductStore();

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  // Modal Visibility State for Auth Prompt
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Database-backed reviews state
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);

  // Automatic Timer for Auth Prompt Modal (e.g., 15 seconds for unauthenticated guest users)
  useEffect(() => {
    if (isAuthenticated) return; // Don't trigger if user is signed in

    const timer = setTimeout(() => {
      setIsAuthModalOpen(true);
    }, 15000); // 15 seconds delay

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  // Fetch Product, Database Reviews, and Store Wishlist Status
  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    setIsLoading(true);

    const loadProductData = async () => {
      try {
        // 1. Fetch Product details
        const productData = await productService.getProduct(id);
        if (!isMounted) return;
        setProduct(productData);

        // 2. Fetch persisted reviews from DB service
        setIsReviewsLoading(true);
        try {
          const fetchedReviews = await productService.getProductReviews(id);
          if (isMounted) setReviews(fetchedReviews);
        } catch (revErr) {
          console.error("Failed to load database reviews:", revErr);
        } finally {
          if (isMounted) setIsReviewsLoading(false);
        }

        // 3. Check wishlist status via store action (supports backend + guest fallback)
        try {
          await checkWishlist(id);
        } catch (wishErr) {
          console.error("Failed to check wishlist status via store:", wishErr);
        }

      } catch (err) {
        if (isMounted) {
          setError("Component missing from master data record");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProductData();

    return () => {
      isMounted = false;
    };
  }, [id, checkWishlist]);

  // Determine current wishlist status from store map
  const isWishlisted = id ? Boolean(wishlistStatusMap[id]) : false;

  const handleWishlistToggle = async () => {
    if (!id) return;
    try {
      await toggleWishlist(id);
    } catch (err) {
      console.error("Failed to toggle wishlist item:", err);
    }
  };

  // Suggested Products Slicing
  const suggestedProducts = useMemo(() => {
    return products.filter((p) => p.id !== id).slice(0, 4);
  }, [products, id]);

  const images: NormalizedImage[] = useMemo(() => {
    if (!product?.images || !Array.isArray(product.images)) {
      return [{ url: "/placeholder.png" }];
    }

    return product.images.map((img: any) => {
      if (typeof img === "string") {
        return { url: img };
      }

      return {
        url: img?.url || "/placeholder.png",
      };
    });
  }, [product]);

  const parsedPrice = Number(product?.price || 0);

  const handlePrevImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setImageIndex((prev) =>
        prev === 0 ? images.length - 1 : prev - 1
      );
    },
    [images.length]
  );

  const handleNextImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setImageIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    },
    [images.length]
  );

  const handleQuantityChange = useCallback(
    (delta: number) => {
      setQuantity((prev) => Math.max(1, prev + delta));
    },
    []
  );

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title || "Product details",
          text: `Check out ${product?.title} on Ingeri Store!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Product link copied to clipboard!");
    }
  };

  const handleAddToCartClick = useCallback(() => {
    if (!product) return;

    for (let i = 0; i < quantity; i++) {
      handleAddToCart({
        id: String(product.id),
        name: product.title,
        price: Number(product.price),
        image: images[0]?.url || "/placeholder.png",
        productId: String(product.id),
        vendorId: String(product.vendorId),
      });
    }

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 2000);
  }, [product, quantity, handleAddToCart, images]);

  const handleExecuteCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (!product) return;

    navigate("/checkout", {
      state: {
        guestUser: {
          email: guestEmail,
          phone: guestPhone,
          isGuest: true,
        },
        directProductPurchase: {
          id: String(product.id),
          title: product.title,
          price: Number(product.price),
          quantity,
        },
      },
    });
  };

  // Persist new review to the database
  const handleAddReview = async (newRev: Omit<ReviewItem, "id" | "date">) => {
    if (!id) return;
    try {
      const savedReview = await productService.addProductReview(id, newRev);
      setReviews((prev) => [savedReview, ...prev]);
    } catch (err) {
      console.error("Failed to submit review to database:", err);
      alert("Could not post your review. Please try again.");
    }
  };

  // Calculate the dynamic average rating from the loaded reviews for this product
const totalRating = reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0);
const calculatedAverageRating = reviews.length > 0 ? totalRating / reviews.length : 0.0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#050505] flex items-center justify-center transition-colors">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#050505] flex flex-col items-center justify-center gap-4 font-mono transition-colors">
        <p className="text-zinc-500 dark:text-gray-400 text-xs uppercase tracking-widest">
          Asset tracking node unallocated
        </p>

        <Button
          label="Return to Catalog"
          icon={ArrowLeft}
          onClick={() => navigate("/products")}
          className="border border-zinc-200 dark:border-white/10 text-xs uppercase cursor-pointer text-zinc-800 dark:text-gray-200 bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-zinc-900 dark:text-gray-100 font-sans selection:bg-blue-500/30 transition-colors">

      {/* Auth Prompt Modal (Triggers on timer or actions) */}
      <AuthPromptModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0b0b0b] border border-zinc-200 dark:border-white/10 w-full max-w-sm p-8 rounded-3xl shadow-2xl relative transition-colors">
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <form onSubmit={handleExecuteCheckout} className="space-y-5">
              <div>
                <h2 className="text-lg font-black tracking-tight uppercase font-mono text-zinc-900 dark:text-white">
                  Direct Checkout
                </h2>
                <p className="text-zinc-500 dark:text-gray-400 text-xs mt-1 leading-normal">
                  Provide contact points below to receive delivery updates.
                </p>
              </div>

              <div className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-[#050505] border border-zinc-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-zinc-900 dark:text-white focus:border-blue-500 transition-colors"
                />

                <input
                  type="tel"
                  required
                  placeholder="+250 788 000 000"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-[#050505] border border-zinc-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-zinc-900 dark:text-white focus:border-blue-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest cursor-pointer transition-colors shadow-lg shadow-blue-600/20"
              >
                Execute Transaction
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md border-b border-zinc-200 dark:border-white/10 px-6 py-4 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/products")}
            className="group flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white transition-all uppercase tracking-wider cursor-pointer"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>Back to Catalog</span>
          </button>

          <div className="flex items-center gap-4">
            {/* Share Button */}
            <button
              onClick={handleShare}
              title="Share Product"
              className="p-2 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-gray-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <Share2 size={16} />
            </button>

            {/* Wishlist Button Connected to Store Logic */}
            <WishlistButton
              productId={String(product.id)}
              initialState={isWishlisted}
              onToggle={handleWishlistToggle}
              size={18}
            />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Gallery */}
          <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-24">
            <div className="relative aspect-square bg-zinc-100 dark:bg-[#0b0b0b] overflow-hidden rounded-3xl border border-zinc-200 dark:border-white/10 group transition-colors shadow-sm">
              <img
                src={images[imageIndex]?.url}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />

              {images.length > 1 && (
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                  <button
                    onClick={handlePrevImage}
                    className="pointer-events-auto p-2.5 bg-black/60 backdrop-blur-md text-white rounded-xl hover:bg-black/80 transition-colors cursor-pointer border border-white/10"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    onClick={handleNextImage}
                    className="pointer-events-auto p-2.5 bg-black/60 backdrop-blur-md text-white rounded-xl hover:bg-black/80 transition-colors cursor-pointer border border-white/10"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImageIndex(i)}
                  className={`shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${i === imageIndex
                    ? "border-blue-500 scale-95 shadow-md shadow-blue-500/20"
                    : "border-zinc-200 dark:border-white/10 opacity-60 hover:opacity-100"
                    }`}
                >
                  <img
                    src={img.url}
                    alt={`thumbnail-${i}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:col-span-5 space-y-8">
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-blue-500/20">
                  {product.category?.name || "Premium Node"}
                </span>

                <div className="flex items-center gap-1 text-amber-500 ml-auto text-xs font-bold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  <Star size={12} fill="currentColor" />
                  <span>4.8</span>
                </div>
              </div>

              <h1 className="text-3xl lg:text-4xl font-black tracking-tight uppercase text-zinc-900 dark:text-white">
                {product.title}
              </h1>

              <div className="flex items-baseline gap-4 border-b border-zinc-200 dark:border-white/10 pb-6 transition-colors">
                <span className="text-4xl font-light text-zinc-900 dark:text-white">
                  RWF {parsedPrice.toFixed(2)}
                </span>
                <span className="text-zinc-400 dark:text-gray-500 line-through text-lg">
                  RF {(parsedPrice * 1.25).toFixed(0)}
                </span>
              </div>

              <p className="text-zinc-600 dark:text-gray-300 text-sm leading-relaxed">
                {product.description}
              </p>
            </section>

            {/* Vendor Card */}
            <div className="bg-zinc-50 dark:bg-[#0b0b0b] border border-zinc-200 dark:border-white/10 rounded-3xl p-5 space-y-4 transition-colors shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Store size={20} className="text-blue-600 dark:text-blue-400" />
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 dark:text-gray-400 font-bold">
                    Vendor Node
                  </p>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                    {product.vendor?.storeName || "Independent Vendor"}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-[#050505] border border-zinc-200 dark:border-white/10 rounded-2xl p-3 transition-colors">
                  <p className="text-[9px] uppercase text-zinc-400 dark:text-gray-400 font-bold tracking-wider">
                    Inventory
                  </p>
                  <p className="text-sm font-black text-zinc-900 dark:text-white mt-1">
                    {product.stock} Units
                  </p>
                </div>

                <div className="bg-white dark:bg-[#050505] border border-zinc-200 dark:border-white/10 rounded-2xl p-3 transition-colors">
                  <p className="text-[9px] uppercase text-zinc-400 dark:text-gray-400 font-bold tracking-wider">
                    Vendor Status
                  </p>
                  <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    Active
                  </p>
                </div>
              </div>

              {/* Action Button for quantity change */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-semibold text-zinc-500 dark:text-gray-400 uppercase tracking-wider">
                  Quantity
                </span>
                <QuantityButton
                  quantity={quantity}
                  onDecrease={() => handleQuantityChange(-1)}
                  onIncrease={() => handleQuantityChange(1)}
                  min={1}
                  max={product.stock} // Automatically caps at maximum available inventory stock
                />
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-white/10 space-y-3 transition-colors">
                <Button
                  label={added ? "Added to Cart" : "Add to Cart"}
                  icon={added ? Check : ShoppingCart}
                  onClick={handleAddToCartClick}
                  disabled={added}
                  className="w-full py-4 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors shadow-lg shadow-blue-600/20"
                />

                <Button
                  label={"Continue Shopping"}
                  icon={ArrowLeft}
                  iconPosition="left"
                  onClick={() => navigate("/products")}
                  disabled={added}
                  className="w-full py-4 flex items-center justify-center bg-transparent border border-zinc-300 dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/20 text-zinc-700 dark:text-gray-300 hover:text-zinc-900 dark:hover:text-white rounded-2xl text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors"
                />
              </div>
            </div>

            {/* Description */}
            <div className="bg-zinc-50 dark:bg-[#0b0b0b] border border-zinc-200 dark:border-white/10 rounded-3xl p-5 transition-colors shadow-sm">
              <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                Product Description
              </h2>
              <p className="text-zinc-600 dark:text-gray-300 text-sm leading-relaxed mt-3">
                {product.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-zinc-50 dark:bg-[#0b0b0b] border border-zinc-200 dark:border-white/10 rounded-3xl p-5 flex items-center gap-4 cursor-pointer transition-colors shadow-sm"
              >
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Check size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 font-bold">Trusted Node</p>
                  <h3 className="text-sm font-black text-emerald-700 dark:text-emerald-300">Quality Assured</h3>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-zinc-50 dark:bg-[#0b0b0b] border border-zinc-200 dark:border-white/10 rounded-3xl p-5 flex items-center gap-4 cursor-pointer transition-colors shadow-sm"
              >
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Shield size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 font-bold">Secure Node</p>
                  <h3 className="text-sm font-black text-blue-700 dark:text-blue-300">Verified Transit</h3>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {!isReviewsLoading ? (
          <div className="mt-16 border-t border-zinc-200 dark:border-white/10 pt-12 transition-colors">
            <ProductReviews
              productId={String(product.id)}
              reviews={reviews}
              onAddReview={handleAddReview}
              averageRating={calculatedAverageRating}
            />
          </div>
        ) : (
          <div className="mt-16 border-t border-zinc-200 dark:border-white/10 pt-12 flex flex-col items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-500 dark:text-gray-400 text-sm mt-2">
              Loading reviews...
            </p>
          </div>
        )}

        {/* Suggested Alternatives */}
        <section className="mt-16 border-t border-zinc-200 dark:border-white/10 pt-12 transition-colors">
          <h2 className="text-xl font-black uppercase tracking-widest mb-8 text-zinc-900 dark:text-white">Suggested Alternatives</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {suggestedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          {suggestedProducts.length === 0 && (
            <p className="text-zinc-500 dark:text-gray-400 border border-zinc-200 dark:border-white/10 rounded-3xl p-5 flex items-center gap-4 cursor-pointer transition-colors shadow-sm">
              No suggested alternatives available at the moment.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}