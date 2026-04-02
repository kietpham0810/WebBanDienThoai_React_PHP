import { apiClient } from './apiClient'

export const categoryService = {
  getAll: async () => {
    const response = await apiClient.get('categories')
    return response.data
  },
  getById: async (id) => {
    const response = await apiClient.get(`categories/${id}`)
    return response.data
  },
  create: async (payload) => {
    const response = await apiClient.post('categories', payload)
    return response.data
  },
  update: async (id, payload) => {
    const response = await apiClient.put(`categories/${id}`, payload)
    return response.data
  },
  remove: async (id) => {
    const response = await apiClient.delete(`categories/${id}`)
    return response.data
  },
}
