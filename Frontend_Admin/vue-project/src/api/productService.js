import { apiClient } from './apiClient'

// Base URL cho ảnh sản phẩm
export const PRODUCT_IMAGE_BASE_URL =
  'http://localhost/WebBanDienThoai_React_PHP/BackEnd_API_Admin/uploads/products/'

export const productService = {
  getAll: async () => {
    const response = await apiClient.get('products')
    return response.data
  },
  getById: async (id) => {
    const response = await apiClient.get(`products/${id}`)
    return response.data
  },

  // Tạo sản phẩm mới - truyền FormData, để axios tự set Content-Type với boundary
  create: async (payload) => {
    const formData = buildFormData(payload)
    const response = await apiClient.post('products', formData, {
      // QUAN TRỌNG: KHÔNG set Content-Type thủ công
      // Axios sẽ tự set "multipart/form-data; boundary=xxxx"
      headers: { 'Content-Type': undefined },
    })
    return response.data
  },

  // Cập nhật sản phẩm - gửi POST + _method=PUT vì PHP không nhận $_FILES với PUT
  update: async (id, payload) => {
    const formData = buildFormData(payload)
    formData.append('_method', 'PUT')
    const response = await apiClient.post(`products/${id}`, formData, {
      headers: { 'Content-Type': undefined },
    })
    return response.data
  },

  remove: async (id) => {
    const response = await apiClient.delete(`products/${id}`)
    return response.data
  },
}

// Helper: chuyển object thành FormData (kể cả File object)
function buildFormData(payload) {
  const formData = new FormData()
  for (const key in payload) {
    if (payload[key] !== null && payload[key] !== undefined) {
      formData.append(key, payload[key])
    }
  }
  return formData
}
