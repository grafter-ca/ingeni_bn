import { DollarSign, Package, TrendingUp, Clock, ExternalLink, ShieldCheck } from "lucide-react";

// --- TYPES ---
export interface VendorStats {
  revenue: number; // Changed to number for easier calculation/formatting
  activeOrders: number;
  productCount: number;
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: 'PENDING' | 'DELIVERED' | 'SHIPPED' | 'CANCELLED';
  user?: {
    name: string;
  };
  createdAt: string;
}

interface VendorContentProps {
  stats: VendorStats | null;
  orders: Order[];
}

const VendorContent = ({ stats, orders }: VendorContentProps) => {
  // Loading state placeholder if stats haven't arrived yet
  if (!stats) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-pulse text-gray-600 text-[10px] uppercase font-black tracking-widest">
          Synchronizing Ledger...
        </div>
      </div>
    );
  }

  const statCards = [
    { 
      label: "Revenue", 
      value: `${stats.revenue.toLocaleString()} RWF`, 
      icon: <DollarSign size={20} />, 
      color: "text-green-500",
      bg: "bg-green-500/5"
    },
    { 
      label: "Pending Orders", 
      value: stats.activeOrders, 
      icon: <Clock size={20} />, 
      color: "text-amber-500",
      bg: "bg-amber-500/5"
    },
    { 
      label: "Inventory Items", 
      value: stats.productCount, 
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

  return (
    <div className="space-y-10 pb-10 text-white selection:bg-blue-500/30">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[8px] font-black text-blue-500 uppercase tracking-tighter">
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
            <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Database Node</p>
            <div className="flex items-center justify-end gap-2 text-green-500 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
              <ShieldCheck size={12} /> ENCRYPTED LIVE
            </div>
          </div>
        </div>
      </header>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="group p-6 bg-[#0a0a0a] border border-white/5 rounded-[2rem] hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/5">
            <div className={`w-12 h-12 mb-4 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <p className="text-gray-600 text-[9px] uppercase font-black tracking-[0.2em]">{stat.label}</p>
            <h3 className="text-2xl font-bold mt-1 tabular-nums tracking-tight">
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Orders Table Container */}
      <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
          <div>
            <h3 className="font-bold text-lg tracking-tight">Streamed Transactions</h3>
            <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest mt-1">Latest inbound orders</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all border border-white/5 active:scale-95">
            Audit Ledger <ExternalLink size={12} />
          </button>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="text-gray-600 border-b border-white/5">
                <th className="px-8 py-6 font-black uppercase text-[9px] tracking-[0.2em]">Reference No.</th>
                <th className="px-8 py-6 font-black uppercase text-[9px] tracking-[0.2em]">Acquisition</th>
                <th className="px-8 py-6 font-black uppercase text-[9px] tracking-[0.2em]">Settlement</th>
                <th className="px-8 py-6 font-black uppercase text-[9px] tracking-[0.2em]">Flow Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                       <Package size={32} className="text-gray-800" />
                       <p className="text-gray-600 text-[10px] uppercase font-black tracking-widest">Null return: No transaction data found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-blue-500/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                       <span className="font-mono text-[11px] text-gray-500 group-hover:text-blue-400 transition-colors bg-white/5 px-2 py-1 rounded-md">
                        #{o.orderNumber}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-gray-300 font-bold text-xs uppercase tracking-tight">{o.user?.name || "Anonymous Guest"}</span>
                        <span className="text-[9px] text-gray-600 font-medium">Verified Customer</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-mono font-bold text-green-400">
                      +{o.totalAmount.toLocaleString()} <span className="text-[10px] text-green-900">RWF</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase border ${
                        o.status === 'DELIVERED' 
                          ? 'bg-green-500/5 text-green-500 border-green-500/20' 
                          : 'bg-amber-500/5 text-amber-500 border-amber-500/20'
                      }`}>
                        {o.status}
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

export default VendorContent;