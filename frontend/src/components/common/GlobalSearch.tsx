// components/common/GlobalSearch.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, Package } from "lucide-react";
import { useProductStore } from "../../store/productStore";

export default function GlobalSearch() {
  const { products, searchQuery, setSearchQuery, isLoading, fetchProducts, fetchCategories } = useProductStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Initial fetch if products are not loaded yet
  useEffect(() => {
    if (products.length === 0) {
      void fetchProducts();
      void fetchCategories();
    }
  }, [products.length, fetchProducts, fetchCategories]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter products locally using store products and query
  const filteredSuggestions = searchQuery.trim()
    ? products.filter((p) => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6) // Limit to top 6 live suggestions
    : [];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setIsOpen(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 text-zinc-400 dark:text-zinc-500" size={16} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            const query = e.target.value;
            setSearchQuery(query);
            setIsOpen(true);
            setIsSearching(isLoading && query.trim().length > 0);
          }}
          onFocus={() => {
            if (searchQuery.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search products, categories..."
          className="w-full bg-white dark:bg-zinc-900/85 border border-zinc-300 dark:border-zinc-700 rounded-full pl-10 pr-10 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-all shadow-inner"
        />
        {/* Only spin when user is actively typing and store is busy fetching */}
        {isSearching && searchQuery.trim() && (
          <Loader2 size={16} className="absolute right-3.5 animate-spin text-blue-500" />
        )}
      </div>

      {/* Live Search Results Dropdown */}
      {isOpen && searchQuery.trim() && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-md transition-colors">
          {filteredSuggestions.length > 0 ? (
            <div className="p-2 space-y-1">
              <p className="px-3 py-1.5 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Products</p>
              {filteredSuggestions.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    setIsOpen(false);
                    navigate(`/products/${product.id}`);
                  }}
                  className="flex items-center gap-3 p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-xl transition cursor-pointer group"
                >
                  <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-950 rounded-lg overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <Package size={16} className="text-zinc-400 dark:text-zinc-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{product.title}</h4>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{product.location || "Rwandan Marketplace"}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                    RWF {Number(product.price).toLocaleString()}
                  </span>
                </div>
              ))}
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
                }}
                className="w-full text-center py-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-600/10 rounded-xl transition cursor-pointer mt-1 border-t border-zinc-100 dark:border-zinc-800/60"
              >
                View all results for "{searchQuery}"
              </button>
            </div>
          ) : (
            <div className="p-6 text-center text-zinc-500 text-xs">
              No products found matching "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}