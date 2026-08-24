// src/pages/OrderSuccess.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, Package, ArrowRight, Printer, Clock, CreditCard, AlertCircle } from "lucide-react";
import { useOrderStore } from "../store/useOrderStore";
import type { Order } from "../types/api";

const OrderSuccess = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { filteredOrders, fetchAllOrders } = useOrderStore();
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Ensure we have order data in store to look up metadata if needed
    if (!filteredOrders || filteredOrders.length === 0) {
      void fetchAllOrders();
    }
  }, [filteredOrders, fetchAllOrders]);

  useEffect(() => {
    if (orderNumber && filteredOrders) {
      const found = filteredOrders.find(
        (o) => o.orderNumber === orderNumber || o.id.slice(-8).toUpperCase() === orderNumber.toUpperCase()
      );
      if (found) {
        setCurrentOrder(found);
      }
    }
  }, [orderNumber, filteredOrders]);

  const paymentStatus = currentOrder?.paymentStatus || "SUCCESS";
  const isPaid = paymentStatus === "SUCCESS";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white flex items-center justify-center px-6 py-12 font-poppins transition-colors duration-200">
      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className={`p-4 rounded-full border ${isPaid ? 'bg-green-500/10 border-green-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
            {isPaid ? (
              <CheckCircle size={64} className="text-green-500 animate-pulse" />
            ) : (
              <CreditCard size={64} className="text-amber-500 dark:text-amber-400 animate-bounce" />
            )}
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2">
          {isPaid ? "Order Confirmed!" : "Payment Pending Review"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm sm:text-base">
          Your order{" "}
          <span className="text-blue-600 dark:text-blue-400 font-mono font-semibold">
            #{orderNumber}
          </span>{" "}
          {isPaid ? "has been placed and paid successfully." : "has been saved. Awaiting payment gateway verification."}
        </p>

        {/* Payment Verification Banner */}
        <div className={`mb-6 p-4 rounded-2xl border text-xs flex items-center gap-3 text-left shadow-sm ${
          isPaid 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300' 
            : 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300'
        }`}>
          {isPaid ? <CheckCircle size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" /> : <AlertCircle size={18} className="shrink-0 text-amber-600 dark:text-amber-400" />}
          <div>
            <strong className="block uppercase tracking-wider font-bold mb-0.5">Payment State: {paymentStatus}</strong>
            {isPaid ? "Transaction clearance verified. Vendor is cleared to package items." : "Please complete your mobile money or card prompt to finalize validation."}
          </div>
        </div>

        {/* Status Timeline / Next Steps */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-3xl p-6 mb-8 text-left shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">
            Order Status & Next Steps
          </h3>
          <ul className="space-y-4">
            <li className="flex gap-3 items-start">
              <Package size={18} className="text-blue-600 dark:text-blue-500 shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {isPaid ? "The vendor is preparing your items for courier pickup." : "Items are reserved. Fulfillment unlocks once payment clears."}
              </span>
            </li>
            <li className="flex gap-3 items-start">
              <Clock size={18} className="text-gray-400 dark:text-gray-500 shrink-0 mt-0.5" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                You will receive a notification and SMS update once dispatch initiates.
              </span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/my-orders"
            className="flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-black py-3 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-all text-sm cursor-pointer shadow-sm"
          >
            Track Orders
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-white/10 transition-all text-sm cursor-pointer text-gray-900 dark:text-white"
          >
            <Printer size={18} /> Print Receipt
          </button>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-2 mt-8 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all text-sm font-medium"
        >
          Continue Shopping <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;