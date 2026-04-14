import { useEffect } from "react";
import { useProductStore } from "../../../store/productStore";
import { useCategoryStore } from "../../../store/categoryStore";
import { ProductTable } from "../../../features/admin/product/ProductTable";
import { ProductForm } from "../../../features/admin/product/CreateEditProduct";
import { ProductFilters } from "../../../features/admin/product/ProductFilters";
import { Loader2, PackagePlus } from "lucide-react";
import { useAuthState } from "../../../context/AuthContext";

export default function AdminProducts() {
  const { fetchProducts, isLoading, isEditing, setEditingProduct } = useProductStore();
  const { fetchCategories } = useCategoryStore();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const { user } = useAuthState()

  return (
    <div className="p-2 max-w-6xl mx-auto min-h-screen">
      <div className="lg:flex lg:space-y-0  space-y-4 justify-between items-end mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl uppercase font-bold text-gray-600">Inventory</h1>
          <h1 className="text-sm capitalize italic font-light text-green-500">{user?.name}</h1>
          <p className="text-gray-500">Manage your Rwanda Marketplace listings.</p> 
        </div>
        {!isEditing && (
          <button 
            onClick={() => setEditingProduct(null)} 
            className="flex items-center gap-2 bg-green-500/50 text-white px-5 py-2.5 rounded-xl hover:bg-green-500/40 cursor-pointer transition-all"
          >
            <PackagePlus size={18} /> Add New Product
          </button>
        )}
      </div>

      {isEditing !== null || useProductStore.getState().formData.title !== "" ? (
        <div className="mb-10">
          <ProductForm />
        </div>
      ) : null}

      <ProductFilters />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="animate-spin mb-2" size={40} />
            <p>Loading inventory...</p>
          </div>
        ) : (
          <ProductTable />
        )}
      </div>
    </div>
  );
}