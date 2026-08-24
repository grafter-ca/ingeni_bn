// src/libs/api.ts

const FAKE_BASE = "https://api.escuelajs.co/api/v1";
const LOCAL_BASE = "http://localhost:8000/api";

async function baseRequest<T>(
  baseUrl: string,
  endpoint: string,
  options: RequestInit & { credentials? : RequestCredentials} = {}
): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const url = `${baseUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: isFormData ? {} : {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body:isFormData ? options.body : JSON.stringify(options.body),
    // credentials: options.credentials || "omit",
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Request failed at ${url}: ${errorText || response.statusText}`);
  }

  return response.json();
}

// --- Local API Wrapper ---
export const localApi = {
  get: async <T>(endpoint: string, params?: Record<string, any>): Promise<T> => {
    let url = endpoint;
    if (params) {
      const query = new URLSearchParams(params as any).toString();
      url += `?${query}`;
    }
    return baseRequest<T>(LOCAL_BASE, url, { method: "GET", credentials: "include" });
  },

  post: async <T>(endpoint: string, body?: any): Promise<T> =>
    baseRequest<T>(LOCAL_BASE, endpoint, { method: "POST", body, credentials: "include" }),

  patch: async <T>(endpoint: string, body?: any): Promise<T> =>
    baseRequest<T>(LOCAL_BASE, endpoint, { method: "PATCH", body, credentials: "include" }),

  delete: async <T>(endpoint: string): Promise<T> =>
    baseRequest<T>(LOCAL_BASE, endpoint, { method: "DELETE", credentials: "include" }),
};

// --- Fake API Wrapper ---
export const fakeApiClient = <T>(endpoint: string) => baseRequest<T>(FAKE_BASE, endpoint);