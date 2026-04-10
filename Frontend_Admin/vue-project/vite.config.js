import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
  ],
  // Bỏ base khi chạy dev để tránh lỗi assets/routing
  // base: '/admin-ui/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    open: true,
    // Proxy để tránh CORS khi gọi sang XAMPP
    proxy: {
      '/WebBanDienThoai_React_PHP': {
        target: 'http://localhost',
        changeOrigin: true,
      }
    }
  }
})