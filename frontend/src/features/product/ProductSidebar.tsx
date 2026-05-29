import { useCallback } from "react";
import { motion } from "framer-motion";
import { useProductStore } from "../../store/productStore";

type Props = {
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
};

const ProductSidebar = ({ priceRange, onPriceChange }: Props) => {
  const { categories, selectedCategory, setCategory, clearFilters } = useProductStore();

  const handleCategoryClick = useCallback(
    (categoryName: string | null) => {
      setCategory(categoryName);
    },
    [setCategory]
  );

  return (
    <div className="flex flex-col gap-10 font-sans">
      
      {/* --- HEADER ACTIONS --- */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h3 className="text-[9px] uppercase tracking-[0.25em] text-gray-500 font-black font-mono">
          System Filters
        </h3>
        <button
          onClick={clearFilters}
          className="text-[9px] uppercase tracking-widest text-blue-500 hover:text-blue-400 font-black font-mono transition-colors cursor-pointer"
        >
          Reset All
        </button>
      </div>

      {/* --- CATEGORIES SECTION --- */}
      <section>
        <h3 className="text-[11px] uppercase tracking-[0.15em] text-white mb-6 font-black flex items-center gap-2 font-mono">
          <span className="w-1 h-3 bg-blue-500 rounded-full"></span>
          Collections
        </h3>
        <ul className="flex flex-col gap-2">
          <li>
            <button
              onClick={() => handleCategoryClick(null)}
              className={`group flex items-center justify-between w-full text-xs py-2 transition-all cursor-pointer ${
                selectedCategory === null
                  ? "text-blue-400 font-bold"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <span className="flex items-center gap-2">
                {selectedCategory === null && (
                  <motion.div layoutId="activeCatIndicator" className="w-1 h-1 bg-blue-500 rounded-full" />
                )}
                All Inventories
              </span>
            </button>
          </li>
          
          {categories.map((cat) => (
            <motion.li key={cat.id} whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
              <button
                onClick={() => handleCategoryClick(cat.name)}
                className={`group flex items-center justify-between w-full text-xs py-2 transition-all capitalize cursor-pointer ${
                  selectedCategory === cat.name
                    ? "text-blue-400 font-bold"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  {selectedCategory === cat.name && (
                    <motion.div layoutId="activeCatIndicator" className="w-1 h-1 bg-blue-500 rounded-full" />
                  )}
                  {cat.name}
                </span>
                <span className="text-[9px] text-gray-700 group-hover:text-gray-400 transition-colors font-mono">
                  //
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
      </section>

      {/* --- PRICE FILTER SECTION --- */}
      <section>
        <h3 className="text-[11px] uppercase tracking-[0.15em] text-white mb-6 font-black flex items-center gap-2 font-mono">
          <span className="w-1 h-3 bg-blue-500 rounded-full"></span>
          Price Threshold
        </h3>
        <div className="space-y-4 px-1">
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-600 uppercase font-black font-mono">Floor</span>
              <span className="text-xs font-mono text-white font-bold">${priceRange[0]}</span>
            </div>
            <div className="h-px flex-1 bg-white/5 mx-4 mb-1.5 border-dashed border-t"></div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-gray-600 uppercase font-black font-mono">Ceil</span>
              <span className="text-xs font-mono text-blue-400 font-bold">${priceRange[1]}</span>
            </div>
          </div>

          <div className="relative h-2 flex items-center">
            <div className="absolute w-full h-1 bg-white/5 rounded-full"></div>
            <input
              type="range"
              min={0}
              max={20000}
              step={50}
              value={priceRange[1]}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val > priceRange[0]) onPriceChange([priceRange[0], val]);
              }}
              className="absolute w-full appearance-none bg-transparent pointer-events-none accent-blue-500 h-1 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
            />
          </div>
          <p className="text-[9px] text-gray-600 leading-normal font-mono">
            Caps execution arrays containing values above specified parameters.
          </p>
        </div>
      </section>

      {/* --- RATING SECTION --- */}
      <section>
        <h3 className="text-[11px] uppercase tracking-[0.15em] text-white mb-6 font-black flex items-center gap-2 font-mono">
          <span className="w-1 h-3 bg-blue-500 rounded-full"></span>
          User Verification
        </h3>
        <ul className="flex flex-col gap-2">
          {[5, 4, 3].map((star) => (
            <motion.li key={star} whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
              <button className="flex items-center gap-3 group w-full cursor-pointer py-1">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-xs ${i < star ? "text-amber-500" : "text-white/5"}`}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-[10px] text-gray-500 group-hover:text-gray-300 transition-colors uppercase font-bold font-mono">
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