import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { getImageUrl } from '../utils/imageHelper';
import { FaMagic } from 'react-icons/fa';

function CartUpSell({ cartItems, onAddToCart }) {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (cartItems && cartItems.length > 0) {
            const fetchCrossSell = async () => {
                try {
                    setLoading(true);
                    const itemIds = cartItems.map(item => item.maMon || item.MaMon);
                    const res = await axiosClient.post('/Recommendation/CartCrossSell', itemIds);
                    
                    if (Array.isArray(res)) setSuggestions(res);
                } catch (error) {
                    console.error("Lỗi tải gợi ý Cross-sell:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchCrossSell();
        } else {
            setSuggestions([]);
        }
    }, [cartItems]); 

    if (loading) return <div style={{ marginTop: '30px', color: '#b2bec3', textAlign: 'center', fontWeight: 'bold' }}>Đang cho AI phân tích giỏ hàng... ✨</div>;
    if (suggestions.length === 0) return null;

    return (
        <div style={{ marginTop: '30px', background: '#fff', borderRadius: '20px', padding: '25px', boxShadow: '0 5px 15px rgba(0,0,0,0.02)', border: '1px dashed #0984e3' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaMagic color="#0984e3" size={18} />
                </div>
                <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: '#2d3436' }}>
                        Gợi ý từ AI: Thiếu gì bù nấy
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#636e72', marginTop: '4px' }}>
                        Giỏ hàng của bạn sẽ hoàn hảo hơn nếu dùng kèm các món này:
                    </p>
                </div>
            </div>
            
            {/* DẢI TRƯỢT NGANG (HORIZONTAL SLIDER) */}
            <div className="custom-scrollbar" style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '15px' }}>
                {suggestions.map(item => {
                    const price = Number(item.giaBan || item.gia || 0);
                    const thumbImg = item.hinhAnh || item.HinhAnh || item.hinhAnhMonAns?.[0]?.duongDan;
                    const tenMon = item.tenMon || item.TenMon;

                    return (
                        <div key={item.maMon} style={{ 
                            minWidth: '180px', 
                            maxWidth: '180px', 
                            background: '#fff', 
                            borderRadius: '16px', 
                            padding: '12px', 
                            boxShadow: '0 4px 15px rgba(0,0,0,0.04)', 
                            border: '1px solid #f1f2f6',
                            display: 'flex', 
                            flexDirection: 'column',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                        }}
                        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(230,74,25,0.15)'; e.currentTarget.style.borderColor = '#ffe0b2'; }}
                        onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#f1f2f6'; }}
                        >
                            <div style={{ position: 'relative' }}>
                                <img src={getImageUrl(thumbImg)} alt={tenMon} style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '10px', marginBottom: '12px' }} onError={(e) => e.target.src='https://placehold.co/120?text=Food'} />
                                
                                {/* 👉 NHÃN EXPLAINABLE AI NỔI LÊN TRÊN HÌNH */}
                                <div style={{ position: 'absolute', top: '5px', left: '5px', display: 'flex', flexDirection: 'column', gap: '4px', pointerEvents: 'none' }}>
                                    <div style={{ background: 'rgba(255, 255, 255, 0.95)', color: '#0984e3', padding: '3px 6px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '800', border: '1px solid rgba(9, 132, 227, 0.3)', backdropFilter: 'blur(4px)' }}>
                                        🛒 Cross-Sell
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#2d3436', marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {tenMon}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                                    <span style={{ color: '#e64a19', fontWeight: '800', fontSize: '1rem' }}>
                                        {price.toLocaleString()} đ
                                    </span>
                                    {/* 👉 ĐÃ FIX: DÙNG TEXT ICON ĐỂ ĐẢM BẢO 100% LUÔN HIỆN */}
                                    <button 
                                        onClick={(e) => { e.preventDefault(); onAddToCart(item); }}
                                        style={{ 
                                            backgroundColor: '#ffe0b2', 
                                            color: '#e64a19', 
                                            border: 'none', 
                                            width: '32px', 
                                            height: '32px',
                                            minWidth: '32px',
                                            minHeight: '32px',
                                            borderRadius: '50%', 
                                            display: 'flex', 
                                            justifyContent: 'center', 
                                            alignItems: 'center', 
                                            cursor: 'pointer', 
                                            transition: '0.2s',
                                            flexShrink: 0 
                                        }}
                                        onMouseOver={e => { e.currentTarget.style.backgroundColor = '#e64a19'; e.currentTarget.style.color = '#fff'; }}
                                        onMouseOut={e => { e.currentTarget.style.backgroundColor = '#ffe0b2'; e.currentTarget.style.color = '#e64a19'; }}
                                        title="Thêm vào giỏ"
                                    >
                                        <span style={{ fontSize: '18px', fontWeight: '900', lineHeight: 1 }}>+</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f2f6; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a4b0be; }
            `}</style>
        </div>
    );
}

export default CartUpSell;