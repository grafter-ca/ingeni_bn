import { useParams, Link } from "react-router-dom";
import { CheckCircle, Package, ArrowRight, Printer, Clock } from "lucide-react";

const OrderSuccess = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="bg-green-500/10 p-4 rounded-full border border-green-500/20">
            <CheckCircle size={64} className="text-green-500" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-gray-400 mb-8 text-sm sm:text-base">
          Your order{" "}
          <span className="text-blue-400 font-mono font-semibold">
            #{orderNumber}
          </span>{" "}
          has been placed successfully.
        </p>

        {/* Status Timeline / Next Steps */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 mb-8 text-left">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
            Order Status & Next Steps
          </h3>
          <ul className="space-y-4">
            <li className="flex gap-3 items-start">
              <Package size={18} className="text-blue-500 shrink-0 mt-0.5" />
              <span className="text-sm text-gray-300">
                The vendor is currently preparing your items for shipment.
              </span>
            </li>
            <li className="flex gap-3 items-start">
              <Clock size={18} className="text-gray-500 shrink-0 mt-0.5" />
              <span className="text-sm text-gray-400">
                You will receive a notification once the courier picks up your package.
              </span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/my-orders"
            className="flex items-center justify-center gap-2 bg-white text-black py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all text-sm"
          >
            Track Orders
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all text-sm"
          >
            <Printer size={18} /> Print
          </button>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-2 mt-8 text-gray-500 hover:text-white transition-all text-sm"
        >
          Continue Shopping <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;