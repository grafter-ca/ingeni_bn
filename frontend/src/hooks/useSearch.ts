import { useState, useCallback, useEffect } from "react";
import { useProductStore } from "../store/productStore";

// Single Responsibility: manages global search state and debounce
export const useSearch = () => {
  const { searchQuery, setSearchQuery, clearFilters } = useProductStore();
  const [inputValue, setInputValue] = useState(searchQuery);

  // useEffect — debounce search by 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(inputValue);
    }, 400);
    return () => clearTimeout(timer);
  }, [inputValue, setSearchQuery]);

  const handleSearch = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const handleClear = useCallback(() => {
    setInputValue("");
    clearFilters();
  }, [clearFilters]);

  return { inputValue, handleSearch, handleClear, searchQuery };
};