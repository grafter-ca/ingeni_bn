// src/components/layout/VendorLayout.tsx
import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Settings, Menu, X, Store, Bell } from "lucide-react";
import { useOrderStore } from "../../store/useOrderStore";
import { useProductStore } from "../../store/productStore";
import Logout from "../../components/ui/Logout";

const VendorLayout = () => {
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { orders, fetchVendorOrders } = useOrderStore();
  const { fetchCategories, fetchVendorProducts } = useProductStore();

  useEffect(() => {
    fetchVendorOrders();
    fetchVendorProducts();
    fetchCategories();
  }, [fetchVendorOrders, fetchVendorProducts, fetchCategories]);

  const safeOrders = Array.isArray(orders) ? orders : [];
  
  // Calculate total revenue dynamically from vendor orders
  const totalRevenue = safeOrders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
  const pendingCount = safeOrders.filter(o => o.status === 'PENDING').length;

  const menuItems = [
    { name: "Overview", path: "/vendor", icon: <LayoutDashboard size={20} /> },
    { name: "Products & Inventory", path: "/vendor/products", icon: <Package size={20} /> },
    { 
      name: "Customer Orders", 
      path: "/vendor/orders", 
      icon: <ShoppingCart size={20} />, 
      badge: pendingCount > 0 ? pendingCount : null 
    },
    { name: "Store Settings", path: "/vendor/settings", icon: <Settings size={20} /> },
  ];

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex overflow-hidden font-poppins">
      
      {/* 1. MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMenu}
        />
      )}

      {/* 2. SIDEBAR NAVIGATION */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#0c0c0e] border-r border-white/10 p-6 flex flex-col transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:fixed lg:h-screen
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Mobile Close Button */}
        <button 
          aria-label="Close Mobile Menu"
          className="lg:hidden absolute top-6 right-6 p-2 text-gray-400 hover:text-white cursor-pointer"
          onClick={closeMenu}
        >
          <X size={20} />
        </button>

        {/* Brand Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
            <Store size={22} />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400">Vendor Portal</span>
            <h2 className="font-bold text-base text-white tracking-tight">Ingeni Store / Hub</h2>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-2 overflow-y-auto">
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 px-3 mb-2">Workspace Menu</p>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl font-mono text-xs transition-all group ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 font-semibold" 
                    : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? "text-white" : "text-gray-500 group-hover:text-blue-400 transition-colors"}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </div>
                {item.badge ? (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white text-blue-600' : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'}`}>
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="pt-6 border-t border-white/10 space-y-3">
          <div className="px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-xs">
            <span className="text-gray-500 block text-[10px] uppercase">Revenue Balance</span>
            <span className="text-blue-400 font-bold">RWF {totalRevenue.toLocaleString()}</span>
          </div>
          {/* Replaced static link with real context-powered Logout button */}
          <div className="pt-1">
            <Logout />
          </div>
        </div>
      </aside>

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        
        {/* Top Header Bar */}
        <header className="h-20 bg-[#050505]/80 backdrop-blur-xl border-b border-white/10 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              aria-label="Open Mobile Menu"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="font-poppins font-bold text-lg text-white">Vendor Console Dashboard</h1>
              <p className="text-[11px] font-mono text-gray-400 hidden sm:block">Manage storefront inventory, view metrics, and fulfill customer orders.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button aria-label="Notifications" className="p-2.5 rounded-xl bg-[#0c0c0e] border border-white/10 text-gray-400 hover:text-white relative cursor-pointer">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            </button>
          </div>
        </header>

        {/* Page Content Panel */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;