import { useEffect, useState } from 'react';
import { Plus, Search, Edit3, Trash2, Package } from 'lucide-react';
import { localApi } from '../../libs/api';
import type { ApiProduct } from '../../types/api';

const Inventory = () => {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const data = await localApi.get<ApiProduct[]>('/products/vendor/me');
        setProducts(data);
      } catch (err) {
        console.error("Failed to load inventory", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-gray-500 text-sm">Manage your product catalog and stock levels.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all w-fit">
          <Plus size={20} />
          {loading ? 'Loading...' : 'Add New Product'} 
        </button>
      </div>

      {/* Search and Filters */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input 
          placeholder="Search products..." 
          className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-blue-500 outline-none"
        />
      </div>

      {/* Product Table */}
      <div className="bg-[#0a0a0a] border border-white/5 rounded-4xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-500 text-xs uppercase tracking-widest border-b border-white/5">
              <th className="px-8 py-5 font-medium">Product</th>
              <th className="px-8 py-5 font-medium">Category</th>
              <th className="px-8 py-5 font-medium">Price</th>
              <th className="px-8 py-5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <Package size={40} className="mx-auto text-gray-800 mb-4" />
                  <p className="text-gray-500">No products found in your inventory.</p>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-white/2 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img src={product.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover bg-white/5" />
                      <span className="font-medium text-gray-200">{product.title}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-gray-400 text-sm">{product.category?.name || 'General'}</td>
                  <td className="px-8 py-5 font-semibold text-blue-400">${product.price.toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white"><Edit3 size={18} /></button>
                      <button className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-500"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;