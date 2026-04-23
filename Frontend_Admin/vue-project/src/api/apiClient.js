import axios from 'axios'

// Lấy base URL từ biến môi trường hoặc mặc định
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  // 'http://localhost/web/WebBanDienThoai_React_PHP/BackEnd_API_Admin/index.php'
  'http://thu6chieunhom2-bandienthoai.kesug.com/index.php?request='
// Hàm tạo URL đúng: http://localhost/.../index.php?request=products/1
function makeUrl(endpoint) {
  return `${API_BASE}?request=${endpoint}`
}

export const apiClient = {
  get(endpoint, params = {}) {
    return axios.get(makeUrl(endpoint), { params })
  },
  post(endpoint, data, config = {}) {
    return axios.post(makeUrl(endpoint), data, config)
  },
  put(endpoint, data, config = {}) {
    return axios.put(makeUrl(endpoint), data, config)
  },
  delete(endpoint, config = {}) {
    return axios.delete(makeUrl(endpoint), config)
  },
}
