import { useState } from "react";
import { Heart } from "lucide-react";

interface WishlistButtonProps {
  productId: string;
  initialState?: boolean;
  onToggle?: (isWishlisted: boolean) => void;
  size?: number;
  className?: string;
}

export default function WishlistButton({
  productId,
  initialState = false,
  onToggle,
  size = 18,
  className = "",
}: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(initialState);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isWishlisted;
    setIsWishlisted(nextState);

    // Trigger parent callback or execute backend mutation here
    if (onToggle) {
      onToggle(nextState);
    }

    // Example API hook call:
    // await productService.toggleWishlist(productId, nextState);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`cursor-pointer transition-transform active:scale-90 ${className}`}
      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        size={size}
        className={`transition-colors ${
          isWishlisted
            ? "fill-rose-500 text-rose-500"
            : "text-zinc-400 dark:text-gray-600 hover:text-zinc-900 dark:hover:text-white"
        }`}
      />
    </button>
  );
}