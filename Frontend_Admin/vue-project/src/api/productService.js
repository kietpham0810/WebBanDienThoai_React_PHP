import { apiClient } from './apiClient'

export const productService = {
  getAll: async () => {
    const response = await apiClient.get('products')
    return response.data
  },
  getById: async (id) => {
    const response = await apiClient.get(`products/${id}`)
    return response.data
  },
  create: async (payload) => {
    const response = await apiClient.post('products', payload)
    return response.data
  },
  update: async (id, payload) => {
    const response = await apiClient.put(`products/${id}`, payload)
    return response.data
  },
  remove: async (id) => {
    const response = await apiClient.delete(`products/${id}`)
    return response.data
  },
}
