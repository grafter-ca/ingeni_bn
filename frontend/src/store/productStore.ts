import { create } from "zustand";
import { productService } from "../services/productService";
import type { ApiCategory, ApiProduct, ProductFormData } from "../types/api";

export interface ApiVendor {
  id: string;
  name: string;
  email?: string;
}

export interface ApiReview {
  id: string;
  rating: number;
  comment: string;
  authorName?: string;
  createdAt?: string;
  userId?: string;
}

interface ProductState {
  // Data
  products: ApiProduct[];
  filteredProducts: ApiProduct[];
  categories: ApiCategory[];
  vendors: ApiVendor[];
  currentProductReviews: ApiReview[];
  wishlistStatusMap: Record<string, boolean>; // productId -> boolean

  // UI/Context State
  isLoading: boolean;
  isFetchingMore: boolean;
  error: string | null;
  offset: number;
  limit: number;
  hasMore: boolean;
  selectedVendorId: string | null;
  searchQuery: string;
  selectedCategory: string | null;
  isEditing: ApiProduct | null;
  _sanitizeImages: (images: any[] | undefined) => string[];

  // Forms
  formData: ProductFormData;

  // Actions
  fetchProducts: (params?: any) => Promise<void>;
  fetchPublicProducts: (params?: any) => Promise<void>;
  fetchMoreProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchVendors: () => Promise<void>;
  fetchVendorProducts: (vendorId?: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setCategory: (categoryNameOrId: string | null) => void;
  setSelectedVendorId: (vendorId: string | null) => void;
  applyFilters: () => void;
  updateFormData: (data: Partial<ProductState["formData"]>) => void;
  setEditingProduct: (product: ApiProduct | null) => void;
  addProduct: (vendorId?: string, payload?: FormData) => Promise<void>;
  updateProduct: (id: string, payload?: FormData) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  clearFormData: () => void;
  clearFilters: () => void;
  getVendorId: () => string | null;

  // Review & Wishlist Actions
  fetchReviews: (productId: string) => Promise<void>;
  addReview: (productId: string, dto: { rating: number; comment: string; authorName?: string }) => Promise<void>;
  checkWishlist: (productId: string) => Promise<boolean>;
  toggleWishlist: (productId: string) => Promise<boolean>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  filteredProducts: [],
  offset: 0,
  limit: 20,
  hasMore: true,
  categories: [],
  vendors: [],
  currentProductReviews: [],
  wishlistStatusMap: {},
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
      const productList = Array.isArray(data) ? data : (data as any)?.products || [];

      const sanitizedData = productList.map((p: any) => ({
        ...p,
        images: get()._sanitizeImages(p.images),
      }));

      set({ products: sanitizedData, isLoading: false });
      get().applyFilters();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch inventory";
      set({ error: message, isLoading: false, filteredProducts: [] });
      console.error("[ProductStore]: Fetch Error", err);
    }
  },

  fetchPublicProducts: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { selectedVendorId } = get();
      const combinedParams = selectedVendorId ? { ...params, vendorId: selectedVendorId } : params;

      const data = await productService.getProductsPublic(combinedParams);
      const productList = Array.isArray(data) ? data : (data as any)?.products || [];

      const sanitizedData = productList.map((p: any) => ({
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
      set({ error: message, isLoading: false, filteredProducts: [] });
      console.error("[ProductStore]: Public Fetch Error", err);
    }
  },

  fetchVendorProducts: async (_vendorId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await productService.getProducts();
      const productList = Array.isArray(data) ? data : (data as any)?.products || [];
      
      const sanitizedData = productList.map((p: any) => ({
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
      set({ error: "Failed to fetch vendor products", isLoading: false, filteredProducts: [] });
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
      const productList = Array.isArray(newData) ? newData : (newData as any)?.products || [];

      const sanitizedData = productList.map((p: any) => ({
        ...p,
        images: get()._sanitizeImages(p.images),
      }));

      set((state) => ({
        products: [...state.products, ...sanitizedData],
        offset: nextOffset,
        hasMore: productList.length === limit,
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
      const catList = Array.isArray(data) ? data : (data as any)?.categories || [];
      set({ categories: catList });
    } catch (err) {
      console.error("Category fetch error:", err);
    }
  },

  fetchVendors: async () => {
    try {
      if (typeof (productService as any).getVendors === "function") {
        const data = await (productService as any).getVendors();
        set({ vendors: Array.isArray(data) ? data : [] });
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
    if (vendorId) {
      get().fetchVendorProducts(vendorId);
    } else {
      get().fetchProducts();
    }
  },

  applyFilters: () => {
    const { products, searchQuery, selectedCategory, selectedVendorId } = get();

    const categories = get().categories;
    const matchedCategory = categories.find(
      (c) => String(c.id) === String(selectedCategory) || c.name === selectedCategory
    );
    const targetCatId = matchedCategory ? String(matchedCategory.id) : null;
    const targetCatName = matchedCategory ? matchedCategory.name.toLowerCase() : String(selectedCategory || "").toLowerCase();

    const filtered = products.filter((p: any) => {
      const pVendorId = p.vendorId || p.vendor?.id || p.vendor?.userId || "";
      const matchesVendor = !selectedVendorId || !pVendorId || String(pVendorId) === String(selectedVendorId);

      let matchesCategory = true;
      if (selectedCategory) {
        const pCatId = p.categoryId || p.category?.id;
        const pCatName = p.categoryName || p.category?.name || "";

        const matchById = targetCatId && pCatId ? String(pCatId) === targetCatId : false;
        const matchByName = targetCatName ? String(pCatName).toLowerCase() === targetCatName : false;
        const matchDirect = String(pCatId) === String(selectedCategory);

        matchesCategory = Boolean(matchById || matchByName || matchDirect);
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q));

      return matchesVendor && matchesCategory && matchesSearch;
    });

    set({ filteredProducts: filtered.length > 0 ? filtered : products });
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

  addProduct: async (_vendorId?: string, payload?: FormData) => {
    const { fetchProducts, fetchVendorProducts, selectedVendorId } = get();

    if (!payload) {
      set({ error: "No data to save." });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      await productService.createProduct(payload);

      if (selectedVendorId) {
        await fetchVendorProducts(selectedVendorId);
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
      await productService.updateProduct(id, payload);

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
      set((state) => ({
        products: state.products.filter((p) => String(p.id) !== String(id)),
        filteredProducts: state.filteredProducts.filter((p) => String(p.id) !== String(id)),
      }));
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

 // --- REVIEWS & WISHLIST STORE METHODS ---

  fetchReviews: async (productId: string) => {
    try {
      const res: any = await productService.getClient()?.get(`/products/${productId}/reviews`);
      const data = res?.data || res || [];
      set({ currentProductReviews: Array.isArray(data) ? data : [] });
    } catch (err) {
      console.error("Failed to fetch product reviews", err);
      set({ currentProductReviews: [] });
    }
  },

  addReview: async (productId: string, dto) => {
    try {
      const res: any = await productService.getClient()?.post(`/products/${productId}/reviews`, dto);
      const newReview = res?.data || res;
      if (newReview) {
        set((state) => ({
          currentProductReviews: [newReview, ...state.currentProductReviews],
        }));
      }
    } catch (err) {
      console.error("Failed to submit review", err);
      throw err;
    }
  },

  checkWishlist: async (productId: string): Promise<boolean> => {
    try {
      const cleanId = String(productId).replace(/^(local-|fake-)/, '');
      const res: any = await productService.getClient()?.get(`/products/${cleanId}/wishlist/status`);
      const isWishlisted = Boolean(res?.isWishlisted ?? res?.data?.isWishlisted ?? res?.data ?? res);
      set((state) => ({
        wishlistStatusMap: { ...state.wishlistStatusMap, [productId]: isWishlisted },
      }));
      return isWishlisted;
    } catch (err) {
      // Fallback for guests: check local storage
      try {
        const localWishlist = JSON.parse(localStorage.getItem("guest_wishlist") || "[]");
        const isWishlisted = localWishlist.includes(productId);
        set((state) => ({
          wishlistStatusMap: { ...state.wishlistStatusMap, [productId]: isWishlisted },
        }));
        return isWishlisted;
      } catch {
        return false;
      }
    }
  },

  toggleWishlist: async (productId: string): Promise<boolean> => {
    try {
      const cleanId = String(productId).replace(/^(local-|fake-)/, '');
      const res: any = await productService.getClient()?.post(`/products/${cleanId}/wishlist/toggle`);
      const newStatus = Boolean(res?.data?.status ?? res?.status ?? res?.data?.isWishlisted);
      set((state) => ({
        wishlistStatusMap: { ...state.wishlistStatusMap, [productId]: newStatus },
      }));
      return newStatus;
    } catch (err: any) {
      // If unauthorized, gracefully handle wishlist locally for anonymous users!
      if (err?.response?.status === 401 || err?.message?.includes("Unauthorized")) {
        const currentStatus = get().wishlistStatusMap[productId] || false;
        const newStatus = !currentStatus;
        
        try {
          const localWishlist: string[] = JSON.parse(localStorage.getItem("guest_wishlist") || "[]");
          let updatedList = [...localWishlist];
          if (newStatus) {
            if (!updatedList.includes(productId)) updatedList.push(productId);
          } else {
            updatedList = updatedList.filter(id => id !== productId);
          }
          localStorage.setItem("guest_wishlist", JSON.stringify(updatedList));
        } catch (storageErr) {
          console.error("Local storage error", storageErr);
        }

        set((state) => ({
          wishlistStatusMap: { ...state.wishlistStatusMap, [productId]: newStatus },
        }));
        return newStatus;
      }

      console.error("Failed to toggle wishlist", err);
      throw err;
    }
  },
}));