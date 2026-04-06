import { useEffect, useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingCart, ArrowLeft, Shield, Zap,
  Truck, RefreshCw, Heart, ChevronLeft, ChevronRight, X, CheckCircle, Star
} from "lucide-react";
import { useCartActions } from "../../hooks/useCartActions";
import { useAuthState } from "../../context/AuthContext";
import { productService } from "../../services/productService";
import type { ApiProduct } from "../../types/api";
import Button from "../../components/ui/Button";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>(); 
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
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

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
        setError("Product not found"); 
        setIsLoading(false); 
      });
  }, [id]);

  const handlePrevImage = useCallback(() => {
    if (!product?.images) return;
    setImageIndex((prev) => prev === 0 ? product.images.length - 1 : prev - 1);
  }, [product]);

  const handleNextImage = useCallback(() => {
    if (!product?.images) return;
    setImageIndex((prev) => prev === product.images.length - 1 ? 0 : prev + 1);
  }, [product]);

  const handleAddToCartClick = useCallback(() => {
    if (!user) { navigate("/login", { state: { from: `/products/${id}` } }); return; }
    if (!product) return;
    
    for (let i = 0; i < quantity; i++) {
      handleAddToCart({
        id: String(product.id),
        name: product.title,
        price: product.price,
        productId: String(product.id),
        image: product.images[0],
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }, [user, product, quantity, handleAddToCart, navigate, id]);

  if (isLoading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
      <p className="text-gray-400">Product not found</p>
      <Button label="Return to Shop" icon={ArrowLeft} onClick={() => navigate("/products")} />
    </div>
  );

  const images = product.images?.length > 0 ? product.images : ["/placeholder.png"];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-poppins selection:bg-blue-500/30">
      
      {/* ── Checkout Modal (Quick Flow) ── */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#141414] border border-white/10 w-full max-w-md p-8 rounded-2xl shadow-2xl relative">
            <button onClick={() => setIsCheckoutOpen(false)} className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors">
              <X size={24} />
            </button>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-2xl font-bold">Secure Checkout</h2>
              <p className="text-gray-400 text-sm">Proceeding with {quantity}x <strong>{product.title}</strong> for ${(product.price * quantity).toFixed(2)}</p>
              <Button label="Pay Now" onClick={() => navigate('/checkout')} className="w-full py-4 bg-blue-600 hover:bg-blue-500 mt-4" />
              <button onClick={() => setIsCheckoutOpen(false)} className="text-xs text-gray-500 uppercase tracking-widest hover:text-white">Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate("/products")} className="group flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-all">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Continue Shopping</span>
          </button>
          <div className="flex gap-4">
             <Heart size={20} className={`cursor-pointer transition-colors ${wishlist ? "fill-red-500 text-red-500" : "text-gray-500 hover:text-white"}`} onClick={() => setWishlist(!wishlist)} />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* ── Left: Gallery (Sticky on Desktop) ── */}
          <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-24">
            <div className="relative aspect-square bg-[#111] overflow-hidden rounded-3xl border border-white/5 group">
              <img
                src={images[imageIndex]}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {images.length > 1 && (
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                  <button onClick={handlePrevImage} className="pointer-events-auto p-3 bg-black/50 backdrop-blur-md rounded-full hover:bg-black transition-colors border border-white/10">
                    <ChevronLeft size={24} />
                  </button>
                  <button onClick={handleNextImage} className="pointer-events-auto p-3 bg-black/50 backdrop-blur-md rounded-full hover:bg-black transition-colors border border-white/10">
                    <ChevronRight size={24} />
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImageIndex(i)}
                  className={`shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${
                    i === imageIndex ? "border-blue-500 scale-95" : "border-transparent opacity-40 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* ── Right: Conversion Terminal ── */}
          <div className="lg:col-span-5 space-y-8">
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-blue-500/20">
                  {product.category?.name || "Premium Collection"}
                </span>
                <div className="flex items-center gap-1 text-yellow-500 ml-auto">
                  <Star size={14} fill="currentColor" />
                  <span className="text-sm font-bold">4.8</span>
                </div>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight">{product.title}</h1>
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-light text-white">${product.price}</span>
                <span className="text-gray-600 line-through text-xl">${(product.price * 1.3).toFixed(0)}</span>
              </div>
              <p className="text-gray-400 leading-relaxed font-light">{product.description}</p>
            </section>

            {/* Action Box */}
            <div className="p-6 bg-[#141414] rounded-3xl border border-white/5 space-y-6 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Select Quantity</span>
                <div className="flex items-center bg-black/40 rounded-xl p-1 border border-white/5">
                  <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="w-10 h-10 flex items-center justify-center hover:text-blue-500 transition-colors">−</button>
                  <span className="w-10 text-center font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(q => q+1)} className="w-10 h-10 flex items-center justify-center hover:text-blue-500 transition-colors">+</button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  label={added ? "Added to Cart" : "Add to Cart"}
                  icon={ShoppingCart}
                  onClick={handleAddToCartClick}
                  className={`w-full py-4 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all ${
                    added ? "bg-green-600 border-green-600" : "bg-transparent border-white/10 hover:bg-white/5"
                  }`}
                />
                <Button
                  label="Buy It Now"
                  icon={Zap}
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 border-none rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-600/20"
                />
              </div>
            </div>

            {/* Trust Matrix */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Truck, label: "Express", sub: "Fast Delivery" },
                { icon: Shield, label: "Secure", sub: "Encrypted" },
                { icon: RefreshCw, label: "Returns", sub: "30-Day Policy" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="p-4 rounded-2xl bg-white/2 border border-white/5 text-center space-y-1">
                  <Icon size={18} className="mx-auto text-blue-500 mb-1" />
                  <p className="text-[10px] font-bold text-white uppercase">{label}</p>
                  <p className="text-[9px] text-gray-500 uppercase">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;