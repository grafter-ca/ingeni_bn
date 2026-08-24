// src/pages/Wishlist.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useProductStore } from "../store/productStore";

const Wishlist = () => {
  const { products, fetchProducts, wishlistStatusMap, toggleWishlist, checkWishlist } = useProductStore();
  const [loading, setLoading] = useState(true);

  // Run only once on mount to avoid infinite loops
  useEffect(() => {
    const initWishlistPage = async () => {
      setLoading(true);
      
      // Fetch products if not already loaded
      const currentProducts = useProductStore.getState().products;
      if (!currentProducts || currentProducts.length === 0) {
        await fetchProducts();
      }

      // Re-evaluate current products from store state
      const freshProducts = useProductStore.getState().products;
      if (freshProducts.length > 0) {
        await Promise.all(
          freshProducts.map((p) => checkWishlist(p.id))
        );
      }
      setLoading(false);
    };

    void initWishlistPage();
  }, []); // <-- Empty dependency array ensures it only runs once on load

  // Filter products that are marked as true in the wishlistStatusMap
  const wishlistedProducts = products.filter(
    (product) => wishlistStatusMap[product.id] === true
  );

  const handleRemove = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(productId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex items-center justify-center font-poppins transition-colors duration-200">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600 dark:text-blue-500" size={40} />
          <p className="text-gray-500 text-sm animate-pulse">
            Loading your saved wishlist...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white py-12 px-6 font-poppins transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-200 dark:border-white/5">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
                <Heart size={24} className="fill-rose-500/20" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">My Wishlist</h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Keep track of items you love and grab them when you're ready
            </p>
          </div>
          <span className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 self-start sm:self-auto">
            {wishlistedProducts.length} Saved Products
          </span>
        </div>

        {/* Wishlist Grid or Empty State */}
        {wishlistedProducts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistedProducts.map((product) => {
              const primaryImage = product.images?.[0] || "/placeholder.jpg";
              const isOutOfStock = (product.stock ?? 0) <= 0;

              return (
                <div
                  key={product.id}
                  className="group bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-3xl p-4 flex flex-col justify-between hover:border-blue-500/40 transition-all shadow-sm relative"
                >
                  {/* Remove Button Badge */}
                  <button
                    onClick={(e) => handleRemove(product.id, e)}
                    className="absolute top-6 right-6 z-10 p-2.5 rounded-xl bg-white/80 dark:bg-black/60 backdrop-blur-md border border-gray-200 dark:border-white/10 text-gray-500 hover:text-rose-500 hover:border-rose-500/30 transition-all shadow-sm cursor-pointer"
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div>
                    {/* Product Image */}
                    <Link to={`/products/${product.id}`} className="block relative w-full h-52 rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/5 mb-4">
                      <img
                        src={primaryImage}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {isOutOfStock && (
                        <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-bold text-amber-400 uppercase tracking-wider border border-white/10">
                          Out of Stock
                        </span>
                      )}
                    </Link>

                    {/* Product Metadata */}
                    <Link to={`/products/${product.id}`} className="block">
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 text-base">
                        {product.title}
                      </h3>
                    </Link>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  {/* Card Footer: Price & Actions */}
                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 block font-medium">
                        Price
                      </span>
                      <span className="font-mono text-base font-bold text-gray-900 dark:text-white">
                        RWF {(product.price || 0).toLocaleString()}
                      </span>
                    </div>

                    <Link
                      to={`/products/${product.id}`}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-semibold text-xs hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-sm"
                    >
                      View Item <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-white dark:bg-[#0a0a0a] rounded-3xl border border-dashed border-gray-200 dark:border-white/10 p-8 shadow-sm">
            <div className="bg-rose-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-500">
              <Sparkles size={28} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your wishlist is empty</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-sm mx-auto mb-8">
              Explore our product catalogue and click the heart icon on any item to save it for later.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors text-sm shadow-lg shadow-blue-600/20"
            >
              <ShoppingBag size={18} /> Discover Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;