import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Box, ShoppingCart, Settings, Menu, X } from "lucide-react";
import Logout from "../ui/Logout";

const VendorLayout = () => {
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: "Inventory", path: "/vendor", icon: <Box size={20} /> },
    { name: "Orders", path: "/vendor/orders", icon: <ShoppingCart size={20} /> },
  ];

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans">
      
      {/* 1. MOBILE OVERLAY (Darkens background when menu is open) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMenu}
        />
      )}

      {/* 2. SIDEBAR (Side-Fixed on desktop layout structures) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#050505] border-r border-white/5 p-6 transform transition-transform duration-300 ease-in-out flex flex-col
        lg:translate-x-0 lg:fixed lg:h-screen
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Mobile Close Button */}
        <button 
          className="lg:hidden absolute top-6 right-6 p-2 text-gray-400 cursor-pointer"
          onClick={closeMenu}
        >
          <X size={24} />
        </button>

        <div className="mb-10 px-2">
          <h1 className="text-xl font-black tracking-tighter bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent uppercase font-mono">
            Vendor Console
          </h1>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                    : "text-gray-500 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className={isActive ? "text-white" : "group-hover:text-blue-400 transition-colors"}>
                  {item.icon}
                </span>
                <span className="font-bold text-sm tracking-tight">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-white/5">
          <Link 
            to="/settings" 
            onClick={closeMenu}
            className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white transition-all mb-2 group"
          >
            <Settings size={20} className="group-hover:text-blue-400 transition-colors" />
            <span className="text-sm font-bold tracking-tight">Store Settings</span>
          </Link>
          <Logout />
        </div>
      </aside>

      {/* 3. MAIN CONTENT AREA (Offset by pl-72 on large screens to accommodate the fixed sidebar) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        
        {/* MOBILE TOPBAR (Only visible on small viewports) */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-30">
          <h1 className="text-sm font-black tracking-widest text-blue-500 uppercase font-mono">Console</h1>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 bg-white/5 rounded-xl text-gray-400 active:scale-95 transition-all cursor-pointer"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* PAGE CONTENT PANEL */}
        <main className="flex-1 p-5 md:p-8 lg:p-10">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;