// components/vendor/VendorSettingsView.tsx
import { useState, useEffect } from "react";
import { Settings, CreditCard, Bell, ShieldCheck, Check, Palette, User, Send, HelpCircle, Loader2 } from "lucide-react";
import Button from "../../components/ui/Button";
import { useVendorStore } from "../../store/vendorStore";

export const VendorSettingsView = () => {
  const { 
    vendorSettings, 
    fetchVendorSettings, 
    updateVendorSettings, 
    submitAdminRequest, 
    isLoading 
  } = useVendorStore();

  const [saved, setSaved] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  
  const [settings, setSettings] = useState({
    storeName: "Ingeni Store Official",
    ownerName: "Ingeni Store Representative",
    supportEmail: "support@ingenistore.rw",
    phone: "+250728680460",
    momoNumber: "+250728680460",
    theme: "dark", 
    autoAcceptOrders: true,
    emailAlerts: true,
  });

  const [adminRequest, setAdminRequest] = useState({
    type: "CASHOUT", 
    amount: "50000",
    message: "Requesting revenue withdrawal via Mobile Money for completed sales and fulfillment operations.",
  });

  // Fetch settings on mount
  useEffect(() => {
    fetchVendorSettings();
  }, [fetchVendorSettings]);

  // Sync store data to local state when loaded, keeping Ingeni Store default placeholders as fallback
  useEffect(() => {
    if (vendorSettings) {
      setSettings({
        storeName: vendorSettings.storeName || "Ingeni Store Official",
        ownerName: vendorSettings.ownerName || "Ingeni Store Representative",
        supportEmail: vendorSettings.supportEmail || "support@ingenistore.rw",
        phone: vendorSettings.phone || "+250728680460",
        momoNumber: vendorSettings.momoNumber || "+250728680460",
        theme: vendorSettings.theme || "dark",
        autoAcceptOrders: vendorSettings.autoAcceptOrders ?? true,
        emailAlerts: vendorSettings.emailAlerts ?? true,
      });
    }
  }, [vendorSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    setErrorMessage(null);
    try {
      await updateVendorSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update settings");
    }
  };

  const handleAdminRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminRequest.message) return;
    setRequestSent(false);
    setAdminError(null);
    try {
      await submitAdminRequest({
        type: adminRequest.type,
        amount: adminRequest.amount ? String(adminRequest.amount) : undefined,
        message: adminRequest.message,
      });
      setRequestSent(true);
      setAdminRequest({ type: "CASHOUT", amount: "", message: "" });
      setTimeout(() => setRequestSent(false), 4000);
    } catch (err: any) {
      setAdminError(err.message || "Failed to send request to admin");
    }
  };

  return (
    <div className="space-y-8 max-w-4xl animate-fadeIn pb-16">
      
      {/* Header */}
      <div className="pb-6 border-b border-white/10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings size={14} className="text-blue-400" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-blue-400">Configuration</span>
          </div>
          <h1 className="font-poppins font-bold text-2xl md:text-3xl text-white tracking-tight">Store Settings & Management</h1>
        </div>
        {saved && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs">
            <Check size={14} />
            <span>Settings Updated Successfully</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 font-mono text-xs">
        
        {/* 1. Vendor & Store Profile Information */}
        <div className="p-6 md:p-8 rounded-3xl bg-[#0c0c0e] border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <User size={18} />
            </div>
            <div>
              <h2 className="font-poppins font-bold text-base text-white">Vendor & Store Profile</h2>
              <p className="text-[11px] text-gray-400">Review your identity details and how your storefront appears to customers.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-400 uppercase text-[10px] mb-1.5">Owner / Representative Name</label>
              <input
                type="text"
                placeholder="e.g. store owner or representative"
                value={settings.ownerName}
                onChange={(e) => setSettings({ ...settings, ownerName: e.target.value })}
                className="w-full p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-gray-400 uppercase text-[10px] mb-1.5">Store Name</label>
              <input
                type="text"
                placeholder="e.g. Ingeni Store"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-gray-400 uppercase text-[10px] mb-1.5">Support Email</label>
              <input
                type="email"
                placeholder="e.g. support@ingenistore.rw"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-gray-400 uppercase text-[10px] mb-1.5">Contact Phone</label>
              <input
                type="text"
                placeholder="e.g. +250728680460"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>
        </div>

        {/* 2. Theme & Appearance Customization */}
        <div className="p-6 md:p-8 rounded-3xl bg-[#0c0c0e] border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Palette size={18} />
            </div>
            <div>
              <h2 className="font-poppins font-bold text-base text-white">Dashboard Theme Customization</h2>
              <p className="text-[11px] text-gray-400">Personalize your console UI interface appearance.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: "dark", name: "Deep Obsidian", desc: "Default dark interface style with crisp accents." },
              { id: "midnight", name: "Midnight Blue", desc: "Deep rich indigo/blue shaded tone." },
              { id: "cyberpunk", name: "Cyber Matrix", desc: "High contrast dark mode styling." },
            ].map((t) => (
              <div
                key={t.id}
                onClick={() => setSettings({ ...settings, theme: t.id })}
                className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                  settings.theme === t.id
                    ? "bg-blue-600/10 border-blue-500 text-white shadow-lg shadow-blue-500/10"
                    : "bg-white/[0.02] border-white/5 text-gray-400 hover:border-white/20"
                }`}
              >
                <div>
                  <span className="block font-bold text-white text-sm mb-1">{t.name}</span>
                  <span className="text-[11px] text-gray-400 leading-relaxed block">{t.desc}</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-blue-400">
                    {settings.theme === t.id ? "Active Theme" : "Select"}
                  </span>
                  {settings.theme === t.id && <Check size={14} className="text-blue-400" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payout & Financials */}
        <div className="p-6 md:p-8 rounded-3xl bg-[#0c0c0e] border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CreditCard size={18} />
            </div>
            <div>
              <h2 className="font-poppins font-bold text-base text-white">Payout & Mobile Money</h2>
              <p className="text-[11px] text-gray-400">Configure where your sales revenues are automatically deposited.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-400 uppercase text-[10px] mb-1.5">Mobile Money Number (MTN/Airtel)</label>
              <input
                type="text"
                placeholder="e.g. +250728680460"
                value={settings.momoNumber}
                onChange={(e) => setSettings({ ...settings, momoNumber: e.target.value })}
                className="w-full p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Notifications & Toggles */}
        <div className="p-6 md:p-8 rounded-3xl bg-[#0c0c0e] border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Bell size={18} />
            </div>
            <div>
              <h2 className="font-poppins font-bold text-base text-white">Automations & Notifications</h2>
              <p className="text-[11px] text-gray-400">Manage alert behaviors and operational automation rules.</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04] transition">
              <div>
                <span className="block font-bold text-white text-sm">Auto-Accept Incoming Orders</span>
                <span className="text-gray-400 text-[11px]">Automatically shift new customer requests into active fulfillment queues.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoAcceptOrders}
                onChange={(e) => setSettings({ ...settings, autoAcceptOrders: e.target.checked })}
                className="w-5 h-5 rounded accent-blue-600 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04] transition">
              <div>
                <span className="block font-bold text-white text-sm">Email Alerts for Low Stock</span>
                <span className="text-gray-400 text-[11px]">Receive warning notifications when inventory counts fall below 5 items.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.emailAlerts}
                onChange={(e) => setSettings({ ...settings, emailAlerts: e.target.checked })}
                className="w-5 h-5 rounded accent-blue-600 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <Button
            label={isLoading ? "Saving Changes..." : "Save All Changes"}
            icon={isLoading ? Loader2 : ShieldCheck}
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs py-3.5 px-8 rounded-2xl transition shadow-lg shadow-blue-600/25 cursor-pointer disabled:opacity-50"
          />
        </div>

      </form>

      {/* 3. Request Something to Admin (Cashout, Custom Dashboard Features, Support) */}
      <div className="p-6 md:p-8 rounded-3xl bg-[#0c0c0e] border border-white/10 shadow-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <HelpCircle size={18} />
          </div>
          <div>
            <h2 className="font-poppins font-bold text-base text-white">Request Admin Assistance / Cashout</h2>
            <p className="text-[11px] text-gray-400">Submit requests directly to marketplace administrators for cash disbursements or custom updates.</p>
          </div>
        </div>

        {requestSent && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs flex items-center gap-2">
            <Check size={16} />
            <span>Your request has been successfully transmitted to the admin team.</span>
          </div>
        )}

        {adminError && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs">
            {adminError}
          </div>
        )}

        <form onSubmit={handleAdminRequestSubmit} className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 uppercase text-[10px] mb-1.5">Request Type</label>
              <select
                value={adminRequest.type}
                onChange={(e) => setAdminRequest({ ...adminRequest, type: e.target.value })}
                className="w-full p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-blue-500 transition cursor-pointer"
              >
                <option value="CASHOUT" className="bg-[#0c0c0e]">Cashout / Revenue Withdrawal</option>
                <option value="DASHBOARD_FEATURE" className="bg-[#0c0c0e]">Dashboard / Feature Request</option>
                <option value="SUPPORT" className="bg-[#0c0c0e]">General Admin Support</option>
              </select>
            </div>

            {adminRequest.type === 'CASHOUT' && (
              <div>
                <label className="block text-gray-400 uppercase text-[10px] mb-1.5">Withdrawal Amount (RWF)</label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={adminRequest.amount}
                  onChange={(e) => setAdminRequest({ ...adminRequest, amount: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-400 uppercase text-[10px] mb-1.5">Message / Details</label>
            <textarea
              rows={3}
              placeholder={adminRequest.type === 'CASHOUT' ? "Provide your Mobile Money details (+250728680460)..." : "Describe the dashboard modification or issue you need assistance with..."}
              value={adminRequest.message}
              onChange={(e) => setAdminRequest({ ...adminRequest, message: e.target.value })}
              className="w-full p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-blue-500 transition resize-none"
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              label="Submit Request to Admin"
              icon={Send}
              type="submit"
              className="bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs py-3.5 px-6 rounded-2xl transition shadow-lg shadow-amber-600/25 cursor-pointer"
            />
          </div>
        </form>
      </div>

    </div>
  );
};