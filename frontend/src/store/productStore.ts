import { create } from "zustand";
import { productService } from "../services/productService";
import type { ApiCategory, ApiProduct } from "../types/api";

// Assuming you have a standard basic shape for Vendor data records
export interface ApiVendor {
  id: string;
  name: string;
  email?: string;
}

interface ProductState {
  // Data State
  products: ApiProduct[];
  filteredProducts: ApiProduct[];
  categories: ApiCategory[];
  vendors: ApiVendor[]; // <-- Added: Global repository of marketplace vendors
  isLoading: boolean;
  selectedVendorId: string | null; //深 <-- Added: Active tenant view context identifier
  isFetchingMore: boolean;
  error: string | null;

  // Filter State
  searchQuery: string;
  selectedCategory: string | null;

  // Form/Modal State
  isEditing: ApiProduct | null;
  formData: Omit<ApiProduct, "id" | "category" | "origin" | "images"> & { images: string[] };

  // Methods
  fetchProducts: (params?: any) => Promise<void>;
  fetchMoreProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchVendors: () => Promise<void>; // <-- Added: Hydrates backend vendor profiles
  setSearchQuery: (query: string) => void;
  setCategory: (categoryNameOrId: string | null) => void;
  setSelectedVendorId: (vendorId: string | null) => void; // <-- Added: Sets active tenant context
  applyFilters: () => void;
  updateFormData: (data: Partial<ProductState["formData"]>) => void;
  setEditingProduct: (product: ApiProduct | null) => void;
  
  // CRUD Actions
  addProduct: (vendorId: string) => Promise<void>;
  updateProduct: (id: string) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  clearFilters: () => void;
  getVendorId: () => string | null;
  clearFormData?: () => void; // Optional helper to reset form data fields on modal close
}

export const useProductStore = create<ProductState>((set, get) => ({
  // --- INITIAL STATE ---
  products: [],
  filteredProducts: [],
  categories: [],
  vendors: [], // <-- Initial state setup
  isLoading: false,
  isFetchingMore: false,
  error: null,
  selectedVendorId: null, // <-- Initial state setup
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

  // --- DATA FETCHING ---
  fetchProducts: async (params) => {
    set({ isLoading: true, error: null });
    try {
      // If a global vendor filter context is active, force it down into our payload requests automatically
      const activeVendorId = get().selectedVendorId;
      const combinedParams = activeVendorId 
        ? { ...params, vendorId: activeVendorId } 
        : params;

      const data = await productService.getProducts(combinedParams);
      
      const sanitizedData = data.map((p: any) => ({
        ...p,
        images: Array.isArray(p.images) && typeof p.images[0] === 'object' 
          ? p.images.map((img: any) => img.url) 
          : Array.isArray(p.images) ? p.images : []
      }));
      
      set({ 
        products: sanitizedData, 
        isLoading: false 
      });
      
      // Sync filtered array reactively
      get().applyFilters();
    } catch (err) {
      set({ error: "Failed to fetch inventory", isLoading: false });
    }
  },

  fetchMoreProducts: async () => {
    const { isFetchingMore } = get();
    if (isFetchingMore) return;
    set({ isFetchingMore: true });
    try {
      set({ isFetchingMore: false });
    } catch (err) {
      console.error("Failed to load more products:", err);
      set({ isFetchingMore: false });
    }
  },

  fetchCategories: async () => {
    try {
      const data = await productService.getCategories();
      set({ categories: data });
    } catch (err) {
      console.error("Category fetch error:", err);
    }
  },

  // --- NEW VENDOR REPOSITORY METHOD ---
  fetchVendors: async () => {
    set({ isLoading: true, error: null });
    try {
      // Assumes your backend service exposes a basic list endpoint for profiles
      // If service is not built yet, you can use: const data = await axios.get("/api/vendors").then(res => res.data);
      if (typeof (productService as any).getVendors === 'function') {
        const data = await (productService as any).getVendors();
        set({ vendors: data, isLoading: false });
      } else {
        console.warn("getVendors method is missing on your product API service wrapper.");
        set({ isLoading: false });
      }
    } catch (err) {
      set({ error: "Failed to sync merchant profiles", isLoading: false });
    }
  },

  // --- FILTERING ENGINE ---
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().applyFilters();
  },

  setCategory: (categoryNameOrId) => {
    set({ selectedCategory: categoryNameOrId });
    get().applyFilters();
  },

  // --- NEW CONTEXT SETTER METHOD ---
  setSelectedVendorId: (vendorId) => {
    set({ selectedVendorId: vendorId });
    // Re-fetch products matching this merchant profile instantly or re-filter the current state array
    get().fetchProducts();
  },

 applyFilters: () => {
  const { products, searchQuery, selectedCategory, selectedVendorId } = get();
  let updatedList = [...products];

  // 1. Safe Tenant Filtering Check
  if (selectedVendorId) {
    updatedList = updatedList.filter(
      (p) => String(p.vendorId) === String(selectedVendorId)
    );
  }

  // 2. Text Queries
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    updatedList = updatedList.filter(
      (p) =>
        p.title?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
    );
  }

  // 3. Category Normalization Match Check
  if (selectedCategory) {
    updatedList = updatedList.filter(
      (p) =>
        String(p.categoryId) === String(selectedCategory) ||
        p.category?.id === selectedCategory ||
        p.category?.name === selectedCategory
    );
  }

  set({ filteredProducts: updatedList });
},

  // --- FORM MANAGEMENT ---
  updateFormData: (data) =>
    set((state) => ({ formData: { ...state.formData, ...data } })),

  setEditingProduct: (product) => {
    if (product) {
      set({
        isEditing: product,
        formData: {
          title: product.title,
          stock: product.stock ?? 0,
          price: product.price,
          description: product.description,
          images: Array.isArray(product.images) ? product.images : [],
          categoryId: product.categoryId,
          vendorId: product.vendorId,
        },
      });
    } else {
      // Clean baseline state when building new objects, auto-inject active vendor parameters if available
      set({
        isEditing: null,
        formData: { 
          title: "", 
          stock: 0, 
          price: 0, 
          description: "", 
          images: [], 
          categoryId: "", 
          vendorId: get().selectedVendorId || "" 
        },
      });
    }
  },

  // --- CRUD OPERATIONS ---
  addProduct: async (vendorId: string) => {
    const { formData, fetchProducts } = get();
    if (!formData.title?.trim()) throw new Error("Title is required");

    set({ isLoading: true });
    try {
      const payload = {
        ...formData,
        vendorId,
        price: Number(formData.price),
        stock: Number(formData.stock),
      };

      await productService.createProduct(payload);
      set({ isEditing: null });
      await fetchProducts({ vendorId });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  getVendorId: () => {
    const { products, selectedVendorId } = get();
    if (selectedVendorId) return selectedVendorId;
    const vendorIdFromProducts = products.find(p => p.vendorId)?.vendorId;
    return vendorIdFromProducts || null;
  },

  updateProduct: async (id: string) => {
    const { formData, fetchProducts, isEditing } = get();
    set({ isLoading: true });
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
      };

      await productService.updateProduct(id, payload);
      set({ isEditing: null });
      await fetchProducts({ vendorId: isEditing?.vendorId });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  removeProduct: async (id: string) => {
    const { fetchProducts, products } = get();
    const productToDelete = products.find((p) => p.id === id);
    const vId = productToDelete?.vendorId;

    set({ isLoading: true });
    try {
      await productService.deleteProduct(id);
      await fetchProducts({ vendorId: vId });
    } catch (err) {
      set({ error: "Failed to delete product", isLoading: false });
      throw err;
    }
  },

  clearFormData: () => {
    set({
      formData: {
        title: "",
        stock: 0,
        price: 0,
        description: "",
        images: [],
        categoryId: "",
        vendorId: ""
      }
    });
  },

  clearFilters: () => {
    set({ searchQuery: "", selectedCategory: null, selectedVendorId: null });
    get().fetchProducts();
  }
}));