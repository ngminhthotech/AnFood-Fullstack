// src/hooks/useTracking.js
import { useCallback } from 'react';
import axiosClient from '../api/axiosClient'; // Đường dẫn trỏ tới file axiosClient của sếp
import CONFIG from '../config'; // Trỏ tới file config chứa API_URL sếp vừa làm

export const useTracking = () => {
    const trackEvent = useCallback((actionType, payload) => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return; // Chỉ theo dõi khách đã đăng nhập
            const user = JSON.parse(userStr);

            const data = {
                maNguoiDung: user.id || user.maNguoiDung,
                loaiHanhVi: actionType,
                ...payload
            };

            // Chuẩn Enterprise: Dùng sendBeacon chạy ngầm, rớt mạng hoặc đóng tab vẫn gửi được
            if (navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
                navigator.sendBeacon(`${CONFIG.API_URL}/Recommendation/TrackBehavior`, blob);
            } else {
                // Fallback về axios nếu trình duyệt cũ
                axiosClient.post('/Recommendation/TrackBehavior', data).catch(() => {});
            }
        } catch (error) {
            console.debug("Tracking ignored:", error);
        }
    }, []);

    return trackEvent;
};