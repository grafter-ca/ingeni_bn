// src/features/admin/vendors/VendorList.tsx
import { memo } from "react";
import { useVendorStore } from "../../../store/vendorStore";
import { Store, Trash2, Edit3, Shield, ShieldOff, Search, SlidersHorizontal } from "lucide-react";

export const VendorList = memo(() => {
  const {
    filteredVendors,
    isLoading,
    searchQuery,
    statusFilter,
    setSearchQuery,
    setStatusFilter,
    clearFilters,
    setEditingVendor,
    fetchVendorDetails,
    removeVendor,
    toggleVendorStatus
  } = useVendorStore();

  return (
    <div className="space-y-6">
      {/* Search and Filters Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0a0a0a] border border-white/10 p-4 rounded-3xl shadow-xl">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search merchants by name, store, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5 bg-black/50 border border-white/10 px-3 py-1.5 rounded-2xl">
            <SlidersHorizontal size={14} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer font-medium"
            >
              <option value="all" className="bg-[#0a0a0a] text-white">All Statuses</option>
              <option value="active" className="bg-[#0a0a0a] text-white">Active Only</option>
              <option value="inactive" className="bg-[#0a0a0a] text-white">Inactive Only</option>
            </select>
          </div>

          {(searchQuery || statusFilter !== "all") && (
            <button
              onClick={clearFilters}
              className="text-xs text-blue-400 hover:underline font-semibold px-2 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Directory Table / Cards Container */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
        {isLoading && filteredVendors.length === 0 ? (
          <div className="p-16 text-center text-gray-500 text-xs font-mono animate-pulse">
            Synchronizing merchant records ledger...
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="p-16 text-center text-gray-500 space-y-2">
            <Store size={36} className="mx-auto text-gray-600" />
            <p className="text-sm font-medium">No merchant records match your filter parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-white/[0.01]">
                  <th className="p-4 pl-6">Merchant Store</th>
                  <th className="p-4">Owner Name</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-medium">
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold shrink-0">
                          {vendor.storeName?.charAt(0)?.toUpperCase() || "S"}
                        </div>
                        <div>
                          <button
                            onClick={() => fetchVendorDetails(vendor.id)}
                            className="font-bold text-white hover:text-blue-400 transition-colors text-left cursor-pointer"
                          >
                            {vendor.storeName}
                          </button>
                          <p className="text-[10px] text-gray-500 font-mono truncate max-w-[200px]">
                            {vendor.description || vendor.businessDescription || "No overview profile details provided."}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-gray-300">
                      {vendor.name}
                    </td>

                    <td className="p-4 text-gray-400 font-mono text-[11px]">
                      <div>{vendor.email}</div>
                      <div className="text-gray-500">{vendor.phone || "No phone listed"}</div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          vendor.isActive
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {vendor.isActive ? <Shield size={10} /> : <ShieldOff size={10} />}
                        {vendor.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => toggleVendorStatus(vendor.id, vendor.isActive)}
                          title={vendor.isActive ? "Deactivate store" : "Activate store"}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-all cursor-pointer"
                        >
                          {vendor.isActive ? <ShieldOff size={14} className="text-amber-400" /> : <Shield size={14} className="text-green-400" />}
                        </button>
                        <button
                          onClick={() => setEditingVendor(vendor)}
                          title="Edit Merchant Details"
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-all cursor-pointer"
                        >
                          <Edit3 size={14} className="text-blue-400" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to remove ${vendor.storeName}?`)) {
                              removeVendor(vendor.id);
                            }
                          }}
                          title="Delete Merchant Record"
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
});

VendorList.displayName = "VendorList";