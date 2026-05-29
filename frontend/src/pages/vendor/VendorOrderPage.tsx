import { useEffect, useState } from 'react';
import { useOrderStore } from '../../store/useOrderStore';
import { Truck, Clock, Eye, ShieldAlert, Loader2, PackageCheck, Layers } from 'lucide-react';

const TRACKING_TABS = ["all", "pending", "shipped", "delivered"];

const VendorOrders = () => {
  // 1. Consume clean, centralized state engines from our unified store layer
  const { 
    fetchVendorOrders, 
    filteredOrders, 
    statusFilter, 
    setStatusFilter, 
    loading, 
    error, 
    updateOrderStatus 
  } = useOrderStore();

  const [inspectingOrder, setInspectingOrder] = useState<any | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Synchronize on catalog initialization mount
  useEffect(() => {
    fetchVendorOrders();
  }, []);

  const handleStatusUpdate = async (id: string, nextStatus: string) => {
    setProcessingId(id);
    try {
      await updateOrderStatus(id, nextStatus);
      // Re-trigger global internal array partitioning calculations instantly
      setStatusFilter(statusFilter);
    } catch (err) {
      console.error("Fulfillment dispatch error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColorConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': 
        return { text: 'text-amber-400', bg: 'bg-amber-500/10', icon: 'text-amber-400 bg-amber-500/10' };
      case 'shipped': 
        return { text: 'text-blue-400', bg: 'bg-blue-500/10', icon: 'text-blue-400 bg-blue-500/10' };
      case 'delivered': 
        return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: 'text-emerald-400 bg-emerald-500/10' };
      default: 
        return { text: 'text-gray-400', bg: 'bg-white/5', icon: 'text-gray-400 bg-white/5' };
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 font-poppins text-white max-w-5xl mx-auto p-2">
      
      {/* --- SECTION TITLE HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase text-white">
            Customer Shipments
          </h1>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-1">
            Fulfill Storefront Allocations & Update Dispatches
          </p>
        </div>

        {/* --- DYNAMIC WORKFLOW PIPELINE TABS --- */}
        <div className="flex bg-[#0a0a0a] border border-white/5 p-1 rounded-2xl gap-1">
          {TRACKING_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === tab 
                  ? "bg-white text-black shadow-md" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* --- ERROR MESSAGE DISPLAY --- */}
      {error && (
        <div className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-3">
          <ShieldAlert size={16} /> {error}
        </div>
      )}

      {/* --- SYSTEM CARDS RENDER GRID --- */}
      {loading && filteredOrders.length === 0 ? (
        <div className="p-24 flex flex-col items-center justify-center text-gray-500 gap-3 bg-[#0a0a0a] border border-white/5 rounded-4xl">
          <Loader2 className="animate-spin text-green-500" size={32} />
          <p className="text-xs font-mono tracking-widest uppercase text-gray-400">Syncing local manifests...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-24 text-center text-gray-500 space-y-3 bg-[#0a0a0a] border border-white/5 rounded-4xl">
          <Layers className="mx-auto text-gray-700" size={40} />
          <p className="text-xs font-bold tracking-wider uppercase text-gray-400">
            No orders queued under state descriptor: "{statusFilter}"
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => {
            const colors = getStatusColorConfig(order.status);
            return (
              <div 
                key={order.id} 
                className="bg-[#0a0a0a] border border-white/5 rounded-4xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-white/10 transition-all"
              >
                <div className="flex gap-5 items-center">
                  <div className={`p-4 rounded-2xl transition-colors ${colors.icon}`}>
                    <Clock size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg font-mono tracking-tight group-hover:text-green-400 transition-colors">
                      #{order.id ? order.id.slice(-8).toUpperCase() : "UNKNOWN"}
                    </h4>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"} • {order.items?.length || 0} commodities
                    </p>
                  </div>
                </div>

                <div className="flex md:flex-col items-baseline md:items-end justify-between w-full md:w-auto gap-2">
                  <span className="text-xl font-bold font-mono">
                    {new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(order.totalAmount || 0)}
                  </span>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/5 ${colors.bg} ${colors.text}`}>
                    {order.status || 'PENDING'}
                  </span>
                </div>

                <div className="flex gap-2 w-full md:w-auto pt-2 md:pt-0 border-t border-white/5 md:border-none">
                  {/* Step-down pipeline controls context parameters actions trigger buttons */}
                  {order.status?.toLowerCase() === 'pending' && (
                    <button 
                      disabled={processingId === order.id}
                      onClick={() => handleStatusUpdate(order.id, 'shipped')}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-black px-5 py-3 rounded-2xl font-black hover:bg-gray-200 disabled:opacity-40 transition-all text-xs uppercase tracking-wider cursor-pointer"
                    >
                      <Truck size={14} /> 
                      {processingId === order.id ? 'Routing...' : 'Ship Asset'}
                    </button>
                  )}

                  {order.status?.toLowerCase() === 'shipped' && (
                    <button 
                      disabled={processingId === order.id}
                      onClick={() => handleStatusUpdate(order.id, 'delivered')}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-500 text-white px-5 py-3 rounded-2xl font-black hover:bg-green-400 disabled:opacity-40 transition-all text-xs uppercase tracking-wider cursor-pointer"
                    >
                      <PackageCheck size={14} /> 
                      {processingId === order.id ? 'Clearing...' : 'Confirm Delivery'}
                    </button>
                  )}

                  <button 
                    onClick={() => setInspectingOrder(order)}
                    className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer text-gray-400 hover:text-white"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- INLINE VIEW MANIFEST MODAL SLIDE-OVER OVERLAY --- */}
      {inspectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setInspectingOrder(null)} />
          
          <div className="relative w-full max-w-xl bg-[#0d0d0d] border border-white/10 rounded-4xl overflow-hidden z-10 p-6 space-y-6 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <div>
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Manifest Configuration</h3>
                <p className="text-xl font-bold font-mono mt-0.5 text-white">#{inspectingOrder.id.toUpperCase()}</p>
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${getStatusColorConfig(inspectingOrder.status).bg} ${getStatusColorConfig(inspectingOrder.status).text}`}>
                {inspectingOrder.status}
              </span>
            </div>

            {/* Scrollable container viewport frame */}
            <div className="overflow-y-auto space-y-4 text-xs sm:text-sm subtle-scroll pr-1">
              <div className="bg-white/5 p-4 rounded-3xl space-y-1 border border-white/5">
                <span className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Logistics Destination</span>
                <p className="font-bold text-white/90">{inspectingOrder.shippingAddress?.name || "Client Consortium"}</p>
                <p className="text-gray-400 text-xs">{inspectingOrder.shippingAddress?.street || "Kigali, Sector Hub Location"}</p>
                <p className="text-gray-500 text-xs font-mono mt-1">{inspectingOrder.shippingAddress?.phone || "No phone parameters logged"}</p>
              </div>

              <div className="space-y-2">
                <span className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Line Item Units</span>
                <div className="divide-y divide-white/5 bg-white/2 border border-white/5 rounded-3xl overflow-hidden">
                  {inspectingOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 flex justify-between items-center text-xs sm:text-sm">
                      <div>
                        <p className="font-bold text-white">{item.product?.title || "Marketplace Resource"}</p>
                        <p className="text-gray-500 text-xs mt-0.5">Quantity Order Metric: {item.quantity}</p>
                      </div>
                      <span className="font-mono font-bold text-white">
                        {new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(item.price || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button
                onClick={() => setInspectingOrder(null)}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-wider text-gray-300 transition-colors cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorOrders;