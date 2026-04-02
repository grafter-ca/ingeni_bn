import { useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ArrowRight } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { useCartActions } from "../../hooks/useCartActions";
import { useCartSummary } from "../../hooks/useCartSummary";
import Button from "../../components/ui/Button";

const Cart = () => {
  const navigate = useNavigate();
  const { items } = useCartStore();
  const { handleRemoveFromCart, handleUpdateQuantity, handleClearCart } = useCartActions();
  const { totalItems } = useCartSummary();

  // useMemo — only recomputes when items change
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );
  const shipping  = subtotal > 50 ? 0 : 9.99;
  const tax       = subtotal * 0.08;
  const total     = subtotal + shipping + tax;

  const handleCheckout = useCallback(() => {
    navigate("/checkout");
  }, [navigate]);

  // ── Empty Cart ──
  if (items.length === 0) return (
    <div className="min-h-screen bg-gray-900 font-poppins flex flex-col items-center justify-center gap-6 px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <ShoppingBag size={64} className="text-gray-700" />
        <h2 className="font-bold text-2xl text-white">Your cart is empty</h2>
        <p className="text-gray-400 text-sm max-w-sm">
          Looks like you haven't added anything yet. Explore our collection and find something you love.
        </p>
        <Button
          label="Explore Products"
          icon={ArrowRight}
          iconPosition="right"
          onClick={() => navigate("/products")}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 font-poppins text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-bold text-3xl tracking-wide">Your Cart</h1>
            <p className="text-gray-400 text-sm mt-1">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={handleClearCart}
            className="text-xs text-gray-500 uppercase tracking-widest hover:text-red-400 transition-colors flex items-center gap-1"
          >
            <Trash2 size={14} /> Clear all
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Cart Items ── */}
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
                      onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.png"; }}
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
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 border border-gray-700 hover:border-white flex items-center justify-center transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 border border-gray-700 hover:border-white flex items-center justify-center transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-semibold text-white">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-gray-500">
                          ${item.price.toFixed(2)} each
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

          {/* ── Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 p-6 flex flex-col gap-4 sticky top-24">
              <h2 className="font-semibold text-lg uppercase tracking-widest border-b border-gray-700 pb-4">
                Order Summary
              </h2>

              {/* Line items */}
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-green-400" : ""}>
                    {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                {shipping > 0 && (
                  <p className="text-xs text-gray-500 bg-gray-700 px-3 py-2">
                    Add ${(50 - subtotal).toFixed(2)} more for free shipping
                  </p>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between font-bold text-lg border-t border-gray-700 pt-4">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              {/* Promo code */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo code"
                  className="flex-1 bg-gray-700 border border-gray-600 text-white text-sm px-3 py-2 focus:outline-none focus:border-gray-400 placeholder:text-gray-500"
                />
                <button className="px-4 py-2 border border-gray-600 text-gray-400 text-sm hover:border-white hover:text-white transition-colors uppercase tracking-widest">
                  Apply
                </button>
              </div>

              {/* Checkout */}
              <Button
                label="Proceed to Checkout"
                icon={ArrowRight}
                iconPosition="right"
                onClick={handleCheckout}
                className="w-full justify-center"
              />

              {/* Trust note */}
              <p className="text-xs text-gray-500 text-center">
                🔒 Secure checkout · Free returns · 24/7 support
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;