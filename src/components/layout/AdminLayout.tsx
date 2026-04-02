import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <section className="min-h-screen bg-gray-100 admin">
        {/* this admin layout with outlet component . sidebar , topbar and main content as outlet */}
        <div className="flex">
            <aside className="w-64 bg-white shadow-md">
                <nav className="p-4">
                    <ul className="space-y-4">
                        <li><a href="/admin" className="text-gray-700 hover:text-gray-900">Dashboard</a></li>
                        <li><a href="/admin/products" className="text-gray-700 hover:text-gray-900">Products</a></li>
                        <li><a href="/admin/orders" className="text-gray-700 hover:text-gray-900">Orders</a></li>
                        <li><a href="/admin/users" className="text-gray-700 hover:text-gray-900">Users</a></li>
                    </ul>
                </nav>
            </aside>
            <main className="flex-1 p-6">
                 <Outlet />
             </main>
        </div>
    </section>
  )
}
