import { useEffect, useState } from "react";
import { useOrderStore } from "../../../store/useOrderStore";
import { useProductStore } from "../../../store/productStore"; // To access vendor stores names if needed
import {
  Loader2,
  ShieldAlert,
  FileText,
  ClipboardList,
  RefreshCw,
  Eye,
} from "lucide-react";
import { useAuthState } from "../../../context/AuthContext";

const STATUS_OPTIONS = [
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
  const { vendors, fetchVendors } = useProductStore();
  const { user } = useAuthState();

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAllOrders();
    if (vendors.length === 0) fetchVendors();
  }, []);

  const handleStatusChange = async (orderId: string, nextStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, nextStatus);
      // Re-trigger the active layout view computation array bounds safely
      setStatusFilter(statusFilter);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status: nextStatus }));
      }
    } catch (err) {
      alert("Failed to modify dispatch execution status routing parameters.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const baseline =
      "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ";
    switch (status?.toLowerCase()) {
      case "pending":
        return baseline + "bg-amber-100 text-amber-800 border border-amber-200";
      case "processing":
        return baseline + "bg-blue-100 text-blue-800 border border-blue-200";
      case "shipped":
        return (
          baseline + "bg-indigo-100 text-indigo-800 border border-indigo-200"
        );
      case "delivered":
        return (
          baseline + "bg-emerald-100 text-emerald-800 border border-emerald-200"
        );
      case "cancelled":
        return baseline + "bg-rose-100 text-rose-800 border border-rose-200";
      default:
        return baseline + "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto min-h-screen font-poppins text-gray-800 relative">
      {/* --- BACKEND ORDER HEADINGS --- */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-end mb-8">
        <div>
          <h1 className="text-3xl uppercase font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="text-green-600" size={28} /> Logistics
            Registry
          </h1>
          <p className="text-gray-500 text-sm">
            Monitor system-wide multi-vendor marketplace invoices and shipments.
          </p>
        </div>
        <button
          onClick={() => fetchAllOrders()}
          className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 active:scale-95 transition-all text-xs font-semibold border border-gray-200"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Sync
          Database
        </button>
      </div>

      {/* --- ORDER PIPELINE WORKFLOW STATUS TABS --- */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-3">
        {STATUS_OPTIONS.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              statusFilter === tab
                ? "bg-green-600 text-white shadow-sm"
                : "bg-white text-gray-500 hover:text-gray-800 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- PRIMARY DATA LAYER VIEWPORT --- */}
      {error && (
        <div className="p-4 mb-6 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 text-sm flex items-center gap-2">
          <ShieldAlert size={18} /> {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading && filteredOrders.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-gray-400 gap-2">
            <Loader2 className="animate-spin text-green-500" size={36} />
            <p className="text-sm font-medium text-gray-500">
              Loading transactional registers...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-20 text-center text-gray-400 space-y-2">
            <FileText className="mx-auto text-gray-300" size={48} />
            <p className="text-sm font-medium">
              No order files cataloged under the "{statusFilter}" flag
              statement.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-bold uppercase text-gray-500 tracking-wider">
                  <th className="p-4">Order ID / Customer</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Vendor Nodes</th>
                  <th className="p-4">Financial Total</th>
                  <th className="p-4">Fulfillment Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="font-mono text-xs font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                        #{order.id.slice(-8).toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {order.phoneNumber || "Guest Checkout"}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {user?.email || "Guest Checkout"}
                      </div>
                    </td>
                    <td className="p-4 text-xs text-gray-500">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString(
                            "en-US",
                            { dateStyle: "medium" },
                          )
                        : "N/A"}
                    </td>
                    <td className="p-4">
                      {/* Pull matching store name matching vendor tracking ids safely */}
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-md font-medium text-gray-600">
                        {vendors.find((v) => v.id === order.vendorId)?.name ||
                          "Global Marketplace"}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-gray-900">
                      {new Intl.NumberFormat("en-RW", {
                        style: "currency",
                        currency: "RWF",
                        maximumFractionDigits: 0,
                      }).format(order.totalAmount || 0)}
                    </td>
                    <td className="p-4">
                      <span className={getStatusBadgeClass(order.status)}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      {/* View detailed informational modal overlay */}
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-lg text-gray-600 hover:text-gray-900 inline-flex items-center align-middle transition-all cursor-pointer"
                        title="Inspect Full Metadata"
                      >
                        <Eye size={14} />
                      </button>

                      <select
                      disabled={updatingId === order.id}
                        onChange={(e) =>
                          updateOrderStatus(selectedOrder?.id, e.target.value)
                        }
                        defaultValue={selectedOrder?.status}
                        value={order.status}
                        className="text-xs bg-white border border-gray-200 rounded-lg p-1.5 font-medium outline-none focus:border-green-500 cursor-pointer disabled:opacity-50 inline-block align-middle"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt.toUpperCase()}>
                            {opt.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MORE INFORMATION MODAL FOR VENDOR AND PRODUCT METRICS --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center rounded justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh] z-10">
            {/* HEADER */}
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold">
                  Order #{selectedOrder?.id.slice(-8)}
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedOrder?.phoneNumber}
                </p>
              </div>

              <div className="flex gap-2">
                <select
                  value={selectedOrder?.status}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder?.id, e.target.value)
                  }
                  className="text-xs border rounded-lg px-2 py-1"
                >
                  {STATUS_OPTIONS.filter((s) => s !== "all").map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => deleteOrder(selectedOrder?.id)}
                  className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* BODY */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* SHIPPING */}
              <div className="bg-gray-50 p-4 rounded-xl text-sm">
                <p>
                  <b>Address:</b> {selectedOrder?.shippingAddress}
                </p>
                <p>
                  <b>Payment:</b> {selectedOrder?.paymentMethod}
                </p>
              </div>

              {/* ITEMS WITH VENDORS */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase text-gray-500">
                  Items + Vendor Info
                </h4>

                {selectedOrder.items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="border rounded-xl p-3 space-y-1"
                  >
                    <div className="flex justify-between">
                      <p className="font-semibold">{item.product?.title}</p>
                      <p className="text-sm font-bold">
                        {(
                          item.priceAtPurchase * item.quantity
                        ).toLocaleString()}{" "}
                        RWF
                      </p>
                    </div>

                    <div className="text-xs text-gray-500 flex justify-between">
                      <span>Qty: {item.quantity}</span>

                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        Vendor: {item.vendorId}
                      </span>
                    </div>

                    {/* OPTIONAL: vendor lookup */}
                    <div className="text-xs text-gray-400">
                      Store:{" "}
                      {vendors.find((v) => v.id === item.vendorId)?.name ||
                        "Unknown Vendor"}
                    </div>
                  </div>
                ))}
              </div>

              {/* TOTAL */}
              <div className="border-t pt-4 text-right">
                <p className="font-bold text-lg">
                  Total: {selectedOrder?.totalAmount?.toLocaleString()} RWF
                </p>
              </div>
            </div>

            {/* FOOTER */}
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-gray-100 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
