import axios from 'axios';

// Chuẩn bị lên chung host rồi, gọi thẳng link gốc luôn không sợ ai chặn
// const TARGET_URL = 'https://thu6chieunhom2-bandienthoai.kesug.com/users';
const TARGET_URL = 'https://thu6chieunhom2-bandienthoai.kesug.com/users';

export const userService = {
  // Đọc danh sách Data (GET)
  getAll: async () => {
    try {
      const response = await axios.get(TARGET_URL);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi load API Fetch Users Database:", error);
      throw error;
    }
  },

  // Tạo user mới (POST)
  create: async (payload) => {
    try {
      const response = await axios.post(TARGET_URL, payload);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo user:", error);
      throw error;
    }
  },

  // Cập nhật user (PUT)
  update: async (id, payload) => {
    try {
      const response = await axios.put(`${TARGET_URL}/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật user:", error);
      throw error;
    }
  },

  // Xoá user (DELETE)
  remove: async (id) => {
    try {
      const response = await axios.delete(`${TARGET_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xoá user:", error);
      throw error;
    }
  },
};
