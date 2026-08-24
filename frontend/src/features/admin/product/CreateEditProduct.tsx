import React, { useState, useEffect } from "react";
import { useProductStore } from "../../../store/productStore";
import { useCategoryStore } from "../../../store/categoryStore";
import { useAuthState } from "../../../context/AuthContext";
import { Save, RotateCcw, Upload, X, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export const ProductForm = () => {
  const {
    formData,
    updateFormData,
    isEditing,
    addProduct,
    updateProduct,
    setEditingProduct,
    vendors // Fed natively from the administrative configuration stack
  } = useProductStore();
  
  const { categories } = useCategoryStore();
  const { user } = useAuthState();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync existing database images during update cycles
  useEffect(() => {
    if (isEditing && isEditing.images) {
      const existingUrls = isEditing.images.map((img: any) => img.url);
      setPreviews(existingUrls);
    } else {
      setPreviews([]);
      setSelectedFiles([]);
    }
  }, [isEditing]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    
    if (filesArray.length + selectedFiles.length > 5) {
      toast.error("Maximum threshold of 5 media frames reached.");
      return;
    }

    setSelectedFiles((prev) => [...prev, ...filesArray]);
    const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeSelectedFile = (index: number) => {
    // Determine if it is a local object url or historical database asset url string
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
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

    // Enforce dynamic vendor identity constraints
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
      setEditingProduct(null);
    } catch (err) {
      toast.error("Failed to sync catalog changes with database logs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-poppins">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* --- LEFT HAND COMPARTMENT: REGISTRY DETAILS --- */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1.5">Product Title</label>
            <input
              type="text"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 focus:border-green-500 focus:bg-white rounded-xl outline-none transition-all text-sm text-gray-800 font-medium"
              placeholder="e.g., Industrial Organic Desk Lamp"
              value={formData.title}
              onChange={(e) => updateFormData({ title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1.5">Price (RWF)</label>
              <input
                type="number"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 focus:border-green-500 focus:bg-white rounded-xl outline-none transition-all text-sm text-gray-800 font-mono font-bold"
                value={formData.price || ""}
                onChange={(e) => updateFormData({ price: Number(e.target.value) })}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1.5">Stock Level</label>
              <input
                type="number"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 focus:border-green-500 focus:bg-white rounded-xl outline-none transition-all text-sm text-gray-800 font-mono font-bold"
                value={formData.stock || ""}
                onChange={(e) => updateFormData({ stock: Number(e.target.value) })}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1.5">Category</label>
              <select
                className="w-full p-2.5 bg-gray-50 border border-gray-200 focus:border-green-500 focus:bg-white rounded-xl outline-none transition-all text-sm text-gray-700 font-semibold cursor-pointer"
                value={formData.categoryId}
                onChange={(e) => updateFormData({ categoryId: e.target.value })}
                required
              >
                <option value="">Select...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* --- ADMIN ONLY STORE CHANGER DROPDOWN --- */}
          {user?.role === "admin" && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1.5">Target Store Ownership Mapping</label>
              <select
                className="w-full p-2.5 bg-gray-50 border border-gray-200 focus:border-green-500 focus:bg-white rounded-xl outline-none transition-all text-sm text-gray-700 font-semibold cursor-pointer"
                value={formData.vendorId || ""}
                onChange={(e) => updateFormData({ vendorId: e.target.value })}
                required
              >
                <option value="">Select Target Merchant Ledger...</option>
                {vendors?.map((v: any) => (
                  <option key={v.id} value={v.id}>{v.storeName}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1.5">Detailed Specs</label>
            <textarea
              className="w-full p-2.5 bg-gray-50 border border-gray-200 focus:border-green-500 focus:bg-white rounded-xl outline-none transition-all text-sm text-gray-800 h-28 resize-none leading-relaxed"
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
              required
            />
          </div>
        </div>

        {/* --- RIGHT HAND COMPARTMENT: LIVE DIGITAL ASSET FRAME --- */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1.5">Media Assets Manager</label>
            <div className="relative group w-full border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 text-center hover:bg-gray-100/50 transition-all cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                disabled={previews.length >= 5}
              />
              <Upload className="mx-auto text-gray-400 mb-2" size={24} />
              <p className="text-xs font-medium text-gray-600">Click or drag images to queue</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-2">Live Registered Matrix Preview</label>
            <div className="flex flex-wrap gap-3 p-3 bg-white border border-gray-200 rounded-xl min-h-28">
              {previews.length > 0 ? (
                previews.map((url, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 group">
                    <img src={url} className="w-full h-full object-cover" alt="asset preview" />
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(i)}
                      className="absolute top-1 right-1 bg-black/75 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center w-full text-xs text-gray-400 italic">No asset strings cached.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- REACTION CONTROL SYSTEM TRIGGER FOOTER --- */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => setEditingProduct(null)}
          className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
        >
          <RotateCcw size={16} /> Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl hover:bg-green-500 shadow-md text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 min-w-37.5 justify-center"
        >
          {isSubmitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {isSubmitting ? "Saving changes..." : isEditing ? "Save Updates" : "Publish Listing"}
        </button>
      </div>
    </form>
  );
};