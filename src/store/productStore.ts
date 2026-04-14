import { create } from "zustand";
import { productService } from "../services/productService";
import type { ApiCategory, ApiProduct } from "../types/api";

interface ProductState {
  // Data State
  products: ApiProduct[];
  filteredProducts: ApiProduct[];
  categories: ApiCategory[];
  isLoading: boolean;
  error: string | null;

  // Form/Modal State
  isEditing: ApiProduct | null;
  // UI Note: images is a string in the form (for comma-parsing) but string[] in the API
  formData: Omit<ApiProduct, "id" | "category" | "origin" | "images"> & { images: string };

  // Methods
  fetchProducts: (params?: any) => Promise<void>;
  fetchCategories: () => Promise<void>;
  setFilteredProducts: (products: ApiProduct[]) => void;
  updateFormData: (data: Partial<ProductState["formData"]>) => void;
  setEditingProduct: (product: ApiProduct | null) => void;
  
  // CRUD Actions
  addProduct: (vendorId: string) => Promise<void>;
  updateProduct: (id: string) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  // --- INITIAL STATE ---
  products: [],
  filteredProducts: [],
  categories: [],
  isLoading: false,
  error: null,
  isEditing: null,
  formData: {
    title: "",
    stock: 0,
    price: 0,
    description: "",
    images: "", // Initialized as empty string for the comma-separated input
    categoryId: "",
    vendorId: "",
  },

  // --- DATA FETCHING ---
  fetchProducts: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const data = await productService.getProducts(params);
      
      // Sanitize incoming data: Ensure images are always string[]
      const sanitizedData = data.map((p: any) => ({
        ...p,
        images: Array.isArray(p.images) && typeof p.images[0] === 'object' 
          ? p.images.map((img: any) => img.url) 
          : p.images
      }));
      
      set({ 
        products: sanitizedData, 
        filteredProducts: sanitizedData, 
        isLoading: false 
      });
    } catch (err) {
      set({ error: "Failed to fetch inventory", isLoading: false });
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

  // --- FILTERING ---
  setFilteredProducts: (products) => set({ filteredProducts: products }),

  // --- FORM MANAGEMENT ---
  updateFormData: (data) =>
    set((state) => ({ formData: { ...state.formData, ...data } })),

  setEditingProduct: (product) => {
    if (product) {
      set({
        isEditing: product,
        formData: {
          title: product.title,
          stock: product.stock,
          price: product.price,
          description: product.description,
          // Convert string[] from API to comma-separated string for the UI input
          images: Array.isArray(product.images) ? product.images.join(", ") : "",
          categoryId: product.categoryId,
          vendorId: product.vendorId,
        },
      });
    } else {
      set({
        isEditing: null,
        formData: { 
          title: "", 
          stock: 0, 
          price: 0, 
          description: "", 
          images: "", 
          categoryId: "", 
          vendorId: "" 
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
        // PARSE: Convert the UI string back into a clean string[] for the backend
        images: formData.images
          .split(",")
          .map((url) => url.trim())
          .filter((url) => url !== ""),
      };

      await productService.createProduct(payload);
      set({ isEditing: null, isLoading: false });
      await fetchProducts({ vendorId });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  updateProduct: async (id: string) => {
    const { formData, fetchProducts, isEditing } = get();
    set({ isLoading: true });
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        // PARSE: Convert the UI string back into a clean string[] for the backend
        images: formData.images
          .split(",")
          .map((url) => url.trim())
          .filter((url) => url !== ""),
      };

      await productService.updateProduct(id, payload);
      set({ isEditing: null, isLoading: false });
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
    } finally {
      set({ isLoading: false });
    }
  },
}));