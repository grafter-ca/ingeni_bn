const BASE_URL = "https://api.escuelajs.co/api/v1";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string;
};

// Open/Closed: extend with new endpoints without modifying base
export const apiClient = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { method = "GET", body, token } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    ...body ? { body: JSON.stringify(body) } : {}, // make sure that body is handled correctly
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? `HTTP error ${response.status}`);
  }

  return response.json();
};