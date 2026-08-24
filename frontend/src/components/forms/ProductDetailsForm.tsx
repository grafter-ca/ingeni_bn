import { useProductStore } from "../../store/productStore";
import { ProductImageUploader } from "../../components/forms/ProductImageUploader";
import { useCategoryStore } from "../../store/categoryStore";
import { useEffect } from "react";

export const ProductDetailsForm = () => {
  const { formData, updateFormData } = useProductStore();
  const { categories, fetchCategories, loading } = useCategoryStore();

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const inputClass = "w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-white placeholder-gray-700 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all";
  const labelClass = "text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1";

  return (
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
          disabled={loading}
        >
          <option value="">{loading ? "Loading categories..." : "Select Category"}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
  <label className={labelClass}>Physical Location</label>
  <input
    value={formData.location || ""}
    onChange={(e) => updateFormData({ location: e.target.value })}
    className={inputClass}
    placeholder="e.g. Warehouse A, Kigali Branch"
  />
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

      <ProductImageUploader
        existingImages={formData.images}
        newFiles={formData.imageFiles || []}
        onUpdate={(existing, newFiles) => updateFormData({ images: existing, imageFiles: newFiles })}
      />
    </div>
  );
};