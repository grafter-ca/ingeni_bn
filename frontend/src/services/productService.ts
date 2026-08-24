import { localApi, fakeApiClient } from "../libs/api";
import type { ApiProduct, ApiCategory, ProductFilters } from "../types/api";
import type { ReviewItem } from "../types"; // Adjust path to your ReviewItem type if needed

// Helper to handle responses that might be direct arrays or wrapped objects
const extractArray = <T>(response: any): T[] => {
  const data = response?.data ?? response;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const productService = {
  /**
   * EXPOSE BASE CLIENT FOR STORE ACTIONS
   */
  getClient: () => localApi,

  /**
   * AGGREGATED FETCH (Local + Fake API)
   */
  getProducts: async (filters: ProductFilters = {}): Promise<ApiProduct[]> => {
    const params = new URLSearchParams();

    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;

    if (filters.title) params.append("title", filters.title);
    if (filters.categoryName) params.append("categoryName", filters.categoryName);
    if (filters.price_min) params.append("price_min", String(filters.price_min));
    if (filters.price_max) params.append("price_max", String(filters.price_max));

    params.append("limit", String(limit));
    params.append("offset", String(offset));

    const query = `?${params.toString()}`;

    const [localRes, fakeRes] = await Promise.allSettled([
      localApi.get<ApiProduct[]>(`/products${query}`),
      fakeApiClient<ApiProduct[]>(`/products${query}`),
    ]);

    const allProducts: ApiProduct[] = [];

    if (localRes.status === "fulfilled") {
      const items = extractArray<ApiProduct>(localRes.value);
      allProducts.push(
        ...items.map((p) => ({
          ...p,
          id: String(p.id).startsWith("local-") ? String(p.id) : `local-${p.id}`,
        }))
      );
    }

    if (fakeRes.status === "fulfilled") {
      const items = extractArray<ApiProduct>(fakeRes.value);
      allProducts.push(
        ...items.map((p) => ({
          ...p,
          id: String(p.id).startsWith("fake-") ? String(p.id) : `fake-${p.id}`,
        }))
      );
    }

    return allProducts;
  },

  /**
   * AGGREGATED FETCH PRODUCT FOR PUBLIC (products/public)
   */
  getProductsPublic: async (filters: ProductFilters = {}): Promise<ApiProduct[]> => {
    const params = new URLSearchParams();

    if (filters.title) params.append("title", filters.title);
    if (filters.categoryName) params.append("categoryName", filters.categoryName);
    if (filters.price_min) params.append("price_min", String(filters.price_min));
    if (filters.price_max) params.append("price_max", String(filters.price_max));
    params.append("limit", String(filters.limit ?? 20));
    params.append("offset", String(filters.offset ?? 0));

    const query = `?${params.toString()}`;

    const [localRes, fakeRes] = await Promise.allSettled([
      localApi.get<ApiProduct[]>(`/products/public${query}`),
      fakeApiClient<ApiProduct[]>(`/products${query}`),
    ]);

    const allProducts: ApiProduct[] = [];

    if (localRes.status === "fulfilled") {
      const items = extractArray<ApiProduct>(localRes.value);
      allProducts.push(
        ...items.map((p) => ({
          ...p,
          id: String(p.id).startsWith("local-") ? String(p.id) : `local-${p.id}`,
        }))
      );
    }

    if (fakeRes.status === "fulfilled") {
      const items = extractArray<ApiProduct>(fakeRes.value);
      allProducts.push(
        ...items.map((p) => ({
          ...p,
          id: String(p.id).startsWith("fake-") ? String(p.id) : `fake-${p.id}`,
        }))
      );
    }

    return allProducts;
  },

  /**
   * GET SINGLE PRODUCT
   */
  getProduct: async (id: string | number): Promise<ApiProduct> => {
    const idStr = String(id);

    if (idStr.startsWith("local-")) {
      const realId = idStr.replace("local-", "");
      return await localApi.get<ApiProduct>(`/products/${realId}`);
    }

    if (idStr.startsWith("fake-")) {
      const realId = idStr.replace("fake-", "");
      return await fakeApiClient<ApiProduct>(`/products/${realId}`);
    }

    try {
      return await localApi.get<ApiProduct>(`/products/${id}`);
    } catch {
      return await fakeApiClient<ApiProduct>(`/products/${id}`);
    }
  },

  /**
   * CREATE PRODUCT (LOCAL ONLY)
   */
  createProduct: async (data: FormData): Promise<ApiProduct> => {
    return await localApi.post<ApiProduct>(`/products`, data);
  },

  /**
   * UPDATE PRODUCT (LOCAL ONLY)
   */
  updateProduct: async (
    id: string,
    data: FormData
  ): Promise<ApiProduct> => {
    const realId = id.replace("local-", "");
    return await localApi.patch<ApiProduct>(`/products/${realId}`, data);
  },

  /**
   * DELETE PRODUCT (LOCAL ONLY)
   */
  deleteProduct: async (id: string): Promise<void> => {
    const idStr = String(id);

    if (idStr.startsWith("fake-")) {
      throw new Error("Cannot delete external (fake) product");
    }

    const realId = idStr.replace("local-", "");
    await localApi.delete(`/products/${realId}`);
  },

  /**
   * CATEGORY AGGREGATION
   */
  getCategories: async (): Promise<ApiCategory[]> => {
    const [localCats, fakeCats] = await Promise.allSettled([
      localApi.get<ApiCategory[]>("/categories"),
      fakeApiClient<ApiCategory[]>("/categories"),
    ]);

    const merged = new Map<string, ApiCategory>();

    [localCats, fakeCats].forEach((res, index) => {
      if (res.status === "fulfilled") {
        const items = extractArray<ApiCategory>(res.value);
        items.forEach((cat) => {
          if (!cat?.name) return;
          const key = cat.name.toLowerCase().trim();

          if (!merged.has(key)) {
            const prefix = index === 0 ? "local" : "fake";
            const cleanId = String(cat.id).replace(/^(local-|fake-)/, '');
            merged.set(key, {
              ...cat,
              id: `${prefix}-${cleanId}`,
            });
          }
        });
      }
    });

    return Array.from(merged.values());
  },

  /**
   * GET PRODUCT REVIEWS
   */
  getProductReviews: async (id: string | number): Promise<ReviewItem[]> => {
    const realId = String(id).replace(/^(local-|fake-)/, "");
    const res: any = await localApi.get(`/products/${realId}/reviews`);
    return Array.isArray(res) ? res : res?.data || [];
  },

  /**
   * ADD PRODUCT REVIEW
   */
  addProductReview: async (
    id: string | number,
    reviewData: Omit<ReviewItem, "id" | "date">
  ): Promise<ReviewItem> => {
    const realId = String(id).replace(/^(local-|fake-)/, "");
    const res: any = await localApi.post(`/products/${realId}/reviews`, reviewData);
    return res?.data || res;
  },
};