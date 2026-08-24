// pages/Products.tsx
import { useEffect, useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, Loader2, X, PackageX } from "lucide-react";
import { useProductStore } from "../../store/productStore";
import { useSearch } from "../../hooks/useSearch";
import ProductCard from "../../components/common/ProductCard";
import ProductSidebar from "../product/ProductSidebar";
import SearchBar from "../../components/ui/SearchBar";

type SortOption = "default" | "price_asc" | "price_desc" | "newest";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryIdParam = searchParams.get("categoryId");

  const {
    filteredProducts,
    isLoading,
    isFetchingMore,
    error,
    fetchPublicProducts,
    fetchMoreProducts,
    fetchCategories,
    setCategory,
    categories,
    selectedCategory,
  } = useProductStore();

  const { searchQuery, handleClear } = useSearch();

  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Synchronize URL categoryIdParam with the store state
  useEffect(() => {
    if (categoryIdParam && categories.length > 0) {
      const matchedCat = categories.find(c => String(c.id) === String(categoryIdParam));
      if (matchedCat) {
        setCategory(matchedCat.id);
      }
    } else if (!categoryIdParam) {
      setCategory(null);
      setSearchParams({});
    }
    fetchPublicProducts({ limit: 40 });
    setPage(1);
  }, [categoryIdParam, categories, setCategory, fetchPublicProducts, setSearchParams]);

  // Combined filtering: Category/Price range + Location + Store + Search Query matching
  const sorted = useMemo(() => {
    let result = [...filteredProducts].filter((p) => {
      // 1. Price Threshold Filter Check
      const matchesPrice = Number(p.price) >= priceRange[0] && Number(p.price) <= priceRange[1];
      
      // 2. Real Location/District Filter Check (e.g. Kigali, Rubavu, Musanze)
      const matchesLocation = !selectedLocation || 
        (p.location && p.location.toLowerCase().includes(selectedLocation.toLowerCase()));

      // 3. Vendor/Store Matrix Filter Check
      const matchesStore = !selectedStore || 
        (p.vendor?.storeName && p.vendor.storeName.toLowerCase() === selectedStore.toLowerCase());

      // Base combination check before search query validation
      const passesBaseFilters = matchesPrice && matchesLocation && matchesStore;

      // 4. Search Query matching across title and category name
      if (!searchQuery) return passesBaseFilters;
      const query = searchQuery.toLowerCase();
      const titleMatch = p.title?.toLowerCase().includes(query);
      const categoryMatch = p.category?.name?.toLowerCase().includes(query);
      
      return passesBaseFilters && (titleMatch || categoryMatch);
    });

    if (sortBy === "price_asc") result.sort((a, b) => Number(a.price) - Number(b.price));
    if (sortBy === "price_desc") result.sort((a, b) => Number(b.price) - Number(a.price));
    if (sortBy === "newest") result.sort((a, b) => Number(b.id) - Number(a.id));
    
    return result;
  }, [filteredProducts, priceRange, selectedLocation, selectedStore, searchQuery, sortBy]);

  const paginated = useMemo(() => sorted.slice(0, page * PER_PAGE), [sorted, page]);
  const hasMore = paginated.length < sorted.length;

  const handleLoadMore = useCallback(() => {
    if (hasMore) {
      setPage((p) => p + 1);
    } else {
      fetchMoreProducts();
    }
  }, [hasMore, fetchMoreProducts]);

  // Find the matching human-readable category name from your categories array
  const currentCategoryName = useMemo(() => {
    if (!selectedCategory) return "Collections";

    const found = categories.find(
      (c) => String(c.id) === String(selectedCategory) || c.name.toLowerCase() === String(selectedCategory).toLowerCase()
    );

    return found ? found.name : selectedCategory;
  }, [selectedCategory, categories]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#050505] font-sans text-zinc-900 dark:text-gray-100 relative selection:bg-blue-500/30 transition-colors">

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
              className="fixed top-0 left-0 bottom-0 w-[80%] max-w-[320px] bg-white dark:bg-[#050505] border-r border-zinc-200 dark:border-white/5 z-50 p-6 shadow-2xl md:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-black tracking-widest text-zinc-900 dark:text-white uppercase font-mono">Filters</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              <ProductSidebar 
                priceRange={priceRange} 
                onPriceChange={setPriceRange} 
                selectedLocation={selectedLocation}
                onLocationChange={setSelectedLocation}
                selectedStore={selectedStore}
                onStoreChange={setSelectedStore}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Dynamic Filter Header Context */}
      <div className="border-b border-zinc-200 dark:border-white/5 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
        <div className="px-6 py-5 flex flex-wrap items-center justify-between gap-4 max-w-7xl mx-auto">
          <div>
            <h1 className="font-black text-xl md:text-2xl text-zinc-900 dark:text-white tracking-tight uppercase font-mono bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-gray-400 bg-clip-text">
              {currentCategoryName}
            </h1>
            <p className="text-zinc-500 dark:text-gray-500 text-[10px] mt-1 font-bold tracking-[0.2em] uppercase font-mono">
              {sorted.length} Units Available
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
            <div className="flex-1 md:w-64">
              <SearchBar />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-white dark:bg-[#050505] border rounded-xl border-zinc-200 dark:border-white/5 text-zinc-600 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider px-3 md:px-4 py-2.5 outline-none cursor-pointer hover:border-zinc-400 dark:hover:border-white/20 hover:text-zinc-900 dark:hover:text-white transition-all font-mono"
            >
              <option value="default">Default Matrix</option>
              <option value="price_asc">Price: Ascending</option>
              <option value="price_desc">Price: Descending</option>
              <option value="newest">Latest Drop</option>
            </select>

            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden flex space-x-2 items-center justify-center text-white bg-blue-600 p-2.5 rounded-xl active:scale-95 transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              <SlidersHorizontal size={18} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Open Filters</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex items-start">
        {/* --- DESKTOP SIDEBAR --- */}
        <aside className="hidden md:block w-70 shrink-0 border-r border-zinc-200 dark:border-white/5 px-6 py-12 sticky top-24 h-[calc(100vh-100px)] overflow-y-auto no-scrollbar">
          <ProductSidebar 
            priceRange={priceRange} 
            onPriceChange={setPriceRange} 
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
            selectedStore={selectedStore}
            onStoreChange={setSelectedStore}
          />
        </aside>

        {/* Product Grid Area Layout */}
        <main className="flex-1 px-4 md:px-8 py-4 md:py-9">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 mb-8 text-rose-600 dark:text-rose-400 text-xs font-mono flex items-center gap-3">
              <X size={14} /> telemetry error: {error}
            </div>
          )}

          {isLoading && page === 1 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-3/4 bg-zinc-200 dark:bg-white/2 border border-zinc-200 dark:border-white/5 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <>
              {sorted.length > 0 ? (
                <>
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
                      layout
                    >
                      {paginated.map((product, i) => (
                        <motion.div
                          key={product.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.25, delay: i * 0.02 }}
                          className="flex flex-col h-full"
                        >
                          <ProductCard product={product} />
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>

                  {/* Load More Button Wrapper */}
                  <div className="flex flex-col items-center justify-center mt-16 gap-4">
                    {(hasMore || isFetchingMore) && (
                      <motion.button
                        onClick={handleLoadMore}
                        disabled={isFetchingMore}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-3 font-bold text-[10px] tracking-[0.25em] uppercase px-10 py-4 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-full hover:bg-zinc-800 dark:hover:bg-gray-200 transition-all disabled:opacity-50 font-mono cursor-pointer shadow-lg shadow-zinc-900/5 dark:shadow-white/5"
                      >
                        {isFetchingMore ? <Loader2 className="animate-spin" size={12} /> : "Load Engine Matrix"}
                      </motion.button>
                    )}

                    <p className="text-zinc-500 dark:text-gray-600 text-[9px] font-bold tracking-widest uppercase font-mono">
                      {paginated.length} / {sorted.length} Units Manifested
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 md:py-12 text-center px-4">
                  <div className="bg-zinc-100 dark:bg-white/2 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-200 dark:border-white/5 shadow-inner">
                    <PackageX className="text-blue-600 dark:text-blue-400" size={24} />
                  </div>
                  <h3 className="font-poppins font-semibold text-zinc-900 dark:text-white text-base">No matching products found</h3>
                  <p className="text-zinc-600 dark:text-gray-400 text-xs mt-1 max-w-sm mb-6">
                    {searchQuery 
                      ? `We couldn't find any items matching "${searchQuery}". Try a different keyword or filter range.`
                      : "No items match your selected filter criteria."}
                  </p>
                  <button
                    onClick={() => {
                      handleClear();
                      setSelectedLocation(null);
                      setSelectedStore(null);
                      setPriceRange([0, 20000]);
                    }}
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