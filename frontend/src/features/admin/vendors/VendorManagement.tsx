// src/features/admin/vendors/VendorManagement.tsx
import { useEffect, useState } from 'react';
import { useVendorStore } from '../../../store/vendorStore';
import { VendorList } from './VendorList';
import { VendorForm } from './VendorForm';
import { VendorDetail } from './VendorDetail';
import { Store, UserCheck, ShieldPlus, Layers, Loader2 } from 'lucide-react';

export const VendorManagement = () => {
  const { 
    fetchVendors, 
    fetchPendingRequests, 
    pendingRequests, 
    isLoadingRequests, 
    approveVendorRequest, 
    rejectVendorRequest, 
    isEditing, 
    selectedVendor, 
    setEditingVendor 
  } = useVendorStore();
  
  const [activeTab, setActiveTab] = useState<'directories' | 'requests'>('directories');

  useEffect(() => {
    fetchVendors();
    fetchPendingRequests();
  }, [fetchVendors, fetchPendingRequests]);

  const handleAddNew = () => {
    setEditingVendor(null);
  };

  const handleApproveRequest = async (req: any) => {
    try {
      await approveVendorRequest({
        userId: req.userId || req.id,
        storeName: req.storeName || 'New Store',
        description: req.businessDescription || req.description || '',
        address: req.address || '',
        phone: req.phone || ''
      });
      setActiveTab('directories');
    } catch (error) {
      alert("Failed to approve merchant request.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3 bg-[#0a0a0a] p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab('directories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'directories'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Store size={14} /> Active Stores
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer relative ${
              activeTab === 'requests'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserCheck size={14} /> Onboarding Requests
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {!isEditing && !selectedVendor && activeTab === 'directories' && (
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer"
          >
            <ShieldPlus size={16} /> Force Create Vendor Profile
          </button>
        )}
      </div>

      {/* View Orchestration Logic */}
      {isEditing ? (
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers size={18} className="text-blue-500" /> Admin Merchant Provisioning Suite
            </h3>
            <button
              onClick={() => setEditingVendor(null)}
              className="text-xs text-gray-400 hover:text-white underline cursor-pointer"
            >
              Cancel & Return
            </button>
          </div>
          <VendorForm />
        </div>
      ) : selectedVendor ? (
        <VendorDetail />
      ) : activeTab === 'directories' ? (
        <VendorList />
      ) : (
        /* Real Onboarding Requests Review Queue */
        <div className="space-y-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5">
            <h3 className="font-bold text-white text-base mb-1">Pending Store Applications</h3>
            <p className="text-xs text-gray-400">
              Review user-submitted business concepts and approve credentials to dispatch automated onboarding tokens and workspace links.
            </p>
          </div>

          {isLoadingRequests ? (
            <div className="p-12 text-center flex flex-col items-center justify-center text-gray-500 bg-[#0a0a0a]/50 border border-white/10 rounded-2xl gap-3">
              <Loader2 className="animate-spin text-blue-500" size={32} />
              <p className="text-xs font-medium text-gray-400">Fetching live onboarding queues...</p>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl text-gray-500 bg-[#0a0a0a]/50">
              <UserCheck size={36} className="mx-auto mb-2 text-gray-600" />
              <p className="text-sm font-medium">No active onboarding requests pending evaluation.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-white/20 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-white text-base">{req.storeName || 'Unnamed Store Application'}</h4>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Pending Verification
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 max-w-xl">{req.businessDescription || req.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400 pt-1 font-mono">
                      <span>Owner: <strong className="text-gray-200">{req.user?.name || req.userName || 'User'}</strong> ({req.user?.email || req.userEmail})</span>
                      <span>Phone: <strong className="text-gray-200">{req.phone || 'N/A'}</strong></span>
                      <span>Location: <strong className="text-gray-200">{req.address || 'N/A'}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => void handleApproveRequest(req)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-emerald-900/20 flex items-center gap-1.5"
                    >
                      <UserCheck size={14} /> Approve & Initialize Store
                    </button>
                    <button
                      onClick={() => void rejectVendorRequest(req.id)}
                      className="px-3 py-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};