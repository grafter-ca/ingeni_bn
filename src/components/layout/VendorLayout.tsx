import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Box, ShoppingCart, Settings, LogOut } from "lucide-react";

const VendorLayout = () => {
  const { pathname } = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/vendor", icon: <LayoutDashboard size={20} /> },
    { name: "Inventory", path: "/vendor/inventory", icon: <Box size={20} /> },
    { name: "Orders", path: "/vendor/orders", icon: <ShoppingCart size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col p-6 sticky top-0 h-screen">
        <div className="mb-10 px-2">
          <h1 className="text-xl font-bold bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            WORKFORCE VENDOR
          </h1>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.icon}
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-white/5">
          <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white transition-all">
            <Settings size={20} />
            <span className="text-sm">Store Settings</span>
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/5 rounded-xl transition-all mt-2">
            <LogOut size={20} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet /> {/* This is where VendorContent or Inventory will render */}
      </main>
    </div>
  );
};

export default VendorLayout;