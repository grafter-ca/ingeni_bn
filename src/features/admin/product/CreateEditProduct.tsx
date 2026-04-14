import { useProductStore } from "../../../store/productStore";
import { useCategoryStore } from "../../../store/categoryStore";
import { Save } from "lucide-react";

export const ProductForm = () => {
  const {
    formData,
    updateFormData,
    isEditing,
    addProduct,
    updateProduct,
    setEditingProduct,
  } = useProductStore();
  const { categories } = useCategoryStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      await updateProduct(isEditing.id);
    } else {
      await addProduct();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white/20 p-6 rounded-2xl border shadow-sm"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <input
            className="w-full p-2.5 border rounded-xl"
            placeholder="Product Title"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            required
          />
          <div className="flex gap-4">
            <input
              type="number"
              className="w-1/2 p-2.5 border rounded-xl"
              placeholder="Price (RWF)"
              value={formData.price}
              onChange={(e) =>
                updateFormData({ price: Number(e.target.value) })
              }
              required
            />
            <select
              className="w-1/2 p-2.5 border rounded-xl"
              value={formData.categoryId}
              onChange={(e) => updateFormData({ categoryId: e.target.value })}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <textarea
            className="w-full p-2.5 border rounded-xl h-32"
            placeholder="Product Description"
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            required
          />
        </div>

        {/* Image Management */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-100">
            Image URLs (comma separated)
          </label>
          <textarea
            className="w-full p-2.5 border rounded-xl h-20 text-sm"
            placeholder="https://image1.jpg, https://image2.jpg"
            value={formData.images.join(", ")}
            onChange={(e) =>
              updateFormData({
                images: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter((s) => s !== ""),
              })
            }
          />
          <div className="flex gap-2 overflow-x-auto pb-2">
            {/* Explicitly type 'url' as string and 'i' as number */}
            {formData.images.map(
              (url: string, i: number) =>
                url && (
                  <img
                    key={i}
                    src={url}
                    className="w-16 h-16 object-cover rounded-lg border shadow-sm"
                    alt={`preview-${i}`}
                  />
                ),
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <button
          type="submit"
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700"
        >
          <Save size={18} /> {isEditing ? "Update Product" : "Publish Product"}
        </button>
        <button
          type="button"
          onClick={() => setEditingProduct(null)}
          className="bg-gray-100 px-6 py-2 rounded-xl text-gray-600 hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
