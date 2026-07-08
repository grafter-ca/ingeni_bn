// src/components/admin/products/ProductList.tsx
import { useProductStore } from "../../../store/productStore";
import { Trash2, Edit2, Package } from "lucide-react";

export default function ProductList({ onEdit }: { onEdit: (id: string) => void }) {
  const { products, removeProduct } = useProductStore();

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Package size={48} className="mb-4 opacity-20" />
        <p className="text-sm font-bold uppercase tracking-widest">No inventory assets found</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
      {/* Table Header */}
      <div className="grid grid-cols-12 p-5 border-b border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 bg-white/2">
        <span className="col-span-5">Product Details</span>
        <span className="col-span-2">Category</span>
        <span className="col-span-2">Price</span>
        <span className="col-span-1">Stock</span>
        <span className="col-span-2 text-right">Actions</span>
      </div>
      
      {/* Table Body */}
      <div className="divide-y divide-white/5">
        {products.map((product) => (
          <div key={product.id} className="grid grid-cols-12 p-4 items-center hover:bg-white/3 transition-all group">
            {/* Product Column */}
            <div className="col-span-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 overflow-hidden border border-white/10">
                <img src={product.images[0]} className="w-full h-full object-cover" alt={product.title} />
              </div>
              <div>
                <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{product.title}</p>
                <p className="text-[10px] font-medium text-gray-500 mt-0.5 tracking-wide">
                  {product.vendor?.storeName || 'Unknown Vendor'}
                </p>
              </div>
            </div>

            {/* Category */}
            <span className="col-span-2 text-[11px] font-medium text-gray-400 bg-white/5 px-2 py-1 rounded-md w-fit">
              {product.category?.name || 'Uncategorized'}
            </span>

            {/* Price */}
            <span className="col-span-2 text-sm font-mono font-bold text-white">
              {Number(product.price).toLocaleString()} <span className="text-[10px] text-gray-600">RWF</span>
            </span>

            {/* Stock */}
            <div className="col-span-1">
              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                product.stock > 10 ? 'text-emerald-400 bg-emerald-400/10' : 'text-amber-400 bg-amber-400/10'
              }`}>
                {product.stock}
              </span>
            </div>

            {/* Actions */}
            <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => onEdit(product.id)} 
                className="p-2 hover:bg-blue-500/10 rounded-xl text-gray-400 hover:text-blue-400 transition-all"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={() => removeProduct(product.id)} 
                className="p-2 hover:bg-rose-500/10 rounded-xl text-gray-400 hover:text-rose-500 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}