// src/services/admin-analytics.service.ts
import type { TrafficStat } from "../types/admin";

export async function fetchVendorTrafficStats(vendorId: string): Promise<TrafficStat[]> {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  
  const response = await fetch(`${baseUrl}/analytics/vendor/${vendorId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // <-- Crucial if you are using cookie-based Better Auth sessions
  });

  if (!response.ok) {
    throw new Error('Failed to fetch traffic metrics');
  }

  const result = await response.json();
  return result.data || result;
}