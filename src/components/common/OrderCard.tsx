import { Package } from 'lucide-react';

const OrderCard = ({ order }: { order: any }) => {
  return (
    <div className="group p-6 bg-[#0f0f0f] border border-white/5 rounded-2xl hover:border-blue-500/30 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
            <Package size={20} />
          </div>
          <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">
            {order.orderNumber}
          </span>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
          order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
        }`}>
          {order.status}
        </div>
      </div>

      <div className="space-y-2">
        {order.items.map((item: any) => (
          <div key={item.id} className="flex justify-between text-sm text-gray-400">
            <span>{item.product.title} x{item.quantity}</span>
            <span>${item.priceAtPurchase}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Paid via {order.paymentMethod.replace('_', ' ')}
        </span>
        <span className="text-white font-bold text-lg">${order.totalAmount}</span>
      </div>
    </div>
  );
};

export default OrderCard;