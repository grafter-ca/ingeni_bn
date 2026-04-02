import { localApiClient, fakeApiClient } from "../libs/api";
import type { ApiProduct, ApiCategory, ProductFilters } from "../types/api";

export const productService = {
  /**
   * AGGREGATOR: Fetches from Local NestJS and Fake API in parallel.
   * Features: Unique ID tagging, explicit limit/offset handling.
   */
  getProducts: async (filters: ProductFilters = {}): Promise<ApiProduct[]> => {
    const params = new URLSearchParams();

    // Workforce Sync: Ensure we always have a limit to avoid the "8-product" default
    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;

    if (filters.title) params.append("title", filters.title);
    if (filters.categoryName)
      params.append("categoryName", filters.categoryName);
    if (filters.price_min)
      params.append("price_min", String(filters.price_min));
    if (filters.price_max)
      params.append("price_max", String(filters.price_max));
    params.append("limit", String(limit));
    params.append("offset", String(offset));

    const query = `?${params.toString()}`;

    // Parallel Request Execution
    const [localRes, fakeRes] = await Promise.allSettled([
      localApiClient<ApiProduct[]>(`/products${query}`),
      fakeApiClient<ApiProduct[]>(`/products${query}`),
    ]);

    const allProducts: ApiProduct[] = [];

    if (localRes.status === "fulfilled") {
      const taggedLocal = localRes.value.map(
        (p): ApiProduct => ({
          ...p,
          id: `local-${p.id}`, // Now valid because ApiProduct.id is string | number
          origin: "local",
        }),
      );
      allProducts.push(...taggedLocal);
    }

    if (fakeRes.status === "fulfilled") {
      const taggedFake = fakeRes.value.map(
        (p): ApiProduct => ({
          ...p,
          id: `fake-${p.id}`,
          origin: "fake",
        }),
      );
      allProducts.push(...taggedFake);
    }

    console.log(
      `[Aggregator] Total: ${allProducts.length} (Local: ${localRes.status === "fulfilled" ? localRes.value.length : 0}, Public: ${fakeRes.status === "fulfilled" ? fakeRes.value.length : 0})`,
    );

    return allProducts;
  },

  /**
   * STRATEGY: Resolves a single product.
   * It checks the ID prefix to know which API to hit.
   */
  getProduct: async (id: number | string): Promise<ApiProduct> => {
    const idStr = String(id);

    // If we have a tagged ID, we know exactly where to go
    if (idStr.startsWith("local-")) {
      const realId = idStr.replace("local-", "");
      return await localApiClient<ApiProduct>(`/products/${realId}`);
    }

    if (idStr.startsWith("fake-")) {
      const realId = idStr.replace("fake-", "");
      return await fakeApiClient<ApiProduct>(`/products/${realId}`);
    }

    // Fallback: Try Local first, then Fake if no prefix found
    try {
      return await localApiClient<ApiProduct>(`/products/${id}`);
    } catch {
      return await fakeApiClient<ApiProduct>(`/products/${id}`);
    }
  },

  /**
   * CATEGORY AGGREGATOR: Merges categories and deduplicates by Name.
   */
  getCategories: async (): Promise<ApiCategory[]> => {
    const [localCats, fakeCats] = await Promise.allSettled([
      localApiClient<ApiCategory[]>("/categories"),
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
              id:
                String(cat.id).startsWith("local") ||
                String(cat.id).startsWith("fake")
                  ? cat.id
                  : `${index === 0 ? "local" : "fake"}-${cat.id}`,
            } as ApiCategory);
          }
        });
      }
    });

    return Array.from(merged.values());
  },
};
