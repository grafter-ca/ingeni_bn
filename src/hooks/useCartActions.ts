import { useCallback } from "react";
import { useCartStore } from "../store/cartStore";
import type { CartItem } from "../types";

// Single Responsibility: encapsulates cart interaction logic
export const useCartActions = () => {
  const { addToCart, removeFromCart, updateQuantity, clearCart } = useCartStore();

  const handleAddToCart = useCallback(
    (item: Omit<CartItem, "quantity">) => {
      addToCart(item);
    },
    [addToCart]
  );

  const handleRemoveFromCart = useCallback(
    (id: string) => {
      removeFromCart(id);
    },
    [removeFromCart]
  );

  const handleUpdateQuantity = useCallback(
    (id: string, quantity: number) => {
      updateQuantity(id, quantity);
    },
    [updateQuantity]
  );

  const handleClearCart = useCallback(() => {
    clearCart();
  }, [clearCart]);

  return {
    handleAddToCart,
    handleRemoveFromCart,
    handleUpdateQuantity,
    handleClearCart,
  };
};