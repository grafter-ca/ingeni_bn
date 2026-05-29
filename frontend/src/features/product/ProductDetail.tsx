import { useEffect, useCallback, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Heart,
  ChevronLeft,
  ChevronRight,
  X,
  Star,
  Store,
  Check,
  ShoppingCart,
} from "lucide-react";

import { useCartActions } from "../../hooks/useCartActions";
import { productService } from "../../services/productService";
import type { ApiProduct } from "../../types/api";
import Button from "../../components/ui/Button";

type NormalizedImage = {
  url: string;
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { handleAddToCart } = useCartActions();

  const [product, setProduct] = useState<ApiProduct | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [imageIndex, setImageIndex] = useState(0);

  const [quantity, setQuantity] = useState(1);

  const [added, setAdded] = useState(false);

  const [wishlist, setWishlist] = useState(false);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [guestEmail, setGuestEmail] = useState("");

  const [guestPhone, setGuestPhone] = useState("");

  useEffect(() => {
    if (!id) return;

    setIsLoading(true);

    productService
      .getProduct(id)
      .then((data) => {
        setProduct(data);

        setIsLoading(false);
      })
      .catch(() => {
        setError("Component missing from master data record");

        setIsLoading(false);
      });
  }, [id]);

  /**
   * Normalize images safely
   */
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

  const handleExecuteCheckout = (
    e: React.FormEvent
  ) => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4 font-mono">
        <p className="text-gray-500 text-xs uppercase tracking-widest">
          Asset tracking node unallocated
        </p>

        <Button
          label="Return to Catalog"
          icon={ArrowLeft}
          onClick={() => navigate("/products")}
          className="border border-white/10 text-xs uppercase"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-blue-500/30">

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">

          <div className="bg-[#0b0b0b] border border-white/5 w-full max-w-sm p-8 rounded-3xl shadow-2xl relative">

            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <form
              onSubmit={handleExecuteCheckout}
              className="space-y-5"
            >
              <div>
                <h2 className="text-lg font-black tracking-tight uppercase font-mono">
                  Direct Checkout
                </h2>

                <p className="text-gray-500 text-xs mt-1 leading-normal">
                  Provide contact points below to receive delivery updates.
                </p>
              </div>

              <div className="space-y-3">

                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={guestEmail}
                  onChange={(e) =>
                    setGuestEmail(e.target.value)
                  }
                  className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-sm outline-none text-white focus:border-blue-500"
                />

                <input
                  type="tel"
                  required
                  placeholder="+250 788 000 000"
                  value={guestPhone}
                  onChange={(e) =>
                    setGuestPhone(e.target.value)
                  }
                  className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-sm outline-none text-white focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest"
              >
                Execute Transaction
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 px-6 py-4">

        <div className="max-w-7xl mx-auto flex items-center justify-between">

          <button
            onClick={() => navigate("/products")}
            className="group flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white transition-all uppercase tracking-wider"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-1 transition-transform"
            />

            <span>Back to Catalog</span>
          </button>

          <Heart
            size={18}
            onClick={() => setWishlist(!wishlist)}
            className={`cursor-pointer transition-colors ${
              wishlist
                ? "fill-rose-500 text-rose-500"
                : "text-gray-600 hover:text-white"
            }`}
          />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 lg:py-16">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Gallery */}
          <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-24">

            <div className="relative aspect-square bg-[#0b0b0b] overflow-hidden rounded-3xl border border-white/5 group">

              <img
                src={images[imageIndex]?.url}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />

              {images.length > 1 && (
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">

                  <button
                    onClick={handlePrevImage}
                    className="pointer-events-auto p-2.5 bg-black/60 backdrop-blur-md text-white rounded-xl"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    onClick={handleNextImage}
                    className="pointer-events-auto p-2.5 bg-black/60 backdrop-blur-md text-white rounded-xl"
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
                  className={`shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                    i === imageIndex
                      ? "border-blue-500 scale-95"
                      : "border-transparent opacity-40 hover:opacity-100"
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

                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-blue-500/20">
                  {product.category?.name || "Premium Node"}
                </span>

                <div className="flex items-center gap-1 text-amber-500 ml-auto text-xs font-bold">
                  <Star size={12} fill="currentColor" />
                  <span>4.8</span>
                </div>
              </div>

              <h1 className="text-3xl lg:text-4xl font-black tracking-tight uppercase">
                {product.title}
              </h1>

              <div className="flex items-baseline gap-4 border-b border-white/5 pb-6">

                <span className="text-4xl font-light">
                  ${parsedPrice.toFixed(2)}
                </span>

                <span className="text-gray-600 line-through text-lg">
                  ${(parsedPrice * 1.25).toFixed(0)}
                </span>
              </div>

              <p className="text-gray-400 text-sm leading-relaxed">
                {product.description}
              </p>
            </section>

            {/* Vendor */}
            <div className="bg-[#0b0b0b] border border-white/5 rounded-3xl p-5 space-y-4">

              <div className="flex items-center gap-3">

                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Store size={20} className="text-blue-400" />
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">
                    Vendor Node
                  </p>

                  <h3 className="text-lg font-black">
                    {product.vendor?.storeName ||
                      "Independent Vendor"}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">

                <div className="bg-black/40 border border-white/5 rounded-2xl p-3">
                  <p className="text-[9px] uppercase text-gray-500 font-bold tracking-wider">
                    Inventory
                  </p>

                  <p className="text-sm font-black text-white mt-1">
                    {product.stock} Units
                  </p>
                </div>

                <div className="bg-black/40 border border-white/5 rounded-2xl p-3">
                  <p className="text-[9px] uppercase text-gray-500 font-bold tracking-wider">
                    Vendor Status
                  </p>

                  <p className="text-sm font-black text-green-400 mt-1">
                    Active
                  </p>
                </div>
              </div>

              {/* Action Button for quantity change */}
              < div className="flex items-center gap-4 mt-2">

                <div className="flex items-center gap-2"> 
                  <Button
                    label="-"
                    onClick={() => handleQuantityChange(-1)}
                    className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                  />
                  <span className="text-sm font-medium">{quantity}</span>
                  <Button
                    label="+"   
                    onClick={() => handleQuantityChange(1)}
                    className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                  />
                </div>
                </div>

              <div className="pt-4 border-t border-white/5">
                <Button
                  label={added ? "Added to Cart" : "Add to Cart"}
                  icon={added ? Check : ShoppingCart}
                  onClick={handleAddToCartClick}
                  disabled={added}
                  className="w-full py-4 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest"
                />
                <Button
                  label={"Continue Shopping"}
                  icon={ArrowLeft}
                  iconPosition="left"
                  onClick={() => navigate("/products")}
                  disabled={added}
                  className="w-full mt-3 py-4 flex items-center justify-center bg-transparent border border-white/10 hover:border-white/20 text-gray-500 hover:text-white rounded-2xl text-xs font-bold uppercase tracking-widest"
                />
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#0b0b0b] border border-white/5 rounded-3xl p-5">
              <h2 className="text-xl font-black uppercase tracking-tight">
                Product Description
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mt-3">
                {product.description}
              </p>
            </div>

            {/* Trustcard static to all products is custom */}
            <div className="bg-[#0b0b0b] border border-white/5 rounded-3xl p-5 flex items-center gap-4">

              <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <Check size={20} className="text-green-400" />
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-green-500 font-bold">
                  Trusted Node
                </p>
                <h3 className="text-lg font-black text-green-400">
                  Quality Assured
                </h3>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}