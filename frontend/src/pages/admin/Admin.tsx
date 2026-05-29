import { useEffect, useState } from "react";
import { useProductStore } from "../../store/productStore";
import { useAuthActions } from "../../context/AuthContext";
import { Users, Package, ShoppingCart, ArrowUpRight, Activity } from "lucide-react";
import StatCard from "../../features/admin/home/StatCard";
import { useOrderStore } from "../../store/useOrderStore";

function Admin() {
  // 1. Destructure BOTH the trigger function AND the actual raw array values
  const { fetchProducts, products } = useProductStore();
  const { fetchAllOrders, orders } = useOrderStore();
  const { admin } = useAuthActions();    
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
  });

  // Concurrently download global server data parameters on dashboard initialization
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Run lookups in parallel
        const [userRes] = await Promise.all([
          admin.listUsers({ limit: 1 }),
          fetchProducts(),
          fetchAllOrders()
        ]);
        
        setStats({
          users: userRes?.total || 0,
          orders: useOrderStore.getState().orders?.length || 0,
          products: useProductStore.getState().products?.length || 0,
        });
      } catch (err) {
        console.error("Dashboard Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [admin, fetchProducts, fetchAllOrders]);

  // Keep the dashboard stats in real-time sync with changes to store arrays
  useEffect(() => {
    setStats(prev => ({ 
      ...prev, 
      products: products.length,
      orders: orders.length 
    }));
  }, [products, orders]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-white uppercase">
            Core Overview
          </h1>
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mt-1">
            System Intelligence & Resource Management
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
          <Activity size={14} className="text-blue-500" />
          <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">System Optimal</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Users" 
          value={loading ? "..." : stats.users} 
          icon={<Users size={20} />} 
          color="text-blue-500" 
        />
        <StatCard 
          title="Inventory Assets" 
          value={loading ? "..." : stats.products} 
          icon={<Package size={20} />} 
          color="text-purple-500" 
        />
        <StatCard 
          title="Processed Orders" 
          value={loading ? "..." : stats.orders} 
          icon={<ShoppingCart size={20} />} 
          color="text-amber-500" 
        />
      </div>

      {/* Operational Quick Links */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-gray-700 uppercase tracking-[0.4em] ml-2">Quick Operations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <QuickLink href="/admin/users" label="Registry" desc="Manage User Access" accent="group-hover:text-blue-400" />
          <QuickLink href="/admin/products" label="Inventory" desc="Catalog Control" accent="group-hover:text-purple-400" />
          <QuickLink href="/admin/orders" label="Logistics" desc="Order Processing" accent="group-hover:text-amber-400" />
        </div>
      </div>
    </div>
  );
}

const QuickLink = ({ href, label, desc, accent }: any) => (
  <a
    href={href}
    className="group p-6 bg-[#0a0a0a] border border-white/5 rounded-4xl hover:bg-white/20 transition-all relative overflow-hidden"
  >
    <div className="flex justify-between items-center mb-1">
      <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ${accent} transition-colors`}>
        {label}
      </span>
      <ArrowUpRight size={14} className="text-gray-700 group-hover:text-white transition-colors" />
    </div>
    <p className="text-sm font-bold text-white/80">{desc}</p>
  </a>
);

export default Admin;