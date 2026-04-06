import { localApi } from "../libs/api";
import type { Order, CreateOrderDto } from "../types/api";

export const OrderClient = {
  /**
   * Place a new order
   * Triggered from CheckoutForm.tsx
   */
  async create(orderData: CreateOrderDto): Promise<Order> {
    try {
      return await localApi.post<Order>("/orders", orderData);
    } catch (error) {
      console.error("Order Creation Error:", error);
      throw new Error("Could not process your order. Please check your payment details.");
    }
  },

  /**
   * Fetch history for the logged-in user
   * Used in MyOrders.tsx
   */
  async getMyOrders(): Promise<Order[]> {
    try {
      return await localApi.get<Order[]>("/orders/my-orders");
    } catch (error) {
      console.error("Fetch Orders Error:", error);
      return []; // Return empty array to prevent UI crashes
    }
  },

  /**
   * Fetch specific order details (for Success or Detail pages)
   */
  async getById(id: string): Promise<Order> {
    return await localApi.get<Order>(`/orders/${id}`);
  },

  /**
   * VENDOR LOGIC: Fetch orders containing vendor's products
   */
  async getVendorOrders(): Promise<Order[]> {
    try {
      return await localApi.get<Order[]>("/orders/vendor/dashboard");
    } catch (error) {
      throw new Error("Unauthorized: Vendor access only.");
    }
  },

  /**
   * ADMIN/VENDOR LOGIC: Update order status (Pending -> Shipped)
   */
  async updateStatus(orderId: string, status: string): Promise<Order> {
    return await localApi.patch<Order>(`/orders/${orderId}/status`, { status });
  }
};