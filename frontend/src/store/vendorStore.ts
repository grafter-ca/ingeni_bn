import { create } from "zustand";
import { vendorService, type ApiVendor, type VendorMetrics } from "../services/vendorService";

// --- EXPANDED LOCAL INTERFACES FOR SYNCHRONIZATION ---
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

interface VendorState {
  // Data State
  vendors: ApiVendor[];
  filteredVendors: ApiVendor[];
  selectedVendor: ApiVendor | null;
  activeMetrics: VendorMetrics | null;
  isLoading: boolean;
  error: string | null;

  // --- COMPONENT STREAMING DATA EXTRACTIONS ---
  orders: Order[];
  stats: VendorStats | null;

  // Filtering Context States
  searchQuery: string;
  statusFilter: "all" | "active" | "inactive";

  // Form Management Buffer States (Modals / Creation Cards)
  isEditing: ApiVendor | null;
  formData: Omit<ApiVendor, "id" | "createdAt" | "_count">;

  // Core Management Methods
  fetchVendors: (params?: any) => Promise<void>;
  fetchVendorDetails: (id: string) => Promise<void>;
  fetchVendorDashboardData: () => Promise<void>; // Pulls orders & telemetry cards
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: "all" | "active" | "inactive") => void;
  applyFilters: () => void;
  
  // Form Actions
  updateFormData: (data: Partial<VendorState["formData"]>) => void;
  setEditingVendor: (vendor: ApiVendor | null) => void;

  // Data Writing Sync Pipeline (CRUD & Order Telemetry Mutations)
  addVendor: () => Promise<void>;
  updateVendor: (id: string) => Promise<void>;
  removeVendor: (id: string) => Promise<void>;
  toggleVendorStatus: (id: string, currentStatus: boolean) => Promise<void>;
  updateOrderStatus: (orderId: string, nextStatus: Order['status']) => Promise<void>;
  clearFilters: () => void;
}

export const useVendorStore = create<VendorState>((set, get) => ({
  // --- INITIAL COMPONENT STATE ---
  vendors: [],
  filteredVendors: [],
  selectedVendor: null,
  activeMetrics: null,
  isLoading: false,
  error: null,

  // --- STREAMING PIPELINE STRUCTURAL ARRAYS ---
  orders: [],
  stats: null,
  
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

  // --- BUSINESS LOGIC ACTIONS ---
  fetchVendors: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const data = await vendorService.getVendors(params);
      set({ vendors: data, isLoading: false });
      
      // Keep search filters synchronizing smoothly
      get().applyFilters();
    } catch (err: any) {
      set({ error: err.message || "Failed to load vendors catalog", isLoading: false });
    }
  },

  // fetchVendor by userid to pull detailed profile insights for dashboard and management views
  fetchVendorDetails: async (id) => {
    set({ isLoading: true, error: null, activeMetrics: null });
    try {
      // Fetch both profile properties and operational performance tracking indices concurrently
      const [profile, metrics] = await Promise.all([
        vendorService.getVendorById(id),  
        vendorService.getVendorMetrics(id)
      ]);
      set({ selectedVendor: profile, activeMetrics: metrics, isLoading: false });
    } catch (err: any) {
      set({ error: "Failed to pull detailed profile insights", isLoading: false });
    }
  },

  // --- TELEMETRY ORCHESTRATION PIPELINES ---
  fetchVendorDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      // Direct integration points to service mapping layers
      const [ordersData, metricsData] = await Promise.all([
        vendorService.getVendorOrders?.() || Promise.resolve([]),
        vendorService.getStorefrontMetrics?.() || Promise.resolve(null)
      ]);

      // Fallback fallback mappings if endpoints don't aggregate calculations instantly
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

  // --- RECONCILING ENGINE (SEARCH & FILTERS) ---
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

    // 1. Text parsing evaluation against profile details
    if (searchQuery.trim()) {
      const targetQuery = searchQuery.toLowerCase().trim();
      updatedList = updatedList.filter(
        (v) =>
          v.name.toLowerCase().includes(targetQuery) ||
          v.storeName.toLowerCase().includes(targetQuery) ||
          v.email.toLowerCase().includes(targetQuery)
      );
    }

    // 2. State-level status evaluation
    if (statusFilter !== "all") {
      const targetActiveState = statusFilter === "active";
      updatedList = updatedList.filter((v) => v.isActive === targetActiveState);
    }

    set({ filteredVendors: updatedList });
  },

  // --- CLIENT STRUCTURAL BUFFER FORM ACTIONS ---
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
      // Clear out the state cleanly when preparing an entry modal
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

  // --- MUTATIVE DATA MODIFICATION PIPELINES (CRUD) ---
  addVendor: async () => {
    const { formData, fetchVendors } = get();
    if (!formData.name.trim() || !formData.storeName.trim()) {
      throw new Error("Vendor name and Store title are strictly required parameters.");
    }

    set({ isLoading: true });
    try {
      await vendorService.createVendor(formData);
      set({ isEditing: null });
      await fetchVendors(); // Refresh our collection array state seamlessly
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
      // Remove element locally in real-time instantly without forcing secondary payload delays
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
      // Optimistically push structural switch statements right down to the data engine layer
      await vendorService.updateVendor(id, { isActive: !currentStatus });
      
      // Update our local state indices instantly
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

  updateOrderStatus: async (orderId, nextStatus) => {
    try {
      // 1. Invoke API Service mutation pipeline layer
      if (vendorService.updateOrderStatus) {
        await vendorService.updateOrderStatus(orderId, nextStatus);
      }
      
      // 2. Perform optimistic state recalculation right on local arrays
      set((state) => {
        const updatedOrders = state.orders.map((o) =>
          o.id === orderId ? { ...o, status: nextStatus } : o
        );

        // 3. Re-calculate administrative financial modules seamlessly
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

  clearFilters: () => {
    set({ searchQuery: "", statusFilter: "all" });
    get().applyFilters();
  }
}));