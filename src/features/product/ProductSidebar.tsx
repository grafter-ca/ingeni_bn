import { useCallback } from "react";
import { motion } from "framer-motion";
import { useProductStore } from "../../store/productStore";

type Props = {
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
};

// Single Responsibility: only handles filter UI
const ProductSidebar = ({ priceRange, onPriceChange }: Props) => {
  const { categories, selectedCategory, setCategory, clearFilters } =
    useProductStore();

  const handleCategory = useCallback(
    (id: number | null) => setCategory(id),
    [setCategory]
  );

  return (
    <div className="p-6 flex flex-col gap-8 font-poppins">

      {/* Clear all */}
      <button
        onClick={clearFilters}
        className="text-xs uppercase tracking-widest text-gray-500 hover:text-white transition-colors text-left"
      >
        Clear all filters
      </button>

      {/* Categories */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-4 font-semibold">
          Category
        </h3>
        <ul className="flex flex-col gap-2">
          <li>
            <button
              onClick={() => handleCategory(null)}
              className={`text-sm w-full text-left transition-colors ${
                selectedCategory === null
                  ? "text-white font-semibold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              All Categories
            </button>
          </li>
          {categories.map((cat) => (
            <motion.li key={cat.id} whileHover={{ x: 4 }}>
              <button
                onClick={() => handleCategory(cat.id)}
                className={`text-sm w-full text-left transition-colors capitalize ${
                  selectedCategory === cat.id
                    ? "text-white font-semibold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {cat.name}
              </button>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-4 font-semibold">
          Price Range
        </h3>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between text-sm text-white">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
          <input
            type="range"
            min={0}
            max={1000}
            step={10}
            value={priceRange[1]}
            onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)])}
            className="w-full accent-white cursor-pointer"
          />
          <input
            type="range"
            min={0}
            max={1000}
            step={10}
            value={priceRange[0]}
            onChange={(e) => onPriceChange([Number(e.target.value), priceRange[1]])}
            className="w-full accent-white cursor-pointer"
          />
        </div>
      </div>

      {/* Rating filter (static UI — extend when API supports it) */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-4 font-semibold">
          Rating
        </h3>
        <ul className="flex flex-col gap-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <motion.li key={star} whileHover={{ x: 4 }}>
              <button className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                {"★".repeat(star)}{"☆".repeat(5 - star)}
                <span className="ml-1">& up</span>
              </button>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProductSidebar;
