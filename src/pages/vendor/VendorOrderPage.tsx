import { useEffect, useState } from 'react';
import { OrderClient } from '../../services/order.service';
import {  Truck, Clock, Eye } from 'lucide-react';
import type { Order } from '../../types/api';

const VendorOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await OrderClient.getVendorOrders();
        setOrders(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await OrderClient.updateStatus(id, status);
      // Refresh local state
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: status as any } : o));
    } catch (err) { alert("Failed to update status"); }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold">Customer Orders</h1>
        <p className="text-gray-500 text-sm">Fulfill orders and update shipping statuses.</p>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-[#0a0a0a] border border-white/5 rounded-4xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex gap-6 items-center">
              <div className="bg-blue-500/10 p-4 rounded-2xl text-blue-500">
                <Clock size={24} />
              </div>
              <div>
                <h4 className="font-bold text-lg">#{order.orderNumber}</h4>
                <p className="text-gray-500 text-sm">{new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items</p>
              </div>
            </div>

            <div className="flex flex-col md:items-end">
              <span className="text-xl font-bold mb-1">${order.totalAmount.toLocaleString()}</span>
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                order.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'
              }`}>
                {order.status}
              </span>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              {order.status === 'PENDING' && (
                <button 
                  onClick={() => handleStatusUpdate(order.id, 'SHIPPED')}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-black px-5 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all text-sm"
                >
                  <Truck size={16} /> 
                  {loading ? 'Updating...' : 'Mark as Shipped'}
                </button>
              )}
              <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                <Eye size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorOrders;