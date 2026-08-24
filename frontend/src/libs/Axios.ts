// Example frontend api.ts configuration
import axios from 'axios';

export const api = axios.create({
  // Ensure the baseURL explicitly includes '/api' if your backend expects it
  baseURL: 'http://localhost:8000/api', 
  withCredentials: true, 
});