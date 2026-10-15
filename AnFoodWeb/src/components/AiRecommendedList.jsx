import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-toastify';
import { FaMagic, FaFireAlt, FaSyncAlt } from 'react-icons/fa';
import ProductCard from './ProductCard'; 

function AiRecommendedList({ getPriceInfo, addToCart, getAverageRating }) {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    // 👉 FIX 1: Chuyển state type mặc định thành rỗng, chờ API trả về
    const [type, setType] = useState(''); 
    const [contextReason, setContextReason] = useState(null); 
    const [userName, setUserName] = useState('');

    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.maNguoiDung || user?.id || 0; 

    useEffect(() => {
        if (user?.hoTen) setUserName(user.hoTen.split(' ').pop());
        callBackendAI();
    }, [userId]);

    const callBackendAI = async () => {
        try {
            setLoading(true);
            let url = `/Recommendation/ForUser/${userId}`; 
            
            const currentHour = new Date().getHours();
            url += `?currentHour=${currentHour}`;

            const savedWeather = localStorage.getItem('currentWeather');
            if (savedWeather) {
                const wx = JSON.parse(savedWeather);
                url += `&currentTemp=${wx.temp}&weatherCode=${wx.code}`;
            }

            const response = await axiosClient.get(url);
            
            if (response && response.success) {
                setRecommendations(response.data);
                // 👉 FIX 2: Bắt đúng loại Type từ API để Render Tiêu đề
                setType(response.type); 
                if (response.contextText) setContextReason(response.contextText);
            } else if (Array.isArray(response)) {
                setRecommendations(response);
                setType('fallback'); // Nếu lỗi trả thẳng mảng, quy về hàng thịnh hành
            }
        } catch (error) { 
            console.error("Lỗi AI Recommendation:", error); 
        } finally { 
            setTimeout(() => setLoading(false), 800); 
        }
    };

    const handleShuffle = () => {
        setLoading(true);
        setTimeout(() => {
            const shuffled = [...recommendations].sort(() => 0.5 - Math.random());
            setRecommendations(shuffled);
            setLoading(false);
        }, 500);
    };

    const handleQuickAddToCart = (e, item) => {
        e.preventDefault();
        const itemToAdd = { ...item, soLuong: 1 };
        if(addToCart) addToCart(itemToAdd);
        toast.success(`Đã thêm ${item.tenMon || item.TenMon} vào giỏ! 🛒`, { position: "top-center", autoClose: 1500 });
    };

    const getAiBadge = (monAn) => {
        let text = "🔥 Đang hot";
        let bgColor = "#e64a19"; 

        // 👉 FIX 3: Nếu là Fallback (Chưa có lịch sử) thì dán mác Đang Hot
        if (type === 'fallback' || type === 'trending') {
            return (
                <div style={{ background: bgColor, color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', display:'flex', alignItems:'center', gap:'5px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                    {text}
                </div>
            );
        }

        // Còn nếu là Personalized thì ưu tiên Context (Đêm, Mưa, Nắng) hoặc Món Tủ
        text = "✨ Hợp khẩu vị";
        bgColor = "#111";
        
        const hour = new Date().getHours();
        const savedWeather = localStorage.getItem('currentWeather');
        let isRainy = false;
        let isHot = false;

        if (savedWeather) {
            const wx = JSON.parse(savedWeather);
            if (wx.code >= 50) isRainy = true;
            if (wx.temp >= 32) isHot = true;
        }

        const categoryId = monAn.maDanhMuc || monAn.MaDanhMuc;

        if (hour >= 21 || hour <= 3) {
            if (categoryId === 5 || categoryId === 6) { text = "🦉 Ăn vặt đêm khuya"; bgColor = "#6c5ce7"; }
        }
        else if (isRainy && (categoryId === 2 || categoryId === 5)) {
            text = "🌧️ Hợp ngày mưa"; bgColor = "#0984e3";
        }
        else if (isHot && categoryId === 3) {
            text = "☀️ Giải nhiệt trưa nay"; bgColor = "#00b894";
        }
        else {
             text = "❤️ Món Tủ Của Bạn"; bgColor = "#ff4757"; // Fallback của Cá nhân hóa
        }

        return (
            <div style={{ background: bgColor, color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', display:'flex', alignItems:'center', gap:'5px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                {text}
            </div>
        );
    };

    const renderHeader = () => {
        // 👉 FIX 4: Quyết định icon và tiêu đề phụ thuộc vào Type
        const isPersonalized = type.includes("personalized") || type.includes("hybrid");
        
        // Cú lừa UI: Nếu C# trả contextReason thì lấy, còn không thì tự sinh câu dựa trên Type
        let defaultTitle = isPersonalized ? `Dành riêng cho bạn, ${userName}!` : "Món ngon đang thịnh hành";
        let displayTitle = contextReason || defaultTitle;
        
        // Sửa câu của trang Gợi Ý
        if (displayTitle === "Gợi ý cá nhân hóa dựa trên ML.NET (Collaborative Filtering)") {
             displayTitle = "Mua lại món quen";
        }

        return (
            <div className="d-flex align-items-center justify-content-between w-100 mb-4">
                <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.2rem', margin: 0, color: '#2d3436', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isPersonalized ? <FaMagic color="#0984e3" /> : <FaFireAlt color="#e64a19" />}
                    {displayTitle}
                </h2>
                <button onClick={handleShuffle} style={{ padding: '8px 16px', background: '#fff', border: '1px solid #dfe6e9', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#636e72', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    <FaSyncAlt /> Đổi món
                </button>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="container mt-5 mb-5" style={{ padding: '80px 0' }}>
                {renderHeader()}
                <div style={{ display: 'flex', gap: '20px', overflow: 'hidden' }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ minWidth: '280px', height: '480px', background: '#f5f6fa', borderRadius: '20px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
                    ))}
                </div>
            </div>
        );
    }

    if (recommendations.length === 0) return null;

    return (
        <section style={{ padding: '80px 0', background: '#fff' }}>
            <div className="container">
                {renderHeader()}
                <div className="custom-scrollbar" style={{ display: 'flex', flexNowrap: 'nowrap', gap: '25px', overflowX: 'auto', paddingBottom: '20px' }}>
                    {recommendations.map((item) => (
                        <div key={item.maMon || item.MaMon} style={{ minWidth: '280px', maxWidth: '300px' }}>
                            <ProductCard 
                                item={item}
                                priceInfo={getPriceInfo ? getPriceInfo(item) : { isSale: false, finalPrice: item.giaBan || item.gia }}
                                rating={getAverageRating ? getAverageRating(item.maMon || item.MaMon) : 0}
                                onAddToCart={handleQuickAddToCart}
                                customBadge={getAiBadge(item)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default AiRecommendedList;