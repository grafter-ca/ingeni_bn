// src/services/analytics.service.ts
export async function trackTrafficClick(data: {
  actionType: 'whatsapp' | 'call';
  productId?: string;
  vendorId?: string;
}) {
  try {
    const apiUrl = import.meta.env.VITE_BETTER_AUTH_URL || 'http://localhost:8000/api';

    const response = await fetch(`${apiUrl}/analytics/track-click`, {
      method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include',
    });

    if (!response.ok) {
      console.error('Failed to track traffic click:', response.statusText);
    }
  } catch (error) {
    // Fail silently so it never interrupts user experience
    console.error('Error tracking click:', error);
  }
}