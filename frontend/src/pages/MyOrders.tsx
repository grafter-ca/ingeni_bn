import { useEffect, useState, useMemo } from "react";
import {
  ShoppingBag,
  Loader2,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import { OrderClient } from "../services/order.service";
import OrderCard from "../components/common/OrderCard";
import type { Order } from "../types/api";

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await OrderClient.getMyOrders();
      setOrders(data);
    } catch (err: any) {
      console.error("Failed to fetch orders:", err);
      setError("Could not load your purchase history. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ||
        order.status?.toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-500" size={40} />
          <p className="text-gray-500 text-sm animate-pulse">
            Fetching order history...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order Tracking</h1>
            <p className="text-gray-500 text-sm mt-1">
              Monitor shipments, statuses, and history
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="self-start sm:self-auto p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition flex items-center gap-2 text-sm"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* Controls: Search and Filters */}
        {orders.length > 0 && (
          <div className="grid sm:grid-cols-12 gap-4 mb-8">
            {/* Search Input */}
            <div className="sm:col-span-8 relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                placeholder="Search by Order #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#0a0a0a] border border-white/10 text-sm outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="sm:col-span-4 relative">
              <Filter
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#0a0a0a] border border-white/10 text-sm outline-none focus:border-blue-500 transition appearance-none text-gray-300"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {orders.length === 0 && !error ? (
          <div className="text-center py-20 bg-[#0a0a0a] rounded-3xl border border-dashed border-white/10 p-6">
            <div className="bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={28} className="text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold">No orders found</h2>
            <p className="text-gray-500 mt-2 text-sm max-w-xs mx-auto">
              You haven't placed any purchases yet.
            </p>
            <a
              href="/products"
              className="inline-block mt-6 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all text-sm"
            >
              Browse Products
            </a>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-[#0a0a0a] rounded-3xl border border-white/5">
            <p className="text-gray-400 text-sm">
              No orders matching standard filters.
            </p>
          </div>
        ) : (
          /* Order Cards List */
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;