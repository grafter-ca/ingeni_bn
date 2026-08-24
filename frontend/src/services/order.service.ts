// --- FRONTEND /services/order.service.ts ---
import { OrderClient as orderClient } from "../libs/order-client";

export const OrderClient = {
  create: orderClient.create,
  getMyOrders: orderClient.getMyOrders,
  getById: orderClient.getById,
  getVendorOrders: orderClient.getVendorOrders,
  getAllOrders: orderClient.getAllOrders,
  updateStatus: orderClient.updateStatus,
  updatePaymentStatus: orderClient.updatePaymentStatus, 
};