// src/pages/ProfilePage.tsx
import { useState, useEffect } from "react";
import { User, Shield, Store, Edit3, X, CheckCircle2, AlertCircle, Phone, MapPin, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthState, useAuthActions } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Navbar from "../components/layout/Navbar";
import { EastAfricanPhoneInput } from "../components/ui/EastAfricanPhoneInput";

export const ProfilePage = () => {
  const { user } = useAuthState();
  const { updateProfile, vendor, admin } = useAuthActions();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [location, setLocation] = useState(user?.location || "");
  
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Vendor Application State
  const [shopName, setShopName] = useState("");
  const [shopSlug, setShopSlug] = useState("");
  const [creatingVendor, setCreatingVendor] = useState(false);

  // Admin User List State (if user is admin)
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [loadingAdminUsers, setLoadingAdminUsers] = useState(false);

  // Auto-fetch admin users on mount if the user is an admin
  useEffect(() => {
    if (user?.role === "admin") {
      fetchAdminUsers();
    }
  }, [user?.role]);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center font-mono text-gray-400 bg-[#050505]">
        Access Denied. Please authenticate your session.
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      await updateProfile({ name, email, phone, location });
      setFeedback({ type: "success", message: "Account profile matrices synchronized successfully." });
      setIsEditing(false);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVendorNode = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingVendor(true);
    setFeedback(null);
    try {
      await vendor.create(shopName, shopSlug);
      setFeedback({ type: "success", message: "Vendor organization successfully provisioned." });
      setShopName("");
      setShopSlug("");
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to create vendor account." });
    } finally {
      setCreatingVendor(false);
    }
  };

  const fetchAdminUsers = async () => {
    setLoadingAdminUsers(true);
    try {
      const result = await admin.listUsers();
      setAdminUsers(result?.users || result || []);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to fetch user list." });
    } finally {
      setLoadingAdminUsers(false);
    }
  };

  const handleRoleChange = async (targetUserId: string, newRole: any) => {
    try {
      await admin.setRole(targetUserId, newRole);
      setFeedback({ type: "success", message: `User role updated to ${newRole}.` });
      fetchAdminUsers();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to update role." });
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#050505] text-white font-poppins pt-6 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0c0c0e] border border-white/10 p-6 rounded-3xl backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold uppercase overflow-hidden shadow-lg shrink-0 border border-white/10">
                {user.image ? (
                  <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold font-mono tracking-tight text-white">{user.name}</h1>
                <p className="text-xs font-mono text-gray-400">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${
                    user.role === 'admin' 
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                      : user.role === 'vendor' 
                      ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                      : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                  }`}>
                    Role: {user.role || "user"}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/40 text-xs font-mono transition cursor-pointer text-gray-300 hover:text-white"
            >
              {isEditing ? <X size={15} /> : <Edit3 size={15} />}
              <span>{isEditing ? "Abort Edit" : "Configure Profile"}</span>
            </button>
          </div>

          {/* Feedback Alert Matrix */}
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-mono ${
                feedback.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              }`}
            >
              <div className="flex items-center gap-3">
                {feedback.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span>{feedback.message}</span>
              </div>
              <button onClick={() => setFeedback(null)} className="opacity-60 hover:opacity-100 transition cursor-pointer">
                <X size={14} />
              </button>
            </motion.div>
          )}

          {/* Profile Details / Edit Form */}
          <div className="bg-[#0c0c0e] border border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl">
            <h2 className="text-sm font-bold font-mono uppercase tracking-widest text-gray-300 mb-6 flex items-center gap-2">
              <User size={16} className="text-blue-500" />
              <span>Core Identity Matrix</span>
            </h2>

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Phone Number</label>
                    <EastAfricanPhoneInput
                      value={phone}
                      onChange={(val) => setPhone(val)}
                      placeholder="780000000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Location / Zone</label>
                    <input
                      type="text"
                      placeholder="e.g. Kigali, Rwanda"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    label="Cancel"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="w-auto px-6"
                  />
                  <Button 
                    disabled={loading}
                    label={
                      loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                          </svg>
                          <span>Saving...</span>
                        </div>
                      ) : (
                        "Commit Updates"
                      )
                    } 
                    type="submit" 
                    className="w-auto px-6"
                  />
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center gap-3">
                  <User size={18} className="text-blue-400 shrink-0" />
                  <div className="overflow-hidden">
                    <span className="text-[10px] text-gray-500 uppercase block">Node Identifier</span>
                    <p className="text-xs text-white truncate">{user.name}</p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center gap-3">
                  <User size={18} className="text-indigo-400 shrink-0" />
                  <div className="overflow-hidden">
                    <span className="text-[10px] text-gray-500 uppercase block">Communication Channel</span>
                    <p className="text-xs text-white truncate">{user.email}</p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center gap-3">
                  <Phone size={18} className="text-emerald-400 shrink-0" />
                  <div className="overflow-hidden">
                    <span className="text-[10px] text-gray-500 uppercase block">Phone Number</span>
                    <p className="text-xs text-white truncate">{user.phone || "Not configured"}</p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center gap-3">
                  <MapPin size={18} className="text-rose-400 shrink-0" />
                  <div className="overflow-hidden">
                    <span className="text-[10px] text-gray-500 uppercase block">Location / Zone</span>
                    <p className="text-xs text-white truncate">{user.location || "Not specified"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Vendor Section - Visible only if user is a vendor or admin */}
          {(user.role === "vendor" || user.role === "admin") && (
            <div className="bg-[#0c0c0e] border border-purple-500/20 p-6 sm:p-8 rounded-3xl shadow-2xl">
              <h2 className="text-sm font-bold font-mono uppercase tracking-widest text-purple-400 mb-6 flex items-center gap-2">
                <Store size={16} />
                <span>Vendor Storefront Management Matrix</span>
              </h2>
              <div className="bg-purple-500/5 border border-purple-500/10 p-5 rounded-2xl space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Store Status:</span>
                  <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px]">Active Node</span>
                </div>
                <p className="text-[11px] text-gray-400 pt-2 border-t border-white/5 leading-relaxed">
                  Authorized merchant privileges active. You have full system permissions to manage inventory channels, list marketplace products, and inspect local fulfillment pipelines.
                </p>
              </div>
            </div>
          )}

          {/* Vendor Provisioning Section - Visible only if user role is standard 'user' */}
          {user.role === "user" && (
            <div className="bg-[#0c0c0e] border border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl">
              <h2 className="text-sm font-bold font-mono uppercase tracking-widest text-gray-300 mb-6 flex items-center gap-2">
                <Store size={16} className="text-blue-500" />
                <span>Vendor Storefront Provisioning</span>
              </h2>
              <form onSubmit={handleCreateVendorNode} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Store Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Cybernetics Depot"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Store Slug</label>
                    <input
                      type="text"
                      placeholder="e.g. cybernetics-depot"
                      value={shopSlug}
                      onChange={(e) => setShopSlug(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button 
                    disabled={creatingVendor}
                    label={creatingVendor ? "Provisioning..." : "Initialize Vendor Node"} 
                    type="submit" 
                    className="w-auto px-6"
                  />
                </div>
              </form>
            </div>
          )}

          {/* Admin Section (Only for Admin Role) */}
          {user.role === "admin" && (
            <div className="bg-[#0c0c0e] border border-amber-500/20 p-6 sm:p-8 rounded-3xl shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold font-mono uppercase tracking-widest text-amber-400 flex items-center gap-2">
                  <Shield size={16} />
                  <span>Admin Console: User Node Oversight</span>
                </h2>
                <button
                  onClick={fetchAdminUsers}
                  disabled={loadingAdminUsers}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs font-mono text-amber-400 hover:bg-amber-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={12} className={loadingAdminUsers ? "animate-spin" : ""} />
                  <span>{loadingAdminUsers ? "Querying..." : "Refresh Nodes"}</span>
                </button>
              </div>

              {loadingAdminUsers && adminUsers.length === 0 ? (
                <div className="py-12 flex items-center justify-center font-mono text-xs text-gray-500">
                  Loading network user ledger...
                </div>
              ) : adminUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-500">
                        <th className="pb-3 px-3">Identity</th>
                        <th className="pb-3 px-3">Email</th>
                        <th className="pb-3 px-3">Current Role</th>
                        <th className="pb-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {adminUsers.map((u: any) => (
                        <tr key={u.id || u._id} className="hover:bg-white/5 transition">
                          <td className="py-3.5 px-3 text-white font-bold">{u.name}</td>
                          <td className="py-3.5 px-3 text-gray-400">{u.email}</td>
                          <td className="py-3.5 px-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase border ${
                              u.role === 'admin' 
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                                : u.role === 'vendor'
                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id || u._id, e.target.value)}
                              className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-gray-300 focus:outline-none focus:border-amber-500 cursor-pointer"
                            >
                              <option value="user">User</option>
                              <option value="vendor">Vendor</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs font-mono text-gray-500 py-8 text-center">
                  No active network nodes detected.
                </p>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
};