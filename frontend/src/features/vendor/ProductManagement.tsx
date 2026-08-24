// components/vendor/ProductManagement.tsx
import { useState, useEffect, useRef } from "react";
import { Package, Plus, Search, Trash2, Edit3, Upload, X, Loader2, MapPin, Store, ShieldCheck, User } from "lucide-react";
import { useProductStore } from "../../store/productStore";
import Button from "../../components/ui/Button";
import { useAuthState } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

export const ProductManagement = () => {
  const { 
    filteredProducts, 
    categories, 
    fetchCategories, 
    fetchProducts,
    fetchVendorProducts, 
    setSelectedVendorId,
    addProduct, 
    updateProduct,
    removeProduct, 
    isLoading 
  } = useProductStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthState();

  // Multi-file upload states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const vendorId = user?.id || "";

  // Sync vendor context and fetch initial data on mount or when vendorId changes
  useEffect(() => {
    fetchCategories();
    if (vendorId) {
      setSelectedVendorId(vendorId);
      fetchVendorProducts(vendorId);
    } else {
      fetchProducts();
    }
  }, [vendorId, fetchCategories, fetchVendorProducts, setSelectedVendorId, fetchProducts]);

  // Form State
  const [form, setForm] = useState({
    title: "",
    price: "",
    stock: "",
    categoryId: "",
    description: "",
    location: "Kigali"
  });

  // Sync default category ID once categories are successfully fetched from backend
  useEffect(() => {
    if (categories.length > 0) {
      const categoryExists = categories.some((cat: any) => String(cat.id) === String(form.categoryId));
      if (!form.categoryId || !categoryExists) {
        setForm((prev) => ({ ...prev, categoryId: String(categories[0].id) }));
      }
    }
  }, [categories, form.categoryId]);

  // Handle multiple files selection from device
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFilesArray = Array.from(files);
      setSelectedFiles((prev) => [...prev, ...newFilesArray]);

      // Generate local preview URLs for the newly selected files
      const newPreviews = newFilesArray.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveNewFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setSelectedProductId(null);
    setSelectedFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    
    const rawCatId = categories.length > 0 ? String(categories[0].id) : "";
    const cleanDefaultCatId = rawCatId.replace(/^(local-|fake-)/, '');

    setForm({
      title: "",
      price: "",
      stock: "",
      categoryId: cleanDefaultCatId,
      description: "",
      location: "Kigali"
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: any) => {
    setIsEditMode(true);
    setSelectedProductId(product.id);
    setSelectedFiles([]);
    setImagePreviews([]);

    const productImages = Array.isArray(product.images)
      ? product.images.map((img: any) => (typeof img === 'string' ? img : img?.url)).filter(Boolean)
      : [];

    setExistingImages(productImages);

    const rawProdCatId = String(product.categoryId || product.category?.id || "");
    const cleanProdCatId = rawProdCatId.replace(/^(local-|fake-)/, '');

    const matchingCategory = categories.find(
      (cat: any) => String(cat.id).replace(/^(local-|fake-)/, '') === cleanProdCatId
    );
    
    const resolvedCategoryId = matchingCategory 
      ? String(matchingCategory.id).replace(/^(local-|fake-)/, '') 
      : (categories[0]?.id ? String(categories[0].id).replace(/^(local-|fake-)/, '') : "");

    setForm({
      title: product.title || "",
      price: product.price?.toString() || "",
      stock: product.stock?.toString() || "",
      categoryId: resolvedCategoryId,
      description: product.description || "",
      location: product.location || "Kigali"
    });
    setIsModalOpen(true);
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price) {
      toast.error("Please provide a product title and price.");
      return;
    }

    if (!form.categoryId) {
      toast.error("Please select a valid category.");
      return;
    }

    if (!vendorId) {
      toast.error("Vendor session not found. Please log in again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanCategoryId = String(form.categoryId).replace(/^(local-|fake-)/, '');

      const formDataPayload = new FormData();
      formDataPayload.append("title", form.title);
      formDataPayload.append("price", String(form.price));
      formDataPayload.append("stock", String(form.stock || "10"));
      formDataPayload.append("categoryId", cleanCategoryId);
      formDataPayload.append("description", form.description);
      formDataPayload.append("location", form.location || "Kigali");
      formDataPayload.append("vendorId", vendorId);
      
      selectedFiles.forEach((file) => {
        formDataPayload.append("images", file);
      });

      if (isEditMode && existingImages.length > 0) {
        existingImages.forEach((imgUrl) => {
          formDataPayload.append("images_to_keep", imgUrl);
        });
      }

      if (isEditMode && selectedProductId) {
        const cleanId = String(selectedProductId).replace(/^(local-|fake-)/, '');
        await updateProduct(cleanId, formDataPayload);
        toast.success("Product successfully updated.");
      } else {
        await addProduct(vendorId, formDataPayload);
        toast.success("Product successfully created and assigned to your catalog.");
      }

      setIsModalOpen(false);
      if (vendorId) {
        fetchVendorProducts(vendorId);
      }
    } catch (error: any) {
      toast.error(error?.message || "Operation failed. Please verify your inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("Are you sure you want to remove this product from your inventory catalog?")) {
      try {
        const cleanId = String(productId).replace(/^(local-|fake-)/, '');
        await removeProduct(cleanId);
        toast.success("Product deleted successfully.");
        if (vendorId) {
          fetchVendorProducts(vendorId);
        }
      } catch (error) {
        toast.error("Failed to delete product.");
      }
    }
  };

  // Filter products locally by search query from the Zustand store's filtered dataset
  const displayedProducts = (Array.isArray(filteredProducts) ? filteredProducts : []).filter((product) =>
    product.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const vendorDisplayName = user?.name || user?.email?.split('@')[0] || "Vendor Store Portal";

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Vendor Info Banner Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-950/40 via-[#0c0c0e] to-[#0c0c0e] border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Store size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-poppins font-bold text-white text-lg tracking-wide">
                {vendorDisplayName}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-mono text-blue-400 uppercase flex items-center gap-1">
                <ShieldCheck size={10} /> Active Vendor
              </span>
            </div>
            <p className="font-mono text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
              <User size={12} className="text-blue-400" /> Account ID: <span className="text-gray-300">{vendorId || "Session Active"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:border-l sm:border-white/10 sm:pl-6">
          <div className="font-mono text-right">
            <p className="text-[10px] uppercase text-gray-500">Total Products</p>
            <p className="text-sm font-bold text-white">{displayedProducts.length}</p>
          </div>
        </div>
      </div>

      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package size={14} className="text-blue-400" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-blue-400">Inventory Management</span>
          </div>
          <h1 className="font-poppins font-bold text-2xl md:text-3xl text-white tracking-tight">Products & Inventory</h1>
        </div>
        <Button
          label="Add New Product"
          icon={Plus}
          onClick={handleOpenCreateModal}
          className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs py-3 px-5 rounded-xl transition shadow-lg shadow-blue-600/25 cursor-pointer"
        />
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0c0c0e] border border-white/10 flex items-center shadow-lg">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search inventory items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-blue-500/50 transition placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-16 text-center font-mono text-xs text-gray-500 bg-[#0c0c0e] rounded-3xl border border-white/10 flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin text-blue-400" /> Synchronizing inventory catalog...
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="col-span-full py-16 text-center font-mono text-xs text-gray-500 bg-[#0c0c0e] rounded-3xl border border-white/10">
            No products found in your catalog. Click &quot;Add New Product&quot; to publish items.
          </div>
        ) : (
          displayedProducts.map((product) => {
            const imageUrl = typeof product.images?.[0] === 'string' 
              ? product.images[0] 
              : (product.images?.[0] as any)?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30";

            const imageCount = Array.isArray(product.images) ? product.images.length : 1;

            return (
              <div key={product.id} className="rounded-3xl bg-[#0c0c0e] border border-white/10 overflow-hidden flex flex-col justify-between shadow-xl group">
                <div>
                  <div className="h-48 w-full bg-[#121215] relative overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {imageCount > 1 && (
                        <span className="px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[9px] font-mono text-blue-300 border border-white/10">
                          +{imageCount - 1} more
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-mono text-white border border-white/10">
                        Stock: {product.stock ?? "10"}
                      </span>
                    </div>
                    {product.location && (
                      <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-mono text-blue-300 border border-white/10 flex items-center gap-1">
                        <MapPin size={10} /> {product.location}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-poppins font-bold text-base text-white mb-1 line-clamp-1">{product.title}</h3>
                    <p className="font-mono text-xs text-blue-400 font-bold mb-2">RWF {product.price?.toLocaleString()}</p>
                    <p className="font-mono text-[11px] text-gray-400 line-clamp-2">{product.description || "No description provided."}</p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between border-t border-white/5 mt-4">
                  <span className="font-mono text-[10px] text-gray-500 uppercase truncate max-w-[120px]">ID: {product.id}</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleOpenEditModal(product)}
                      className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                      title="Edit Product"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition cursor-pointer border border-rose-500/20"
                      title="Delete Product"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* --- ADD / EDIT PRODUCT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-[#0c0c0e] border border-white/10 p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <h2 className="font-poppins font-bold text-lg text-white">
                {isEditMode ? "Edit Inventory Item" : "Add New Inventory Item"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-gray-400 uppercase text-[10px] mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Product"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 uppercase text-[10px] mb-1">Price (RWF)</label>
                  <input
                    type="number"
                    required
                    placeholder="15000"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 uppercase text-[10px] mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 uppercase text-[10px] mb-1">Category</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value.replace(/^(local-|fake-)/, '') })}
                    required
                    className="w-full p-3 rounded-xl bg-[#121215] border border-white/10 text-white focus:outline-none focus:border-blue-500 transition"
                  >
                    <option value="" disabled>Select a valid category</option>
                    {categories.map((cat: any) => {
                      const cleanCatId = String(cat.id).replace(/^(local-|fake-)/, '');
                      return (
                        <option key={cat.id} value={cleanCatId}>
                          {cat.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 uppercase text-[10px] mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Kigali Market"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Multi-Image Upload Section */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-gray-400 uppercase text-[10px]">Product Images (Multiple allowed)</label>
                  <span className="text-[10px] text-blue-400">{existingImages.length + imagePreviews.length} total</span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                />

                {(existingImages.length > 0 || imagePreviews.length > 0) && (
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {existingImages.map((url, idx) => (
                      <div key={`existing-${idx}`} className="relative h-20 rounded-xl overflow-hidden border border-white/10 bg-black/40 group">
                        <img src={url} alt={`Existing ${idx}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 px-1 rounded bg-black/60 text-[8px] text-gray-300">Saved</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(idx)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-90 hover:opacity-100 transition cursor-pointer"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}

                    {imagePreviews.map((previewUrl, idx) => (
                      <div key={`new-${idx}`} className="relative h-20 rounded-xl overflow-hidden border border-blue-500/40 bg-black/40 group">
                        <img src={previewUrl} alt={`New ${idx}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 px-1 rounded bg-blue-600/80 text-[8px] text-white">New</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveNewFile(idx)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-90 hover:opacity-100 transition cursor-pointer"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-white/20 hover:border-blue-500/50 rounded-2xl p-4 bg-white/[0.02] transition cursor-pointer flex flex-col items-center justify-center gap-2 text-center"
                >
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Upload size={18} />
                  </div>
                  <div>
                    <p className="text-white font-medium text-xs">Click to browse & select images</p>
                    <p className="text-gray-500 text-[10px] mt-0.5">You can select multiple PNG, JPG, or WEBP files</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 uppercase text-[10px] mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Provide details about the product quality, origin, or specifications..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-blue-500 transition resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition shadow-lg shadow-blue-600/25 cursor-pointer flex items-center gap-2 min-w-[130px] justify-center"
                >
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  {isSubmitting ? "Saving..." : isEditMode ? "Update Product" : "Save Product"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};