// components/product/ProductSidebar.tsx
import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { useProductStore } from "../../store/productStore";
import { PRICE_BRACKETS, RWANDA_LOCATIONS } from "../../constants";
import { ChevronDown } from "lucide-react";

type Props = {
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  selectedLocation: string | null;
  onLocationChange: (location: string | null) => void;
  selectedStore: string | null;
  onStoreChange: (store: string | null) => void;
};

const ProductSidebar = ({ 
  priceRange, 
  onPriceChange, 
  selectedLocation, 
  onLocationChange,
  selectedStore,
  onStoreChange 
}: Props) => {
  const { categories, selectedCategory, setCategory, clearFilters, products } = useProductStore();
  const [, setSearchParams] = useSearchParams();

  // Local state for categories pagination and verification ratings
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [visibleCategoriesCount, setVisibleCategoriesCount] = useState<number>(5);

  // Extract unique active vendors/stores dynamically from available products
  const activeVendors = Array.from(
    new Set(products.map((p) => p.vendor?.storeName).filter(Boolean))
  ) as string[];

  const handleCategoryClick = useCallback(
    (categoryName: string | null, categoryId?: number | string) => {
      setCategory(categoryName);
      if (categoryId) {
        setSearchParams({ categoryId: String(categoryId) });
      } else {
        setSearchParams({});
      }
    },
    [setCategory, setSearchParams]
  );

  const handleResetAll = () => {
    clearFilters();
    onPriceChange([0, 20000]);
    onLocationChange(null);
    onStoreChange(null);
    setSelectedRating(null);
    setVisibleCategoriesCount(5);
    setSearchParams({});
  };

  const displayedCategories = categories.slice(0, visibleCategoriesCount);
  const hasMoreCategories = visibleCategoriesCount < categories.length;

  const handleLoadMoreCategories = () => {
    setVisibleCategoriesCount((prev) => Math.min(prev + 5, categories.length));
  };

  return (
    <div className="flex flex-col gap-10 font-sans">
      
      {/* --- HEADER ACTIONS --- */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/5 pb-4">
        <h3 className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 dark:text-gray-500 font-black font-mono">
          System Filters
        </h3>
        <button
          onClick={handleResetAll}
          className="text-[9px] uppercase tracking-widest text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 font-black font-mono transition-colors cursor-pointer"
        >
          Reset All
        </button>
      </div>

      {/* --- CATEGORIES SECTION --- */}
      <section>
        <h3 className="text-[11px] uppercase tracking-[0.15em] text-zinc-900 dark:text-white mb-6 font-black flex items-center gap-2 font-mono">
          <span className="w-1 h-3 bg-blue-600 dark:bg-blue-500 rounded-full"></span>
          Collections
        </h3>
        <ul className="flex flex-col gap-2">
          <li>
            <button
              onClick={() => handleCategoryClick(null)}
              className={`group flex items-center justify-between w-full text-xs py-2 transition-all cursor-pointer ${
                selectedCategory === null
                  ? "text-blue-600 dark:text-blue-400 font-bold"
                  : "text-zinc-500 dark:text-gray-500 hover:text-zinc-900 dark:hover:text-gray-300"
              }`}
            >
              <span className="flex items-center gap-2">
                {selectedCategory === null && (
                  <motion.div layoutId="activeCatIndicator" className="w-1 h-1 bg-blue-600 dark:bg-blue-500 rounded-full" />
                )}
                All Inventories
              </span>
            </button>
          </li>
          
          <AnimatePresence>
            {displayedCategories.map((cat) => (
              <motion.li 
                key={cat.id} 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
              >
                <button
                  onClick={() => handleCategoryClick(cat.name, cat.id)}
                  className={`group flex items-center justify-between w-full text-xs py-2 transition-all capitalize cursor-pointer ${
                    selectedCategory === cat.name
                      ? "text-blue-600 dark:text-blue-400 font-bold"
                      : "text-zinc-500 dark:text-gray-500 hover:text-zinc-900 dark:hover:text-gray-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {selectedCategory === cat.name && (
                      <motion.div layoutId="activeCatIndicator" className="w-1 h-1 bg-blue-600 dark:bg-blue-500 rounded-full" />
                    )}
                    {cat.name}
                  </span>
                  <span className="text-[9px] text-zinc-400 dark:text-gray-700 group-hover:text-zinc-600 dark:group-hover:text-gray-400 transition-colors font-mono">
                    //
                  </span>
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        {hasMoreCategories && (
          <button
            onClick={handleLoadMoreCategories}
            className="mt-4 flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer group"
          >
            <ChevronDown size={12} className="group-hover:translate-y-0.5 transition-transform" />
            Load More Categories ({categories.length - visibleCategoriesCount} remaining)
          </button>
        )}
      </section>

      {/* --- PRICE BRACKET CHECKBOX SECTION --- */}
      <section>
        <h3 className="text-[11px] uppercase tracking-[0.15em] text-zinc-900 dark:text-white mb-6 font-black flex items-center gap-2 font-mono">
          <span className="w-1 h-3 bg-blue-600 dark:bg-blue-500 rounded-full"></span>
          Price Threshold Tiers
        </h3>
        <div className="flex flex-col gap-2.5">
          {PRICE_BRACKETS.map((bracket) => {
            const isChecked = priceRange[0] === bracket.min && priceRange[1] === bracket.max;
            return (
              <label 
                key={bracket.label} 
                className="flex items-center gap-3 text-xs text-zinc-600 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onPriceChange([bracket.min, bracket.max]);
                    } else {
                      onPriceChange([0, 20000]);
                    }
                  }}
                  className="rounded bg-zinc-100 dark:bg-white/5 border-zinc-300 dark:border-white/10 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer w-4 h-4"
                />
                <span className="font-mono text-[11px] group-hover:text-zinc-900 dark:group-hover:text-gray-200 transition-colors">
                  {bracket.label}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      {/* --- LOCATION FILTER (Chip / Button Grid Matrix) --- */}
      <section>
        <h3 className="text-[11px] uppercase tracking-[0.15em] text-zinc-900 dark:text-white mb-4 font-black flex items-center gap-2 font-mono">
          <span className="w-1 h-3 bg-blue-600 dark:bg-blue-500 rounded-full"></span>
          Location / District
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onLocationChange(null)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
              selectedLocation === null 
                ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/25" 
                : "bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-gray-400 hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-white/5"
            }`}
          >
            All Regions
          </button>
          {RWANDA_LOCATIONS.map((loc) => {
            const isSelected = selectedLocation === loc;
            return (
              <button
                key={loc}
                onClick={() => onLocationChange(loc)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  isSelected 
                    ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/25" 
                    : "bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-gray-400 hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-white/5"
                }`}
              >
                {loc}
              </button>
            );
          })}
        </div>
      </section>

      {/* --- STORE / VENDOR FILTER (Chip / Button Grid Matrix) --- */}
      <section>
        <h3 className="text-[11px] uppercase tracking-[0.15em] text-zinc-900 dark:text-white mb-4 font-black flex items-center gap-2 font-mono">
          <span className="w-1 h-3 bg-blue-600 dark:bg-blue-500 rounded-full"></span>
          Vendor Matrix
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onStoreChange(null)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
              selectedStore === null 
                ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/25" 
                : "bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-gray-400 hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-white/5"
            }`}
          >
            All Stores
          </button>
          {activeVendors.map((store) => {
            const isSelected = selectedStore === store;
            return (
              <button
                key={store}
                onClick={() => onStoreChange(store)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer truncate max-w-full ${
                  isSelected 
                    ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/25" 
                    : "bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-gray-400 hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-white/5"
                }`}
              >
                {store}
              </button>
            );
          })}
        </div>
      </section>

      {/* --- USER RATING FILTER --- */}
      <section>
        <h3 className="text-[11px] uppercase tracking-[0.15em] text-zinc-900 dark:text-white mb-6 font-black flex items-center gap-2 font-mono">
          <span className="w-1 h-3 bg-blue-600 dark:bg-blue-500 rounded-full"></span>
          User Verification
        </h3>
        <ul className="flex flex-col gap-2">
          {[5, 4, 3].map((star) => (
            <motion.li key={star} whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
              <button 
                onClick={() => setSelectedRating(selectedRating === star ? null : star)}
                className={`flex items-center gap-3 group w-full cursor-pointer py-1 ${
                  selectedRating === star ? "opacity-100" : "opacity-80"
                }`}
              >
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-xs ${i < star ? "text-amber-500" : "text-zinc-300 dark:text-white/5"}`}>
                      ★
                    </span>
                  ))}
                </div>
                <span className={`text-[10px] uppercase font-bold font-mono transition-colors ${
                  selectedRating === star ? "text-blue-600 dark:text-blue-400 font-extrabold" : "text-zinc-500 dark:text-gray-500 group-hover:text-zinc-900 dark:group-hover:text-gray-300"
                }`}>
                  & Up Matrix
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default ProductSidebar;