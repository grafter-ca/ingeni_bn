// src/components/cart/OrderSummary.tsx
import { ArrowRight, Lock, ShieldCheck, RefreshCw, Headset } from "lucide-react";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../../store/cartStore";
import Button from "../../components/ui/Button";

function OrderSummary() {
  const navigate = useNavigate();
  const { items } = useCartStore();

  const handleCheckout = useCallback(() => {
    navigate("/checkout");
  }, [navigate]);

  // Calculations
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * 0.18; // 18% VAT
  
  // Delivery calculation: 15% of subtotal, but with a minimum floor of RF 500 for very small orders
  const calculatedShipping = subtotal * 0.15;
  const shipping = subtotal > 0 ? Math.max(500, calculatedShipping) : 0;
  
  const total = subtotal + tax + shipping;

  const formatCurrency = (val: number) => `RWF ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="lg:col-span-1">
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 p-8 rounded-3xl flex flex-col gap-6 sticky top-24 shadow-sm transition-colors duration-200">
        <h2 className="font-black text-lg uppercase tracking-tight text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/5 pb-4">
          Order Summary
        </h2>

        {/* Line items */}
        <div className="flex flex-col gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (18%)</span>
            <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery (15%)</span>
            <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(shipping)}</span>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between font-black text-xl text-gray-900 dark:text-white border-t border-gray-200 dark:border-white/5 pt-6">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>

        {/* Checkout Button */}
        <Button
          label="Proceed to Checkout"
          icon={ArrowRight}
          iconPosition="right"
          onClick={handleCheckout}
          className="w-full justify-center bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold text-white shadow-lg shadow-blue-600/20"
        />

        {/* Trust & Policy Section */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200 dark:border-white/5">
          <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-bold">
            <Lock size={12} /> Secure
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-bold">
            <ShieldCheck size={12} /> Authentic
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-bold">
            <RefreshCw size={12} /> Returns
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-bold">
            <Headset size={12} /> Support
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSummary;