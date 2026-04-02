import { useCallback } from "react";
import { motion } from "framer-motion";
import { useProductStore } from "../../store/productStore";

type Props = {
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
};

const ProductSidebar = ({ priceRange, onPriceChange }: Props) => {
  const { categories, selectedCategory, setCategory, clearFilters } = useProductStore();

  // Logic: When a category is clicked, the store is updated
  // and filteredProducts in your main view will automatically update.
  const handleCategoryClick = useCallback(
    (categoryName: string | null) => {
      setCategory(categoryName);
      // If on mobile, you might want to auto-close the sidebar here
    },
    [setCategory]
  );

  return (
    <div className="flex flex-col gap-10 font-poppins">
      
      {/* --- HEADER ACTIONS --- */}
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">
          Filter Tools
        </h3>
        <button
          onClick={clearFilters}
          className="text-[10px] uppercase tracking-widest text-blue-500 hover:text-blue-400 font-bold transition-colors"
        >
          Reset
        </button>
      </div>

      {/* --- CATEGORIES SECTION --- */}
      <section>
        <h3 className="text-xs uppercase tracking-widest text-white mb-6 font-bold flex items-center gap-2">
          <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
          Collections
        </h3>
        <ul className="flex flex-col gap-3">
          <li>
            <button
              onClick={() => handleCategoryClick(null)}
              className={`group flex items-center justify-between w-full text-sm transition-all ${
                selectedCategory === null
                  ? "text-white font-bold"
                  : "text-gray-500 hover:text-gray-200"
              }`}
            >
              <span className="flex items-center gap-2">
                {selectedCategory === null && <motion.div layoutId="activeCat" className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                All Products
              </span>
            </button>
          </li>
          
          {categories.map((cat) => (
            <motion.li key={cat.id} whileHover={{ x: 2 }}>
              <button
                onClick={() => handleCategoryClick(cat.name)}
                className={`group flex items-center justify-between w-full text-sm transition-all capitalize ${
                  selectedCategory === cat.name
                    ? "text-white font-bold"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  {selectedCategory === cat.name && <motion.div layoutId="activeCat" className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                  {cat.name}
                </span>
                {/* Optional: Add count if available in your store */}
                <span className="text-[10px] text-gray-700 group-hover:text-gray-500 transition-colors">
                  →
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
      </section>

      {/* --- PRICE FILTER SECTION --- */}
      <section>
        <h3 className="text-xs uppercase tracking-widest text-white mb-6 font-bold flex items-center gap-2">
          <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
          Price Range
        </h3>
        <div className="space-y-6 px-1">
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase font-bold mb-1">Min</span>
              <span className="text-sm font-mono text-white">${priceRange[0]}</span>
            </div>
            <div className="h-px w-4 bg-gray-800 mb-2"></div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-gray-500 uppercase font-bold mb-1">Max</span>
              <span className="text-sm font-mono text-white">${priceRange[1]}</span>
            </div>
          </div>

          <div className="relative h-2 flex items-center">
            {/* Custom Range Track */}
            <div className="absolute w-full h-1 bg-gray-800 rounded-full"></div>
            
            <input
              type="range"
              min={0}
              max={2000}
              step={50}
              value={priceRange[1]}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val > priceRange[0]) onPriceChange([priceRange[0], val]);
              }}
              className="absolute w-full appearance-none bg-transparent pointer-events-none accent-blue-600 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white"
            />
          </div>
          <p className="text-[9px] text-gray-600 leading-tight">
            Slide to adjust the maximum price point for your current selection.
          </p>
        </div>
      </section>

      {/* --- RATING SECTION --- */}
      <section>
        <h3 className="text-xs uppercase tracking-widest text-white mb-6 font-bold flex items-center gap-2">
          <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
          Customer Rating
        </h3>
        <ul className="flex flex-col gap-3">
          {[5, 4, 3].map((star) => (
            <motion.li key={star} whileHover={{ x: 2 }}>
              <button className="flex items-center gap-3 group w-full">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-xs ${i < star ? "text-yellow-500" : "text-gray-800"}`}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-[11px] text-gray-500 group-hover:text-gray-300 transition-colors uppercase font-bold">
                  & Up
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