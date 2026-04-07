import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";

type NavProps = {
  className?: string;
  opened: boolean;
  handleToggleMenu:()=> void
};

type NavLinkProps = {
  link: string;
  label: string;
};

const adminLinks: NavLinkProps[] = [
  { link: "/admin", label: "Dashboard" },
  { link: "/admin/products", label: "Products" },
  { link: "/admin/orders", label: "Orders" },
  { link: "/admin/users", label: "Users" },
];

const AdminSideBar = ({ className, opened,handleToggleMenu }: NavProps) => {
  return (
    <aside
      className={`
        top-0 left-0 z-40 fixed lg:static
        min-h-screen bg-white shadow-md
        transform transition-transform duration-300
        ${opened ? "translate-x-0" : "-translate-x"} w-64 relative
      `}
    >
      <nav className="px-4 py-16">
        <ul className="space-y-4 text-lg">
          {adminLinks.map((al, index) => (
            <li key={index}>
              <NavLink
                to={al.link}
                className={({ isActive }) =>
                  `${className} block ${
                    isActive
                      ? "text-green-800 font-bold"
                      : "text-gray-600"
                  }`
                }
              >
                {al.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <button 
      onClick={handleToggleMenu}
      className="outline-none lg:hidden rounded-full w-10 h-10 border border-gray-500 absolute top-6 right-6 text-gray-600 items-center text-2xl hover:border-red-500 hover:text-red-500 transition-all duration-300">x
      </button>
    </aside>
  );
};

export default function AdminLayout() {
  const [opened, setOpened] = useState(false);

  const handleToggleMenu = () => {
    setOpened((prev) => !prev);
  };

  return (
    <section className="min-h-screen bg-gray-100 admin">
      <div className="flex">
        
        {/* Sidebar */}
        <AdminSideBar
          opened={opened}
          handleToggleMenu={handleToggleMenu}
          className="px-3 py-2 rounded hover:bg-gray-100 transition"
        />

        {/* Overlay (mobile only) */}
        {opened && (
          <div
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
            onClick={handleToggleMenu}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          
          {/* mobile Header */}
          <header className="mb-6 lg:hidden">
            <button
              onClick={handleToggleMenu}
              aria-label="Toggle Menu"
              className="flex flex-col space-y-1"
            >
              <span className="w-8 h-1 bg-gray-500 rounded"></span>
              <span className="w-6 h-1 bg-gray-500 rounded"></span>
              <span className="w-4 h-1 bg-gray-500 rounded"></span>
            </button>
          </header>

          <Outlet />
        </main>
      </div>
    </section>
  );
}