import { useEffect, useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingCart, ArrowLeft, Star, Shield,
  Truck, RefreshCw, Share2, Heart, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useCartActions } from "../../hooks/useCartActions";
import { useAuthState } from "../../context/AuthContext";
import { productService } from "../../services/productService";
import type { ApiProduct } from "../../types/api";
import Button from "../../components/ui/Button";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleAddToCart } = useCartActions();
  const { user } = useAuthState();

  const [product, setProduct]       = useState<ApiProduct | null>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity]     = useState(1);
  const [added, setAdded]           = useState(false);
  const [wishlist, setWishlist]     = useState(false);

  // useEffect — fetch product on mount
  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    productService
      .getProduct(Number(id))
      .then((data) => { setProduct(data); setIsLoading(false); })
      .catch(() => { setError("Product not found"); setIsLoading(false); });
  }, [id]);

  const handlePrevImage = useCallback(() => {
    setImageIndex((prev) =>
      prev === 0 ? (product?.images.length ?? 1) - 1 : prev - 1
    );
  }, [product]);

  const handleNextImage = useCallback(() => {
    setImageIndex((prev) =>
      prev === (product?.images.length ?? 1) - 1 ? 0 : prev + 1
    );
  }, [product]);

  const handleAddToCartClick = useCallback(() => {
    if (!user) { navigate("/login", { state: { from: `/products/${id}` } }); return; }
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      handleAddToCart({
        id:    String(product.id),
        name:  product.title,
        price: product.price,
        image: product.images[0],
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }, [user, product, quantity, handleAddToCart, navigate, id]);

  // ── Loading ──
  if (isLoading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <p className="font-poppins text-gray-400 text-sm uppercase tracking-widest animate-pulse">
          Loading product...
        </p>
      </div>
    </div>
  );

  // ── Error ──
  if (error || !product) return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-4">
      <p className="font-poppins text-gray-400">{error ?? "Product not found"}</p>
      <Button label="Go Back" icon={ArrowLeft} onClick={() => navigate("/products")} />
    </div>
  );

  const images = product.images.length > 0 ? product.images : ["/placeholder.png"];

  return (
    <div className="min-h-screen bg-gray-900 text-white font-poppins">

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 text-xs text-gray-500 uppercase tracking-widest">
        <button onClick={() => navigate("/")} className="hover:text-white transition-colors">Home</button>
        <span>/</span>
        <button onClick={() => navigate("/products")} className="hover:text-white transition-colors">Products</button>
        <span>/</span>
        <span className="text-gray-300 truncate max-w-xs">{product.title}</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ── Image Gallery ── */}
          <div className="flex flex-col gap-4">

            {/* Main Image */}
            <div className="relative bg-gray-800 aspect-square overflow-hidden group">
              <img
                src={images[imageIndex]}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.png"; }}
              />

              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-gray-900/70 hover:bg-gray-900 p-2 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-900/70 hover:bg-gray-900 p-2 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Wishlist */}
              <button
                onClick={() => setWishlist((w) => !w)}
                className="absolute top-3 right-3 bg-gray-900/70 hover:bg-gray-900 p-2 transition-colors"
              >
                <Heart
                  size={18}
                  className={wishlist ? "fill-red-500 text-red-500" : "text-gray-400"}
                />
              </button>

              {/* Share */}
              <button className="absolute top-3 left-3 bg-gray-900/70 hover:bg-gray-900 p-2 transition-colors">
                <Share2 size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImageIndex(i)}
                    className={`flex-shrink-0 w-20 h-20 overflow-hidden border-2 transition-colors ${
                      i === imageIndex ? "border-white" : "border-gray-700 hover:border-gray-500"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.png"; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ── */}
          <div className="flex flex-col gap-6">

            {/* Category */}
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-gray-400 bg-gray-800 px-3 py-1">
                {product.category.name}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-bold text-3xl md:text-4xl text-white leading-tight">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}
                  />
                ))}
              </div>
              <span className="text-gray-400 text-sm">(4.0) · 128 reviews</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-bold text-4xl text-white">${product.price}</span>
              <span className="text-gray-500 line-through text-lg">
                ${(product.price * 1.2).toFixed(2)}
              </span>
              <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 uppercase tracking-widest">
                20% off
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-400 leading-relaxed text-sm border-t border-gray-800 pt-6">
              {product.description}
            </p>

            {/* Quantity */}
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-widest text-gray-400">Quantity</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 border border-gray-700 hover:border-white flex items-center justify-center text-white transition-colors text-lg"
                >
                  −
                </button>
                <span className="font-medium text-lg w-6 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 border border-gray-700 hover:border-white flex items-center justify-center text-white transition-colors text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                label={added ? "Added to Cart ✓" : "Add to Cart"}
                icon={ShoppingCart}
                onClick={handleAddToCartClick}
                className={`flex-1 ${added ? "bg-green-700 hover:bg-green-700" : ""}`}
              />
              <Button
                label="Buy Now"
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                onClick={handleAddToCartClick}
              />
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800">
              {[
                { icon: Truck,     label: "Free Shipping",   sub: "Orders over $50"   },
                { icon: Shield,    label: "Secure Payment",  sub: "100% protected"     },
                { icon: RefreshCw, label: "Easy Returns",    sub: "30-day policy"      },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1">
                  <Icon size={20} className="text-gray-400" />
                  <span className="text-xs font-medium text-white">{label}</span>
                  <span className="text-xs text-gray-500">{sub}</span>
                </div>
              ))}
            </div>

            {/* Product Meta */}
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-800 text-sm">
              <div className="flex gap-2">
                <span className="text-gray-500 w-24">Category</span>
                <span className="text-gray-300">{product.category.name}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500 w-24">Product ID</span>
                <span className="text-gray-300">#{product.id}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500 w-24">Availability</span>
                <span className="text-green-400">In Stock</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;