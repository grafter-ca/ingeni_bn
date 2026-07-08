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
  const tax = subtotal * 0.18; // Updated to 18% VAT
  const shipping = 500; // Flat fee for Kigali
  const total = subtotal + tax + shipping;

  const formatCurrency = (val: number) => `RF ${val.toLocaleString()}`;

  return (
    <div className="lg:col-span-1">
      <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl flex flex-col gap-6 sticky top-24">
        <h2 className="font-black text-lg uppercase tracking-tight text-white border-b border-white/5 pb-4">
          Order Summary
        </h2>

        {/* Line items */}
        <div className="flex flex-col gap-4 text-sm text-gray-400">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-white font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (18%)</span>
            <span className="text-white font-medium">{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span className="text-white font-medium">{formatCurrency(shipping)}</span>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between font-black text-xl text-white border-t border-white/5 pt-6">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>

        {/* Checkout Button */}
        <Button
          label="Proceed to Checkout"
          icon={ArrowRight}
          iconPosition="right"
          onClick={handleCheckout}
          className="w-full justify-center bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold"
        />

        {/* Trust & Policy Section */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
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