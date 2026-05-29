import { useCallback } from "react";
import { useCartStore } from "../store/cartStore";

type AddToCartInput = {
  id: string;
  name: string;
  price: number;
  image: string;
  productId: string;
  vendorId: string;
};

export const useCartActions = () => {
  const { addToCart, removeFromCart, updateQuantity, clearCart } = useCartStore();

  const handleAddToCart = useCallback(
    (item: AddToCartInput) => {
      // Add a safety check before calling the store
      if (!item.productId || !item.vendorId) {
        console.error("Critical error: Attempted to add product to cart without productId or vendorId", item);
        return;
      }

      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        productId: item.productId,
        vendorId: item.vendorId,
      });
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
      // The store handles <= 0 by removing the item, 
      // so we allow the action to proceed to the store
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