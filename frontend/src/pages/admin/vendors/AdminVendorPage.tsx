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

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  return (
    <div className="min-h-screen bg-[#050505] p-8 text-white max-w-7xl mx-auto">
      <header className="mb-8 border-b border-white/10 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <Store className="text-blue-500" size={32} /> Merchant Ecosystem
        </h1>
        <p className="mt-2 text-gray-400 text-sm">
          Manage store onboarding requests, review merchant verification parameters, monitor operational metrics, and control fulfillment performance.
        </p>
      </header>

      <main className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Main Workspace Section */}
        <section className="lg:col-span-8">
          {error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300 text-sm">
              {error}
            </div>
          ) : (
            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-xl">
              <VendorManagement />
            </div>
          )}
        </section>

        {/* Operational Sidebar Overview */}
        <aside className="space-y-6 lg:col-span-4">
          <div className="rounded-3xl border border-white/10 bg-[#0a0a0a] p-6 shadow-xl space-y-5">
            <h3 className="font-bold text-base text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <TrendingUp size={18} className="text-blue-500" /> Operational Overview
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center bg-white/[0.02] p-3 rounded-xl border border-white/5">
                <span className="text-gray-400 flex items-center gap-2">
                  <Store size={15} className="text-blue-400" /> Total Active Vendors
                </span>
                <span className="font-bold text-white text-base">{vendors.length}</span>
              </div>

              <div className="flex justify-between items-center bg-white/[0.02] p-3 rounded-xl border border-white/5">
                <span className="text-gray-400 flex items-center gap-2">
                  <UserCheck size={15} className="text-amber-400" /> Pending Requests
                </span>
                <span className="font-bold text-amber-400 text-base">{pendingRequests.length}</span>
              </div>

              <div className="flex justify-between items-center bg-white/[0.02] p-3 rounded-xl border border-white/5">
                <span className="text-gray-400">Ecosystem Revenue</span>
                <span className="font-bold text-white">
                  {stats?.revenue?.toLocaleString() ?? "0"} RWF
                </span>
              </div>

              <div className="flex justify-between items-center bg-white/[0.02] p-3 rounded-xl border border-white/5">
                <span className="text-gray-400 flex items-center gap-2">
                  <Package size={15} className="text-indigo-400" /> Pending Orders
                </span>
                <span className="font-bold text-white">{stats?.activeOrders ?? "--"}</span>
              </div>

              <div className="flex justify-between items-center bg-white/[0.02] p-3 rounded-xl border border-white/5">
                <span className="text-gray-400">Total Products Listed</span>
                <span className="font-bold text-white">{stats?.productCount ?? "--"}</span>
              </div>

              <div className="flex justify-between items-center bg-white/[0.02] p-3 rounded-xl border border-white/5 pt-3">
                <span className="text-gray-400 flex items-center gap-2">
                  <ShieldCheck size={15} className="text-green-400" /> System Status
                </span>
                <span
                  className={`font-semibold text-xs px-2.5 py-1 rounded-full border ${
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