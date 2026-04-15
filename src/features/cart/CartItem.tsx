import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCartActions } from "../../hooks/useCartActions";
import { useCartStore } from "../../store/cartStore";

function CartItem() {
  const navigate = useNavigate();
  const { items } = useCartStore();
  const { handleRemoveFromCart, handleUpdateQuantity } = useCartActions();
  return (
    <div className="lg:col-span-2 flex flex-col gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex gap-4 bg-gray-800 p-4 group hover:bg-gray-750 transition-colors"
        >
          {/* Image */}
          <Link to={`/products/${item.id}`} className="shrink-0">
            <div className="w-24 h-24 bg-gray-700 overflow-hidden">
              <img
                src={item.image ?? "/placeholder.png"}
                alt={item.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.png";
                }}
              />
            </div>
          </Link>

          {/* Info */}
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <Link
                to={`/products/${item.id}`}
                className="font-medium text-white hover:text-gray-300 transition-colors line-clamp-2 text-sm"
              >
                {item.name}
              </Link>
              <button
                onClick={() => handleRemoveFromCart(item.id)}
                className="text-gray-600 hover:text-red-400 transition-colors shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex items-center justify-between mt-3">
              {/* Quantity */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleUpdateQuantity(item.id, item.quantity - 1)
                  }
                  className="w-8 h-8 border border-gray-700 hover:border-white flex items-center justify-center transition-colors"
                >
                  <Minus size={12} />
                </button>
                <span className="w-8 text-center text-sm font-medium">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    handleUpdateQuantity(item.id, item.quantity + 1)
                  }
                  className="w-8 h-8 border border-gray-700 hover:border-white flex items-center justify-center transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Price */}
              <div className="text-right">
                <p className="font-semibold text-white">
                  {(Number(item.price) * item.quantity).toFixed(2)}
                </p>
                {item.quantity > 1 && (
                  <p className="text-xs text-gray-500">
                    {Number(item.price).toFixed(2)} each
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Continue Shopping */}
      <button
        onClick={() => navigate("/products")}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mt-2 w-fit"
      >
        <ArrowLeft size={16} /> Continue Shopping
      </button>
    </div>
  );
}

export default CartItem;
