import { create } from "zustand";
import type { ApiProduct, ApiCategory, ProductFilters } from "../types/api";
import { productService } from "../services/productService";

type ProductState = {
  products: ApiProduct[];
  filteredProducts: ApiProduct[];
  categories: ApiCategory[];
  selectedCategory: number | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  fetchCategories: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setCategory: (categoryId: number | null) => void;
  clearFilters: () => void;
};

export const useProductStore = create<ProductState>()((set, get) => ({
  products: [],
  filteredProducts: [],
  categories: [],
  selectedCategory: null,
  searchQuery: "",
  isLoading: false,
  error: null,

  fetchProducts: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const products = await productService.getProducts(filters);
      set({ products, filteredProducts: products, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch products",
        isLoading: false,
      });
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await productService.getCategories();
      set({ categories });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch categories",
      });
    }
  },

  setSearchQuery: (query: string) => {
    const { products } = get();
    const filtered = products.filter((p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
    );
    set({ searchQuery: query, filteredProducts: filtered });
  },

  setCategory: (categoryId: number | null) => {
    const { products } = get();
    const filtered = categoryId
      ? products.filter((p) => p.category.id === categoryId)
      : products;
    set({ selectedCategory: categoryId, filteredProducts: filtered });
  },

  clearFilters: () => {
    const { products } = get();
    set({ searchQuery: "", selectedCategory: null, filteredProducts: products });
  },
}));