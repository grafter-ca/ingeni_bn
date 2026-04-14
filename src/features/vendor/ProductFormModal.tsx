import React from "react";
import { X, Loader2, Image as ImageIcon, LayoutGrid, Eye } from "lucide-react";
import { useProductStore } from "../../store/productStore";
import { useAuthState } from "../../context/AuthContext";

interface ProductFormModalProps {
  onClose: () => void;
}

const ProductFormModal = ({ onClose }: ProductFormModalProps) => {
  const { 
    formData, 
    updateFormData, 
    isEditing, 
    addProduct, 
    updateProduct, 
    categories,
    isLoading 
  } = useProductStore();

  const { user } = useAuthState();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Narrowing the type to solve the 'string | undefined' error
    const vendorId = user?.id;

    if (!vendorId) {
      alert("Vendor authentication failed. Please ensure your vendor profile is active.");
      return;
    }

    try {
      if (isEditing) {
        await updateProduct(isEditing.id);
      } else {
        await addProduct(vendorId);
      }
      onClose();
    } catch (error: any) {
      console.error("Submission Error:", error);
      alert(error.message || "An error occurred while saving.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/5 bg-white/[0.01]">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-blue-500">
              {isEditing ? "Refine Product" : "New Deployment"}
            </h2>
            <p className="text-gray-500 text-[10px] uppercase mt-1 font-bold tracking-widest">
              Inventory Management System / v2.0
            </p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-all text-gray-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Section: Identity */}
          <div className="space-y-4">
            <div className="group">
              <label className="text-[10px] font-black uppercase text-gray-600 mb-2 block tracking-widest">Product Title</label>
              <input 
                required
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 outline-none focus:border-blue-500/50 transition-all text-white"
                placeholder="Enter product name..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-600 mb-2 block tracking-widest">Price (RWF)</label>
                <input 
                  type="number" required
                  value={formData.price}
                  onChange={(e) => updateFormData({ price: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 outline-none focus:border-blue-500/50 font-mono text-blue-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-600 mb-2 block tracking-widest">Stock Units</label>
                <input 
                  type="number" required
                  value={formData.stock}
                  onChange={(e) => updateFormData({ stock: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 outline-none focus:border-blue-500/50 font-mono text-white"
                />
              </div>
            </div>
          </div>

          {/* Section: Classification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-600 mb-2 block tracking-widest flex items-center gap-2">
                <LayoutGrid size={12} /> Category
              </label>
              <select 
                required
                value={formData.categoryId}
                onChange={(e) => updateFormData({ categoryId: e.target.value })}
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 outline-none focus:border-blue-500/50 appearance-none text-white text-sm"
              >
                <option value="" disabled className="bg-black text-gray-500">Select Segment</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-[#111]">{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Note: If you add an isActive field to formData in the store later, this works: */}
            <div>
               <label className="text-[10px] font-black uppercase text-gray-600 mb-2 block tracking-widest">Status</label>
               <div className="bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-blue-500 flex items-center gap-2">
                 <Eye size={14} /> Public Listing
               </div>
            </div>
          </div>

          {/* Section: Visuals (The Comma-Separated Input) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-600 mb-2 block tracking-widest flex items-center gap-2">
              <ImageIcon size={12} /> Image Assets (Comma Separated)
            </label>
            <textarea 
              required
              value={formData.images}
              onChange={(e) => updateFormData({ images: e.target.value })}
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 outline-none focus:border-blue-500/50 font-mono text-[11px] text-gray-400 h-24 resize-none"
              placeholder="https://cdn.com/img1.jpg, https://cdn.com/img2.jpg"
            />
          </div>

          {/* Section: Description */}
          <div>
            <label className="text-[10px] font-black uppercase text-gray-600 mb-2 block tracking-widest">Full Description</label>
            <textarea 
              required
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 outline-none focus:border-blue-500/50 h-32 resize-none text-white text-sm"
              placeholder="Provide technical specifications and heritage details..."
            />
          </div>

          {/* Action Footer */}
          <div className="pt-4 flex gap-4 bg-[#0a0a0a] sticky bottom-0">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] border border-white/5 text-gray-500 hover:bg-white/5 transition-all"
            >
              Abort
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                isEditing ? "Sync Changes" : "Confirm Listing"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;