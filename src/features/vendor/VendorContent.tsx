import { DollarSign, Package, TrendingUp, Clock } from "lucide-react";

const VendorContent = ({ stats, orders }: any) => {
  const statCards = [
    { label: "Total Revenue", value: `$${stats.revenue}`, icon: <DollarSign className="text-green-500" /> },
    { label: "Active Orders", value: stats.activeOrders, icon: <Clock className="text-blue-500" /> },
    { label: "Total Products", value: stats.productCount, icon: <Package className="text-purple-500" /> },
    { label: "Platform Rank", value: "Top 10%", icon: <TrendingUp className="text-orange-500" /> },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header>
        <h2 className="text-3xl font-bold">Welcome back, Vendor</h2>
        <p className="text-gray-500 text-sm mt-1">Here is what's happening with your store today.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="p-6 bg-[#0a0a0a] border border-white/5 rounded-3xl hover:border-white/10 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/5 rounded-lg">{stat.icon}</div>
            </div>
            <p className="text-gray-500 text-xs uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Recent Activity / Simplified Orders Table */}
      <div className="bg-[#0a0a0a] border border-white/5 rounded-4xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-bold">Recent Store Orders</h3>
          <button className="text-blue-500 text-xs hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-white/5">
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.length === 0 ? (
                <tr><td colSpan={4} className="p-10 text-center text-gray-600">No recent orders yet.</td></tr>
              ) : (
                orders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{o.orderNumber}</td>
                    <td className="px-6 py-4 text-gray-300">{o.user?.name || "Guest"}</td>
                    <td className="px-6 py-4 font-semibold">${o.totalAmount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                        o.status === 'DELIVERED' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
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