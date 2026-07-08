import { useEffect, useState } from 'react';
import { Plus, Search, Edit3, Trash2, Package, Loader2, X } from 'lucide-react';
import { useProductStore } from '../../store/productStore';
import  ProductFormModal  from '../../features/vendor/ProductFormModal';
import { getImageUrl } from '../../libs/getImageUrl';
import { useAuthState } from '../../context/AuthContext';
import { useVendorStore } from '../../store/vendorStore';

const LoadingSpinner = () => (
  <div className="p-24 flex flex-col items-center justify-center text-gray-500 gap-3">
    <Loader2 className="animate-spin text-green-500" size={32} />
    <p className="text-xs font-mono tracking-widest uppercase text-gray-400">Syncing database arrays...</p>
  </div>
);

const VendorInventory = () => {
  const {
    products,
    filteredProducts,
    searchQuery,
    setSearchQuery,
    isLoading,
    setEditingProduct,
    fetchVendorProducts,
    setSelectedVendorId,
    removeProduct,
    isEditing, 
    clearFormData // Helper method to scrub data fields on exit
  } = useProductStore();

  const {fetchVendorDetails} = useVendorStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const {user} =useAuthState();

  const currentVendorId = user?.id || null; 

 useEffect(() => {
    // Only fetch when we have a user and they have an ID
    if (!isLoading && user?.id) {
      fetchVendorDetails(user.id);
      setSelectedVendorId(user.id);
      fetchVendorProducts(user.id);
    }
  }, [user, isLoading, fetchVendorDetails, setSelectedVendorId, fetchVendorProducts]);

  // Prevent rendering content with null IDs
  if (isLoading) return <LoadingSpinner />; 
  if (!user?.id) return <p>Please log in to manage your inventory.</p>; 
 
  useEffect(() => {
    if (currentVendorId) {
      setSelectedVendorId(currentVendorId);
      fetchVendorProducts(currentVendorId);
    }
  }, [currentVendorId, fetchVendorProducts, setSelectedVendorId]);

  // Listen to the store's editing lifecycle to control modal visibility
  useEffect(() => {
    // If isEditing is explicit (null for creation mode or an object for update mode), open modal
    if (isEditing !== undefined && isEditing !== null) {
      setIsModalOpen(true);
    } else if (isEditing === null && isModalOpen === false) {
      // Catch initial explicitly set empty states
      setIsModalOpen(false);
    }
  }, [isEditing]);

  const handleOpenCreateModal = () => {
    setEditingProduct(null); // Explicitly signals Creation state
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Timeout gives the fade-out animation time to complete before clear
    setTimeout(() => {
      if (clearFormData) clearFormData();
    }, 200);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to completely delist "${name}" from the catalog?`)) {
      try {
        await removeProduct(id);
      } catch (err) {
        alert("Failed to drop product asset entry from registry parameters.");
      }
    }
  };

  return (
    <section className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 font-poppins text-white max-w-6xl mx-auto p-2 relative">
      
      {/* --- HERO HEADER REGISTRY BAR --- */}
      <article className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase text-white">
            Catalog Inventory
          </h1>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-1">
            Manage Product Assets, Pricing Matrices & Stock levels
          </p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-green-600/10 active:scale-95 w-full sm:w-fit"
        >
          <Plus size={16} />
          Add New Product
        </button>
      </article>

      {/* --- INTEGRATED SEARCH FILTER SYSTEM --- */}
      <section className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
        <input 
          type="text"
          placeholder="Search products by title, metadata descriptors..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-green-500 outline-none transition-all placeholder:text-gray-600 font-medium text-gray-200"
        />
      </section>

      {/* --- MAIN INTERACTIVE SCHEMATIC DATA TABLE --- */}
      <section className="bg-[#0a0a0a] border border-white/5 rounded-4xl overflow-hidden shadow-2xl">
        {isLoading && filteredProducts.length === 0 ? (
          <div className="p-24 flex flex-col items-center justify-center text-gray-500 gap-3">
            <Loader2 className="animate-spin text-green-500" size={32} />
            <p className="text-xs font-mono tracking-widest uppercase text-gray-400">Syncing database arrays...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black bg-white/1 border-b border-white/5">
                  <th className="px-8 py-5">Product Definition</th>
                  <th className="px-8 py-5">Category Module</th>
                  <th className="px-8 py-5">Financial Price</th>
                  <th className="px-8 py-5 text-right">Operational Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-24 text-center">
                      <Package size={44} className="mx-auto text-gray-800 mb-3" />
                      <p className="text-xs font-bold tracking-wider uppercase text-gray-500">
                        {products.length === 0 
                          ? "Your storefront inventory is completely empty." 
                          : "No items match your active search terms."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-white/10 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <img 
                            src={getImageUrl(product.images?.[0])} 
                            alt={product.title} 
                            className="w-12 h-12 rounded-xl object-cover bg-white/5 border border-white/5 shrink-0" 
                          />
                          <div className="space-y-0.5">
                            <span className="font-bold text-gray-200 block group-hover:text-green-400 transition-colors">
                              {product.title}
                            </span>
                            <span className="text-[10px] font-mono text-gray-600 block">
                              ID: #{product.id.slice(-8).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs font-semibold px-2.5 py-1 bg-white/5 rounded-lg text-gray-400 border border-white/5">
                          {product.category?.name || 'General Listing'}
                        </span>
                      </td>
                      <td className="px-8 py-5 font-mono font-bold text-green-400">
                        {new Intl.NumberFormat("en-RW", { 
                          style: "currency", 
                          currency: "RWF", 
                          maximumFractionDigits: 0 
                        }).format(product.price || 0)}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-end gap-1.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setEditingProduct(product)}
                            className="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer"
                            title="Edit Listing Parameters"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id, product.title)}
                            className="p-2 hover:bg-rose-500/10 rounded-xl text-gray-500 hover:text-rose-400 transition-all cursor-pointer"
                            title="Drop Listing Record"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* --- ASSET MANAGEMENT OVERLAY MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Backdrop Click Dismiss */}
          <div className="absolute inset-0" onClick={handleCloseModal} />
          
          <div className="relative w-full max-w-3xl bg-[#0d0d0d] border border-white/10 rounded-4xl overflow-hidden z-10 p-6 sm:p-8 flex flex-col max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header section inside workspace form modal */}
            <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-6">
              <div>
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Workspace configuration</h3>
                <p className="text-xl font-bold tracking-tight text-white mt-0.5">
                  {isEditing ? `Modify Entry: ${isEditing.title}` : "Catalog New Product Archetype"}
                </p>
              </div>
              <button 
                onClick={handleCloseModal}
                className="p-2 bg-white/5 border border-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Form Body Container */}
            <div className="overflow-y-auto subtle-scroll pr-1 flex-1">
              <ProductFormModal onFormSuccess={handleCloseModal} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default VendorInventory;