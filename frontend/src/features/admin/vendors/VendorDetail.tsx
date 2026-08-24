// VendorDetail.tsx
import { useEffect } from 'react';
import { useVendorStore } from '../../../store/vendorStore';

export const VendorDetail = () => {
  const { selectedVendor, activeMetrics, fetchVendorDetails, setEditingVendor } = useVendorStore();

  useEffect(() => {
    if (selectedVendor?.id) fetchVendorDetails(selectedVendor.id);
  }, [selectedVendor?.id, fetchVendorDetails]);

  if (!selectedVendor) return null;

  return (
    <div className="p-6 bg-[#0a0a0a] border border-white/10 rounded-2xl space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">{selectedVendor.storeName}</h2>
          <p className="text-gray-400">{selectedVendor.email}</p>
        </div>
        <button onClick={() => setEditingVendor(null)} className="text-sm text-gray-500 hover:text-white">Back to List</button>
      </div>

      {/* Operational Hours Section */}
      <div className="bg-white/5 p-4 rounded-xl border border-white/5">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Operating Hours</h4>
        <p className="text-xs text-gray-400">Weekdays: 8:00 AM – 2:00 AM</p>
        <p className="text-xs text-gray-400">Weekends: 9:00 AM – 6:00 AM</p>
      </div>

      {/* Metrics Display */}
      {activeMetrics && (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border border-white/5 rounded-lg">
            <div className="text-gray-500 text-xs">Revenue</div>
            <div className="text-white font-mono">${activeMetrics.totalSales.toFixed(2)}</div>
          </div>
        </div>
      )}
    </div>
  );
};