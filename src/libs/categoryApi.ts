import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.BETTER_AUTH_URL || 'http://localhost:8000',
});

export interface Category {
  id: string;
  name: string;
  image: string;
  slug?: string;
}

export const categoryApi = {
  findAll: () => api.get<Category[]>('/categories').then(res => res.data),
  findOne: (id: string) => api.get<Category>(`/categories/${id}`).then(res => res.data),
  create: (data: Partial<Category>) => api.post<Category>('/categories', data).then(res => res.data),
  update: (id: string, data: Partial<Category>) => api.patch<Category>(`/categories/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};