import { useEffect, useMemo, useState } from "react";
import { useOrderStore } from "../../../store/useOrderStore";
import {
  Loader2,
  ShieldAlert,
  FileText,
  ClipboardList,
  RefreshCw,
  Eye,
  Package,
  Store,
  DollarSign,
} from "lucide-react";
import type { Order, OrderItem } from "../../../types/api";

const STATUS_OPTIONS = [
  "ALL",
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

export default function AdminOrders() {
  const {
    fetchAllOrders,
    filteredOrders,
    statusFilter,
    deleteOrder,
    setStatusFilter,
    loading,
    error,
    updateOrderStatus,
  } = useOrderStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    void fetchAllOrders();
  }, [fetchAllOrders]);

  const handleStatusChange = async (orderId: string, nextStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, nextStatus);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: nextStatus as Order["status"] } : prev));
      }
    } catch {
      alert("Failed to modify dispatch execution status routing parameters.");
    } finally {
      setUpdatingId(null);
    }
  };

  const summary = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    const pendingOrders = filteredOrders.filter((order) => order.status?.toLowerCase() === "pending").length;
    return { totalOrders, totalRevenue, pendingOrders };
  }, [filteredOrders]);

  const getStatusBadgeClass = (status?: string) => {
    const baseline = "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ";
    switch (status?.toLowerCase()) {
      case "pending":
        return baseline + "bg-amber-500/10 text-amber-500 border border-amber-500/20";
      case "processing":
        return baseline + "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "shipped":
        return baseline + "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
      case "delivered":
        return baseline + "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
      case "cancelled":
        return baseline + "bg-rose-500/10 text-rose-500 border border-rose-500/20";
      default:
        return baseline + "bg-zinc-800 text-zinc-400 border border-zinc-700";
    }
  };

  const getVendorLabel = (item: OrderItem) => {
    const vendorName = item.product?.vendor?.storeName;
    if (vendorName) return vendorName;
    if (item.vendorId) return `Vendor ${item.vendorId.slice(-4).toUpperCase()}`;
    return "Global Marketplace";
  };

  const buildVendorBreakdown = (order: Order) => {
    const grouped = new Map<string, { vendorName: string; revenue: number; items: OrderItem[] }>();

    order.items.forEach((item) => {
      const vendorId = item.vendorId || item.product?.vendor?.id || "global";
      const vendorName = item.product?.vendor?.storeName || item.product?.vendor?.id || "Global Marketplace";
      const current = grouped.get(vendorId) || { vendorName, revenue: 0, items: [] };
      current.revenue += Number(item.priceAtPurchase || 0) * Number(item.quantity || 0);
      current.items.push(item);
      grouped.set(vendorId, current);
    });

    return Array.from(grouped.values());
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen text-zinc-100 relative">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-end mb-8">
        <div>
          <h1 className="text-3xl uppercase font-extrabold text-zinc-100 tracking-tight flex items-center gap-3">
            <ClipboardList className="text-emerald-500" size={32} /> Logistics Registry
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Monitor marketplace orders, product-level vendor routing, and per-store revenue shares.
          </p>
        </div>
        <button
          onClick={() => void fetchAllOrders()}
          className="flex items-center gap-2 bg-zinc-900 text-zinc-300 px-4 py-2 rounded-2xl hover:bg-zinc-800 active:scale-95 transition-all text-xs font-semibold border border-zinc-800 shadow-sm cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-emerald-500" : ""} /> Sync Database
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md p-5 shadow-sm">
          <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider font-medium">
            <Package size={16} className="text-emerald-500" /> Total Orders
          </div>
          <div className="mt-3 text-3xl font-extrabold text-zinc-100">{summary.totalOrders}</div>
        </div>
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md p-5 shadow-sm">
          <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider font-medium">
            <DollarSign size={16} className="text-emerald-500" /> Gross Revenue
          </div>
          <div className="mt-3 text-3xl font-extrabold text-zinc-100">
            {new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(summary.totalRevenue)}
          </div>
        </div>
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md p-5 shadow-sm">
          <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider font-medium">
            <Store size={16} className="text-emerald-500" /> Pending Fulfillment
          </div>
          <div className="mt-3 text-3xl font-extrabold text-amber-500">{summary.pendingOrders}</div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-zinc-800 pb-4">
        {STATUS_OPTIONS.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab === "ALL" ? "all" : tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              statusFilter === (tab === "ALL" ? "all" : tab)
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
          <ShieldAlert size={18} /> {error}
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-zinc-900/50 backdrop-blur-md rounded-3xl shadow-sm border border-zinc-800 overflow-hidden">
        {loading && filteredOrders.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-zinc-500 gap-3">
            <Loader2 className="animate-spin text-emerald-500" size={36} />
            <p className="text-sm font-medium text-zinc-400">Loading transactional registers...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-20 text-center text-zinc-500 space-y-3">
            <FileText className="mx-auto text-zinc-600" size={48} />
            <p className="text-sm font-medium">No order files cataloged under the "{statusFilter}" flag statement.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900/80 border-b border-zinc-800 text-xs font-bold uppercase text-zinc-400 tracking-wider">
                  <th className="p-4">Order / Customer</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Vendor Split</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-sm">
                {filteredOrders.map((order) => {
                  const vendorCount = new Set(order.items.map((item) => item.vendorId || item.product?.vendor?.id || "global")).size;
                  return (
                    <tr key={order.id} className="hover:bg-zinc-800/40 transition-colors group">
                      <td className="p-4">
                        <div className="font-mono text-xs font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                          #{order.id.slice(-8).toUpperCase()}
                        </div>
                        <div className="text-xs text-zinc-400 mt-0.5">{order.user?.name || order.email || "Guest Checkout"}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">{order.phoneNumber || "Guest Checkout"}</div>
                      </td>
                      <td className="p-4 text-xs text-zinc-400">
                        <div className="font-semibold text-zinc-300">{order.items?.length || 0} line item(s)</div>
                        <div className="mt-0.5 truncate max-w-xs">{order.items?.map((item) => item.product?.title).filter(Boolean).slice(0, 2).join(", ")}...</div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs px-2.5 py-1 bg-zinc-800 border border-zinc-700 rounded-lg font-medium text-zinc-300">
                          {vendorCount} vendor{vendorCount > 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-zinc-100">
                        {new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(order.totalAmount || 0)}
                      </td>
                      <td className="p-4">
                        <span className={getStatusBadgeClass(order.status)}>{order.status}</span>
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-300 hover:text-zinc-100 inline-flex items-center align-middle transition-all cursor-pointer shadow-sm"
                          title="Inspect Full Metadata"
                        >
                          <Eye size={14} />
                        </button>

                        <select
                          disabled={updatingId === order.id}
                          onChange={(e) => void handleStatusChange(order.id, e.target.value)}
                          value={order.status}
                          className="text-xs bg-zinc-900 text-zinc-200 border border-zinc-700 rounded-xl p-2 font-medium outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-50 inline-block align-middle"
                        >
                          {STATUS_OPTIONS.filter((opt) => opt !== "ALL").map((opt) => (
                            <option key={opt} value={opt} className="bg-zinc-900 text-zinc-200">
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deep Inspection Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="absolute inset-0" onClick={() => setSelectedOrder(null)} />

          <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] z-10 text-zinc-100 overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/90">
              <div>
                <h3 className="font-bold text-lg text-zinc-100 font-mono">Order #{selectedOrder.id.slice(-8).toUpperCase()}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">{selectedOrder.phoneNumber || selectedOrder.user?.phone || "Guest Checkout"}</p>
              </div>
              <div className="flex gap-3 items-center">
                <select
                  value={selectedOrder.status}
                  onChange={(e) => void handleStatusChange(selectedOrder.id, e.target.value)}
                  className="text-xs bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-emerald-500"
                >
                  {STATUS_OPTIONS.filter((s) => s !== "ALL").map((s) => (
                    <option key={s} value={s} className="bg-zinc-900">
                      {s}
                    </option>
                  ))}
                </select>
                <button 
                  onClick={() => void deleteOrder(selectedOrder.id)} 
                  className="px-3 py-2 text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
                >
                  Cancel Order
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid md:grid-cols-2 gap-4 bg-zinc-800/40 border border-zinc-800 p-4 rounded-2xl text-sm">
                <div className="space-y-1">
                  <p className="text-zinc-400"><strong className="text-zinc-200">Customer:</strong> {selectedOrder.user?.name || "Guest Customer"}</p>
                  <p className="text-zinc-400"><strong className="text-zinc-200">Email:</strong> {selectedOrder.user?.email || selectedOrder.email || "N/A"}</p>
                  <p className="text-zinc-400"><strong className="text-zinc-200">Phone:</strong> {selectedOrder.phoneNumber || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-400"><strong className="text-zinc-200">Shipping Address:</strong> {selectedOrder.shippingAddress || "N/A"}</p>
                  <p className="text-zinc-400"><strong className="text-zinc-200">Payment:</strong> {selectedOrder.paymentMethod || "N/A"}</p>
                  <p className="text-zinc-400"><strong className="text-zinc-200">Payment Status:</strong> {selectedOrder.paymentStatus || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase text-zinc-400 tracking-wider">Products and vendor routing</h4>
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="border border-zinc-800 bg-zinc-900/40 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between gap-3">
                      <div className="flex gap-3 min-w-0">
                        {item.product?.images?.[0] ? (
                          <img src={item.product.images[0]} alt={item.product.title} className="w-14 h-14 rounded-xl object-cover border border-zinc-800" />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500 text-xs">IMG</div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-zinc-100 truncate">{item.product?.title || "Product item"}</p>
                          <p className="text-xs text-zinc-400 mt-0.5">{item.product?.category?.name || "Uncategorized"}</p>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-zinc-100 text-right shrink-0">
                        <div>{(Number(item.priceAtPurchase || 0) * Number(item.quantity || 0)).toLocaleString()} RWF</div>
                        <div className="text-xs font-medium text-zinc-400">Qty {item.quantity}</div>
                      </div>
                    </div>

                    <div className="text-xs text-zinc-300 flex flex-wrap gap-2 pt-1 border-t border-zinc-800/60">
                      <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-lg">Unit price: {Number(item.priceAtPurchase || 0).toLocaleString()} RWF</span>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg">Vendor: {getVendorLabel(item)}</span>
                      <span className="bg-zinc-800 text-zinc-400 border border-zinc-700 px-2.5 py-1 rounded-lg">Store ID: {item.vendorId || item.product?.vendor?.id || "global"}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase text-zinc-400 tracking-wider">Vendor settlement breakdown</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  {buildVendorBreakdown(selectedOrder).map((entry) => (
                    <div key={entry.vendorName} className="border border-zinc-800 rounded-2xl p-4 bg-zinc-800/20">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-zinc-200">{entry.vendorName}</p>
                        <p className="text-sm font-bold text-emerald-400">{entry.revenue.toLocaleString()} RWF</p>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">{entry.items.length} item(s) routed to this store</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-4 text-right">
                <p className="font-extrabold text-xl text-zinc-100">Order total: {Number(selectedOrder.totalAmount || 0).toLocaleString()} RWF</p>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-800 flex justify-end bg-zinc-900/90">
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold border border-zinc-700 transition-all cursor-pointer"
              >
                Close Registry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}