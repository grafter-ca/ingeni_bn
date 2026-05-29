import { useMemo } from "react";
import { useCartStore } from "../store/cartStore";

// Single Responsibility: only computes cart summary
export const useCartSummary = () => {
  const items = useCartStore((state) => state.items);

  // useMemo — recomputes only when items change
  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const formattedTotal = useMemo(
    () => `$${totalPrice.toFixed(2)}`,
    [totalPrice]
  );

  return { totalItems, totalPrice, formattedTotal, items };
};