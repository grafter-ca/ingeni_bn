import { localApi, fakeApiClient } from "../libs/api";
import type { ApiProduct, ApiCategory, ProductFilters } from "../types/api";

export const productService = {
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
      allProducts.push(
        ...localRes.value.map((p) => ({
          ...p,
          id: `local-${p.id}`,
        }))
      );
    }

    if (fakeRes.status === "fulfilled") {
      allProducts.push(
        ...fakeRes.value.map((p) => ({
          ...p,
          id: `fake-${p.id}`,
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
      return localApi.get<ApiProduct>(`/products/${realId}`);
    }

    if (idStr.startsWith("fake-")) {
      const realId = idStr.replace("fake-", "");
      return fakeApiClient<ApiProduct>(`/products/${realId}`);
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
  createProduct: async (data: Partial<ApiProduct>): Promise<ApiProduct> => {
    return await localApi.post<ApiProduct>(`/products`,{
      methods:"POST",
      body:JSON.stringify(data),
    });
  },

  /**
   * UPDATE PRODUCT (LOCAL ONLY)
   */
  updateProduct: async (
    id: string,
    data: Partial<ApiProduct>
  ): Promise<ApiProduct> => {
    const realId = id.replace("local-", "");

    return await localApi.patch<ApiProduct>(`/products/${realId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE PRODUCT (LOCAL ONLY)
   */
  deleteProduct: async (id: string): Promise<void> => {
    const idStr = String(id);

    // Prevent deleting fake products
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
        res.value.forEach((cat) => {
          const key = cat.name.toLowerCase().trim();

          if (!merged.has(key)) {
            merged.set(key, {
              ...cat,
              id: `${index === 0 ? "local" : "fake"}-${cat.id}`,
            });
          }
        });
      }
    });

    return Array.from(merged.values());
  },
};