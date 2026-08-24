// src/services/vendorService.ts
import { apiClient } from "../libs/vendor.client"; 
import type { ApiOrder, VendorMetrics, ApiVendor } from "../types";

interface VendorStats {
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
    const response = await apiClient.get(`/vendor/orders`);
    return response.data;
  },

  getStorefrontMetrics: async (): Promise<VendorStats> => {
    const response = await apiClient.get(`/vendor/metrics`);
    return response.data;
  },

  updateOrderStatus: async (orderId: string, status: ApiOrder['status']): Promise<ApiOrder> => {
    const response = await apiClient.patch(`/vendor/orders/${orderId}/status`, { status });
    return response.data;
  },

  createVendor: async (payload: Partial<ApiVendor>): Promise<ApiVendor> => {
    const response = await apiClient.post(`/vendors`, payload);
    return response.data;
  },

  updateVendor: async (id: string, payload: Partial<ApiVendor>): Promise<ApiVendor> => {
    const response = await apiClient.put(`/vendors/${id}`, payload);
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
    const response = await apiClient.get(`/vendors/requests`);
    return response.data;
  },

  approveVendorRequest: async (requestData: { userId: string; storeName: string; description: string; address: string; phone: string }): Promise<ApiVendor> => {
    const response = await apiClient.post(`/vendors/requests/approve`, requestData);
    return response.data;
  },

  rejectVendorRequest: async (requestId: string): Promise<void> => {
    await apiClient.delete(`/vendors/requests/${requestId}`);
  }
};