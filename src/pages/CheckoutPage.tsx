import { useOrderStore } from '../store/useOrderStore';
import CheckoutForm from '../components/forms/ChechoutForm'; // Fixed typo from your screenshot
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
  const { cart, getTotal } = useOrderStore();
  const navigate = useNavigate();

  // Redirect if cart is empty
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-white">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Link to="/" className="text-blue-500 hover:underline">Go back to shopping</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-all">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Side: The Form */}
          <div className="lg:col-span-7">
            <div className="mb-8 flex items-center gap-2 text-green-500 bg-green-500/10 w-fit px-4 py-2 rounded-full text-sm font-medium">
              <ShieldCheck size={18} />
              Secure Encrypted Checkout
            </div>
            <CheckoutForm />
          </div>

          {/* Right Side: Order Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 p-8 bg-[#0a0a0a] border border-white/5 rounded-3xl">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4 max-h-75 overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-16 h-16 object-cover rounded-xl border border-white/10"
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium line-clamp-1">{item.title}</h3>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-sm">
                      ${(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 space-y-3 text-sm text-gray-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white">${getTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (18%)</span>
                  <span className="text-white">${(getTotal() * 0.18).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping (Flat Rate)</span>
                  <span className="text-white">$2,000</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-white pt-3 border-t border-white/5">
                  <span>Total</span>
                  <span>${(getTotal() * 1.18 + 2000).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;