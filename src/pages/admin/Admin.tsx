import { useEffect, useState } from "react";
import { useProductStore } from "../../store/productStore";
import type { Stats } from "../../types/admin";
import { StatCard } from "../../features/admin/StatCard";
import {useCartStore} from "../../store/cartStore";

function Admin() {
  const { products, fetchProducts } = useProductStore();
  const { getTotalItems } = useCartStore();

  const [stats, setStats] = useState<Stats>({
    users: 0,
    products: 0,
    orders: 0,
  });

  // ✅ Fetch users
  useEffect(() => {
    
    const fetchUsers = async () => {
      try {
        const res = await fetch("/admin/users");
        const data = await res.json();

        setStats((prev) => ({
          ...prev,
          users: data.length, // ✅ use fresh data directly
        }));
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchUsers();
  }, []);

  // ✅ Fetch orders
  useEffect(() => {
   const fetchOrders = async () => {
      try {
        const res = await fetch("/orders/admin/all");
        const data = await res.json();

        setStats((prev) => ({
          ...prev,
          orders: data.length, // ✅ use fresh data directly
        }));
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchOrders();
  }, []);

  // ✅ Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);


  // ✅ Update stats when data changes
  useEffect(() => {
    setStats((prev) => ({
      ...prev,
      products: products.length,
      orders: getTotalItems.length,
    }));
  }, [products.length, getTotalItems.length]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Admin Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Users" value={stats.users} />
        <StatCard title="Products" value={stats.products} />
        <StatCard title="Orders" value={stats.orders} />
      </div>

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a
          href="/admin/users"
          className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 text-center font-medium text-blue-700"
        >
          Manage Users
        </a>

        <a
          href="/admin/products"
          className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 text-center font-medium text-green-700"
        >
          Manage Products
        </a>

        <a
          href="/admin/orders"
          className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 text-center font-medium text-purple-700"
        >
          Manage Orders
        </a>
      </div>
    </div>
  );
}

export default Admin;