// src/pages/CheckoutPage.tsx
import { useState } from "react";
import { useCartStore } from "../store/cartStore";
import { useOrderStore } from "../store/useOrderStore";
import CheckoutForm from "../components/forms/ChechoutForm";
import {
  Headset,
  MessageCircle,
  Phone,
  ArrowLeft,
  CreditCard,
  Smartphone,
  Banknote,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import type { PaymentMethod } from "../types/api";
import { useAuthState } from "../context/AuthContext";
import { PaymentSecurityGateModal } from "../features/auth/PaymentSecurityGateModal";

const CheckoutPage = () => {
  const { items, clearCart, getTotalPrice, getTotalItems } =
    useCartStore();

  const { user } = useAuthState();
  const [showPaymentGate, setShowPaymentGate] = useState(false);
  const userId = user?.id || null;

  const { createOrder, loading, error } = useOrderStore();

  const location = useLocation();
  const navigate = useNavigate();

  const guestData = location.state?.guestUser;

  const total = getTotalPrice();
  const totalItems = getTotalItems();

  // Shared payment method state to synchronize the buttons and form selector
  const [selectedPayment, setSelectedPayment] =
    useState<PaymentMethod>("MOBILE_MONEY");

  const supportTeam = {
    phone: "+250786015225",
    email: "team@ingenistore.com",
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#050505] font-poppins flex flex-col items-center justify-center text-gray-900 dark:text-white transition-colors duration-200">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Link to="/products" className="text-blue-600 dark:text-blue-500 hover:underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const tax = total * 0.18;
  const shipping = 2000;
  const grandTotal = total + tax + shipping;

  const handlePlaceOrder = async ({
    shippingAddress,
    phoneNumber,
    paymentMethod,
    paymentProofUrl,
  }: {
    shippingAddress: string;
    phoneNumber: string;
    paymentMethod: PaymentMethod;
    paymentProofUrl?: string;
  }) => {
    try {
      const validatedItems = items.map((item) => {
        const cleanId = item.productId.replace("local-", "").replace("fake-", "");
        if (!item.productId) {
          throw new Error(`${item.name} is missing productId`);
        }

        if (!item.vendorId) {
          throw new Error(`${item.name} is missing vendorId`);
        }

        return {
          productId: cleanId,
          vendorId: item.vendorId,
          quantity: item.quantity,
        };
      });

      const payload = {
        items: validatedItems,
        shippingAddress,
        phoneNumber,
        paymentMethod,
        paymentProofUrl, // Forward screenshot upload proof
        totalAmount: grandTotal,
        taxAmount: tax,
        shippingFees: shipping,
        user: {
          id: userId,
          name: user?.name || guestData?.name || "Guest User",
          email: user?.email || guestData?.email || "guest@ingenistore.com",
          phoneNumber: user?.phone || guestData?.phone || "N/A",
        },
        userId,
      };

      const order = await createOrder(payload);

      console.log("Order created successfully:", order, "with payload:", payload);

      clearCart();
      navigate(`/order-success/${order.orderNumber}`);
    } catch (err) {
      console.error("Checkout failed:", err);
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white py-10 px-6 font-poppins transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        {/* SUPPORT SECTION */}
        <div className="mb-8 p-6 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-blue-500/25 flex flex-col md:flex-row justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-500">
              <Headset size={24} />
            </div>
            <div>
              <h2 className="font-bold text-blue-600 dark:text-blue-400">Need Help?</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Contact our support team anytime.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <a
              href={`tel:${supportTeam.phone}`}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white transition flex items-center gap-2 text-sm font-medium"
            >
              <Phone size={16} />
              Call
            </a>

            <a
              href={`mailto:${supportTeam.email}`}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white transition flex items-center gap-2 text-sm font-medium"
            >
              <MessageCircle size={16} />
              Email
            </a>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* LEFT: Checkout Form & Payment Methods selector */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-white/5 rounded-full text-gray-700 dark:text-white transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft size={22} />
              </button>

              <h1 className="text-2xl font-black uppercase tracking-wide">
                Checkout ({totalItems} items)
              </h1>
            </div>

            <CheckoutForm
              onSubmit={handlePlaceOrder}
              loading={loading}
              error={error}
              totalAmount={grandTotal}
              selectedPayment={selectedPayment}
              onPaymentMethodChange={setSelectedPayment}
              defaultValues={{
                shippingAddress: "Kigali",
                phoneNumber: guestData?.phone || user?.phone || "",
                paymentMethod: selectedPayment,
              }}
            />

            <div className="mt-8 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-3xl p-6 shadow-sm">
              <h3 className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4 font-semibold">
                Select Payment Method
              </h3>

              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    id: "MOBILE_MONEY",
                    label: "MoMo",
                    icon: Smartphone,
                  },
                  {
                    id: "CREDIT_CARD",
                    label: "Card",
                    icon: CreditCard,
                  },
                  {
                    id: "CASH_ON_DELIVERY",
                    label: "Cash",
                    icon: Banknote,
                  },
                ].map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() =>
                      setSelectedPayment(
                        method.id as PaymentMethod
                      )
                    }
                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 cursor-pointer ${
                      selectedPayment === method.id
                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20"
                        : "bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <method.icon size={20} />
                    <span className="text-xs font-bold uppercase">
                      {method.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Order Summary</h2>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 items-center"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200 dark:border-white/10"
                    />

                    <div className="flex-1">
                      <h3 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <div className="font-semibold text-sm text-gray-900 dark:text-white">
                      RF{" "}
                      {(
                        item.price * item.quantity
                      ).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-white/5 mt-8 pt-6 space-y-3">
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-gray-900 dark:text-white font-medium">RF {total.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Tax (18%)</span>
                  <span className="text-gray-900 dark:text-white font-medium">RF {tax.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Delivery</span>
                  <span className="text-gray-900 dark:text-white font-medium">RF {shipping.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-white/5 pt-4 text-blue-600 dark:text-blue-400">
                  <span>Total</span>
                  <span>RF {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Security modal for unauthenticated users */}
              {!user && showPaymentGate && (
                <PaymentSecurityGateModal
                  isOpen={showPaymentGate}
                  onClose={() => setShowPaymentGate(false)}
                  onProceedToPayment={() => {
                    setShowPaymentGate(false);
                    document
                      .querySelector<HTMLFormElement>(
                        "#checkout-form"
                      )
                      ?.requestSubmit();
                  }}
                />
              )}

              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    setShowPaymentGate(true);
                  } else {
                    document
                      .querySelector<HTMLFormElement>(
                        "#checkout-form"
                      )
                      ?.requestSubmit();
                  }
                }}
                disabled={loading}
                className="w-full mt-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold uppercase transition-colors text-white disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer text-sm tracking-wider"
              >
                {loading ? "Processing..." : "Complete Purchase"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;