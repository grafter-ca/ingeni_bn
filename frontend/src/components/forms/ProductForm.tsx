// src/components/admin/products/ProductForm.tsx
import { useEffect } from "react";
import { useProductStore } from "../../store/productStore";
import { Loader2, AlertCircle, X } from "lucide-react";
import { ImageUploader } from "../common/ImageUploader";

export const ProductForm = ({ vendorId, productId, onSuccess, onClose }: { 
  vendorId: string; 
  productId?: string;
  onSuccess?: () => void;
  onClose: () => void;
}) => {
  const { 
    formData, updateFormData, addProduct, updateProduct, 
    isEditing, clearFormData, categories, isLoading, error 
  } = useProductStore();

  useEffect(() => {
    return () => clearFormData();
  }, [clearFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateProduct(isEditing.id);
      } else {
        await addProduct(vendorId);
      }
      if (onSuccess) onSuccess();
      onClose(); // Auto-close on success
    } catch (err) {
      console.error("Form submission failed:", err);
    }
  };

  const inputClass = "w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-white placeholder-gray-700 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all";
  const labelClass = "text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1";

  return (
    <form onSubmit={handleSubmit} className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl w-full max-w-lg mx-auto shadow-2xl relative">
      <button type="button" onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
        <X size={20} />
      </button>

      <div className="mb-8">
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
          {isEditing ? "Modify Asset" : "Register New Asset"}
        </h2>
        <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] mt-1">
          {isEditing ? "Updating existing product configuration" : "Deploying item to live catalog"}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 p-4 rounded-xl text-xs border border-rose-500/20 mb-6">
          <AlertCircle size={14} /> <span>{error}</span>
        </div>
      )}
      
      <div className="space-y-5">
        <div className="space-y-1.5">
          <label className={labelClass}>Product Title</label>
          <input 
            value={formData.title} 
            onChange={(e) => updateFormData({ title: e.target.value })}
            className={inputClass} 
            placeholder="e.g. Industrial Grade Power Unit"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={labelClass}>Price (RWF)</label>
            <input 
              type="number" 
              value={formData.price} 
              onChange={(e) => updateFormData({ price: Number(e.target.value) })}
              className={inputClass} 
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Stock Level</label>
            <input 
              type="number" 
              value={formData.stock} 
              onChange={(e) => updateFormData({ stock: Number(e.target.value) })}
              className={inputClass} 
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Category</label>
          <select 
            value={formData.categoryId}
            onChange={(e) => updateFormData({ categoryId: e.target.value })}
            className={inputClass}
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Description</label>
          <textarea 
            value={formData.description} 
            onChange={(e) => updateFormData({ description: e.target.value })}
            className={`${inputClass} h-24 resize-none`}
            placeholder="Technical specifications and details..."
          />
        </div>

        <ImageUploader
          images={formData.images} 
          onUpdate={(urls) => updateFormData({ images: urls })} 
        />
      </div>

      <div className="product-id">{productId || "New Product"}</div>
      
      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full mt-8 bg-white text-black py-4 rounded-xl font-black uppercase tracking-[0.25em] hover:bg-gray-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
      >
        {isLoading ? <Loader2 className="animate-spin" size={16} /> : (isEditing ? "Commit Changes" : "Publish to Catalog")}
      </button>
    </form>
  );
};