import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { X, Menu } from "lucide-react"; // Recommended for professional icons

type NavProps = {
  className?: string;
  opened: boolean;
  handleToggleMenu: () => void;
};

type NavLinkProps = {
  link: string;
  label: string;
};

const adminLinks: NavLinkProps[] = [
  { link: "/admin/products", label: "Products" },
  { link: "/admin/orders", label: "Orders" },
  { link: "/admin/users", label: "Users" },
];

const AdminSideBar = ({ className, opened, handleToggleMenu }: NavProps) => {
  return (
    <aside
      className={`
        /* Base / Mobile Styles */
        fixed inset-y-0 left-0 z-50 w-64 shadow-xl
        transform transition-transform duration-300 ease-in-out
        ${opened ? "translate-x-0" : "-translate-x-full"}

        /* Desktop Styles - Forced visibility */
        lg:static lg:translate-x-0 lg:shadow-none lg:flex lg:flex-col
      `}
    >
      <div className="flex flex-col h-full border-r border-gray-600">
        {/* Sidebar Header - Only visible on mobile to provide a close button */}
        <div className="p-6 flex justify-between items-center lg:hidden">
          <span className="font-bold text-xl text-green-800">Admin</span>
          <button 
            onClick={handleToggleMenu}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 lg:py-12">
          <NavLink to={'/admin'} className="text-3xl font-bold">
          <h2>Dashboard</h2>
          </NavLink>
          <ul className="space-y-2 text-lg mt-12 font-semibold">
            {adminLinks.map((al, index) => (
              <li key={index}>
                <NavLink
                  to={al.link}
                  // Close menu on mobile after clicking a link
                  onClick={() => { if (window.innerWidth < 1024) handleToggleMenu(); }}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-lg transition-colors ${className} ${
                      isActive
                        ? "bg-green-50 text-green-800 font-bold"
                        : "text-gray-600 hover:bg-gray-50"
                    }`
                  }
                >
                  {al.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
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
    <section className="min-h-screen bg-gray-900 text-gray-100 flex overflow-hidden">
      {/* Sidebar */}
      <AdminSideBar
        opened={opened}
        handleToggleMenu={handleToggleMenu}
        className="font-poppins"
      />
      {/* Overlay (mobile only) */}
      <div
        className={`
          fixed inset-0 bg-black/90 z-40 transition-opacity duration-300 lg:hidden
          ${opened ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={handleToggleMenu}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header: Visible ONLY on mobile */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200 lg:hidden shrink-0">
          <NavLink to={'/admin'}>
          <span className="font-bold text-green-800 text-2xl">Dashboard</span>
          </NavLink>
          <button
            onClick={handleToggleMenu}
            className="p-2 text-gray-500 hover:text-green-800"
          >
            <Menu size={28} />
          </button>
        </header>

        {/* Dynamic Page Content: This part scrolls independently */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-360 mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </section>
  );
}