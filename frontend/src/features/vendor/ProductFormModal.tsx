import React, { useState, useEffect } from "react";
import { useProductStore } from "../../store/productStore";
import { useCategoryStore } from "../../store/categoryStore";
import { useAuthState } from "../../context/AuthContext";
import { Save, RotateCcw, Upload, X, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface ProductFormProps {
  onFormSuccess?: () => void;
}

const ProductFormModal = ({ onFormSuccess }: ProductFormProps) => {
  const {
    formData,
    updateFormData,
    isEditing,
    addProduct,
    updateProduct,
    setEditingProduct,
    vendors 
  } = useProductStore();
  
  const { categories } = useCategoryStore();
  const { user } = useAuthState();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing && isEditing.images) {
      const existingUrls = isEditing.images.map((img: any) => typeof img === 'string' ? img : img.url);
      setPreviews(existingUrls);
    } else {
      setPreviews([]);
      setSelectedFiles([]);
    }
  }, [isEditing]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    
    if (filesArray.length + previews.length > 5) {
      toast.error("Maximum threshold of 5 media frames reached.");
      return;
    }

    setSelectedFiles((prev) => [...prev, ...filesArray]);
    const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeSelectedFile = (index: number) => {
    // If it's a freshly added local file asset instance pointer
    const totalLocalFiles = selectedFiles.length;
    const totalPreviews = previews.length;
    const localFileIndexOffset = index - (totalPreviews - totalLocalFiles);

    if (localFileIndexOffset >= 0) {
      setSelectedFiles((prev) => prev.filter((_, i) => i !== localFileIndexOffset));
    }
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const uploadData = new FormData();
    uploadData.append("title", formData.title);
    uploadData.append("price", String(formData.price || 0));
    uploadData.append("stock", String(formData.stock || 0));
    uploadData.append("description", formData.description || "");
    uploadData.append("categoryId", formData.categoryId);

    const computedVendorId = user?.role === "admin" ? formData.vendorId : user?.id;
    if (!computedVendorId) {
      toast.error("Please allocate a verified vendor partition.");
      setIsSubmitting(false);
      return;
    }
    uploadData.append("vendorId", computedVendorId);

    selectedFiles.forEach((file) => {
      uploadData.append("images", file);
    });

    try {
      if (isEditing) {
        await updateProduct(isEditing.id, uploadData);
        toast.success("Catalog information written to remote node successfully.");
      } else {
        await addProduct(computedVendorId, uploadData);
        toast.success("New marketplace document published successfully.");
      }
      
      // Fire tracking callbacks on operational pipeline completion
      if (onFormSuccess) {
        onFormSuccess();
      } else {
        setEditingProduct(null);
      }
    } catch (err) {
      toast.error("Failed to sync catalog changes with database logs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAction = () => {
    if (onFormSuccess) {
      onFormSuccess();
    } else {
      setEditingProduct(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-poppins text-gray-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* --- LEFT HAND COMPARTMENT: REGISTRY DETAILS --- */}
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 block mb-1.5">Product Title</label>
            <input
              type="text"
              className="w-full p-3 bg-white/2 border border-white/5 focus:border-green-500 rounded-xl outline-none transition-all text-sm text-white font-medium"
              placeholder="e.g., Industrial Organic Desk Lamp"
              value={formData.title}
              onChange={(e) => updateFormData({ title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 block mb-1.5">Price (RWF)</label>
              <input
                type="number"
                className="w-full p-3 bg-white/2 border border-white/5 focus:border-green-500 rounded-xl outline-none transition-all text-sm text-white font-mono font-bold"
                value={formData.price || ""}
                onChange={(e) => updateFormData({ price: Number(e.target.value) })}
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 block mb-1.5">Stock Level</label>
              <input
                type="number"
                className="w-full p-3 bg-white/2 border border-white/5 focus:border-green-500 rounded-xl outline-none transition-all text-sm text-white font-mono font-bold"
                value={formData.stock || ""}
                onChange={(e) => updateFormData({ stock: Number(e.target.value) })}
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 block mb-1.5">Category</label>
              <select
                className="w-full p-3 bg-[#111111] border border-white/5 focus:border-green-500 rounded-xl outline-none transition-all text-xs font-semibold text-gray-300 cursor-pointer"
                value={formData.categoryId || ""}
                onChange={(e) => updateFormData({ categoryId: e.target.value })}
                required
              >
                <option value="" className="bg-[#0d0d0d]">Select...</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-[#0d0d0d]">{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {user?.role === "admin" && (
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 block mb-1.5">Target Store Ownership</label>
              <select
                className="w-full p-3 bg-[#111111] border border-white/5 focus:border-green-500 rounded-xl outline-none transition-all text-xs font-semibold text-gray-300 cursor-pointer"
                value={formData.vendorId || ""}
                onChange={(e) => updateFormData({ vendorId: e.target.value })}
                required
              >
                <option value="" className="bg-[#0d0d0d]">Select Target Merchant Ledger...</option>
                {vendors?.map((v: any) => (
                  <option key={v.id} value={v.id} className="bg-[#0d0d0d]">{v.storeName}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 block mb-1.5">Detailed Specs</label>
            <textarea
              className="w-full p-3 bg-white/2 border border-white/5 focus:border-green-500 rounded-xl outline-none transition-all text-sm text-white h-28 resize-none leading-relaxed"
              value={formData.description || ""}
              onChange={(e) => updateFormData({ description: e.target.value })}
              required
            />
          </div>
        </div>

        {/* --- RIGHT HAND COMPARTMENT: ASSET MEDIA DROPZONE --- */}
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 block mb-1.5">Media Assets Manager</label>
            <div className="relative group w-full border-2 border-dashed border-white/5 rounded-2xl p-6 bg-white/1 text-center hover:bg-white/1 transition-all cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                onChange={handleFileChange}
                disabled={previews.length >= 5}
              />
              <Upload className="mx-auto text-gray-600 group-hover:text-green-500 transition-colors mb-2" size={24} />
              <p className="text-xs font-medium text-gray-400">Click or drag images to queue</p>
              <p className="text-[9px] text-gray-600 mt-0.5">Threshold configuration bounds max 5 frames</p>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 block mb-2">Live Cached Previews</label>
            <div className="flex flex-wrap gap-3 p-3 bg-white/1 border border-white/5 rounded-2xl min-h-28">
              {previews.length > 0 ? (
                previews.map((url, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 group">
                    <img src={url} className="w-full h-full object-cover" alt="asset preview" />
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(i)}
                      className="absolute top-1 right-1 bg-black/80 hover:bg-rose-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all cursor-pointer border border-white/10"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center w-full text-xs text-gray-600 italic">No asset tracking logs matching cache state buffers.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- REACTION CONTROL SYSTEM TRIGGER FOOTER --- */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5 mt-4">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleCancelAction}
          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-gray-300 px-5 py-2.5 rounded-xl text-xs uppercase font-black tracking-wider transition-all cursor-pointer disabled:opacity-50"
        >
          <RotateCcw size={14} /> Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl hover:bg-green-500 shadow-md text-xs uppercase font-black tracking-wider transition-all cursor-pointer disabled:opacity-50 min-w-37.5 justify-center"
        >
          {isSubmitting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          {isSubmitting ? "Writing Node..." : isEditing ? "Save Updates" : "Publish Asset"}
        </button>
      </div>
    </form>
  );
};

export default ProductFormModal;