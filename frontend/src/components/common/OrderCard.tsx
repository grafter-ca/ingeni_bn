import { Package, Clock, CheckCircle2, Truck, XCircle } from "lucide-react";
import type { Order } from "../../types/api";

interface OrderCardProps {
  order: Order;
}

const getStatusBadge = (status: string) => {
  switch (status?.toUpperCase()) {
    case "DELIVERED":
      return {
        style: "bg-green-500/10 text-green-400 border-green-500/20",
        icon: CheckCircle2,
      };
    case "SHIPPED":
    case "IN_TRANSIT":
      return {
        style: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        icon: Truck,
      };
    case "CANCELLED":
    case "FAILED":
      return {
        style: "bg-red-500/10 text-red-400 border-red-500/20",
        icon: XCircle,
      };
    case "PENDING":
    case "PROCESSING":
    default:
      return {
        style: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        icon: Clock,
      };
  }
};

const OrderCard = ({ order }: OrderCardProps) => {
  const statusInfo = getStatusBadge(order?.status || "PENDING");
  const StatusIcon = statusInfo.icon;

  // Safe fallback for payment method string formatting
  const formattedPaymentMethod = order?.paymentMethod
    ? order.paymentMethod.replace(/_/g, " ")
    : "Card/MoMo";

  return (
    <div className="group p-6 bg-[#0f0f0f] border border-white/5 rounded-2xl hover:border-blue-500/30 transition-all">
      {/* Top Bar: Order ID & Status Badge */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
            <Package size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-500 block">
              Order Reference
            </span>
            <span className="font-mono text-xs font-bold text-gray-200">
              #{order?.orderNumber || order?.id?.slice(-8) || "N/A"}
            </span>
          </div>
        </div>

        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${statusInfo.style}`}
        >
          <StatusIcon size={12} />
          <span>{order?.status || "PENDING"}</span>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3 my-4">
        {order?.items && order.items.length > 0 ? (
          order.items.map((item: any, idx: number) => {
            // Safe property extractions across various backend payloads
            const itemName =
              item?.name || item?.product?.title || item?.product?.name || "Product Item";
            const itemPrice = item?.priceAtPurchase ?? item?.price ?? 0;
            const quantity = item?.quantity ?? 1;

            return (
              <div
                key={item?.id || item?.productId || idx}
                className="flex items-center justify-between text-sm text-gray-400"
              >
                <div className="flex items-center gap-2 truncate pr-4">
                  {item?.image || item?.product?.image ? (
                    <img
                      src={item?.image || item?.product?.image}
                      alt={itemName}
                      className="w-8 h-8 rounded-lg object-cover bg-white/5 shrink-0"
                    />
                  ) : null}
                  <span className="truncate text-gray-300">
                    {itemName}{" "}
                    <span className="text-gray-500 font-mono text-xs">
                      x{quantity}
                    </span>
                  </span>
                </div>
                <span className="font-mono text-xs text-gray-400 shrink-0">
                  RF {(itemPrice * quantity).toLocaleString()}
                </span>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-gray-500 italic">No item details available</p>
        )}
      </div>

      {/* Footer: Payment Method & Total */}
      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs text-gray-500 capitalize">
          Paid via <span className="text-gray-400">{formattedPaymentMethod}</span>
        </span>
        <div className="text-right">
          <span className="text-[10px] uppercase text-gray-500 block">Total</span>
          <span className="text-white font-black text-lg font-mono">
            RF {(order?.totalAmount || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;