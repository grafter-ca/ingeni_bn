// --- FRONTEND /libs/order-client.ts ---
import { localApi } from "../libs/api";
import type { Order, CreateOrderDto } from "../types/api";

export const OrderClient = {
  // --- CREATE ORDER ---
  async create(orderData: CreateOrderDto): Promise<Order> {
    try {
      return await localApi.post<Order>("/orders", orderData);
    } catch (error: any) {
      console.error("Order Creation Error:", error);
      throw new Error(error?.response?.data?.message || "Could not process your order.");
    }
  },

  // --- USER ORDERS ---
  async getMyOrders(): Promise<Order[]> {
    try {
      return await localApi.get<Order[]>("/orders/my-orders");
    } catch (error) {
      console.error("Fetch Orders Error:", error);
      return [];
    }
  },

  async getById(id: string): Promise<Order> {
    try {
      return await localApi.get<Order>(`/orders/${id}`);
    } catch (error) {
      console.error("Fetch Order Details Error:", error);
      throw new Error("Could not fetch order details.");
    }
  },

  // --- VENDOR ORDERS ---
  async getVendorOrders(): Promise<Order[]> {
    try {
      return await localApi.get<Order[]>("/orders/vendor/dashboard");
    } catch (error: any) {
      console.error(error);
      throw new Error(error?.response?.data?.message || "Unauthorized: Vendor access only.");
    }
  },

  // --- ADMIN ORDERS ---
  async getAllOrders(status?: string): Promise<Order[]> {
    try {
      return await localApi.get<Order[]>("/orders/admin/all", {
        params: status ? { status } : {},
      });
    } catch (error: any) {
      console.error(error);
      throw new Error(error?.response?.data?.message || "Failed to fetch all orders.");
    }
  },

  // --- UPDATE ORDER STATUS ---
  async updateStatus(orderId: string, status: string): Promise<Order> {
    try {
      return await localApi.patch<Order>(`/orders/${orderId}/status`, { status });
    } catch (error: any) {
      console.error(error);
      throw new Error(error?.response?.data?.message || "Failed to update order status.");
    }
  },
};