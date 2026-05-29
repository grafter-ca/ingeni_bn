import { useEffect } from "react";
import { useVendorStore } from "../../store/vendorStore";
import VendorContent from "../../features/vendor/VendorContent"; 
import { RefreshCw, AlertCircle } from "lucide-react";

const VendorOrdersPage = () => {
  const { fetchVendorDashboardData, isLoading, error } = useVendorStore();

  // Initialize pipeline telemetry on mount
  useEffect(() => {
    fetchVendorDashboardData();
  }, [fetchVendorDashboardData]);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30">
      {/* Structural Context Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        
        {/* Navigation / Breadcrumb Track */}
        <div className="flex items-center gap-2 text-gray-500 text-[10px] uppercase font-black tracking-widest mb-6 font-mono">
          <span className="hover:text-gray-300 transition-colors cursor-pointer">Marketplace</span>
          <span>/</span>
          <span className="hover:text-gray-300 transition-colors cursor-pointer">Vendor Workspace</span>
          <span>/</span>
          <span className="text-blue-500">Order Tracking</span>
        </div>

        {/* Global Error Notice Bar */}
        {error && (
          <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-xs font-mono">
            <AlertCircle size={16} />
            <span>Telemetry Error: {error}</span>
            <button 
              onClick={() => fetchVendorDashboardData()}
              className="ml-auto flex items-center gap-1 px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded-xl transition-all font-black text-[9px] uppercase tracking-wider"
            >
              <RefreshCw size={10} /> Retry Sync
            </button>
          </div>
        )}

        {/* Core Layout Interface Wrapper */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
          
          {/* Main Workspace Display Panel */}
          <div className="xl:col-span-4">
            <div className="relative">
              {/* Optional absolute refresh micro-indicator */}
              {isLoading && (
                <div className="absolute top-4 right-4 flex items-center gap-2 text-blue-500 text-[9px] font-mono uppercase font-black bg-blue-500/5 px-3 py-1.5 rounded-full border border-blue-500/10">
                  <RefreshCw size={10} className="animate-spin" /> Stream Updating...
                </div>
              )}
              
              {/* Inject stateful vendor analytics data grids and transaction logging layout */}
              <VendorContent />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VendorOrdersPage;