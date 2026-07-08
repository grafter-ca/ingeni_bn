import { useState } from "react";
import ProductList from "./ProductList";
import { ProductForm } from "../../../components/forms/ProductForm";
import { Plus, SlidersHorizontal } from "lucide-react";
import { useAuthState } from "../../../context/AuthContext"; // Ensure you have access to the current user/vendor

export default function ProductManagement() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { user } = useAuthState();

  const handleEdit = (id: string) => {
    setEditingId(id);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-white uppercase">Product Catalog</h1>
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mt-1">
            Manage your inventory assets & global listings
          </p>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all text-[10px] font-bold uppercase tracking-widest text-white">
            <SlidersHorizontal size={14} /> Filter
          </button>
          <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 px-6 py-2 bg-white text-black rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all"
          >
            <Plus size={16} /> New Asset
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <ProductList onEdit={handleEdit} />

      {/* Overlay Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg animate-in zoom-in-95 duration-200">
            <ProductForm 
              // Passing both the edit ID (if exists) and the vendor context
              productId={editingId || undefined } 
              vendorId={ user?.id || "default-vendor-id"} 
              onClose={() => setIsFormOpen(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}