// src/services/vendorService.ts
import { apiClient } from "../libs/vendor.client"; 
import type { ApiOrder, VendorMetrics, ApiVendor } from "../types";
import type { OnboardingRequest, VendorStats } from "../store/vendorStore";

export const vendorService = {
  getVendors: async (params?: Record<string, any>): Promise<ApiVendor[]> => {
    const response = await apiClient.get(`/vendors`, { params });
    return response.data;
  },

  getVendorById: async (id: string): Promise<ApiVendor> => {
    const response = await apiClient.get(`/vendors/${id}`);
    return response.data;
  },

  getVendorMetrics: async (id: string): Promise<VendorMetrics> => {
    const response = await apiClient.get(`/vendors/${id}/metrics`);
    return response.data;
  },

  getVendorOrders: async (): Promise<ApiOrder[]> => {
    const response = await apiClient.get(`/vendors/orders`).catch(() => ({ data: [] }));
    return response.data;
  },

  getStorefrontMetrics: async (): Promise<VendorStats> => {
    const response = await apiClient.get(`/vendors/metrics`).catch(() => ({
      data: { revenue: 0, activeOrders: 0, productCount: 0 }
    }));
    return response.data;
  },

  updateOrderStatus: async (orderId: string, status: ApiOrder['status'] | string): Promise<ApiOrder> => {
    const response = await apiClient.patch(`/vendors/orders/${orderId}/status`, { status });
    return response.data;
  },

  createVendor: async (payload: Partial<ApiVendor>): Promise<ApiVendor> => {
    const response = await apiClient.post(`/vendors`, payload);
    return response.data;
  },

  updateVendor: async (id: string, payload: Partial<ApiVendor>): Promise<ApiVendor> => {
    const response = await apiClient.patch(`/vendors/${id}`, payload);
    return response.data;
  },

  requestOnboarding: async (description: string) => {
    const response = await apiClient.post(`/vendors/request-onboarding`, { businessDescription: description });
    return response.data;
  },

  deleteVendor: async (id: string): Promise<void> => {
    await apiClient.delete(`/vendors/${id}`);
  },
  
  toggleVendorStatus: async (id: string, currentStatus: boolean): Promise<ApiVendor> => {
    const response = await apiClient.patch(`/vendors/${id}/toggle-status`, { currentStatus });
    return response.data;
  },

  // --- LIVE ONBOARDING REQUEST ENDPOINTS ---
  getPendingRequests: async (): Promise<OnboardingRequest[]> => {
    const response = await apiClient.get(`/vendors/requests`).catch(() => ({ data: [] }));
    return response.data;
  },

  approveVendorRequest: async (requestData: { userId: string; storeName: string; description: string; address: string; phone: string }): Promise<ApiVendor> => {
    const response = await apiClient.post(`/vendors/requests/approve`, requestData);
    return response.data;
  },

  rejectVendorRequest: async (requestId: string): Promise<void> => {
    await apiClient.delete(`/vendors/requests/${requestId}`);
  },

  // --- VENDOR SETTINGS & ADMIN COMMUNICATION ENDPOINTS ---
  getVendorSettings: async (): Promise<any> => {
    const response = await apiClient.get(`/vendors/settings`);
    return response.data;
  },

  updateVendorSettings: async (payload: any): Promise<any> => {
    const response = await apiClient.patch(`/vendors/settings`, payload);
    return response.data;
  },

  submitAdminRequest: async (payload: { type: string; amount?: string; message: string }): Promise<any> => {
    const response = await apiClient.post(`/vendors/admin-request`, payload);
    return response.data;
  }
};