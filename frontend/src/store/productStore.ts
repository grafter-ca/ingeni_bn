import { create } from "zustand";
import { productService } from "../services/productService";
import type { ApiCategory, ApiProduct } from "../types/api";

export interface ApiVendor {
  id: string;
  name: string;
  email?: string;
}

interface ProductState {
  // Data
  products: ApiProduct[];
  filteredProducts: ApiProduct[];
  categories: ApiCategory[];
  vendors: ApiVendor[];

  // UI/Context State
  isLoading: boolean;
  isFetchingMore: boolean;
  error: string | null;
  selectedVendorId: string | null;
  searchQuery: string;
  selectedCategory: string | null;
  isEditing: ApiProduct | null;

  // Forms
  formData: Omit<ApiProduct, "id" | "category" | "origin" | "images"> & {
    images: string[];
  };

  // Actions
  fetchProducts: (params?: any) => Promise<void>;
  fetchMoreProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchVendors: () => Promise<void>;
  fetchVendorProducts: (vendorId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setCategory: (categoryNameOrId: string | null) => void;
  setSelectedVendorId: (vendorId: string | null) => void;
  applyFilters: () => void;
  updateFormData: (data: Partial<ProductState["formData"]>) => void;
  setEditingProduct: (product: ApiProduct | null) => void;
  addProduct: (vendorId: string) => Promise<void>;
  updateProduct: (id: string) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  clearFormData: () => void;
  clearFilters: () => void;
  getVendorId: () => string | null;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  filteredProducts: [],
  categories: [],
  vendors: [],
  isLoading: false,
  isFetchingMore: false,
  error: null,
  selectedVendorId: null,
  searchQuery: "",
  selectedCategory: null,
  isEditing: null,
  formData: {
    title: "",
    stock: 0,
    price: 0,
    description: "",
    images: [],
    categoryId: "",
    vendorId: "",
  },

  fetchProducts: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const activeVendorId = get().selectedVendorId;
      const combinedParams = activeVendorId
        ? { ...params, vendorId: activeVendorId }
        : params;
      const data = await productService.getProducts(combinedParams);

      const sanitizedData = data.map((p: any) => ({
        ...p,
        images: Array.isArray(p.images)
          ? p.images.map((img: any) =>
              typeof img === "string" ? img : img.url,
            )
          : [],
      }));

      set({ products: sanitizedData, isLoading: false });
      get().applyFilters();
    } catch (err) {
      set({ error: "Failed to fetch inventory", isLoading: false });
    }
  },

  fetchVendorProducts: async (vendorId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await productService.getProducts({ vendorId });
      const sanitizedData = data.map((p: any) => ({
        ...p,
        images: Array.isArray(p.images)
          ? p.images.map((img: any) =>
              typeof img === "string" ? img : img.url,
            )
          : [],
      }));
      set({ products: sanitizedData, isLoading: false });
      get().applyFilters();
    } catch (err) {
      set({ error: "Failed to fetch vendor products", isLoading: false });
    }
  },

  fetchMoreProducts: async () => {
    // Implement pagination logic here
  },

  fetchCategories: async () => {
    try {
      const data = await productService.getCategories();
      set({ categories: data });
    } catch (err) {
      console.error("Category fetch error:", err);
    }
  },

  fetchVendors: async () => {
    try {
      if (typeof (productService as any).getVendors === "function") {
        const data = await (productService as any).getVendors();
        set({ vendors: data });
      }
    } catch (err) {
      set({ error: "Failed to sync merchant profiles" });
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().applyFilters();
  },
  setCategory: (cat) => {
    set({ selectedCategory: cat });
    get().applyFilters();
  },

  setSelectedVendorId: (vendorId: string | null) => {
    set({ selectedVendorId: vendorId });
    // Automatically refresh the list when the vendor changes
    if (vendorId) {
      get().fetchVendorProducts(vendorId);
    } else {
      get().fetchProducts();
    }
  },

 applyFilters: () => {
  const { products, searchQuery, selectedCategory, selectedVendorId } = get();
  
  const filtered = products.filter((p) => {
    // 1. Vendor Filter
    const matchesVendor = !selectedVendorId || String(p.vendorId) === String(selectedVendorId);
    
    // 2. Category Filter
    const matchesCategory = !selectedCategory || String(p.categoryId) === String(selectedCategory);
    
    // 3. Search Filter
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      p.title.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q);

    return matchesVendor && matchesCategory && matchesSearch;
  });

  set({ filteredProducts: filtered });
},

  updateFormData: (data) =>
    set((s) => ({ formData: { ...s.formData, ...data } })),

  setEditingProduct: (product) => {
    if (product) {
      set({
        isEditing: product,
        formData: {
          title: product.title,
          stock: product.stock ?? 0,
          price: product.price,
          description: product.description,
          images: Array.isArray(product.images)
            ? product.images.map((img: any) =>
                typeof img === "string" ? img : img.url,
              )
            : [],
          categoryId: product.categoryId,
          vendorId: product.vendorId || "",
        },
      });
    } else {
      get().clearFormData();
      set({ isEditing: null });
    }
  },

  addProduct: async (vendorId?: string) => {
    const { formData, selectedVendorId, fetchProducts, fetchVendorProducts } =
      get();

    // 1. Determine the source of truth for the vendorId
    const targetVendorId = vendorId || selectedVendorId;

    if (!targetVendorId) {
      set({ error: "Cannot add product: No vendor selected." });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const payload = {
        ...formData,
        vendorId: targetVendorId,
        price: Number(formData.price) || 0,
        stock: Number(formData.stock) || 0,
      };

      await productService.createProduct(payload);

      // 2. Refresh the list based on the active view
      if (selectedVendorId) {
        await fetchVendorProducts(selectedVendorId);
      } else {
        await fetchProducts();
      }

      // 3. Clear form on success
      get().clearFormData();
    } catch (err) {
      set({ error: "Failed to save product. Please try again." });
    } finally {
      set({ isLoading: false, isEditing: null });
    }
  },

  updateProduct: async (id: string) => {
    const { formData, fetchProducts, fetchVendorProducts, selectedVendorId } =
      get();

    set({ isLoading: true, error: null });

    try {
      // 1. Prepare and sanitize payload
      const payload = {
        ...formData,
        price: Number(formData.price) || 0,
        stock: Number(formData.stock) || 0,
      };

      // 2. Execute service mutation
      await productService.updateProduct(id, payload);

      // 3. Re-sync state based on current context
      if (selectedVendorId) {
        await fetchVendorProducts(selectedVendorId);
      } else {
        await fetchProducts();
      }

      // 4. Cleanup UI state
      get().clearFormData();
    } catch (err) {
      set({
        error:
          "Failed to update product. Please check your network and try again.",
      });
    } finally {
      set({ isLoading: false, isEditing: null });
    }
  },

  removeProduct: async (id) => {
    set({ isLoading: true });
    try {
      await productService.deleteProduct(id);
      await get().fetchProducts();
    } finally {
      set({ isLoading: false });
    }
  },

  clearFormData: () =>
    set({
      formData: {
        title: "",
        stock: 0,
        price: 0,
        description: "",
        images: [],
        categoryId: "",
        vendorId: get().selectedVendorId || "",
      },
    }),

  clearFilters: () => {
    set({ searchQuery: "", selectedCategory: null, selectedVendorId: null });
    get().fetchProducts();
  },

  getVendorId: () =>
    get().selectedVendorId || get().products[0]?.vendorId || null,
}));
