import { useEffect, useState } from "react";
import VendorContent from "../../features/vendor/VendorContent";
import { OrderClient } from "../../services/order.service"; // Ensure file name matches
import { Loader2 } from "lucide-react";
import type { VendorDashboardData } from "../../types";

// 1. Define the shape of your Dashboard data

const VendorPage = () => {
  // 2. Initialize state with the Interface
  const [data, setData] = useState<VendorDashboardData>({ 
    stats: null, 
    orders: [] 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Controller to prevent memory leaks if component unmounts
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const orders = await OrderClient.getVendorOrders();
        
        // 3. Logic remains the same, but now TS knows the types
        const revenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        
        if (isMounted) {
          setData({
            orders: orders.slice(0, 5),
            stats: {
              revenue: revenue.toLocaleString(),
              activeOrders: orders.filter(o => o.status === 'PENDING').length,
              productCount: "...", 
            }
          });
        }
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboard();
    return () => { isMounted = false };
  }, []);

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <p className="text-gray-500 text-sm">Loading Vendor Analytics...</p>
      </div>
    </div>
  );

  return <VendorContent stats={data.stats} orders={data.orders} />;
};

export default VendorPage;