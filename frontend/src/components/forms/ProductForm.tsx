import { Loader2, X } from "lucide-react";
import { ProductDetailsForm } from "./ProductDetailsForm";
import { useEffect } from "react";
import { useProductStore } from "../../store/productStore";

type ProductFormProps = {
  vendorId: string;
  vendorName?: string;
  productId?: string | null;
  onClose: () => void;
};

export const ProductForm = ({
  vendorId,
  vendorName,
  onClose,
}: ProductFormProps) => {
  const {
    formData,
    addProduct,
    updateProduct,
    isEditing,
    updateFormData,
    isLoading,
    error,
  } = useProductStore();

  useEffect(() => {
    if (isEditing) {
      const existingImages = Array.isArray(isEditing.images)
        ? isEditing.images.map((img: any) => (typeof img === "string" ? img : img.url))
        : [];

      updateFormData({
        title: isEditing.title ?? "",
        stock: isEditing.stock ?? 0,
        price: isEditing.price ?? 0,
        description: isEditing.description ?? "",
        location: isEditing.location ?? "",
        images: existingImages,
        imageFiles: [],
        categoryId: isEditing.categoryId || (isEditing.category?.id ? String(isEditing.category.id) : ""),
        vendorId: isEditing.vendorId || vendorId || "",
      });
      return;
    }

    updateFormData({
      title: "",
      stock: 0,
      price: 0,
      description: "",
      location: "",
      images: [],
      imageFiles: [],
      categoryId: "",
      vendorId: vendorId || "",
    });
  }, [isEditing?.id, vendorId, updateFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const payload = new FormData();
  
  // 1. Mandatory Database Fields
  payload.append("vendorId", formData.vendorId || vendorId);
  payload.append("title", formData.title);
  payload.append("description", formData.description);
  payload.append("price", String(formData.price));
  payload.append("stock", String(formData.stock));
  payload.append("categoryId", formData.categoryId);
  
  // 2. Optional Database Fields
  if (formData.location) payload.append("location", formData.location);

  // 3. Image Handling
  // Backend needs to know which old images to keep and which new ones to upload
  formData.images?.forEach((url: string) => payload.append("images_to_keep", url));
  formData.imageFiles?.forEach((file: File) => payload.append("images", file));

  try {
    if (isEditing) {
       await updateProduct(isEditing.id, payload);
    } else {
       await addProduct(formData.vendorId || vendorId, payload);
    }
  } catch (err) {
    console.error("Submission failed:", err);
  }
};

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-3xl w-full max-w-lg mx-auto shadow-2xl flex flex-col max-h-[90vh]"
    >
      <div className="shrink-0 mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
            {isEditing ? "Modify" : "New"} Asset
          </h2>
          <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em]">
            Deploy to live catalog
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white/5 border border-white/5 p-3 rounded-xl min-w-[180px]">
            <p className="text-[9px] text-gray-400 uppercase tracking-widest">Vendor</p>
            <p className="text-sm font-bold text-white">{vendorName || "Active Merchant"}</p>
            <p className="text-[10px] text-gray-500 mt-1 truncate">
              {formData.vendorId || vendorId || "No vendor assigned"}
            </p>
          </div>
          <button type="button" onClick={onClose} className="mt-2">
            <X size={20} className="text-gray-500 hover:text-white" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-5 subtle-scroll">
        {error && (
          <div className="text-rose-400 bg-rose-500/10 p-4 rounded-xl text-xs border border-rose-500/20">
            {error}
          </div>
        )}
        <ProductDetailsForm />
      </div>

      <div className="shrink-0 mt-6 pt-4 border-t border-white/10">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-[0.25em] hover:bg-gray-200 transition-all flex items-center justify-center"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            isEditing ? "Commit Changes" : "Publish to Catalog"
          )}
        </button>
      </div>
    </form>
  );
};