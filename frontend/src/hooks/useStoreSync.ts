// hooks/useStoreSync.ts
import { useEffect } from 'react';
import { useProductStore } from '../store/productStore';
// import { useVendorStore } from '../store/vendorStore';

export const useStoreSync = (currentVendorId?: string) => {
  const { setSelectedVendorId, fetchProducts } = useProductStore();
  

  useEffect(() => {
    if (currentVendorId) {
      setSelectedVendorId(currentVendorId);
    } else {
      fetchProducts();
    }
  }, [currentVendorId, setSelectedVendorId, fetchProducts]);
};