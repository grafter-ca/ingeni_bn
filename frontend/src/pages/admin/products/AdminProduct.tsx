import { useEffect } from "react";
import { useProductStore } from "../../../store/productStore";
import { useCategoryStore } from "../../../store/categoryStore";
import { useAuthState } from "../../../context/AuthContext";
import ProductManagement from "../../../components/admin/products/ProductManagement";
import { Loader2 } from "lucide-react";

export default function AdminProducts() {
  const { fetchProducts, isLoading, selectedVendorId} = useProductStore();
  const { fetchCategories } = useCategoryStore();
  const { user } = useAuthState();

  // Initialize store data
  useEffect(() => {
    fetchProducts({ vendorId: selectedVendorId });
    fetchCategories();
  }, [fetchProducts, fetchCategories, selectedVendorId]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-green-500" size={36} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen font-poppins selection:bg-green-500/10">
      {/* --- PAGE HEADER --- */}
      <div className="mb-8">
        <h1 className="text-3xl uppercase font-bold text-gray-800 tracking-tight">Inventory Catalog</h1>
        {user?.name && (
          <p className="text-sm text-green-600 font-medium mt-1">
            Managing assets for: <span className="italic">{user.name}</span>
          </p>
        )}
      </div>

      {/* --- ORCHESTRATED MANAGEMENT LAYER --- */}
      {/* This component now handles the List, Form, Modal, and Toggle state */}
      <ProductManagement />
    </div>
  );
}