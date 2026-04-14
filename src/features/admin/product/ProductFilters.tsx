import { useProductStore } from "../../../store/productStore";

export const ProductFilters = () => {
  const { searchQuery, setSearchQuery, categories, setCategory, selectedCategory } = useProductStore();

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <input
        className="flex-1 min-w-50 p-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
        placeholder="Search products by title or description..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <select
        className="p-2.5 border rounded-xl bg-white/20"
        value={ selectedCategory || "" }
        onChange={(e) => setCategory(e.target.value || null)}
      >
        <option value="">All Categories</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.name}>{cat.name}</option>
        ))}
      </select>
    </div>
  );
};