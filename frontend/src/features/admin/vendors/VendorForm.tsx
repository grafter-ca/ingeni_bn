// VendorForm.tsx
import React from 'react';
import { useVendorStore } from '../../../store/vendorStore';

export const VendorForm = () => {
  const { formData, updateFormData, addVendor, updateVendor, isEditing, setEditingVendor } = useVendorStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateVendor(isEditing.id);
      } else {
        await addVendor();
      }
    } catch (err) {
      console.error("Form submission failed", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-[#0a0a0a] border border-white/10 rounded-2xl space-y-4">
      <h2 className="text-lg font-medium text-white">{isEditing ? 'Update Vendor' : 'Create New Vendor'}</h2>
      <input 
        className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-white"
        placeholder="Store Name" 
        value={formData.storeName} 
        onChange={(e) => updateFormData({ storeName: e.target.value })} 
      />
      <input 
        className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-white"
        placeholder="Contact Email" 
        value={formData.email} 
        onChange={(e) => updateFormData({ email: e.target.value })} 
      />
      <div className="flex gap-4">
        <button type="submit" className="px-4 py-2 bg-blue-600 rounded-lg text-white">Save</button>
        <button type="button" onClick={() => setEditingVendor(null)} className="px-4 py-2 border border-white/10 rounded-lg text-gray-400">Cancel</button>
      </div>
    </form>
  );
};