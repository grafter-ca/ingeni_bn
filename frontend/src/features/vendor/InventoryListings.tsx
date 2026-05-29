import { Edit3, Package, Trash2 } from "lucide-react";
import type { ApiProduct } from "../../types/api";

interface InventoryListingProps {
    displayProducts : ApiProduct[];
    setEditingProduct: (product : ApiProduct) => void;
    removeProduct: (id: string) => void;
}


function InventoryListings({
    displayProducts,
    setEditingProduct,
    removeProduct,
} : InventoryListingProps) {
  return (
    <section className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black border-b border-white/5 bg-white/10">
                <th className="px-8 py-6">Product</th>
                <th className="px-8 py-6">Category</th>
                <th className="px-8 py-6">Price</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {displayProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Package size={48} />
                      <p className="text-sm font-bold uppercase tracking-widest">
                        No Products Found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex  items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                         {/* Fallback for product image */}
                         <img 
                          src={product.images?.[0] || 'https://via.placeholder.com/40'} 
                          alt={product.title}
                          className="w-full h-full object-cover"
                         />
                      </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-200">
                            {product.title}
                          </span>
                          <span className="text-[10px] text-gray-600 font-mono uppercase mt-0.5">
                            ID: {product.id.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-white/5 rounded-lg text-gray-400 text-[10px] font-black uppercase tracking-tighter border border-white/5">
                        {product.category?.name || "General"}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-mono font-bold text-blue-400">
                      {product.price.toLocaleString()} RWF
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="p-3 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Delete this product?"))
                              removeProduct(product.id);
                          }}
                          className="p-3 hover:bg-red-500/10 rounded-xl text-gray-500 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
  )
}

export default InventoryListings