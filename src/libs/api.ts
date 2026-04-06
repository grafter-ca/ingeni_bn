// src/libs/api.ts

const FAKE_BASE = "https://api.escuelajs.co/api/v1";
const LOCAL_BASE = "http://localhost:8000"; // Added /api prefix if NestJS uses it

async function baseRequest<T>(baseUrl: string, endpoint: string, options: any = {}): Promise<T> {
  const url = `${baseUrl}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
    body: options.body ? JSON.stringify(options.body) : undefined,

  });

  if (!response.ok) throw new Error(`Failed at ${url}`);
  return response.json();
}

// ✅ Worker 1: Local
export const localApiClient = <T>(endpoint: string) => 
  baseRequest<T>(LOCAL_BASE, endpoint, { credentials: "include" });

export const localApi = {
  get: <T>(endpoint: string) => 
    baseRequest<T>(LOCAL_BASE, endpoint, { method: "GET", credentials: "include" }),

  post: <T>(endpoint: string, body: any) => 
    baseRequest<T>(LOCAL_BASE, endpoint, { 
      method: "POST", 
      body: JSON.stringify(body), 
      credentials: "include" 
    }),

  patch: <T>(endpoint: string, body: any) => 
    baseRequest<T>(LOCAL_BASE, endpoint, { 
      method: "PATCH", 
      body: JSON.stringify(body), 
      credentials: "include" 
    }),

  delete: <T>(endpoint: string) => 
    baseRequest<T>(LOCAL_BASE, endpoint, { method: "DELETE", credentials: "include" }),
};

// ✅ Worker 2: Fake
export const fakeApiClient = <T>(endpoint: string) => 
  baseRequest<T>(FAKE_BASE, endpoint);