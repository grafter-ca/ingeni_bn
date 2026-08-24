// components/vendor/VendorOrdersView.tsx
import { useState, useEffect } from "react";
import { ShoppingCart, CheckCircle2, Clock, Truck, Search, PackageCheck, CreditCard } from "lucide-react";
import { useOrderStore } from "../../store/useOrderStore";

export const VendorOrdersView = () => {
  const { 
    filteredOrders, 
    loading, 
    fetchVendorOrders, 
    updateOrderStatus, 
    setStatusFilter, 
    statusFilter 
  } = useOrderStore();
  
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch vendor-specific orders on mount
  useEffect(() => {
    fetchVendorOrders();
  }, [fetchVendorOrders]);

  // Handle status filter change using the store action
  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
  };

  // Filter orders locally by order number or customer name
  const displayedOrders = (filteredOrders || []).filter((order) => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart size={14} className="text-blue-400" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-blue-400">Order Fulfillment & Payout Ledger</span>
          </div>
          <h1 className="font-poppins font-bold text-2xl md:text-3xl text-white tracking-tight">Customer Orders</h1>
        </div>
        
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#0c0c0e] p-1.5 rounded-2xl border border-white/10 overflow-x-auto">
          {["all", "PENDING", "SHIPPED", "DELIVERED"].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`px-3 py-1.5 rounded-xl font-mono text-[11px] uppercase tracking-wider transition cursor-pointer whitespace-nowrap ${
                statusFilter.toLowerCase() === status.toLowerCase() 
                  ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/25" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0c0c0e] border border-white/10 flex items-center shadow-lg">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by order ID or customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-blue-500/50 transition placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="rounded-3xl bg-[#0c0c0e] border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-500 text-[10px] uppercase tracking-wider bg-white/[0.01]">
                <th className="py-4 px-6">Order / Date</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Payment Status</th>
                <th className="py-4 px-6">Net Earnings & Commission</th>
                <th className="py-4 px-6">Fulfillment</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-500">
                    Loading orders...
                  </td>
                </tr>
              ) : displayedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-500">
                    No orders matching your criteria found.
                  </td>
                </tr>
              ) : (
                displayedOrders.map((order) => {
                  const isPaid = order.paymentStatus === "SUCCESS";
                  const isDelivered = order.status === "DELIVERED";
                  const isReady = isPaid && isDelivered;

                  const total = Number(order.totalAmount || 0);
                  const commission = total * 0.10; // 10% platform fee
                  const netEarnings = total - commission;

                  return (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-4 px-6 font-bold text-white">
                        #{order.orderNumber}
                        <span className="block text-[10px] text-gray-500 font-normal">
                          {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-gray-300">
                        {order.user?.name || "Customer"}
                        <span className="block text-[10px] text-gray-500 font-normal">
                          {order.user?.email}
                        </span>
                      </td>

                      {/* Payment Status Badge */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          isPaid 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          <CreditCard size={10} />
                          {order.paymentStatus || 'INITIALIZED'}
                        </span>
                      </td>

                      {/* Net Earnings & Commission Breakdown */}
                      <td className="py-4 px-6">
                        {isReady ? (
                          <div className="space-y-0.5">
                            <span className="text-emerald-400 font-bold">Net Payout: RWF {netEarnings.toLocaleString()}</span>
                            <p className="text-gray-500 text-[10px]">Platform Fee (10%): RWF {commission.toLocaleString()}</p>
                            <span className="text-[9px] text-emerald-500/80 font-bold uppercase tracking-wider block">✓ Ready for Payout</span>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="text-gray-400 font-bold">Gross: RWF {total.toLocaleString()}</span>
                            <p className="text-amber-500/80 text-[10px] italic">Unlocks after payment & delivery</p>
                          </div>
                        )}
                      </td>

                      {/* Fulfillment Status */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold ${
                          order.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          order.status === 'SHIPPED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {order.status === 'DELIVERED' ? <CheckCircle2 size={12} /> :
                           order.status === 'SHIPPED' ? <Truck size={12} /> : <Clock size={12} />}
                          {order.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right space-x-2">
                        {order.status === 'PENDING' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'SHIPPED')}
                            className="px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition font-bold border border-blue-500/30 cursor-pointer"
                          >
                            Mark Shipped
                          </button>
                        )}
                        {order.status === 'SHIPPED' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition font-bold border border-emerald-500/30 cursor-pointer"
                          >
                            Mark Delivered
                          </button>
                        )}
                        {order.status === 'DELIVERED' && (
                          <span className="inline-flex items-center gap-1 text-gray-500 text-[11px]">
                            <PackageCheck size={14} /> Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
         </div>
    </div>
  );
};