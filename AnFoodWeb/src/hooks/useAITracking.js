import { useCallback } from 'react';
import axiosClient from '../api/axiosClient'; // Đảm bảo lùi 1 cấp ra src rồi vào api

const useAITracking = () => {
    const trackAction = useCallback((maMon, hanhVi) => {
        // 1. Lấy user từ localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?.maNguoiDung || user?.id || null;

        // Nếu không có mã món hoặc khách chưa đăng nhập -> Không theo dõi
        if (!maMon || !userId) return;

        // 2. Bắn tin hiệu về Backend (Ghi nhận ngầm)
        axiosClient.post('/Tracking/Record', {
            maNguoiDung: userId,
            maMon: maMon,
            hanhVi: hanhVi // 'view' hoặc 'cart'
        }).catch(err => console.log("AI Tracking log error:", err.message));
    }, []);

    return trackAction;
};

export default useAITracking;