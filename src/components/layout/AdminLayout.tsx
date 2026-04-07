import { Outlet, NavLink } from "react-router-dom";

export default function AdminLayout() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2 rounded hover:bg-gray-100 ${isActive ? "bg-gray-200 font-semibold" : "text-gray-700"}`;

  return (
    <section className="min-h-screen bg-gray-100 admin">
      <div className="flex">
        <aside className="w-64 bg-white shadow-md min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              <li><NavLink to="/admin" className={linkClass}>Dashboard</NavLink></li>
              <li><NavLink to="/admin/products" className={linkClass}>Products</NavLink></li>
              <li><NavLink to="/admin/orders" className={linkClass}>Orders</NavLink></li>
              <li><NavLink to="/admin/users" className={linkClass}>Users</NavLink></li>
            </ul>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </section>
  );
}