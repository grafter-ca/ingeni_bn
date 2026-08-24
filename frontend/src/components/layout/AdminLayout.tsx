import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { X, Menu, LayoutGrid, Package, ShoppingCart, Users, User, LayersPlusIcon } from "lucide-react";
import Logout from "../ui/Logout";

type NavProps = {
  className?: string;
  opened: boolean;
  handleToggleMenu: () => void;
};

type NavLinkProps = {
  link: string;
  label: string;
  icon: React.ReactNode;
};

const adminLinks: NavLinkProps[] = [
  { link: "/admin/categories", label: "Categories", icon: <LayersPlusIcon size={20} /> },
  { link: "/admin/products", label: "Products", icon: <Package size={20} /> },
  { link: "/admin/orders", label: "Orders", icon: <ShoppingCart size={20} /> },
  { link: "/admin/vendors", label: "Vendors", icon: <User size={20} /> },
  { link: "/admin/users", label: "Users", icon: <Users size={20} /> },
];

const AdminSideBar = ({ opened, handleToggleMenu }: NavProps) => {
  return (
    <aside
      className={`
        /* Base / Mobile Styles */
        fixed inset-y-0 left-0 z-50 w-64 bg-[#050505] border-r border-white/5 p-6 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${opened ? "translate-x-0" : "-translate-x-full"}

        /* Desktop Styles - Side-Fixed Pipeline */
        lg:translate-x-0 lg:fixed lg:h-screen
      `}
    >
      {/* Sidebar Header */}
      <div className="mb-10 flex justify-between items-center px-2">
        <NavLink to="/admin" className="group">
          <h1 className="text-xl font-black tracking-tighter bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent uppercase font-mono">
            Admin HQ
          </h1>
        </NavLink>
        
        {/* Mobile Close Button */}
        <button 
          onClick={handleToggleMenu}
          className="lg:hidden p-2 text-gray-400 bg-white/5 rounded-xl hover:text-white transition-all cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Navigation Track */}
      <nav className="flex-1 space-y-2">
        <NavLink
          to="/admin"
          end
          onClick={() => { if (window.innerWidth < 1024) handleToggleMenu(); }}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group ${
              isActive
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-gray-500 hover:bg-white/5 hover:text-white"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className={isActive ? "text-white" : "group-hover:text-blue-400 transition-colors"}>
                <LayoutGrid size={20} />
              </span>
              <span className="font-bold text-sm tracking-tight">Overview</span>
            </>
          )}
        </NavLink>

        <div className="pt-4 pb-2 px-4">
          <p className="text-[9px] font-black tracking-[0.2em] text-gray-600 uppercase font-mono">Management</p>
        </div>

        <ul className="space-y-2">
          {adminLinks.map((al, index) => (
            <li key={index}>
              <NavLink
                to={al.link}
                onClick={() => { if (window.innerWidth < 1024) handleToggleMenu(); }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "text-gray-500 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={isActive ? "text-white" : "group-hover:text-blue-400 transition-colors"}>
                      {al.icon}
                    </span>
                    <span className="font-bold text-sm tracking-tight">{al.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <Logout />
      {/* System Integrity Footer */}
      <div className="pt-4 mt-4 border-t border-white/5 px-2 text-gray-600 text-[9px] font-mono uppercase tracking-widest">
        Root Privilege Node
      </div>
    </aside>
  );
};

export default function AdminLayout() {
  const [opened, setOpened] = useState(false);

  const handleToggleMenu = () => {
    setOpened((prev) => !prev);
  };

  return (
    <section className="min-h-screen bg-[#050505] text-white flex selection:bg-blue-500/30 font-sans">
      
      {/* Sidebar Interface */}
      <AdminSideBar
        opened={opened}
        handleToggleMenu={handleToggleMenu}
      />

      {/* Mobile Glassmorphic Overlay */}
      {opened && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={handleToggleMenu}
        />
      )}

      {/* Main Content Node Container (Offset padding layout balance: pl-64) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        
        {/* Mobile Header: Visible ONLY on mobile targets */}
        <header className="h-16 flex items-center justify-between px-6 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 lg:hidden shrink-0 sticky top-0 z-30">
          <NavLink to="/admin">
            <span className="font-black tracking-widest text-blue-500 text-sm font-mono uppercase">Dashboard</span>
          </NavLink>
          <button
            onClick={handleToggleMenu}
            className="p-2 bg-white/5 rounded-xl text-gray-400 active:scale-95 transition-all cursor-pointer hover:text-white"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Dynamic Page Content Stream */}
        <main className="flex-1 p-5 md:p-8 lg:p-10">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </section>
  );
}