import { useEffect, useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, Loader2, X } from "lucide-react";
import { useProductStore } from "../../store/productStore";
import { useSearch } from "../../hooks/useSearch";
import ProductCard from "../../components/common/ProductCard";
import ProductSidebar from "../product/ProductSidebar";
import SearchBar from "../../components/ui/SearchBar";

type SortOption = "default" | "price_asc" | "price_desc" | "newest";

const Products = () => {
  const [searchParams] = useSearchParams();
  const categoryIdParam = searchParams.get("categoryId");

  const {
    filteredProducts,
    isLoading,
    isFetchingMore,
    error,
    fetchProducts,
    fetchMoreProducts,
    setCategory,
    categories
  } = useProductStore();

  const { handleClear } = useSearch();

  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile Drawer State
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  // Sync logic
  useEffect(() => {
    if (categoryIdParam) {
      setCategory(String(categoryIdParam), true);
    } else {
      fetchProducts({ limit: 40 });
    }
  }, [categoryIdParam, setCategory, fetchProducts]);

  // Filter & Sort
  const sorted = useMemo(() => {
    let result = [...filteredProducts].filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );
    if (sortBy === "price_asc") result.sort((a, b) => a.price - b.price);
    if (sortBy === "price_desc") result.sort((a, b) => b.price - a.price);
    if (sortBy === "newest") result.sort((a, b) => Number(b.id) - Number(a.id));
    return result;
  }, [filteredProducts, sortBy, priceRange]);

  const paginated = useMemo(() => sorted.slice(0, page * PER_PAGE), [sorted, page]);
  const hasMore = paginated.length < sorted.length;

  const handleLoadMore = useCallback(() => {
    if (hasMore) {
      setPage((p) => p + 1);
    } else {
      fetchMoreProducts();
    }
  }, [hasMore, fetchMoreProducts]);

  return (
    <div className="min-h-screen bg-gray-900 font-poppins text-gray-100 relative">
      
      {/* --- MOBILE SIDEBAR DRAWER --- */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 md:hidden"
            />
            {/* Drawer Content */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[80%] max-w-[320px] bg-gray-900 z-70 p-6 shadow-2xl md:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-white">Filters</h2>
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <ProductSidebar priceRange={priceRange} onPriceChange={setPriceRange} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-30">
        <div className="px-6 py-5 flex flex-wrap items-center justify-between gap-4 max-w-7xl mx-auto">
          <div>
            <h1 className="font-bold text-xl md:text-2xl text-white tracking-tight">
              {categoryIdParam ? categories.find(c => String(c.id) === String(categoryIdParam))?.name : "All Collections"}
            </h1>
            <p className="text-gray-500 text-[10px] md:text-xs mt-1 font-medium tracking-widest uppercase">
              {sorted.length} Products Found
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
            <div className="flex-1 md:w-64">
              <SearchBar />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-gray-800 border rounded-lg border-gray-700 text-white text-[10px] md:text-xs px-3 md:px-4 py-2.5 outline-none cursor-pointer hover:border-gray-500 transition-all"
            >
              <option value="default">Default</option>
              <option value="price_asc">Price: Low</option>
              <option value="price_desc">Price: High</option>
              <option value="newest">Newest</option>
            </select>

            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden flex items-center justify-center text-white bg-blue-600 p-2.5 rounded-lg active:scale-95 transition-all shadow-lg shadow-blue-600/20"
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex items-start">
        {/* --- DESKTOP SIDEBAR (Static/Persistent) --- */}
        <aside className="hidden md:block w-72 shrink-0 border-r border-gray-800 px-6 py-12 sticky top-24 h-[calc(100vh-100px)] overflow-y-auto">
          <ProductSidebar priceRange={priceRange} onPriceChange={setPriceRange} />
        </aside>

        {/* Product Grid Area */}
        <main className="flex-1 px-4 md:px-8 py-8 md:py-12">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8 text-red-400 text-sm flex items-center gap-3">
              <X size={16} /> {error}
            </div>
          )}

          {isLoading && page === 1 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-3/4 bg-gray-800/50 animate-pulse rounded-2xl" />
                ))}
              </div>
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                <motion.div 
                  className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 md:gap-6"
                  layout
                >
                  {paginated.map((product, i) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: i * 0.03 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Load More Button */}
              <div className="flex flex-col items-center justify-center mt-20 gap-4">
                {hasMore || isFetchingMore ? (
                  <motion.button
                    onClick={handleLoadMore}
                    disabled={isFetchingMore}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-3 font-bold text-[10px] tracking-[0.25em] uppercase px-10 py-4 bg-white text-gray-900 rounded-full hover:bg-gray-200 transition-all disabled:opacity-50"
                  >
                    {isFetchingMore ? <Loader2 className="animate-spin" size={14} /> : "Explore More"}
                  </motion.button>
                ) : null}
                
                <p className="text-gray-600 text-[10px] font-medium tracking-widest uppercase">
                  {paginated.length} of {sorted.length} Items Viewed
                </p>
              </div>

              {sorted.length === 0 && !isLoading && (
                <div className="text-center py-32">
                  <div className="bg-gray-800/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
                    <SlidersHorizontal className="text-gray-500" size={24} />
                  </div>
                  <p className="text-gray-400 text-lg mb-6">No matching products found</p>
                  <button
                    onClick={handleClear}
                    className="px-8 py-3 bg-blue-600 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-blue-500 transition-all"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;