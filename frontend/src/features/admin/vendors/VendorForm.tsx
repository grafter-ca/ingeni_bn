// src/features/admin/vendors/VendorForm.tsx
import { useState } from "react";
import { useVendorStore } from "../../../store/vendorStore";
import { Store, ArrowLeft, CheckCircle2 } from "lucide-react";

export const VendorForm = () => {
  const { formData, updateFormData, isEditing, setEditingVendor, addVendor, updateVendor } = useVendorStore();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      if (isEditing && isEditing.id) {
        await updateVendor(isEditing.id);
      } else {
        await addVendor();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to commit merchant configuration record.");
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-xl space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEditingVendor(null)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-all cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Store className="text-blue-500" size={18} />
            {isEditing?.id ? `Edit Merchant: ${isEditing.storeName}` : "Provision New Merchant Account"}
          </h2>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Store Title / Brand Name *</label>
            <input
              type="text"
              required
              value={formData.storeName ?? ""}
              onChange={(e) => updateFormData({ storeName: e.target.value })}
              placeholder="e.g., Kigali Apex Hub"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Owner Full Name *</label>
            <input
              type="text"
              required
              value={formData.name ?? ""}
              onChange={(e) => updateFormData({ name: e.target.value })}
              placeholder="e.g., Jean Bosco"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email ?? ""}
              onChange={(e) => updateFormData({ email: e.target.value })}
              placeholder="merchant@domain.rw"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Phone Number</label>
            <input
              type="text"
              value={formData.phone ?? ""}
              onChange={(e) => updateFormData({ phone: e.target.value })}
              placeholder="+250 780 000 000"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Store Overview / Description</label>
          <textarea
            rows={3}
            value={formData.description ?? ""}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder="Describe product categories, specialty lines, and fulfillment terms..."
            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-blue-500 font-medium resize-none"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive ?? true}
              onChange={(e) => updateFormData({ isActive: e.target.checked })}
              className="w-4 h-4 rounded border-white/10 bg-black/50 text-blue-600 focus:ring-0 cursor-pointer"
            />
            <span className="text-xs font-bold text-gray-300">Active Merchant Store Status</span>
          </label>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setEditingVendor(null)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 size={15} />
              {submitting ? "Saving..." : isEditing?.id ? "Update Merchant Profile" : "Create Merchant Profile"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};