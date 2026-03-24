import axios from 'axios'
import { useStore } from '../store'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = useStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const authApi = {
  sendOtp: (phone: string) => api.post('/auth/send-otp', { phone }),
  verifyOtp: (phone: string, code: string) => api.post('/auth/verify-otp', { phone, code }),
}

export const requestsApi = {
  getAll: (params?: any) => api.get('/requests', { params }),
  getOne: (id: string) => api.get(`/requests/${id}`),
  create: (data: any) => api.post('/requests', data),
  updateStatus: (id: string, status: string, comment?: string) =>
    api.patch(`/requests/${id}/status`, { status, comment }),
  assign: (id: string, executor_id: string) =>
    api.patch(`/requests/${id}/assign`, { executor_id }),
  getHistory: (id: string) => api.get(`/requests/${id}/history`),
}

export const categoriesApi = {
  getAll: () => api.get('/categories'),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.patch(`/categories/${id}`, data),
}

export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
}

export const usersApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data: any) => api.patch('/users/me', data),
  getAll: () => api.get('/users'),
  updateRole: (id: string, role: string) => api.patch(`/users/${id}/role`, { role }),
}

export default api
