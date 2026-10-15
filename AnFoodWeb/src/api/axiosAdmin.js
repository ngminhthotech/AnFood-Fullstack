import axios from 'axios';
import CONFIG from '../config'; // Import file config mà sếp đã tạo

const axiosAdmin = axios.create({
  // ✅ Dùng biến môi trường từ Vercel hoặc fallback về localhost
  baseURL: CONFIG.API_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, 
});

// --- 1. INTERCEPTOR REQUEST: Tự động gắn Token ---
axiosAdmin.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- 2. INTERCEPTOR RESPONSE: Xử lý lỗi tập trung ---
axiosAdmin.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        window.location.href = '/login'; 
      }
      if (status === 403) {
        alert("⛔ Bạn không có quyền truy cập trang quản trị!");
        window.location.href = '/'; 
      }
    }
    return Promise.reject(error);
  }
);

export default axiosAdmin;