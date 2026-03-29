import { useEffect, useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
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
    error,
    fetchProducts,
    selectedCategory,
    setCategory,
  } = useProductStore();

  const { inputValue, handleSearch, handleClear } = useSearch();

  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  // useEffect — sync URL param to store
  useEffect(() => {
    if (categoryIdParam) setCategory(Number(categoryIdParam));
    else fetchProducts({ limit: 100 });
  }, [categoryIdParam, setCategory, fetchProducts]);

  // useMemo — sort + price filter + paginate
  const sorted = useMemo(() => {
    let result = [...filteredProducts].filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );
    if (sortBy === "price_asc")  result.sort((a, b) => a.price - b.price);
    if (sortBy === "price_desc") result.sort((a, b) => b.price - a.price);
    if (sortBy === "newest")     result.reverse();
    return result;
  }, [filteredProducts, sortBy, priceRange]);

  const paginated = useMemo(
    () => sorted.slice(0, page * PER_PAGE),
    [sorted, page]
  );

  const hasMore = paginated.length < sorted.length;

  const handleLoadMore = useCallback(() => setPage((p) => p + 1), []);

  return (
    <div className="min-h-screen bg-gray-900 font-poppins">

      {/* Top bar */}
      <div className="border-b border-gray-800 px-6 py-5 flex flex-wrap items-center justify-between gap-4 max-w-7xl mx-auto">
        <div>
          <h1 className="font-bold text-2xl text-white tracking-wide">All Products</h1>
          <p className="text-gray-400 text-sm mt-1">
            {sorted.length} product{sorted.length !== 1 ? "s" : ""} found
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SearchBar />

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-gray-800 border rounded border-gray-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-gray-500 font-poppins"
          >
            <option value="default">Sort: Default</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>

          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden flex items-center gap-2 text-sm text-gray-400 hover:text-white border border-gray-700 px-3 py-2 transition-colors"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex">

        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 shrink-0 border-r border-gray-800 min-h-screen">
          <ProductSidebar priceRange={priceRange} onPriceChange={setPriceRange} />
        </aside>

        {/* Mobile Sidebar Drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/70 z-40 md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                className="fixed left-0 top-0 bottom-0 w-72 bg-gray-900 z-50 md:hidden overflow-y-auto"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                  <span className="font-semibold text-white">Filters</span>
                  <button onClick={() => setSidebarOpen(false)}>
                    <X size={20} className="text-gray-400 hover:text-white" />
                  </button>
                </div>
                <ProductSidebar priceRange={priceRange} onPriceChange={setPriceRange} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        <main className="flex-1 px-6 py-8">
          {error && (
            <p className="text-red-400 text-sm text-center py-10">{error}</p>
          )}

          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-72 bg-gray-800 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                <motion.div
                  className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  layout
                >
                  {paginated.map((product, i) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i < PER_PAGE ? i * 0.04 : 0 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Load more */}
              {hasMore && (
                <div className="flex justify-center mt-12">
                  <motion.button
                    onClick={handleLoadMore}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="font-poppins text-sm uppercase tracking-widest px-10 py-4 border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
                  >
                    Load More
                  </motion.button>
                </div>
              )}

              {sorted.length === 0 && !isLoading && (
                <motion.div
                  className="text-center py-20 flex flex-col gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-gray-400 text-lg">No products found</p>
                  <button
                    onClick={handleClear}
                    className="text-sm text-gray-500 underline hover:text-white transition-colors"
                  >
                    Clear filters
                  </button>
                </motion.div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;