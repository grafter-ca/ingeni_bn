import { useState } from "react";
import ProductList from "./ProductList";
import { ProductForm } from "../../../components/forms/ProductForm";
import { Plus } from "lucide-react";
import { useAuthState } from "../../../context/AuthContext";
import { useProductStore } from "../../../store/productStore";

export default function ProductManagement() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { user } = useAuthState();
  const { setEditingProduct, isEditing } = useProductStore();

  const handleEdit = (product: any) => {
    setEditingProduct(product); // Populates formData in store
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null); // Clears formData in store
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header and List */}
      <div className="flex justify-between items-end">
        <h1 className="text-3xl font-bold text-white uppercase tracking-tighter">Product Catalog</h1>
        <button onClick={handleAddNew} className="bg-white text-black px-3 py-2 rounded-xl flex gap-2 font-bold uppercase text-[10px]">
          <Plus size={16} /> New Asset
        </button>
      </div>

      <ProductList onEdit={handleEdit} />

      {/* Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <ProductForm
            key={isEditing?.id ?? "new"}
            productId={isEditing?.id || null}
            vendorId={isEditing?.vendorId || user?.id || "default-vendor-id"}
            vendorName={isEditing?.vendor?.storeName || "Active Merchant"}
            onClose={() => {
              setIsFormOpen(false);
              setEditingProduct(null);
            }}
          />
        </div>
      )}
    </div>
  );
}