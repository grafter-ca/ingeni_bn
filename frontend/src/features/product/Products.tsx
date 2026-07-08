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
    fetchCategories,
    setCategory,
    categories
  } = useProductStore();

  const { handleClear } = useSearch();

  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (categoryIdParam) {
      setCategory(String(categoryIdParam));
    } else {
      fetchProducts({ limit: 40 });
    }
    setPage(1);
  }, [categoryIdParam, setCategory, fetchProducts]);

  const sorted = useMemo(() => {
    let result = [...filteredProducts].filter(
      (p) => Number(p.price) >= priceRange[0] && Number(p.price) <= priceRange[1]
    );
    if (sortBy === "price_asc") result.sort((a, b) => Number(a.price) - Number(b.price));
    if (sortBy === "price_desc") result.sort((a, b) => Number(b.price) - Number(a.price));
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

  console.log("Products rendered with:", { categoryIdParam, sortBy, priceRange, page, filteredProductsLength: filteredProducts.length, sortedLength: sorted.length });  

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-gray-100 relative selection:bg-blue-500/30">
      
      {/* --- MOBILE SIDEBAR DRAWER --- */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[80%] max-w-[320px] bg-[#050505] border-r border-white/5 z-50 p-6 shadow-2xl md:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-black tracking-widest text-white uppercase font-mono">Filters</h2>
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 bg-white/5 text-gray-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              <ProductSidebar priceRange={priceRange} onPriceChange={setPriceRange} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Dynamic Filter Header Context */}
      <div className="border-b border-white/5 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="px-6 py-5 flex flex-wrap items-center justify-between gap-4 max-w-7xl mx-auto">
          <div>
            <h1 className="font-black text-xl md:text-2xl text-white tracking-tight uppercase font-mono bg-linear-to-r from-white to-gray-400 bg-clip-text ">
              {categoryIdParam 
                ? categories.find(c => String(c.id) === String(categoryIdParam))?.name || "Loading..." 
                : "Collections"}
            </h1>
            <p className="text-gray-500 text-[10px] mt-1 font-bold tracking-[0.2em] uppercase font-mono">
              {sorted.length} Units Available
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
            <div className="flex-1 md:w-64">
              <SearchBar />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-[#050505] border rounded-xl border-white/5 text-gray-400 text-[10px] font-bold uppercase tracking-wider px-3 md:px-4 py-2.5 outline-none cursor-pointer hover:border-white/20 hover:text-white transition-all font-mono"
            >
              <option value="default">Default Matrix</option>
              <option value="price_asc">Price: Ascending</option>
              <option value="price_desc">Price: Descending</option>
              <option value="newest">Latest Drop</option>
            </select>

            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden flex items-center justify-center text-white bg-blue-600 p-2.5 rounded-xl active:scale-95 transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex items-start">
        {/* --- DESKTOP SIDEBAR (Side-Fixed Viewport Tracking) --- */}
        <aside className="hidden md:block w-72 shrink-0 border-r border-white/5 px-6 py-12 sticky top-24 h-[calc(100vh-100px)] overflow-y-auto no-scrollbar">
          <ProductSidebar priceRange={priceRange} onPriceChange={setPriceRange} />
        </aside>

        {/* Product Grid Area Layout */}
        <main className="flex-1 px-4 md:px-8 py-8 md:py-12">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 mb-8 text-rose-400 text-xs font-mono flex items-center gap-3">
              <X size={14} /> telemetry error: {error}
            </div>
          )}

          {isLoading && page === 1 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-3/4 bg-white/2 border border-white/5 animate-pulse rounded-2xl" />
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
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25, delay: i * 0.02 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Load More Button Wrapper */}
              <div className="flex flex-col items-center justify-center mt-20 gap-4">
                {(hasMore || isFetchingMore) && (
                  <motion.button
                    onClick={handleLoadMore}
                    disabled={isFetchingMore}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 font-bold text-[10px] tracking-[0.25em] uppercase px-10 py-4 bg-white text-black rounded-full hover:bg-gray-200 transition-all disabled:opacity-50 font-mono cursor-pointer shadow-lg shadow-white/5"
                  >
                    {isFetchingMore ? <Loader2 className="animate-spin" size={12} /> : "Load Engine Matrix"}
                  </motion.button>
                )}
                
                <p className="text-gray-600 text-[9px] font-bold tracking-widest uppercase font-mono">
                  {paginated.length} / {sorted.length} Units Manifested
                </p>
              </div>

              {sorted.length === 0 && !isLoading && (
                <div className="text-center py-32">
                  <div className="bg-white/2 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                    <SlidersHorizontal className="text-gray-600" size={20} />
                  </div>
                  <p className="text-gray-400 text-sm font-mono mb-6">No matching components found in scope.</p>
                  <button
                    onClick={handleClear}
                    className="px-8 py-3 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all cursor-pointer shadow-lg shadow-blue-600/20"
                  >
                    Reset Grid Parameters
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