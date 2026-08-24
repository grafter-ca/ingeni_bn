import { useEffect, useState } from "react";
import { 
  Store, 
  CheckCircle2, 
  XCircle, 
  Mail, 
  User, 
  Calendar, 
  ShieldAlert, 
  Loader2, 
  MessageSquare,
  DollarSign,
  Building,
  Trash2,
  CheckCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { localApi } from "../../../libs/api";

interface OnboardingRequest {
  id: string;
  user: { id: string; name: string; email: string };
  businessDescription: string;
  submittedAt: string;
}

interface AdminRequest {
  id: string;
  vendorId: string;
  type: string;
  amount?: string;
  message: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
  vendor?: { storeName: string; phone?: string };
}

export default function AdminVendorRequests() {
  const [activeTab, setActiveTab] = useState<"onboarding" | "inquiries">("onboarding");
  const [onboardingRequests, setOnboardingRequests] = useState<OnboardingRequest[]>([]);
  const [adminQueries, setAdminQueries] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Approval Modal State
  const [selectedRequest, setSelectedRequest] = useState<OnboardingRequest | null>(null);
  const [formData, setFormData] = useState({
    storeName: "",
    description: "",
    address: "",
    phone: "",
  });

  // Reply / Response Modal State
  const [respondingQuery, setRespondingQuery] = useState<AdminRequest | null>(null);
  const [adminReplyNotes, setAdminReplyNotes] = useState("");
  const [replyStatus, setReplyStatus] = useState("RESOLVED");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const requests = await localApi.get<OnboardingRequest[]>("/vendors/requests");
      setOnboardingRequests(requests || []);

      try {
        const queries = await localApi.get<AdminRequest[]>("/vendors/admin-requests");
        setAdminQueries(queries || []);
      } catch {
        setAdminQueries([]);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load vendor requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const handleOpenApproveModal = (req: OnboardingRequest) => {
    setSelectedRequest(req);
    setFormData({
      storeName: `${req.user.name}'s Store`,
      description: req.businessDescription,
      address: "Kigali, Rwanda",
      phone: "+2507",
    });
  };

  const handleApproveOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      await localApi.post("/vendors/requests/approve", {
        userId: selectedRequest.user.id,
        ...formData,
      });
      toast.success(`Store "${formData.storeName}" approved & provisioned successfully!`);
      setSelectedRequest(null);
      void fetchData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to approve vendor onboarding request.");
    }
  };

  const handleRejectOnboarding = async (requestId: string) => {
    if (!window.confirm("Are you sure you want to reject this vendor application?")) return;
    try {
      await localApi.delete(`/vendors/requests/${requestId}`);
      toast.success("Vendor request rejected.");
      void fetchData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to reject request.");
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondingQuery) return;

    try {
      await localApi.patch(`/vendors/admin-requests/${respondingQuery.id}`, {
        status: replyStatus,
        adminNotes: adminReplyNotes,
      });
      toast.success("Response sent & request status updated successfully!");
      setRespondingQuery(null);
      setAdminReplyNotes("");
      void fetchData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit response.");
    }
  };

  // Quick Status Update Handler from Card Dropdown
  const handleQuickStatusChange = async (queryId: string, newStatus: string) => {
    try {
      await localApi.patch(`/vendors/admin-requests/${queryId}`, {
        status: newStatus,
      });
      toast.success(`Status updated to ${newStatus}`);
      void fetchData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update status.");
    }
  };

  const handleDeleteQuery = async (queryId: string) => {
    if (!window.confirm("Are you sure you want to archive/delete this resolved query?")) return;
    try {
      await localApi.delete(`/vendors/admin-requests/${queryId}`);
      toast.success("Query archived successfully.");
      void fetchData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete query.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen text-zinc-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 flex items-center gap-3 tracking-tight">
            <Store className="text-emerald-500" size={32} /> Vendor Onboarding & Queries
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Review merchant partnership applications and manage storefront support messages.
          </p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-3 mb-6 border-b border-zinc-800 pb-4">
        <button
          onClick={() => setActiveTab("onboarding")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "onboarding"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
              : "bg-zinc-900 text-zinc-400 hover:text-zinc-100 border border-zinc-800"
          }`}
        >
          Onboarding Applications ({onboardingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab("inquiries")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "inquiries"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
              : "bg-zinc-900 text-zinc-400 hover:text-zinc-100 border border-zinc-800"
          }`}
        >
          Vendor Support & Cashouts ({adminQueries.length})
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
          <ShieldAlert size={18} /> {error}
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <div className="p-20 flex flex-col items-center justify-center text-zinc-500 gap-3">
          <Loader2 className="animate-spin text-emerald-500" size={36} />
          <p className="text-sm font-medium text-zinc-400">Loading requests queue...</p>
        </div>
      ) : activeTab === "onboarding" ? (
        // --- ONBOARDING QUEUE ---
        onboardingRequests.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-16 text-center text-zinc-500">
            <CheckCircle2 className="mx-auto text-emerald-500 mb-3" size={48} />
            <p className="text-sm font-medium text-zinc-300">No pending vendor onboarding applications.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {onboardingRequests.map((req) => (
              <div key={req.id} className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-zinc-100 flex items-center gap-2">
                        <User size={16} className="text-emerald-500" /> {req.user.name}
                      </h3>
                      <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                        <Mail size={12} /> {req.user.email}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1 bg-zinc-800/80 px-2.5 py-1 rounded-full border border-zinc-700">
                      <Calendar size={10} /> {new Date(req.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="bg-zinc-950/50 border border-zinc-800/80 p-4 rounded-2xl">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Business Concept / Pitch:</p>
                    <p className="text-sm text-zinc-300 leading-relaxed italic">"{req.businessDescription}"</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t border-zinc-800/80">
                  <button
                    onClick={() => handleOpenApproveModal(req)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-900/20"
                  >
                    <CheckCircle2 size={14} /> Provision Store
                  </button>
                  <button
                    onClick={() => void handleRejectOnboarding(req.id)}
                    className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        // --- VENDOR SUPPORT & CASHOUT QUERIES ---
        adminQueries.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-16 text-center text-zinc-500">
            <MessageSquare className="mx-auto text-zinc-600 mb-3" size={48} />
            <p className="text-sm font-medium text-zinc-300">No active vendor support queries or cashout requests found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {adminQueries.map((query) => (
              <div key={query.id} className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {query.type}
                    </span>
                    {query.amount && (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <DollarSign size={12} /> RWF {Number(query.amount).toLocaleString()}
                      </span>
                    )}
                    {/* Inline Quick Status Selector */}
                    <select
                      value={query.status}
                      onChange={(e) => void handleQuickStatusChange(query.id, e.target.value)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-xl border focus:outline-none cursor-pointer ${
                        query.status === 'RESOLVED' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : query.status === 'PROCESSING'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : query.status === 'REJECTED'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      <option value="PENDING" className="bg-zinc-900 text-amber-400">PENDING</option>
                      <option value="PROCESSING" className="bg-zinc-900 text-blue-400">PROCESSING</option>
                      <option value="RESOLVED" className="bg-zinc-900 text-emerald-400">RESOLVED</option>
                      <option value="REJECTED" className="bg-zinc-900 text-rose-400">REJECTED</option>
                    </select>
                  </div>
                  <p className="text-sm text-zinc-200 font-medium">{query.message}</p>
                  <p className="text-xs text-zinc-500">Submitted by Store ID: <span className="font-mono">{query.vendorId}</span></p>

                  {/* Display Admin's Response Note if available */}
                  {query.adminNotes && (
                    <div className="mt-3 p-3.5 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl flex items-start gap-2.5">
                      <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Admin Response Reference:</p>
                        <p className="text-xs text-zinc-300 mt-0.5">{query.adminNotes}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => {
                      setRespondingQuery(query);
                      setAdminReplyNotes(query.adminNotes || "");
                      setReplyStatus(query.status || "RESOLVED");
                    }}
                    className="px-3.5 py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <MessageSquare size={14} /> {query.adminNotes ? "Edit Response" : "Respond"}
                  </button>
                  <button
                    onClick={() => void handleDeleteQuery(query.id)}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 rounded-xl transition cursor-pointer"
                    title="Archive / Delete Query"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Store Provisioning Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="absolute inset-0" onClick={() => setSelectedRequest(null)} />

          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col z-10 text-zinc-100 overflow-hidden">
            <div className="p-6 border-b border-zinc-800 bg-zinc-900/90 flex justify-between items-center">
              <h3 className="font-bold text-lg text-zinc-100 flex items-center gap-2">
                <Building size={18} className="text-emerald-500" /> Provision Vendor Storefront
              </h3>
              <button onClick={() => setSelectedRequest(null)} className="text-zinc-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleApproveOnboarding} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Store Name</label>
                <input
                  type="text"
                  required
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Business Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Physical Address</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-900/20 cursor-pointer"
                >
                  Authorize & Create Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Response / Resolution Modal */}
      {respondingQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="absolute inset-0" onClick={() => setRespondingQuery(null)} />
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl z-15 text-zinc-100 overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/90">
              <h3 className="font-bold text-lg text-zinc-100">Respond to Vendor Inquiry</h3>
              <button onClick={() => setRespondingQuery(null)} className="text-zinc-400 hover:text-white cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSendReply} className="p-6 space-y-4">
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 text-xs text-zinc-300">
                <p className="font-bold text-zinc-400 uppercase tracking-wider mb-1">Original Vendor Message:</p>
                <p className="italic">"{respondingQuery.message}"</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Action Status</label>
                <select
                  value={replyStatus}
                  onChange={(e) => setReplyStatus(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing / Under Review</option>
                  <option value="RESOLVED">Resolved / Payout Dispatched</option>
                  <option value="REJECTED">Reject Request</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Admin Response / Transfer Reference Note</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide details (e.g., Momo transaction ID or notes on why it's processed)..."
                  value={adminReplyNotes}
                  onChange={(e) => setAdminReplyNotes(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
              <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRespondingQuery(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-900/20 cursor-pointer"
                >
                  Send Response & Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}