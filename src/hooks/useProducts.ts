import { useEffect, useMemo } from "react";
import { useProductStore } from "../store/productStore";
import { useAuthState } from "../context/AuthContext";

/**
 * @param categoryName - Optional category ID/Name to filter by.
 * @param isVendorOnly - If true, scopes products to the currently logged-in vendor.
 */
export const useProducts = (categoryName?: string, isVendorOnly = false) => {
  const {
    filteredProducts,
    categories,
    isLoading,
    error,
    fetchProducts,
    fetchCategories,
  } = useProductStore();

  const { user } = useAuthState();

  // 1. Fetch Categories once on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 2. Fetch Products based on filters
  useEffect(() => {
    // Resolve category name if an ID was passed
    const resolvedCategory = categoryName 
      ? categories.find(c => c.id === categoryName)?.name || categoryName
      : undefined;

    const params = {
      categoryName: resolvedCategory,
      // If vendor mode is active, pass the logged-in user's ID
      vendorId: isVendorOnly ? user?.id : undefined,
    };

    fetchProducts(params);
  }, [categoryName, isVendorOnly, user?.id, categories, fetchProducts]);

  // 3. Derived State: Memoized grouping for category-based layouts
  const groupedByCategory = useMemo(() => {
    if (!filteredProducts.length) return {};

    return filteredProducts.reduce<Record<string, typeof filteredProducts>>(
      (acc, product) => {
        const cat = product.category?.name || "Uncategorized";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(product);
        return acc;
      },
      {}
    );
  }, [filteredProducts]);

  return { 
    filteredProducts, 
    categories, 
    isLoading, 
    error, 
    groupedByCategory 
  };
};