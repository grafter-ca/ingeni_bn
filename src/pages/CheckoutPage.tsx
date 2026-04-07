import { useCartStore } from "../store/cartStore";
import { useOrderStore } from "../store/useOrderStore";
import CheckoutForm from "../components/forms/ChechoutForm";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const CheckoutPage = () => {
  const { items, clearCart } = useCartStore();

  const total = useCartStore((s) => s.getTotalPrice());
  const totalItems = useCartStore((s) => s.getTotalItems());

  const { createOrder, loading, error } = useOrderStore();

  const navigate = useNavigate();

  // 🚫 Redirect if empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-white">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Link to="/products" className="text-blue-500 hover:underline">
          Go back to shopping
        </Link>
      </div>
    );
  }

  const tax = total * 0.18;
  const shipping = 2000;
  const grandTotal = total + tax + shipping;

  // ✅ Place order & handle payment
  const handlePlaceOrder = async ({
    address,
    phone,
  }: {
    address: string;
    phone: string;
  }) => {
    try {
      // 1️⃣ Create order payload
      const payload = {
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddress: address,
        phoneNumber: phone,
        paymentMethod: "MOBILE_MONEY" as const,
      };

      // 2️⃣ Create order in backend
      const order = await createOrder(payload);

      // 3️⃣ Payment placeholder (simulate or call payment API)
      // Here you would trigger the MTN/Airtel MoMo API or redirect user to confirm payment
      // Example: await PaymentClient.requestPayment(order.id, phone, grandTotal);

      // 4️⃣ Clear cart after successful creation/payment
      clearCart();

      // 5️⃣ Navigate to success page
      navigate(`/order-success/${order.orderNumber}`);
    } catch (err) {
      console.error("Order & Payment failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/5 rounded-full"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold tracking-tight">
            Checkout ({totalItems} items)
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT: FORM */}
          <div className="lg:col-span-7">
            <div className="mb-8 flex items-center gap-2 text-green-500 bg-green-500/10 w-fit px-4 py-2 rounded-full text-sm font-medium">
              <ShieldCheck size={18} />
              Secure Checkout
            </div>

            <CheckoutForm
              onSubmit={handlePlaceOrder}
              loading={loading}
              error={error}
              totalAmount={grandTotal} // optional prop for displaying in form
            />

            {/* 💳 Payment Info Section */}
            <div className="mt-6 p-6 bg-[#0a0a0a] border border-white/5 rounded-3xl space-y-4">
              <h2 className="text-xl font-bold text-white">Payment</h2>
              <p className="text-gray-400 text-sm">
                You can pay via Mobile Money (MTN/Airtel). After confirming payment on your phone, your order will be processed and delivered.
              </p>
              <p className="text-gray-400 text-sm">
                Total Amount: <span className="font-bold">${grandTotal.toLocaleString()}</span>
              </p>
              <button
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
              >
                Pay via Mobile Money
              </button>
            </div>
          </div>

          {/* RIGHT: SUMMARY */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 p-8 bg-[#0a0a0a] border border-white/5 rounded-3xl">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-xl border border-white/10"
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-sm">
                      ${(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-8 pt-6 border-t border-white/5 space-y-3 text-sm text-gray-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white">${total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (18%)</span>
                  <span className="text-white">${tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-white">${shipping.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-white pt-3 border-t border-white/5">
                  <span>Total</span>
                  <span>${grandTotal.toLocaleString()}</span>
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