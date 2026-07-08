import { ArrowLeft, Minus, Plus, Trash2, Store } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCartActions } from "../../hooks/useCartActions";
import { useCartStore } from "../../store/cartStore";

function CartItem() {
  const navigate = useNavigate();
  const { items } = useCartStore();
  const { handleRemoveFromCart, handleUpdateQuantity } = useCartActions();

  if (items.length === 0) return null;

  return (
    <div className="lg:col-span-2 flex flex-col gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex gap-4 bg-[#0a0a0a] border border-white/5 p-4 rounded-2xl group transition-colors"
        >
          {/* Image */}
          <Link to={`/products/${item.id}`} className="shrink-0">
            <div className="w-24 h-24 bg-gray-900 rounded-xl overflow-hidden border border-white/10">
              <img
                src={item.image ?? "/placeholder.png"}
                alt={item.name || "Product"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.png";
                }}
              />
            </div>
          </Link>

          {/* Info */}
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col">
                <Link
                  to={`/products/${item.id}`}
                  className="font-bold text-white hover:text-blue-400 transition-colors line-clamp-1 text-sm"
                >
                  {item.name}
                </Link>
                
                {/* PRODUCTION SAFE: Optional chaining for vendorId */}
                <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1 uppercase tracking-wider">
                  <Store size={10} />
                  <span>
                    Vendor: {item.vendorId ? `${item.vendorId.slice(0, 8)}...` : "Unknown"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleRemoveFromCart(item.id)}
                className="text-gray-600 hover:text-red-500 transition-colors p-2"
                aria-label="Remove item"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex items-center justify-between mt-3">
              {/* Quantity Controls */}
              <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-1">
                <button
                  onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors"
                  disabled={item.quantity <= 1}
                >
                  <Minus size={12} />
                </button>
                <span className="w-8 text-center text-xs font-bold">
                  {item.quantity}
                </span>
                <button
                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Price Display */}
              <div className="text-right">
                <p className="font-black text-white text-sm">
                  RF {(Number(item.price || 0) * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={() => navigate("/products")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mt-4 w-fit"
      >
        <ArrowLeft size={16} /> Continue Shopping
      </button>
    </div>
  );
}

export default CartItem;