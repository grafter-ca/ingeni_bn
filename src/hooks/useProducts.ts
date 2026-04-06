import { useEffect, useMemo } from "react";
import { useProductStore } from "../store/productStore";

// Single Responsibility: manages product fetching lifecycle
export const useProducts = (categoryName?: string) => {
  const {
    filteredProducts,
    categories,
    isLoading,
    error,
    fetchProducts,
    fetchCategories,
  } = useProductStore();

  // useEffect — fetch on mount or category change
  useEffect(() => {
    fetchProducts(categoryName ? { categoryName: categories.find(c => c.id === categoryName)?.name } : {categoryName: undefined});
  }, [categoryName, fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // useMemo — only recomputes when filteredProducts changes
  const groupedByCategory = useMemo(() => {
    return filteredProducts.reduce<Record<string, typeof filteredProducts>>(
      (acc, product) => {
        const cat = product.category.name;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(product);
        return acc;
      },
      {}
    );
  }, [filteredProducts]);

  return { filteredProducts, categories, isLoading, error, groupedByCategory };
};