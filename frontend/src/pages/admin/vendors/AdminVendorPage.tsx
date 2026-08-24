// src/pages/admin/AdminVendorPage.tsx
import { memo, useEffect } from "react";
import { VendorManagement } from "../../../features/admin/vendors/VendorManagement";
import { useVendorStore } from "../../../store/vendorStore";
import { Store, UserCheck, TrendingUp, Package, ShieldCheck } from "lucide-react";

const AdminVendorPage = () => {
  const vendors = useVendorStore((state) => state.vendors);
  const isLoading = useVendorStore((state) => state.isLoading);
  const error = useVendorStore((state) => state.error);
  const stats = useVendorStore((state) => state.stats);
  const pendingRequests = useVendorStore((state) => state.pendingRequests);
  const fetchPendingRequests = useVendorStore((state) => state.fetchPendingRequests);
  const fetchStorefrontMetrics = useVendorStore((state) => state.fetchStorefrontMetrics);

  useEffect(() => {
    fetchPendingRequests();
    fetchStorefrontMetrics();
  }, [fetchPendingRequests, fetchStorefrontMetrics]);

  return (
    <div className="min-h-screen bg-[#050505] p-6 lg:p-8 text-white max-w-[1440px] mx-auto space-y-8">
      {/* Header Section */}
      <header className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Store className="text-blue-500" size={30} /> Merchant Ecosystem
          </h1>
          <p className="mt-1.5 text-gray-400 text-xs lg:text-sm">
            Manage store onboarding requests, review merchant verification parameters, monitor operational metrics, and control fulfillment performance.
          </p>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-300 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Main Balanced Grid Layout */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Workspace Section */}
        <section className="lg:col-span-8 bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-xl min-h-[600px]">
          <VendorManagement />
        </section>

        {/* Operational Sidebar Overview */}
        <aside className="lg:col-span-4 space-y-6 sticky top-8">
          <div className="rounded-3xl border border-white/10 bg-[#0a0a0a] p-6 shadow-xl space-y-5">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-white/10 pb-3 uppercase tracking-wider">
              <TrendingUp size={16} className="text-blue-500" /> Operational Overview
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-3.5 rounded-2xl border border-white/5">
                <span className="text-gray-400 flex items-center gap-2 font-medium">
                  <Store size={14} className="text-blue-400" /> Total Active Vendors
                </span>
                <span className="font-bold text-white text-sm">{vendors.length}</span>
              </div>

              <div className="flex justify-between items-center bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-3.5 rounded-2xl border border-white/5">
                <span className="text-gray-400 flex items-center gap-2 font-medium">
                  <UserCheck size={14} className="text-amber-400" /> Pending Requests
                </span>
                <span className="font-bold text-amber-400 text-sm">{pendingRequests.length}</span>
              </div>

              <div className="flex justify-between items-center bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-3.5 rounded-2xl border border-white/5">
                <span className="text-gray-400 font-medium">Ecosystem Revenue</span>
                <span className="font-bold text-white text-sm">
                  {stats?.revenue?.toLocaleString() ?? "0"} RWF
                </span>
              </div>

              <div className="flex justify-between items-center bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-3.5 rounded-2xl border border-white/5">
                <span className="text-gray-400 flex items-center gap-2 font-medium">
                  <Package size={14} className="text-indigo-400" /> Pending Orders
                </span>
                <span className="font-bold text-white text-sm">{stats?.activeOrders ?? 0}</span>
              </div>

              <div className="flex justify-between items-center bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-3.5 rounded-2xl border border-white/5">
                <span className="text-gray-400 font-medium">Total Products Listed</span>
                <span className="font-bold text-white text-sm">{stats?.productCount ?? vendors.length}</span>
              </div>

              <div className="flex justify-between items-center bg-white/[0.02] p-3.5 rounded-2xl border border-white/5 pt-3.5 mt-2">
                <span className="text-gray-400 flex items-center gap-2 font-medium">
                  <ShieldCheck size={14} className="text-green-400" /> System Status
                </span>
                <span
                  className={`font-semibold text-[11px] px-2.5 py-1 rounded-full border ${
                    isLoading
                      ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      : "bg-green-500/10 text-green-400 border-green-500/20"
                  }`}
                >
                  {isLoading ? "Synchronizing..." : "Healthy"}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default memo(AdminVendorPage);