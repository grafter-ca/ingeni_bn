import { useEffect, useState } from "react";
import { DollarSign, Package, TrendingUp, Clock, ExternalLink, ShieldCheck, Loader2 } from "lucide-react";
import { useVendorStore } from "../../store/vendorStore"; // Adjust paths to your exact store locations
import { useProductStore } from "../../store/productStore";

const VendorContent = () => {
  // 1. Consume telemetry data & mutation functions from your vendor/order store
  const { 
    stats, 
    orders, 
    isLoading: isOrdersLoading, 
    fetchVendorDashboardData, // Assuming a method that pulls initial stats/orders
    updateOrderStatus 
  } = useVendorStore();

  // 2. Consume complementary data from your product store if needed
  const { products, fetchProducts } = useProductStore();

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Synchronize component lifecycle with global application states
  useEffect(() => {
    if (fetchVendorDashboardData) fetchVendorDashboardData();
    if (fetchProducts && products.length === 0) fetchProducts();
  }, []);

  // Loading state placeholder if stores haven't settled yet
  if (isOrdersLoading && !stats) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-pulse text-gray-600 text-[10px] uppercase font-black tracking-widest font-mono">
          Synchronizing Live Storefront Arrays...
        </div>
      </div>
    );
  }

  // Graceful fallback if stats object isn't fully structured yet
  const activeStats = stats || {
    revenue: 0,
    activeOrders: orders.filter(o => o.status === 'PENDING').length,
    productCount: products.length
  };

  const handleStatusChange = async (orderId: string, nextStatus: 'PENDING' | 'DELIVERED' | 'SHIPPED' | 'CANCELLED') => {
    if (!updateOrderStatus) return;
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, nextStatus);
    } catch (err) {
      console.error("Failed store state status transition reconciliation:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const statCards = [
    { 
      label: "Revenue", 
      value: `${activeStats.revenue.toLocaleString()} RWF`, 
      icon: <DollarSign size={20} />, 
      color: "text-green-500",
      bg: "bg-green-500/5"
    },
    { 
      label: "Pending Orders", 
      value: activeStats.activeOrders, 
      icon: <Clock size={20} />, 
      color: "text-amber-500",
      bg: "bg-amber-500/5"
    },
    { 
      label: "Inventory Items", 
      value: activeStats.productCount || products.length, 
      icon: <Package size={20} />, 
      color: "text-purple-500",
      bg: "bg-purple-500/5"
    },
    { 
      label: "Market Growth", 
      value: "+12.4%", 
      icon: <TrendingUp size={20} />, 
      color: "text-blue-500",
      bg: "bg-blue-500/5"
    },
  ];

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'bg-green-500/5 text-green-500 border-green-500/20';
      case 'SHIPPED': return 'bg-blue-500/5 text-blue-500 border-blue-500/20';
      case 'PENDING': return 'bg-amber-500/5 text-amber-500 border-amber-500/20';
      case 'CANCELLED': return 'bg-rose-500/5 text-rose-500 border-rose-500/20';
      default: return 'bg-white/5 text-gray-400 border-white/5';
    }
  };

  return (
    <div className="space-y-10 pb-10 text-white selection:bg-blue-500/30 font-poppins">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[8px] font-black text-blue-500 uppercase tracking-tighter font-mono">
               Vendor Console
             </div>
          </div>
          <h2 className="text-4xl font-bold tracking-tighter">Command Center</h2>
          <p className="text-gray-500 text-xs mt-1 font-medium italic">
            Real-time telemetry for your Rwanda Marketplace operations.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest font-mono">Database Node</p>
            <div className="flex items-center justify-end gap-2 text-green-500 text-[10px] font-bold font-mono">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
              <ShieldCheck size={12} /> ENCRYPTED LIVE
            </div>
          </div>
        </div>
      </header>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="group p-6 bg-[#0a0a0a] border border-white/5 rounded-4xl hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/5">
            <div className={`w-12 h-12 mb-4 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <p className="text-gray-600 text-[9px] uppercase font-black tracking-[0.2em] font-mono">{stat.label}</p>
            <h3 className="text-2xl font-bold mt-1 tabular-nums tracking-tight">
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Orders Table Container */}
      <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-white/1">
          <div>
            <h3 className="font-bold text-lg tracking-tight">Streamed Transactions</h3>
            <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest mt-1 font-mono">Latest inbound orders</p>
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all border border-white/5 active:scale-95 cursor-pointer">
            Audit Ledger <ExternalLink size={12} />
          </button>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="text-gray-600 border-b border-white/5 bg-white/1">
                <th className="px-8 py-6 font-black uppercase text-[9px] tracking-[0.2em] font-mono">Reference No.</th>
                <th className="px-8 py-6 font-black uppercase text-[9px] tracking-[0.2em] font-mono">Acquisition</th>
                <th className="px-8 py-6 font-black uppercase text-[9px] tracking-[0.2em] font-mono">Settlement</th>
                <th className="px-8 py-6 font-black uppercase text-[9px] tracking-[0.2em] font-mono">Flow Status</th>
                <th className="px-8 py-6 font-black uppercase text-[9px] tracking-[0.2em] font-mono text-right">Orchestration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                       <Package size={32} className="text-gray-800" />
                       <p className="text-gray-600 text-[10px] uppercase font-black tracking-widest font-mono">Null return: No transaction data found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-blue-500/5 transition-colors group">
                    <td className="px-8 py-6">
                       <span className="font-mono text-[11px] text-gray-500 group-hover:text-blue-400 transition-colors bg-white/5 px-2 py-1 rounded-md border border-white/5">
                        #{o.orderNumber}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-gray-300 font-bold text-xs uppercase tracking-tight">{o.user?.name || "Anonymous Guest"}</span>
                        <span className="text-[9px] text-gray-600 font-medium font-mono">Verified Customer</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-mono font-bold text-green-400">
                      +{o.totalAmount.toLocaleString()} <span className="text-[10px] text-green-900 font-sans font-medium">RWF</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        {updatingId === o.id && <Loader2 size={12} className="animate-spin text-blue-500" />}
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase border transition-all ${getStatusStyles(o.status)}`}>
                          {o.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <select
                        value={o.status}
                        disabled={updatingId === o.id}
                        onChange={(e) => handleStatusChange(o.id, e.target.value as any)}
                        className="bg-[#111111] border border-white/5 text-[10px] font-black uppercase tracking-wider text-gray-400 rounded-xl px-3 py-2 outline-none focus:border-blue-500 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <option value="PENDING" className="bg-[#0a0a0a]">Pending</option>
                        <option value="SHIPPED" className="bg-[#0a0a0a]">Shipped</option>
                        <option value="DELIVERED" className="bg-[#0a0a0a]">Delivered</option>
                        <option value="CANCELLED" className="bg-[#0a0a0a]">Cancelled</option>
                      </select>
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

export default VendorContent;