import axios from "axios";

// Define the core structures for data type safety
export interface ApiVendor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  logoUrl?: string;
  storeName: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    products: number;
    orders: number;
  };
}

export interface VendorMetrics {
  totalSales: number;
  totalProducts: number;
  activeOrders: number;
}

// Added structural interfaces matching our order management pipeline
export interface ApiOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: 'PENDING' | 'DELIVERED' | 'SHIPPED' | 'CANCELLED';
  user?: {
    name: string;
  };
  createdAt: string;
}

interface VendorStats {
  revenue: number;
  activeOrders: number;
  productCount: number;
}

const API_BASE_URL = import.meta.env.BETTER_AUTH_URL || "http://localhost:8000/api";

export const vendorService = {
  /**
   * Fetch all vendors with optional query filters (e.g., status, search)
   */
  getVendors: async (params?: Record<string, any>): Promise<ApiVendor[]> => {
    const response = await axios.get(`${API_BASE_URL}/vendors`, { params });
    return response.data;
  },

  /**
   * Fetch a single vendor details by their unique ID
   */
  getVendorById: async (id: string): Promise<ApiVendor> => {
    const response = await axios.get(`${API_BASE_URL}/vendors/${id}`);
    return response.data;
  },

  /**
   * Fetch performance insights / summary dashboards for a single vendor profile
   */
  getVendorMetrics: async (id: string): Promise<VendorMetrics> => {
    const response = await axios.get(`${API_BASE_URL}/vendors/${id}/metrics`);
    return response.data;
  },

  /**
   * Fetch real-time streaming order transactions assigned to the current vendor session
   */
  getVendorOrders: async (): Promise<ApiOrder[]> => {
    const response = await axios.get(`${API_BASE_URL}/vendor/orders`);
    return response.data;
  },

  /**
   * Fetch global operational ledger summaries (Revenue, Pending count, Inventory total)
   */
  getStorefrontMetrics: async (): Promise<VendorStats> => {
    const response = await axios.get(`${API_BASE_URL}/vendor/metrics`);
    return response.data;
  },

  /**
   * Reconcile status state transitions on an active transaction tracking lifecycle
   */
  updateOrderStatus: async (orderId: string, status: ApiOrder['status']): Promise<ApiOrder> => {
    const response = await axios.patch(`${API_BASE_URL}/vendor/orders/${orderId}/status`, { status });
    return response.data;
  },

  /**
   * Create a new onboarding marketplace vendor profile
   */
  createVendor: async (payload: Partial<ApiVendor>): Promise<ApiVendor> => {
    const response = await axios.post(`${API_BASE_URL}/vendors`, payload);
    return response.data;
  },

  /**
   * Modify properties of an existing vendor profile
   */
  updateVendor: async (id: string, payload: Partial<ApiVendor>): Promise<ApiVendor> => {
    const response = await axios.put(`${API_BASE_URL}/vendors/${id}`, payload);
    return response.data;
  },

  /**
   * Permanently delete/offboard a vendor profile
   */
  deleteVendor: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/vendors/${id}`);
  }
};