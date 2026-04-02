import { create } from "zustand";
import { productService } from "../services/productService";
import type { ProductState, ProductFilters } from "../types/api";

export const useProductStore = create<ProductState>()((set, get) => ({
  products: [],
  filteredProducts: [],
  categories: [],
  currentProduct: null,
  selectedCategory: null,
  searchQuery: "",
  isLoading: false,
  isFetchingMore: false, // Added missing state
  error: null,

  // 1. Initial Load (Aggregated)
  fetchProducts: async (filters: ProductFilters = {}) => {
    set({ isLoading: true, error: null });
    try {
      // Ensure we explicitly ask for more than 8
      const limit = filters.limit || 40; 
      const data = await productService.getProducts({ ...filters, limit });
      
      set({ 
        products: data, 
        filteredProducts: data, 
        isLoading: false 
      });
    } catch (err) {
      set({ error: "Failed to sync inventory", isLoading: false });
    }
  },

  // 2. Load More (Crucial for fixing the "Only 8" issue)
  fetchMoreProducts: async () => {
    const { products, selectedCategory, isFetchingMore } = get();
    if (isFetchingMore) return;

    set({ isFetchingMore: true });
    try {
      const moreData = await productService.getProducts({
        offset: products.length,
        categoryName: selectedCategory || undefined,
        limit: 20
      });

      const updatedProducts = [...products, ...moreData];
      set({
        products: updatedProducts,
        filteredProducts: updatedProducts,
        isFetchingMore: false
      });
    } catch (err) {
      set({ isFetchingMore: false });
    }
  },

  // 3. Single Product Fetch
  fetchProductById: async (id: number | string) => {
    set({ isLoading: true, currentProduct: null });
    try {
      const product = await productService.getProduct(id);
      set({ currentProduct: product, isLoading: false });
    } catch (err) {
      set({ error: "Product not found", isLoading: false });
    }
  },

  // 4. Category Sync
  fetchCategories: async () => {
    try {
      const categories = await productService.getCategories();
      set({ categories });
    } catch (err) {
      console.error("Category Sync Error", err);
    }
  },

  // 5. Lookups
  getCategoryById: (id) => {
    return get().categories.find((cat) => String(cat.id) === String(id));
  },

  getLocalProductById: (id) => {
    return get().products.find((p) => String(p.id) === String(id));
  },

  // 6. Search & Filters
  setSearchQuery: (query: string) => {
    const { products, selectedCategory } = get();
    const lowerQuery = query.toLowerCase();
    
    let filtered = products.filter((p) =>
      p.title.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
    );

    if (selectedCategory) {
      filtered = filtered.filter((p) => String(p.category.id) === String(selectedCategory));
    }

    set({ searchQuery: query, filteredProducts: filtered });
  },

setCategory: async (categoryName: string | null, shouldFetch = false) => {
  set({ selectedCategory: categoryName });
  
  if (shouldFetch && categoryName !== null) {
    // Fetch fresh data using the string name
    await get().fetchProducts({ title: categoryName }); 
    // Note: If your backend supports a specific 'category' query, use that instead of 'title'
  } else {
    const { products, searchQuery } = get();
    
    // Local Filter by Name (Case-insensitive)
    let filtered = categoryName 
      ? products.filter((p) => 
          p.category.name.toLowerCase() === categoryName.toLowerCase()
        ) 
      : products;

    if (searchQuery) {
      filtered = filtered.filter((p) => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    set({ filteredProducts: filtered });
  }
},

  clearFilters: () => {
    const { products } = get();
    set({ searchQuery: "", selectedCategory: null, filteredProducts: products });
  },
}));