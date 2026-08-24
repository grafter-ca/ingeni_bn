// src/api/client.ts
import axios from "axios";

const API_BASE_URL = import.meta.env.BETTER_AUTH_URL || "http://localhost:8000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, 
  headers: {  
    'Content-Type': 'application/json'
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can handle global 401/403 errors here if needed
    return Promise.reject(error);
  }
);

