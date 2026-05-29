import { create } from "zustand";
import { OrderClient } from "../services/order.service";
import type { Order, CreateOrderDto } from "../types/api";

interface OrderState {
  loading: boolean;
  error: string | null;

  currentOrder: Order | null;
  orders: Order[];
  filteredOrders: Order[]; // Reactive client subset computed array
  statusFilter: string;    // Tracking parameter state ('all', 'pending', etc.)

  // --- SETTERS / UTILITIES ---
  setStatusFilter: (status: string) => void;
  applyFilters: () => void;
  clearOrder: () => void;

  // --- USER ACTIONS ---
  createOrder: (payload: CreateOrderDto) => Promise<Order>;
  fetchMyOrders: () => Promise<void>;
  fetchOrderById: (id: string) => Promise<Order>;

  // --- VENDOR/ADMIN ACTIONS ---
  fetchVendorOrders: () => Promise<void>;
  fetchAllOrders: (status?: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<Order>;
  deleteOrder: (orderId: string) => Promise<void>; // Added delete action definition
}

export const useOrderStore = create<OrderState>((set, get) => ({
  loading: false,
  error: null,
  currentOrder: null,
  orders: [],
  filteredOrders: [],
  statusFilter: "all",

  // --- SET FILTER STATE AND RECOMPUTE ---
  setStatusFilter: (status) => {
    set({ statusFilter: status });
    get().applyFilters();
  },

  // --- CORE FILTER COMPILER ---
  applyFilters: () => {
    const { orders, statusFilter } = get();
    
    if (!statusFilter || statusFilter.toLowerCase() === "all") {
      set({ filteredOrders: orders });
    } else {
      set({
        filteredOrders: orders.filter(
          (order) => order.status?.toLowerCase() === statusFilter.toLowerCase()
        ),
      });
    }
  },

  // --- CLEAR CURRENT ORDER ---
  clearOrder: () => set({ currentOrder: null, error: null }),

  // --- CREATE ORDER ---
  createOrder: async (payload) => {
    try {
      set({ loading: true, error: null });
      const order = await OrderClient.create(payload);
      set({ currentOrder: order, loading: false });
      return order;
    } catch (err: any) {
      set({ error: err?.message || "Failed to create order", loading: false });
      throw err;
    }
  },

  // --- FETCH USER ORDERS ---
  fetchMyOrders: async () => {
    try {
      set({ loading: true, error: null });
      const orders = await OrderClient.getMyOrders();
      set({ orders, loading: false });
      get().applyFilters(); 
    } catch (err: any) {
      set({ error: err?.message || "Failed to fetch orders", loading: false });
    }
  },

  fetchOrderById: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const order = await OrderClient.getById(id);
      set({ currentOrder: order, loading: false });
      return order;
    } catch (err: any) {
      set({ error: err?.message || "Failed to fetch order", loading: false });
      throw err;
    }
  },

  // --- VENDOR ORDERS ---
  fetchVendorOrders: async () => {
    try {
      set({ loading: true, error: null });
      const orders = await OrderClient.getVendorOrders();
      set({ orders, loading: false });
      get().applyFilters(); 
    } catch (err: any) {
      set({ error: err?.message || "Failed to fetch vendor orders", loading: false });
    }
  },

  // --- ADMIN ORDERS ---
  fetchAllOrders: async (status) => {
    try {
      set({ loading: true, error: null });
      
      const targetFilter = status || get().statusFilter;
      const queryParam = targetFilter === "all" ? undefined : targetFilter;
      
      const orders = await OrderClient.getAllOrders(queryParam);
      set({ orders, loading: false });
      
      get().applyFilters();
    } catch (err: any) {
      set({ error: err?.message || "Failed to fetch all orders", loading: false });
    }
  },

  // --- UPDATE ORDER STATUS ---
  updateOrderStatus: async (orderId, status) => {
    try {
      set({ loading: true, error: null });
      const updatedOrder = await OrderClient.updateStatus(orderId, status);
      
      set((state) => ({
        orders: state.orders.map((o) => (o.id === orderId ? updatedOrder : o)),
        currentOrder: state.currentOrder?.id === orderId ? updatedOrder : state.currentOrder,
        loading: false,
      }));
      
      get().applyFilters();
      return updatedOrder;
    } catch (err: any) {
      set({ error: err?.message || "Failed to update order status", loading: false });
      throw err;
    }
  },
  // --- DELETE ORDER ENTRY ---
  deleteOrder: async (orderId) => {
    try {
      set({ loading: true, error: null });
      
      // Assumes your API Client exposes a delete method matching database parameters
      if (typeof (OrderClient as any).delete === "function") {
        await (OrderClient as any).delete(orderId);
      } else {
        // Fallback for custom endpoint routers like OrderClient.deleteOrder(id)
        await OrderClient.updateStatus(orderId, "cancelled"); 
      }

      set((state) => ({
        orders: state.orders.filter((o) => o.id !== orderId),
        currentOrder: state.currentOrder?.id === orderId ? null : state.currentOrder,
        loading: false,
      }));

      get().applyFilters();
    } catch (err: any) {
      set({ error: err?.message || "Failed to remove order registry record", loading: false });
      throw err;
    }
  }
}));
