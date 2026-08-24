// src/features/admin/vendors/VendorManagement.tsx
import { useState, useEffect } from "react";
import { useVendorStore } from "../../../store/vendorStore";
import { VendorList } from "./VendorList";
import { VendorForm } from "./VendorForm";
import { VendorDetail } from "./VendorDetail";
import { Store, UserCheck, PlusCircle } from "lucide-react";

export const VendorManagement = () => {
  const {
    vendors,
    pendingRequests,
    fetchVendors,
    fetchPendingRequests,
    initSocketListeners,
    isEditing,
    selectedVendor,
    setEditingVendor,
    approveVendorRequest,
    rejectVendorRequest
  } = useVendorStore();

  const [activeTab, setActiveTab] = useState<"directory" | "requests">("directory");
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  // Approval form state for pending onboarding review
  const [approvalForm, setApprovalForm] = useState({
    storeName: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    fetchVendors();
    fetchPendingRequests();
    initSocketListeners();
  }, [fetchVendors, fetchPendingRequests, initSocketListeners]);

  const handleOpenApprovalModal = (req: any) => {
    setSelectedRequest(req);
    setApprovalForm({
      storeName: req.storeName || req.user?.name ? `${req.user.name}'s Store` : "New Store",
      phone: req.phone || "",
      address: req.address || ""
    });
  };

  const handleExecuteApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    try {
      await approveVendorRequest({
        userId: selectedRequest.user?.id || selectedRequest.userId,
        storeName: approvalForm.storeName,
        description: selectedRequest.businessDescription || selectedRequest.description || "",
        address: approvalForm.address,
        phone: approvalForm.phone
      });
      setSelectedRequest(null);
    } catch (err) {
      // Handled inside store alert / state catch
    }
  };

  return (
    <div className="space-y-6">
      {/* Internal Management Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2 bg-black/40 border border-white/10 p-1 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => { setActiveTab("directory"); setEditingVendor(null); }}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "directory" && !isEditing && !selectedVendor
                ? "bg-blue-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Store size={14} /> Verified Directory ({vendors.length})
          </button>

          <button
            onClick={() => { setActiveTab("requests"); setEditingVendor(null); }}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 relative ${
              activeTab === "requests"
                ? "bg-blue-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <UserCheck size={14} /> Onboarding Requests
            {pendingRequests.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-black text-[10px] font-black flex items-center justify-center animate-pulse">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "directory" && !isEditing && !selectedVendor && (
          <button
            onClick={() => setEditingVendor({} as any)}
            className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
          >
            <PlusCircle size={15} /> Provision New Merchant
          </button>
        )}
      </div>

      {/* Conditional Content Rendering */}
      {selectedVendor ? (
        <VendorDetail />
      ) : isEditing ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">
              {isEditing.id ? "Modify Enterprise Merchant Record" : "Manually Provision Vendor Profile"}
            </h3>
          </div>
          <VendorForm />
        </div>
      ) : activeTab === "requests" ? (
        <div className="space-y-4">
          <h3 className="text-sm font-bold tracking-wider uppercase text-gray-400">Incoming Merchant Applications Queue</h3>
          {pendingRequests.length === 0 ? (
            <div className="p-16 text-center border border-dashed border-white/10 rounded-2xl bg-black/20 text-gray-500 space-y-2">
              <UserCheck size={36} className="mx-auto text-gray-600" />
              <p className="text-sm font-medium">No pending onboarding applications waiting for validation.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {pendingRequests.map((req) => (
                <div key={req.id} className="bg-black/40 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-white text-base">{req.user?.name || "Anonymous Partner"}</h4>
                      <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded-md">
                        {req.user?.email}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 max-w-xl">{req.businessDescription || req.description || "No description provided."}</p>
                    <span className="text-[10px] text-gray-500 font-mono">Submitted: {req.submittedAt ? new Date(req.submittedAt).toLocaleString() : "Recent"}</span>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => handleOpenApprovalModal(req)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                    >
                      Review & Approve
                    </button>
                    <button
                      onClick={() => rejectVendorRequest(req.id)}
                      className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <VendorList />
      )}

      {/* Approval Modal Configuration Box */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Store size={18} className="text-blue-500" /> Complete Vendor Setup
              </h3>
              <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-white text-sm cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleExecuteApproval} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Assigned Store Name</label>
                <input
                  type="text"
                  required
                  value={approvalForm.storeName}
                  onChange={(e) => setApprovalForm({ ...approvalForm, storeName: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Contact Phone Number</label>
                <input
                  type="text"
                  placeholder="+250 700 000 000"
                  value={approvalForm.phone}
                  onChange={(e) => setApprovalForm({ ...approvalForm, phone: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Store Physical Address</label>
                <input
                  type="text"
                  placeholder="Kigali, Rwanda"
                  value={approvalForm.address}
                  onChange={(e) => setApprovalForm({ ...approvalForm, address: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-lg"
                >
                  Authorize & Create Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};