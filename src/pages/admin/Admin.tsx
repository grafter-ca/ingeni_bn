import { useEffect, useState } from "react";
import { useProductStore } from "../../store/productStore";
import { useOrderStore } from "../../store/useOrderStore";

function Admin() {
  const { products, fetchProducts } = useProductStore();
  const { cart } = useOrderStore(); // Using cart as orders count for demo

  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0 });
  const [usersData, setUsersData] = useState([]);

useEffect(() => {
  const fetchUsers = async () => {
    const res = await fetch("/admin/users");
    const data = await res.json();
    setUsersData(data);
  };
  fetchUsers();
}, []);
  
  useEffect(() => {
    // Fetch products for dashboard
    fetchProducts().then(() => {
      setStats((prev) => ({ ...prev, products: products.length }));
    });

    // Fetch users from API
    fetch("/admin/users")
      .then((res) => res.json())
      .then((data) => setStats((prev) => ({ ...prev, users: usersData.length || data.length })))
      .catch(console.error);


    // Count of orders/cart for demo
    setStats((prev) => ({ ...prev, orders: cart.length }));
  }, [products.length, cart.length]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <p className="text-gray-500">Users</p>
          <p className="text-3xl font-bold text-gray-800">{stats.users}</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <p className="text-gray-500">Products</p>
          <p className="text-3xl font-bold text-gray-800">{stats.products}</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <p className="text-gray-500">Orders</p>
          <p className="text-3xl font-bold text-gray-800">{stats.orders}</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a href="/admin/users" className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 text-center font-medium text-blue-700">
          Manage Users
        </a>
        <a href="/admin/products" className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 text-center font-medium text-green-700">
          Manage Products
        </a>
        <a href="/admin/orders" className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 text-center font-medium text-purple-700">
          Manage Orders
        </a>
      </div>
    </div>
  );
}

export default Admin;