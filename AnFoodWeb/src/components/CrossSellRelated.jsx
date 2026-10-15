import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-toastify';
import { FaLink, FaPlusCircle } from 'react-icons/fa';
import ProductCard from './ProductCard';

function CrossSellRelated({ currentProductId, getPriceInfo, addToCart, getAverageRating }) {
    const [relatedItems, setRelatedItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentProductId) {
            fetchRelatedProducts();
        }
    }, [currentProductId]);

    const fetchRelatedProducts = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get(`/Recommendation/Related/${currentProductId}`);
            if (response && response.success) {
                setRelatedItems(response.data);
            }
        } catch (error) {
            console.error("Lỗi lấy món ăn kèm:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAddToCart = (e, item) => {
        e.preventDefault();
        const itemToAdd = { ...item, soLuong: 1 };
        if (addToCart) addToCart(itemToAdd);
        toast.success(`Đã thêm ${item.tenMon} ăn kèm! 🍟`, { position: "top-center", autoClose: 1500 });
    };

    if (loading) {
        return (
            <div className="container mt-4 mb-5">
                <h4 className="mb-4" style={{ fontWeight: 'bold', color: '#2d3436' }}>Thường được mua cùng</h4>
                <div style={{ display: 'flex', gap: '20px', overflow: 'hidden' }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ minWidth: '250px', height: '400px', background: '#f1f2f6', borderRadius: '15px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
                    ))}
                </div>
            </div>
        );
    }

    if (relatedItems.length === 0) return null;

    return (
        <div className="cross-sell-section mt-5 pt-4" style={{ borderTop: '2px dashed #eee' }}>
            <div className="container">
                <div className="d-flex align-items-center mb-4">
                    <FaLink className="text-primary me-2" size={24} />
                    <h3 className="m-0" style={{ fontWeight: '800', color: '#2d3436', fontFamily: '"Playfair Display", serif' }}>
                        Thường được mua cùng
                    </h3>
                </div>
                
                <p className="text-muted mb-4">Khách hàng thưởng thức món này cũng thường chọn thêm các món dưới đây để bữa ăn thêm trọn vẹn.</p>

                <div className="custom-scrollbar" style={{ display: 'flex', flexNowrap: 'nowrap', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
                    {relatedItems.map((item) => (
                        <div key={item.maMon} style={{ minWidth: '250px', maxWidth: '280px' }}>
                            <ProductCard 
                                item={item}
                                priceInfo={getPriceInfo ? getPriceInfo(item) : { isSale: false, finalPrice: item.giaBan || item.gia }}
                                rating={getAverageRating ? getAverageRating(item.maMon) : 0}
                                onAddToCart={handleQuickAddToCart}
                                customBadge={
                                    <div style={{ background: '#0984e3', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', display:'flex', alignItems:'center', gap:'4px' }}>
                                        <FaPlusCircle /> Gợi ý ăn kèm
                                    </div>
                                }
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CrossSellRelated;