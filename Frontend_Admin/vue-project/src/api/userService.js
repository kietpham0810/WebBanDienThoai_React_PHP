import { apiClient } from './apiClient'

export const userService = {
  getAll: async () => {
    const response = await apiClient.get('users')
    return response.data
  },
  getById: async (id) => {
    const response = await apiClient.get(`users/${id}`)
    return response.data
  },
  create: async (payload) => {
    const response = await apiClient.post('users', payload)
    return response.data
  },
  update: async (id, payload) => {
    const response = await apiClient.put(`users/${id}`, payload)
    return response.data
  },
  remove: async (id) => {
    const response = await apiClient.delete(`users/${id}`)
    return response.data
  },
}
