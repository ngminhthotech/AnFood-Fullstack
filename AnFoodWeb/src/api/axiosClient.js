import axios from 'axios';
import CONFIG from '../config'; // Import từ file config của sếp

const axiosClient = axios.create({
    // Nếu trong config sếp chưa điền link, nó sẽ tự động lấy cổng 5010 (cổng Backend sếp đang chạy)
    baseURL: CONFIG.API_URL || 'http://localhost:5010/api', 
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // Giữ timeout 30s để tránh treo request
});

// --- 1. INTERCEPTOR REQUEST: Tự động gắn Token cho mọi request ---
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- 2. INTERCEPTOR RESPONSE: Xử lý dữ liệu & Lỗi tập trung ---
axiosClient.interceptors.response.use(
    (response) => {
        // Trả về thẳng data để code ở các Component gọn hơn (không cần gõ .data nhiều lần)
        if (response && response.data !== undefined) {
            return response.data;
        }
        return response;
    },
    (error) => {
        // Có phản hồi từ server nhưng là lỗi (4xx, 5xx)
        if (error.response) {
            const { status, data } = error.response;

            // 401: Hết hạn token hoặc chưa đăng nhập -> Đá về Login
            if (status === 401) {
                console.warn("⚠️ Token không hợp lệ hoặc đã hết hạn!");
                localStorage.removeItem('user');
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
            }

            // 403: Không có quyền truy cập (vd: User cố tình vào trang Admin)
            if (status === 403) {
                alert("⛔ Bạn không có quyền truy cập chức năng này!");
                window.location.href = '/';
            }

            // Trả về phần data lỗi từ Backend để hiển thị (ví dụ: data.message)
            return Promise.reject(data || error.response);
        }

        // Lỗi không có phản hồi từ server (Mất mạng, Server sập, Sai cổng...)
        console.error("Lỗi kết nối API:", error.message);
        return Promise.reject(error);
    }
);

export default axiosClient;