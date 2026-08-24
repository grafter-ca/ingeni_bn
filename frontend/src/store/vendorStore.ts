// src/store/vendorStore.ts
import { create } from "zustand";
import { vendorService } from "../services/vendorService";
import type { ApiVendor, VendorMetrics } from "../types";
import { socket } from "../libs/socket.client";

export interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: 'PENDING' | 'DELIVERED' | 'SHIPPED' | 'CANCELLED';
  user?: {
    name: string;
  };
  createdAt: string;
}

export interface VendorStats {
  revenue: number;
  activeOrders: number;
  productCount: number;
}

export interface OnboardingRequest {
  id: string;
  userId: string;
  storeName?: string;
  businessDescription?: string;
  description?: string;
  address?: string;
  phone?: string;
  user?: {
    name?: string;
    email: string;
  };
  submittedAt?: string;
}

interface VendorState {
  vendors: ApiVendor[];
  filteredVendors: ApiVendor[];
  selectedVendor: ApiVendor | null;
  activeMetrics: VendorMetrics | null;
  isLoading: boolean;
  error: string | null;

  orders: Order[];
  stats: VendorStats | null;
  pendingRequests: OnboardingRequest[];
  isLoadingRequests: boolean;

  searchQuery: string;
  statusFilter: "all" | "active" | "inactive";

  isEditing: ApiVendor | null;
  formData: Omit<ApiVendor, "id" | "createdAt" | "_count">;

  fetchVendors: (params?: any) => Promise<void>;
  fetchVendorDetails: (id: string) => Promise<void>;
  fetchPendingRequests: () => Promise<void>;
  fetchVendorDashboardData: () => Promise<void>;
  fetchStorefrontMetrics: () => Promise<void>;
  
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: "all" | "active" | "inactive") => void;
  applyFilters: () => void;
  
  updateFormData: (data: Partial<VendorState["formData"]>) => void;
  setEditingVendor: (vendor: ApiVendor | null) => void;

  addVendor: () => Promise<void>;
  updateVendor: (id: string) => Promise<void>;
  removeVendor: (id: string) => Promise<void>;
  toggleVendorStatus: (id: string, currentStatus: boolean) => Promise<void>;
  approveVendorRequest: (requestData: { userId: string; storeName: string; description: string; address: string; phone: string }) => Promise<void>;
  rejectVendorRequest: (requestId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, nextStatus: Order['status']) => Promise<void>;
  requestOnboarding: (description: string) => Promise<void>;
  clearFilters: () => void;
}

export const initializeSocketListeners = ( set: any) => {
  socket.on('vendor:request-created', (newRequest) => {
    set((state: any) => ({
      pendingRequests: [newRequest, ...state.pendingRequests]
    }));
  });
};

export const useVendorStore = create<VendorState>((set, get) => ({
  vendors: [],
  filteredVendors: [],
  selectedVendor: null,
  activeMetrics: null,
  isLoading: false,
  error: null,

  orders: [],
  stats: null,
  pendingRequests: [],
  isLoadingRequests: false,
  
  searchQuery: "",
  statusFilter: "all",
  
  isEditing: null,
  formData: {
    name: "",
    email: "",
    phone: "",
    storeName: "",
    logoUrl: "",
    isActive: true,
  },

  fetchVendors: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const data = await vendorService.getVendors(params);
      set({ vendors: data, isLoading: false });
      get().applyFilters();
    } catch (err: any) {
      set({ error: err.message || "Failed to load vendors catalog", isLoading: false });
    }
  },

  fetchVendorDetails: async (id) => {
    set({ isLoading: true, error: null, activeMetrics: null });
    try {
      const [profile, metrics] = await Promise.all([
        vendorService.getVendorById(id),  
        vendorService.getVendorMetrics(id)
      ]);
      set({ selectedVendor: profile, activeMetrics: metrics, isLoading: false });
    } catch (err: any) {
      set({ error: "Failed to pull detailed profile insights", isLoading: false });
    }
  },

  fetchPendingRequests: async () => {
    set({ isLoadingRequests: true });
    try {
      // Connects to your backend endpoint for pending user onboarding requests
      const data = await vendorService.getPendingRequests?.() || [];
      set({ pendingRequests: data, isLoadingRequests: false });
    } catch (err) {
      console.error("Failed to fetch pending requests", err);
      set({ isLoadingRequests: false });
    }
  },

  fetchVendorDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [ordersData, metricsData] = await Promise.all([
        vendorService.getVendorOrders?.() || Promise.resolve([]),
        vendorService.getStorefrontMetrics?.() || Promise.resolve(null)
      ]);

      const mappedStats: VendorStats = metricsData || {
        revenue: ordersData.reduce((acc: number, curr: any) => curr.status === 'DELIVERED' ? acc + curr.totalAmount : acc, 0),
        activeOrders: ordersData.filter((o: any) => o.status === 'PENDING').length,
        productCount: get().vendors.length
      };

      set({ orders: ordersData, stats: mappedStats, isLoading: false });
    } catch (err: any) {
      set({ error: "Failed to pull transaction metrics telemetry", isLoading: false });
    }
  },

  fetchStorefrontMetrics: async () => {
    try {
      const stats = await vendorService.getStorefrontMetrics();
      set({ stats });
    } catch (err: any) {
      console.error("Failed to fetch storefront metrics", err);
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().applyFilters();
  },

  setStatusFilter: (status) => {
    set({ statusFilter: status });
    get().applyFilters();
  },

  applyFilters: () => {
    const { vendors, searchQuery, statusFilter } = get();
    let updatedList = [...vendors];

    if (searchQuery.trim()) {
      const targetQuery = searchQuery.toLowerCase().trim();
      updatedList = updatedList.filter(
        (v) =>
          v.name.toLowerCase().includes(targetQuery) ||
          v.storeName.toLowerCase().includes(targetQuery) ||
          v.email.toLowerCase().includes(targetQuery)
      );
    }

    if (statusFilter !== "all") {
      const targetActiveState = statusFilter === "active";
      updatedList = updatedList.filter((v) => v.isActive === targetActiveState);
    }

    set({ filteredVendors: updatedList });
  },

  updateFormData: (data) =>
    set((state) => ({ formData: { ...state.formData, ...data } })),

  setEditingVendor: (vendor) => {
    if (vendor) {
      set({
        isEditing: vendor,
        formData: {
          name: vendor.name,
          email: vendor.email,
          phone: vendor.phone || "",
          storeName: vendor.storeName,
          logoUrl: vendor.logoUrl || "",
          isActive: vendor.isActive,
        }
      });
    } else {
      set({
        isEditing: null,
        formData: {
          name: "",
          email: "",
          phone: "",
          storeName: "",
          logoUrl: "",
          isActive: true,
        }
      });
    }
  },

  addVendor: async () => {
    const { formData, fetchVendors } = get();
    if (!formData.name.trim() || !formData.storeName.trim()) {
      throw new Error("Vendor name and Store title are strictly required parameters.");
    }

    set({ isLoading: true });
    try {
      await vendorService.createVendor(formData);
      set({ isEditing: null });
      await fetchVendors();
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },

  updateVendor: async (id) => {
    const { formData, fetchVendors } = get();
    set({ isLoading: true });
    try {
      await vendorService.updateVendor(id, formData);
      set({ isEditing: null });
      await fetchVendors();
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },

  removeVendor: async (id) => {
    set({ isLoading: true });
    try {
      await vendorService.deleteVendor(id);
      set((state) => {
        const nextVendors = state.vendors.filter((v) => v.id !== id);
        return {
          vendors: nextVendors,
          filteredVendors: nextVendors.filter((v) => {
            if (state.statusFilter === "all") return true;
            return v.isActive === (state.statusFilter === "active");
          }),
          isLoading: false
        };
      });
    } catch (err: any) {
      set({ error: "Could not unboard profile record from data tables", isLoading: false });
      throw err;
    }
  },

  toggleVendorStatus: async (id, currentStatus) => {
    try {
      await vendorService.updateVendor(id, { isActive: !currentStatus });
      set((state) => {
        const updated = state.vendors.map((v) => 
          v.id === id ? { ...v, isActive: !currentStatus } : v
        );
        return { vendors: updated };
      });
      get().applyFilters();
    } catch (err: any) {
      console.error("Failed to alter remote state profile visibility flag context:", err);
    }
  },

  approveVendorRequest: async (requestData) => {
    set({ isLoading: true });
    try {
      if (vendorService.approveVendorRequest) {
        await vendorService.approveVendorRequest(requestData);
      } else {
        // Fallback default service call
        await vendorService.createVendor({
          name: requestData.storeName,
          email: "",
          storeName: requestData.storeName,
          phone: requestData.phone,
          isActive: true
        });
      }
      await get().fetchVendors();
      await get().fetchPendingRequests();
      set({ isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || "Failed to approve request" });
      throw err;
    }
  },

  rejectVendorRequest: async (requestId) => {
    try {
      if (vendorService.rejectVendorRequest) {
        await vendorService.rejectVendorRequest(requestId);
      }
      set((state) => ({
        pendingRequests: state.pendingRequests.filter((r) => r.id !== requestId)
      }));
    } catch (err) {
      console.error("Failed to reject request", err);
    }
  },

  updateOrderStatus: async (orderId, nextStatus) => {
    try {
      if (vendorService.updateOrderStatus) {
        await vendorService.updateOrderStatus(orderId, nextStatus);
      }
      
      set((state) => {
        const updatedOrders = state.orders.map((o) =>
          o.id === orderId ? { ...o, status: nextStatus } : o
        );

        const updatedStats = state.stats ? {
          ...state.stats,
          revenue: updatedOrders.reduce((acc, curr) => curr.status === 'DELIVERED' ? acc + curr.totalAmount : acc, 0),
          activeOrders: updatedOrders.filter(o => o.status === 'PENDING').length
        } : null;

        return {
          orders: updatedOrders,
          stats: updatedStats
        };
      });
    } catch (err) {
      console.error("Order adjustment handshake failure inside store module:", err);
      throw err;
    }
  },

  requestOnboarding: async (description) => {
    await vendorService.requestOnboarding(description);
  },

  clearFilters: () => {
    set({ searchQuery: "", statusFilter: "all" });
    get().applyFilters();
  }
}));