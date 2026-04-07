import { useEffect } from "react";
import { useProductStore } from "../../../store/productStore";
import ProductCard from "../component/ProductCard";
import { useNavigate } from "react-router-dom";
import type { ApiProduct } from "../../../types/api";
import { useAuthState } from "../../../context/AuthContext";

const AdminProducts: React.FC = () => {
  const {
    filteredProducts,
    fetchProducts,
    fetchCategories,
    setSearchQuery,
    setCategory,
    searchQuery,
    categories,
  } = useProductStore();

  const {user} = useAuthState();

  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const isAdmin = user?.role === 'admin'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={() => navigate("/admin/products/new")}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + New Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className="border px-3 py-2 rounded w-full"
        />

        <select
          onChange={(e) => setCategory(e.target.value || null)}
          className="border px-3 py-2 rounded"
        >
          <option value="">All</option>
          {categories.map((cat: any) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product: ApiProduct) => (
          <ProductCard
            key={product.id}
            product={product}
            isAdmin={isAdmin}
          />
        ))}
      </div>
    </div>
  );
};

export default AdminProducts;