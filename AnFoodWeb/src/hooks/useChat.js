import { useState } from 'react';
import axiosClient from '../api/axiosClient'; // Đảm bảo đường dẫn này đúng

export const useChat = () => {
    // Khởi tạo tin nhắn chào mừng mặc định
    const [messages, setMessages] = useState([
        { id: 1, text: "Chào bạn! Mình là trợ lý ảo của FastBite. Mình có thể giúp gì cho bạn hôm nay?", sender: 'Bot' }
    ]);
    const [isBotTyping, setIsBotTyping] = useState(false);

    const sendMessage = async (noiDung) => {
        if (!noiDung.trim()) return;

        // 1. Hiện tin nhắn của khách lên màn hình ngay lập tức
        const userMsg = { id: Date.now(), text: noiDung, sender: 'User' };
        setMessages(prev => [...prev, userMsg]);
        setIsBotTyping(true); // Hiện trạng thái "Bot đang gõ..."

        try {
            // Lấy ID người dùng nếu đã đăng nhập
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const userId = user ? (user.id || user.maNguoiDung) : null;

            // 2. Gọi API Backend (cái mà sếp vừa code xong)
            const payload = { 
                MaNguoiDung: userId, 
                NoiDung: noiDung 
            };
            
            const response = await axiosClient.post('/Chatbot/SendMessage', payload);
            
            // 3. Nhận câu trả lời từ Gemini và hiện lên màn hình
            if (response && response.phanHoi) {
                const botMsg = { id: Date.now() + 1, text: response.phanHoi, sender: 'Bot' };
                setMessages(prev => [...prev, botMsg]);
            }

        } catch (error) {
            console.error("Lỗi Chatbot:", error);
            const errorMsg = { id: Date.now() + 1, text: "Xin lỗi, hệ thống của mình đang gặp chút sự cố. Bạn thử lại sau nhé! 😢", sender: 'Bot' };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsBotTyping(false); // Tắt trạng thái "Bot đang gõ..."
        }
    };

    return { messages, isBotTyping, sendMessage };
};