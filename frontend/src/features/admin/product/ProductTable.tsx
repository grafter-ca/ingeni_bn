import { useState, useMemo, useEffect } from "react";
import { Edit3, Trash2, ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import { useProductStore } from "../../../store/productStore";
import { useAuthState } from "../../../context/AuthContext";
import { toast } from "react-hot-toast";

export const ProductTable = () => {
  const { filteredProducts, removeProduct, setEditingProduct, updateProduct, getVendorId } = useProductStore();
  const { user } = useAuthState();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const itemsPerPage = 10;

  // --- Dynamic Admin/Vendor Data Separation Layer ---
  const visibleProducts = useMemo(() => {
    let listings = filteredProducts;
    if (user?.role === "vendor") {
      listings = listings.filter((p) => p.vendorId === user.id);
    } else if (user?.role === "admin" && getVendorId()) {
      listings = listings.filter((p) => p.vendorId === getVendorId());
    }
    return listings;
  }, [filteredProducts, user, getVendorId]);

  const totalPages = Math.ceil(visibleProducts.length / itemsPerPage);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return visibleProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [visibleProducts, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // --- Fast Admin Status Toggle Button Handler ---
  const handleToggleStatus = async (productId: string, currentStatus: boolean) => {
    if (user?.role !== "admin") return;
    setLoadingActionId(productId);
    try {
      const formData = new FormData();
      formData.append("isActive", String(!currentStatus));
      await updateProduct(productId);
      toast.success(`Listing status shifted to ${!currentStatus ? "LIVE" : "SUSPENDED"}`);
    } catch (err) {
      toast.error("Failed to alter remote listing visibility state.");
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to permanently drop this product record?")) return;
    try {
      await removeProduct(id);
      toast.success("Product wiped out from system logs successfully.");
    } catch {
      toast.error("An error occurred while wiping this entry.");
    }
  };

  return (
    <div className="space-y-4 font-poppins">
      <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              <th className="p-4">Product Specification</th>
              {user?.role === "admin" && <th className="p-4">Merchant Origin</th>}
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock Ledger</th>
              <th className="p-4">Listing Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {currentItems.length > 0 ? (
              currentItems.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/40 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-100 overflow-hidden shrink-0">
                        <img 
                          src={product.images?.[0] || "https://via.placeholder.com/40"} 
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-semibold text-gray-800 line-clamp-1">{product.title}</span>
                    </div>
                  </td>

                  {user?.role === "admin" && (
                    <td className="p-4">
                      <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        {product.vendorId || "Global Admin Setup"}
                      </span>
                    </td>
                  )}

                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {product.category?.name || "Uncategorized"}
                    </span>
                  </td>

                  <td className="p-4 font-mono font-bold text-gray-700">
                    {Number(product.price).toLocaleString()} RWF
                  </td>

                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${product.stock > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                      QTY: {product.stock}
                    </span>
                  </td>

                  <td className="p-4">
                    <button
                      disabled={user?.role !== "admin" || loadingActionId === product.id}
                      onClick={() => handleToggleStatus(product.id, product.isActive || false)}
                      className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2.5 py-1 rounded-full transition-all ${
                        user?.role === "admin" ? "cursor-pointer hover:scale-105" : "cursor-default"
                      } ${
                        product.isActive 
                          ? "bg-green-100 text-green-800" 
                          : "bg-amber-100 text-amber-800"
                      } disabled:opacity-50`}
                    >
                      {loadingActionId === product.id ? (
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : product.isActive ? (
                        <CheckCircle size={12} />
                      ) : (
                        <XCircle size={12} />
                      )}
                      {product.isActive ? "Live" : "Pending Review"}
                    </button>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button 
                        onClick={() => setEditingProduct(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Modify Profile Specs"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Purge Document Node"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={user?.role === "admin" ? 7 : 6} className="p-12 text-center text-gray-400 font-medium italic">
                  No active product listings mapped inside this workspace frame.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Pagination Controls System --- */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-2">
          <p className="text-xs text-gray-400 font-medium">
            Showing <span className="font-bold text-gray-700">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
            <span className="font-bold text-gray-700">
              {Math.min(currentPage * itemsPerPage, visibleProducts.length)}
            </span>{" "}
            of <span className="font-bold text-gray-700">{visibleProducts.length}</span> registry assets
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold ${
                    currentPage === i + 1
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-green-600"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};