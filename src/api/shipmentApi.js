import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const shipmentApi = {
  getAll: () => api.get('/shipments'),
  getById: (id) => api.get(`/shipments/${id}`),
  create: (data) => api.post('/shipments', data),
  update: (id, data) => api.put(`/shipments/${id}`, data),
  delete: (id) => api.delete(`/shipments/${id}`),
  search: (query) => api.get(`/shipments/search?q=${query}`),
};