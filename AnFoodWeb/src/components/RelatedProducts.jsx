import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import ProductCard from './ProductCard';
import { FaLink, FaMagic, FaUsers, FaTags } from 'react-icons/fa';

function RelatedProducts({ maMonHienTai, getPriceInfo, getAverageRating, addToCart }) {
    const [relatedItems, setRelatedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recommendType, setRecommendType] = useState('item-based-collaborative'); 

    useEffect(() => {
        const fetchRelated = async () => {
            if (!maMonHienTai) return;
            try {
                setLoading(true);
                const response = await axiosClient.get(`/Recommendation/Related/${maMonHienTai}`);
                
                if (response && response.success) {
                    setRelatedItems(response.data);
                    setRecommendType(response.type); // Bắt loại thuật toán: 'item-based-collaborative' hoặc 'content-based'
                } else if (Array.isArray(response)) {
                    setRelatedItems(response); 
                    setRecommendType('content-based'); // Fallback nếu API trục trặc
                }
            } catch (error) {
                console.error("Lỗi lấy sản phẩm liên quan:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRelated();
    }, [maMonHienTai]);

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Đang phân tích gợi ý món...</div>;
    }

    if (relatedItems.length === 0) return null;

    // 🎯 LOGIC ĐỊNH DANH NHƯ SHOPEE/AMAZON
    let uiConfig = {
        icon: <FaUsers color="#0984e3" size={20} />,
        bgIcon: '#e3f2fd',
        title: "Khách hàng cũng quan tâm",
        subTitle: "Thuật toán AI phát hiện: Người xem món này thường xem các món dưới đây",
        badgeText: "🔥 Đang hot",
        badgeColor: "#0984e3",
        aiTag: "🤝 Item-Based CF",
        aiTagBg: "#dff9fb",
        aiTagColor: "#0984e3"
    };

    if (recommendType === 'content-based') {
        uiConfig = {
            icon: <FaTags color="#e64a19" size={20} />,
            bgIcon: '#fff0e6',
            title: "Sản phẩm tương tự",
            subTitle: "Gợi ý các món ăn có cùng thuộc tính và danh mục",
            badgeText: "✨ Cùng loại",
            badgeColor: "#e64a19",
            aiTag: "🏷️ Content-Based",
            aiTagBg: "#ffeaa7",
            aiTagColor: "#d35400"
        };
    }

    return (
        <div style={{ marginTop: '40px', background: '#fff', borderRadius: '20px', padding: '30px', boxShadow: '0 5px 20px rgba(0,0,0,0.03)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: uiConfig.bgIcon, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {uiConfig.icon}
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#2d3436', fontWeight: '800' }}>
                        {uiConfig.title}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#636e72', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                        <FaMagic color="#a4b0be" size={12}/> {uiConfig.subTitle}
                    </p>
                </div>
            </div>

            <div className="custom-scrollbar" style={{ display: 'flex', flexNowrap: 'nowrap', gap: '20px', overflowX: 'auto', paddingBottom: '15px' }}>
                {relatedItems.map((item) => (
                    <div key={item.maMon || item.MaMon} style={{ minWidth: '240px', maxWidth: '240px' }}>
                        <ProductCard 
                            item={item}
                            priceInfo={getPriceInfo ? getPriceInfo(item) : { isSale: false, finalPrice: item.giaBan || item.gia }}
                            rating={getAverageRating ? getAverageRating(item.maMon || item.MaMon) : 0}
                            onAddToCart={(e, itm) => {
                                e.preventDefault();
                                addToCart({ ...itm, soLuong: 1 });
                            }}
                            customBadge={
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                                    {/* Nhãn Giải thích Thuật toán AI */}
                                    <div style={{ background: uiConfig.aiTagBg, color: uiConfig.aiTagColor, padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '800', border: `1px solid ${uiConfig.aiTagColor}50` }}>
                                        {uiConfig.aiTag}
                                    </div>
                                    <div style={{ background: uiConfig.badgeColor, color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                                        {uiConfig.badgeText}
                                    </div>
                                </div>
                            }
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RelatedProducts;