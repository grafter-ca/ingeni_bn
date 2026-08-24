// src/api/client.ts
import axios from "axios";

const API_BASE_URL = import.meta.env.BETTER_AUTH_URL || "http://localhost:8000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, 
});

