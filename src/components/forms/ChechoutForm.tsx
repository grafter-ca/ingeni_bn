import { useState } from 'react';
import { useOrderStore } from '../../store/useOrderStore';
import { OrderClient } from '../../services/order.service'; // Updated to the correct client name
import { useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, Loader2 } from 'lucide-react';

const CheckoutForm = () => {
  const navigate = useNavigate();
  const { cart, getTotal, clearCart } = useOrderStore(); // Destructure clearCart
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const address = formData.get('address') as string;
    const phone = formData.get('phone') as string;

    try {
      // 1. Map CartItem[] to the format the Backend expects
      const formattedItems = cart.map((item: any) => ({
        productId: item.id, 
        quantity: item.quantity,
      }));

      // 2. Call the client with the correctly shaped data
      const newOrder = await OrderClient.create({
        items: formattedItems,
        shippingAddress: address,
        phoneNumber: phone,
        paymentMethod: 'MOBILE_MONEY', // Explicitly matching your enum
      });

      // 3. Success!
      clearCart(); // Wipe the store
      navigate(`/order-success/${newOrder.orderNumber}`);
      
    } catch (err: any) {
      console.error("Checkout failed:", err.message);
      setError(err.message || "Something went wrong during checkout.");
    } finally {
      setLoading(false);
    }
  };

  const total = getTotal();
  const tax = total * 0.18;
  const shipping = 2000;
  const grandTotal = total + tax + shipping;

  return (
    <form onSubmit={onSubmit} className="p-8 bg-[#0a0a0a] border border-white/5 rounded-3xl space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Delivery & Payment</h2>
        <div className="flex gap-2">
          <Smartphone className="text-green-500" size={20} />
          <span className="text-xs text-gray-500 self-center">Momo Supported</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 ml-1 mb-1 block uppercase tracking-wider">Shipping Address</label>
          <input 
            name="address" 
            placeholder="e.g. KN 20 Ave, Kigali, Rwanda" 
            required
            disabled={loading}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all disabled:opacity-50"
          />
        </div>
        
        <div>
          <label className="text-xs text-gray-500 ml-1 mb-1 block uppercase tracking-wider">Momo Phone Number</label>
          <input 
            name="phone" 
            type="tel"
            placeholder="078 / 079 / 072 / 073" 
            required
            disabled={loading}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all disabled:opacity-50"
          />
        </div>
      </div>

      <div className="pt-6 border-t border-white/5 space-y-3">
        <div className="flex justify-between text-sm text-gray-400">
          <span>Items Subtotal</span>
          <span>${total.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-400">
          <span>VAT (18%)</span>
          <span>${tax.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-400">
          <span>Shipping</span>
          <span>$2,000</span>
        </div>
        <div className="flex justify-between text-white font-bold text-xl pt-2">
          <span>Total</span>
          <span className="text-blue-500">${grandTotal.toLocaleString()}</span>
        </div>
      </div>

      <button 
        type="submit"
        disabled={loading || cart.length === 0}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Processing...
          </>
        ) : (
          <>
            Confirm & Pay via Momo
            <CreditCard className="group-hover:translate-x-1 transition-transform" size={20} />
          </>
        )}
      </button>
      
      <p className="text-[10px] text-center text-gray-600 uppercase tracking-widest">
        By clicking pay, you agree to the Workforce Aggregator terms of service.
      </p>
    </form>
  );
};

export default CheckoutForm;