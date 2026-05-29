import { useEffect } from "react";
import { useProductStore } from "../../../store/productStore";
import { useCategoryStore } from "../../../store/categoryStore";
import { ProductTable } from "../../../features/admin/product/ProductTable";
import { ProductForm } from "../../../features/admin/product/CreateEditProduct";
import { ProductFilters } from "../../../features/admin/product/ProductFilters";
import { Loader2, PackagePlus, X } from "lucide-react";
import { useAuthState } from "../../../context/AuthContext";

export default function AdminProducts() {
  const { 
    fetchProducts, 
    isLoading, 
    isEditing, 
    setEditingProduct,
    formData,
    selectedVendorId // <-- Get the globally active vendor filter context
  } = useProductStore();
  
  const { fetchCategories } = useCategoryStore();
  const { user } = useAuthState();

  // Re-fetch clean catalog data whenever the administrator toggles the target store profile dropdown
  useEffect(() => {
    fetchProducts({ vendorId: selectedVendorId });
    fetchCategories();
  }, [fetchProducts, fetchCategories, selectedVendorId]);

  const isModalOpen = isEditing !== null || (formData && formData.title !== "");

  return (
    <div className="p-4 max-w-6xl mx-auto min-h-screen font-poppins selection:bg-green-500/10">
      
      {/* --- INVENTORY HEADER BAR --- */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-end mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl uppercase font-bold text-gray-800 tracking-tight">Inventory</h1>
          {user?.name && (
            <h2 className="text-sm capitalize italic font-light text-green-500">{user.name}</h2>
          )}
          <p className="text-gray-500 text-sm">Manage your Rwanda Marketplace listings.</p> 
        </div>
        
        <button 
          onClick={() => setEditingProduct(null)} 
          className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-500 active:scale-95 cursor-pointer transition-all shadow-md shadow-green-600/10 text-sm font-semibold"
        >
          <PackagePlus size={18} /> Add New Product
        </button>
      </div>

      {/* --- SEARCH / FILTERS BAR --- */}
      <ProductFilters />

      {/* --- DATA TABLE PORT --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center text-gray-400 gap-2">
            <Loader2 className="animate-spin text-green-500" size={36} />
            <p className="text-sm font-medium text-gray-500">Loading inventory records...</p>
          </div>
        ) : (
          /* Core structural check: Ensure your ProductTable maps useProductStore's filteredProducts! */
          <ProductTable />
        )}
      </div>

      {/* --- MODAL OVERLAY WRAPPER --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setEditingProduct(null)} />
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {isEditing ? "Modify Listing Profile" : "Create New Listing"}
                </h3>
                <p className="text-xs text-gray-400 font-medium">Provide accurate store parameters for the marketplace.</p>
              </div>
              <button 
                onClick={() => setEditingProduct(null)}
                className="p-1.5 rounded-xl hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 subtle-scroll">
              <ProductForm />
            </div>

          </div>
        </div>
      )}
    </div>
  );
}