import { useMemo, useState, useEffect } from "react";
import { Plus, Search, Loader2, PackageSearch } from "lucide-react";
import { useProducts } from "../../hooks/useProducts";
import { useProductStore } from "../../store/productStore";
import InventoryListings from "./InventoryListings";
import ProductFormModal from "./ProductFormModal";
import type { ApiProduct } from "../../types/api";

const Inventory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Hook Integration
  // We use your custom hook to handle the initial vendor-scoped fetch
  const { filteredProducts, isLoading } = useProducts(undefined, true);
  
  // Store Actions
  const { removeProduct, setEditingProduct, fetchCategories } = useProductStore();

  // Load categories globally so the modal dropdown is ready before it's even opened
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 2. Optimized Search Filter
  const displayProducts = useMemo(() => {
    if (!filteredProducts) return [];
    return filteredProducts.filter((p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [filteredProducts, searchQuery]);

  // 3. Modal Orchestration
  const openCreateModal = () => {
    setEditingProduct(null); // Reset store formData to initial empty state
    setIsModalOpen(true);
  };

  const openEditModal = (product: ApiProduct) => {
    setEditingProduct(product); // Hydrate store formData with product details
    setIsModalOpen(true);
  };

  // Loading State with the Dashboard's aesthetic
  if (isLoading)
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 bg-[#070707]/50 rounded-[2.5rem] border border-white/5 shadow-inner">
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <p className="text-gray-500 font-black tracking-[0.2em] uppercase text-[10px]">
          Syncing Catalog Telemetry...
        </p>
      </div>
    );

  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 text-white">
      
      {/* Header & Primary Action */}
      <article className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <header>
          <div className="flex items-center gap-2 mb-1">
             <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest text-blue-500/80">Inventory System</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter">Stock Management</h1>
          <p className="text-gray-500 text-sm mt-1 max-w-md">
            Manage your digital storefront. Monitor stock levels, adjust pricing, and deploy new listings.
          </p>
        </header>
        
        <button 
          onClick={openCreateModal}
          className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-2xl shadow-blue-600/20 active:scale-95 border border-blue-400/20 group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          Add New Product
        </button>
      </article>

      {/* Control Bar: Search & View Options */}
      <section className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={20} />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter inventory by name or SKU..."
          className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl py-6 pl-16 pr-8 text-sm focus:border-blue-500/30 outline-none transition-all placeholder:text-gray-800 shadow-inner"
        />
      </section>

      {/* Product Grid / Table */}
      {displayProducts.length > 0 ? (
        <InventoryListings 
          displayProducts={displayProducts}
          setEditingProduct={openEditModal}
          removeProduct={removeProduct}
        />
      ) : (
        <div className="py-32 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-[2.5rem] bg-white/10">
          <PackageSearch size={48} className="text-gray-800 mb-4" />
          <h3 className="text-gray-500 font-bold uppercase text-xs tracking-widest">No Matches Found</h3>
          <p className="text-gray-700 text-[10px] uppercase mt-1">Adjust your filter or deploy a new product.</p>
        </div>
      )}

      {/* Modal - Rendered at root level for portal-like behavior */}
      {isModalOpen && (
        <ProductFormModal onFormSuccess={() => setIsModalOpen(false)} />
      )}
    </section>
  );
};

export default Inventory;