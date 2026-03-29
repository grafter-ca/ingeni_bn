import { apiClient } from "./api";
import type { ApiProduct, ApiCategory, ProductFilters } from "../types/api";

// Single Responsibility: only handles product API calls
export const productService = {
  // Fetch all products with optional filters
  getProducts: (filters: ProductFilters = {}): Promise<ApiProduct[]> => {
    const params = new URLSearchParams();
    if (filters.title)      params.append("title",       filters.title);
    if (filters.categoryId) params.append("categoryId",  String(filters.categoryId));
    if (filters.price_min)  params.append("price_min",   String(filters.price_min));
    if (filters.price_max)  params.append("price_max",   String(filters.price_max));
    if (filters.offset)     params.append("offset",      String(filters.offset));
    params.append("limit", String(filters.limit ?? 20));

    const query = params.toString();
    return apiClient<ApiProduct[]>(`/products${query ? `?${query}` : ""}`);
  },

  // Fetch single product
  getProduct: (id: number): Promise<ApiProduct> =>
    apiClient<ApiProduct>(`/products/${id}`),

  // Fetch all categories
  getCategories: (): Promise<ApiCategory[]> =>
    apiClient<ApiCategory[]>("/categories"),

  // Filter by category
  getByCategory: (categoryId: number): Promise<ApiProduct[]> =>
    apiClient<ApiProduct[]>(`/products/?categoryId=${categoryId}`),
};