import { useVendorStore } from "../../../store/vendorStore";

// VendorList.tsx
export const VendorList = () => {
  const { filteredVendors, setEditingVendor, toggleVendorStatus } = useVendorStore();

  return (
    <div className="grid gap-4">
      {filteredVendors.map((vendor) => (
        <div key={vendor.id} className="p-4 border rounded shadow-sm flex justify-between items-center">
          <div>
            <h3 className="font-semibold">{vendor.storeName}</h3>
            <p className="text-sm text-gray-500">{vendor.email}</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${vendor.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {vendor.isActive ? 'ACTIVE' : 'SUSPENDED'}
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditingVendor(vendor)}>Edit</button>
            <button 
              onClick={() => toggleVendorStatus(vendor.id, vendor.isActive)}
              className={vendor.isActive ? "text-green-600" : "text-red-600"}
            >
              {vendor.isActive ? 'Suspend' : 'Activate'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};