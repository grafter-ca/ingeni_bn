import { create } from "zustand";
import { OrderClient } from "../services/order.service";
import type { Order, CreateOrderDto } from "../types/api";

interface OrderState {
  loading: boolean;
  error: string | null;

  currentOrder: Order | null;
  orders: Order[];

  // --- USER ACTIONS ---
  createOrder: (payload: CreateOrderDto) => Promise<Order>;
  fetchMyOrders: () => Promise<void>;
  fetchOrderById: (id: string) => Promise<Order>;

  // --- VENDOR/ADMIN ACTIONS ---
  fetchVendorOrders: () => Promise<void>;
  fetchAllOrders: (status?: string) => Promise<void>;

  updateOrderStatus: (orderId: string, status: string) => Promise<Order>;

  clearOrder: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  loading: false,
  error: null,
  currentOrder: null,
  orders: [],

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
    } catch (err: any) {
      set({ error: err?.message || "Failed to fetch vendor orders", loading: false });
    }
  },

  // --- ADMIN ORDERS ---
  fetchAllOrders: async (status?: string) => {
    try {
      set({ loading: true, error: null });
      const orders = await OrderClient.getAllOrders?.(status); // Ensure OrderClient supports this
      set({ orders, loading: false });
    } catch (err: any) {
      set({ error: err?.message || "Failed to fetch all orders", loading: false });
    }
  },

  // --- UPDATE ORDER STATUS ---
  updateOrderStatus: async (orderId, status) => {
    try {
      set({ loading: true, error: null });
      const updatedOrder = await OrderClient.updateStatus(orderId, status);
      // Update local orders list if present
      set((state) => ({
        orders: state.orders.map((o) => (o.id === orderId ? updatedOrder : o)),
        currentOrder: state.currentOrder?.id === orderId ? updatedOrder : state.currentOrder,
        loading: false,
      }));
      return updatedOrder;
    } catch (err: any) {
      set({ error: err?.message || "Failed to update order status", loading: false });
      throw err;
    }
  },

  // --- CLEAR CURRENT ORDER ---
  clearOrder: () => set({ currentOrder: null, error: null }),
}));