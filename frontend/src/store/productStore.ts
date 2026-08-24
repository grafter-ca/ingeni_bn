import { create } from "zustand";
import { productService } from "../services/productService";
import type { ApiCategory, ApiProduct, ProductFormData } from "../types/api";

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
  // ADD THESE:
  offset: number;
  limit: number;
  hasMore: boolean;
  selectedVendorId: string | null;
  searchQuery: string;
  selectedCategory: string | null;
  isEditing: ApiProduct | null;
  _sanitizeImages: (images: any[] | undefined) => string[];

  // Forms
  formData: ProductFormData

  // Actions
  fetchProducts: (params?: any) => Promise<void>;
  fetchPublicProducts: (params?: any) => Promise<void>;
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
  addProduct: (vendorId: string, payload: FormData) => Promise<void>;
  updateProduct: (id: string, payload: FormData) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  clearFormData: () => void;
  clearFilters: () => void;
  getVendorId: () => string | null;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  filteredProducts: [],
  offset: 0,
  limit: 20,
  hasMore: true,
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
    location: "",
    imageFiles: [],
  },

  _sanitizeImages: (images: any[] | undefined): string[] => {
    if (!Array.isArray(images)) return [];
    return images.map((img) => (typeof img === "string" ? img : img?.url || ""));
  },

  fetchProducts: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { selectedVendorId } = get();
      const combinedParams = selectedVendorId ? {
        ...params,
        vendorId: selectedVendorId
      } : params;

      const data = await productService.getProducts(combinedParams);

      const sanitizedData = data.map((p) => ({
        ...p,
        images: get()._sanitizeImages(p.images),
      }));

      set({ products: sanitizedData, isLoading: false });
      get().applyFilters();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch inventory";
      set({ error: message, isLoading: false });
      console.error("[ProductStore]: Fetch Error", err); // Log for observability
    }
  },
  fetchPublicProducts: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { selectedVendorId } = get();
      const combinedParams = selectedVendorId ? { ...params, vendorId: selectedVendorId } : params;

      const data = await productService.getProductsPublic(combinedParams);

      const sanitizedData = data.map((p) => ({
        ...p,
        images: get()._sanitizeImages(p.images),
      }));

      set({
        products: sanitizedData,
        isLoading: false,
      });
      get().applyFilters();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch public inventory";
      set({ error: message, isLoading: false });
      console.error("[ProductStore]: Public Fetch Error", err);
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
    const { isLoading, hasMore, offset, limit, selectedVendorId } = get();

    if (isLoading || !hasMore) return;

    set({ isLoading: true });

    try {
      const nextOffset = offset + limit;
      const params = {
        limit,
        offset: nextOffset,
        vendorId: selectedVendorId || undefined
      };

      const newData = await productService.getProducts(params);

      const sanitizedData = newData.map((p) => ({
        ...p,
        images: get()._sanitizeImages(p.images),
      }));

      set((state) => ({
        products: [...state.products, ...sanitizedData],
        offset: nextOffset,
        hasMore: newData.length === limit, // Logic: stop if we get fewer than limit
        isLoading: false,
      }));

      get().applyFilters();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load more products";
      set({ error: message, isLoading: false });
      console.error("[ProductStore]: Pagination Error", err);
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
  setCategory: (catNameOrId: string | null) => {
    set({ selectedCategory: catNameOrId });
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

    // Find the category object if an ID or Name was passed
    const categories = get().categories;
    const matchedCategory = categories.find(
      (c) => String(c.id) === String(selectedCategory) || c.name === selectedCategory
    );
    const targetCatId = matchedCategory ? String(matchedCategory.id) : null;
    const targetCatName = matchedCategory ? matchedCategory.name.toLowerCase() : String(selectedCategory || "").toLowerCase();

    const filtered = products.filter((p: any) => {
      // 1. Vendor Filter
      const matchesVendor = !selectedVendorId || String(p.vendorId) === String(selectedVendorId);

      // 2. Flexible Category Filter (Handles ID, nested category objects, or category names)
      let matchesCategory = true;
      if (selectedCategory) {
        const pCatId = p.categoryId || p.category?.id;
        const pCatName = p.categoryName || p.category?.name || "";

        const matchById = targetCatId && pCatId ? String(pCatId) === targetCatId : false;
        const matchByName = targetCatName ? String(pCatName).toLowerCase() === targetCatName : false;
        const matchDirect = String(pCatId) === String(selectedCategory);

        matchesCategory = Boolean(matchById || matchByName || matchDirect);
      }

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

          imageFiles: [],
          location: product.location || "",
          categoryId: product.categoryId,
          vendorId: product.vendorId || "",
        },
      });
    } else {
      get().clearFormData();
      set({ isEditing: null });
    }
  },

  addProduct: async (vendorId?: string, payload?: FormData) => {
    const { fetchProducts, fetchVendorProducts, selectedVendorId } = get();

    // Validate that we have a vendor context
    const targetVendorId = vendorId || selectedVendorId;
    if (!targetVendorId) {
      set({ error: "Missing vendor context." });
      return;
    }

    if (!payload) {
      set({ error: "No data to save." });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      await productService.createProduct(payload);

      // Refresh list using the verified targetVendorId
      if (targetVendorId) {
        await fetchVendorProducts(targetVendorId);
      } else {
        await fetchProducts();
      }

      get().clearFormData();
    } catch (err) {
      set({ error: "Failed to save product. Please try again." });
    } finally {
      set({ isLoading: false, isEditing: null });
    }
  },

  updateProduct: async (id: string, payload?: FormData) => {
    const { fetchProducts, fetchVendorProducts, selectedVendorId } = get();

    if (!payload) {
      set({ error: "No data to update." });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // Use the FormData payload directly
      await productService.updateProduct(id, payload);

      // Re-sync
      if (selectedVendorId) {
        await fetchVendorProducts(selectedVendorId);
      } else {
        await fetchProducts();
      }

      get().clearFormData();
    } catch (err) {
      set({
        error: "Failed to update product. Please check your network and try again.",
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
        imageFiles: [],
        location: "",
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
