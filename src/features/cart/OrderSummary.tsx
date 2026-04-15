import { ArrowRight } from "lucide-react"
import Button from "../../components/ui/Button"
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../../store/cartStore";
import { useCartSummary } from "../../hooks/useCartSummary";

function OrderSummary() {
 const navigate = useNavigate();
 const {items} = useCartStore();
 const {totalItems} = useCartSummary();
 const handleCheckout = useCallback(() => {
    navigate("/checkout");
  }, [navigate]);

   const subtotal = useMemo(
      () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      [items]
    );
    const shipping  = subtotal > 50 ? 0 : 9.99;
    const tax       = subtotal * 0.08;
    const total     = subtotal + shipping + tax;
  return (
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
  )
}

export default OrderSummary