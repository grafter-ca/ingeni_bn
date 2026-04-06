import  { useEffect, useState } from 'react';
import { ShoppingBag, Loader2, AlertCircle } from 'lucide-react';
import { OrderClient } from '../services/order.service'; // Ensure this matches your file name
import OrderCard from '../components/common/OrderCard';
import type { Order } from '../types/api';

const MyOrders = () => {
  // 1. Define the state with the Order type to fix mapping errors
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // 2. Use the clean client call
        const data = await OrderClient.getMyOrders();
        setOrders(data);
      } catch (err: any) {
        console.error("Failed to fetch orders:", err);
        setError("Could not load your purchase history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-500" size={40} />
          <p className="text-gray-500 animate-pulse">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Purchase History</h1>
            <p className="text-gray-500 text-sm mt-1">Manage and track your workforce orders</p>
          </div>
          <div className="bg-white/5 px-4 py-2 rounded-2xl text-sm border border-white/10 text-gray-300 font-medium">
            {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {orders.length === 0 && !error ? (
          <div className="text-center py-24 bg-[#0a0a0a] rounded-4xl border border-dashed border-white/10">
            <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={32} className="text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold">No orders yet</h2>
            <p className="text-gray-500 mt-2 max-w-xs mx-auto">
              Ready to start your first project? Your purchases will appear here.
            </p>
            <button 
              onClick={() => window.location.href = '/products'}
              className="mt-8 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
            >
              Browse Products
            </button>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;