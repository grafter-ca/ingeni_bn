import { useState, useEffect, useMemo } from "react";
import { OrderClient } from "../services/order.service";
import { useProducts } from "./useProducts";

export const useVendorDashboard = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  
  const { filteredProducts, isLoading: productsLoading } = useProducts();

  useEffect(() => {
    let isMounted = true;
    const fetchOrders = async () => {
      try {
        const vendorOrders = await OrderClient.getVendorOrders();
        if (isMounted) setOrders(vendorOrders);
      } catch (error) {
        console.error("Dashboard Order Error:", error);
      } finally {
        if (isMounted) setOrdersLoading(false);
      }
    };

    fetchOrders();
    return () => { isMounted = false };
  }, []);

  const stats = useMemo(() => {
    const revenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const activeOrders = orders.filter(o => o.status === 'PENDING').length;
    
    return {
      revenue: revenue.toLocaleString(),
      activeOrders,
      // Now correctly derived from our useProducts hook
      productCount: filteredProducts.length.toString(),
    };
  }, [orders, filteredProducts]);

  return { 
    stats, 
    orders: orders.slice(0, 5), 
    loading: ordersLoading || productsLoading 
  };
};