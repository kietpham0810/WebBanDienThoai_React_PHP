import { apiClient } from './apiClient'

export const orderService = {
  getAll: async () => {
    const response = await apiClient.get('orders')
    return response.data
  },
  getById: async (id) => {
    const response = await apiClient.get(`orders/${id}`)
    return response.data
  },
  updateStatus: async (id, status) => {
    const response = await apiClient.put(`orders/${id}`, { status })
    return response.data
  },
}
