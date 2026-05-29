// components/products/ProductFilters.tsx
import { useEffect } from "react";
import { useProductStore } from "../../../store/productStore";
import { Search, Layers, Store } from "lucide-react";
import { useAuthState } from "../../../context/AuthContext";

export const ProductFilters = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    categories, 
    setCategory, 
    selectedCategory,
    vendors,             
    selectedVendorId,    
    setSelectedVendorId,
    fetchCategories, // Added to guarantee hydration
    fetchVendors     // Added to guarantee hydration
  } = useProductStore();
  
  const { user } = useAuthState();

  // Hydrate dropdown datasets instantly when filters load on a workspace page
  useEffect(() => {
    if (categories.length === 0) fetchCategories();
    if (user?.role === "admin" && vendors?.length === 0) fetchVendors();
  }, [user, categories.length, vendors?.length]);

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 font-poppins w-full">
      {/* --- TEXT SEARCH ENGINE ROW --- */}
      <div className="flex-1 relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 focus:border-green-500 rounded-xl outline-none transition-all text-sm text-gray-800 shadow-sm"
          placeholder="Search inventory items by title, description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Zustand triggers applyFilters reactively here
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* --- CATEGORY SELECTOR PANEL --- */}
        <div className="relative min-w-50">
          <Layers size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select
            className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-200 focus:border-green-500 rounded-xl outline-none transition-all text-sm text-gray-700 font-medium cursor-pointer appearance-none shadow-sm"
            value={selectedCategory || ""}
            onChange={(e) => {
              const val = e.target.value;
              setCategory(val === "" ? null : val); // Explicitly normalize empty string options to deep null
            }}
          >
            <option value="">All Categories</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
        </div>

        {/* --- GLOBAL ADMIN SYSTEM VENDOR FILTER OPTION --- */}
        {user?.role === "admin" && (
          <div className="relative min-w-50">
            <Store size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-200 focus:border-green-500 rounded-xl outline-none transition-all text-sm text-gray-700 font-medium cursor-pointer appearance-none shadow-sm"
              value={selectedVendorId || ""}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedVendorId(val === "" ? null : val); // Strict conversion to normalize filtering execution bounds
              }}
            >
              <option value="">All Platform Stores</option>
              {vendors?.map((v: any) => (
                <option key={v.id} value={v.id}>{v.storeName || v.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
          </div>
        )}
      </div>
    </div>
  );
};