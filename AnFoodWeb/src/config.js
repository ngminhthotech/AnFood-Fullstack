// src/config.js

// Lấy biến môi trường, nếu không có thì dùng fallback (dự phòng)
const CONFIG = {
    // Link gốc (dùng cho ảnh)
    API_ROOT: import.meta.env.VITE_API_ROOT || 'http://localhost:5010',
    
    // Link API (dùng cho dữ liệu)
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5010/api',
};

// Log ra để debug (F12 xem biết ngay đang chạy môi trường nào)
console.log("🚀 App Config Loaded:", CONFIG);

export default CONFIG;