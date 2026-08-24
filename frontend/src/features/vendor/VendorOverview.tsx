// components/vendor/VendorOverview.tsx
import { useEffect } from "react";
import { Package, ShoppingCart, DollarSign, TrendingUp, ArrowUpRight, Clock, CheckCircle2 } from "lucide-react";
import { useOrderStore } from "../../store/useOrderStore";
import { useProductStore } from "../../store/productStore";

export const VendorOverview = () => {
  const { orders, fetchVendorOrders } = useOrderStore();
  const { products, fetchVendorProducts } = useProductStore();

  // Fetch orders and products on mount to guarantee fresh metrics
  useEffect(() => {
    fetchVendorOrders();
    fetchVendorProducts();
  }, [fetchVendorOrders, fetchVendorProducts]);

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];

  // Calculate total revenue dynamically from delivered/completed orders
  const totalRevenue = safeOrders.reduce((acc, order) => {
    return acc + (order.totalAmount || 0);
  }, 0);

  const pendingOrdersCount = safeOrders.filter(o => o.status === 'PENDING').length;

  const statCards = [
    {
      label: "Total Revenue",
      value: `RWF ${totalRevenue.toLocaleString()}`,
      change: "Active marketplace pool",
      icon: DollarSign,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Active Products",
      value: safeProducts.length,
      change: "In stock & listed",
      icon: Package,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Total Orders",
      value: safeOrders.length,
      change: `${pendingOrdersCount} pending fulfillment`,
      icon: ShoppingCart,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-900/40 via-[#0c0c0e] to-[#0c0c0e] border border-white/10 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[10px] uppercase tracking-wider mb-4">
            <TrendingUp size={12} />
            <span>Storefront Telemetry Active</span>
          </div>
          <h1 className="font-poppins font-bold text-2xl md:text-4xl text-white tracking-tight mb-2">
            Welcome back, Vendor
          </h1>
          <p className="font-mono text-xs text-gray-400 leading-relaxed">
            Monitor your real-time store performance metrics, manage catalog listings, and keep track of live customer shipments directly from your dashboard.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map(({ label, value, change, icon: Icon, color }, index) => (
          <div key={index} className="p-6 rounded-2xl bg-[#0c0c0e] border border-white/10 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs uppercase tracking-wider text-gray-400">{label}</span>
              <div className={`p-3 rounded-xl border ${color}`}>
                <Icon size={20} />
              </div>
            </div>
            <div>
              <div className="font-poppins font-bold text-2xl md:text-3xl text-white mb-1 tracking-tight">{value}</div>
              <div className="font-mono text-[11px] text-gray-500 flex items-center gap-1">
                <ArrowUpRight size={12} className="text-emerald-400" />
                <span>{change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Preview Section */}
      <div className="rounded-3xl bg-[#0c0c0e] border border-white/10 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div>
            <h2 className="font-poppins font-bold text-lg text-white">Recent Customer Orders</h2>
            <p className="font-mono text-[11px] text-gray-400">Latest transactions requiring fulfillment attention.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-500 text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {safeOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">No orders recorded yet.</td>
                </tr>
              ) : (
                safeOrders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4 font-bold text-white">#{order.orderNumber}</td>
                    <td className="py-3.5 px-4 text-gray-300">{order.user?.name || "Customer"}</td>
                    <td className="py-3.5 px-4 text-blue-400">RWF {order.totalAmount?.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-semibold ${
                        order.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-400' :
                        order.status === 'SHIPPED' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {order.status === 'DELIVERED' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};