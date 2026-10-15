import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaStar, FaEye, FaTag } from 'react-icons/fa';
import { getImageUrl } from '../utils/imageHelper'; 

// 👉 1. IMPORT HOOK TRACKING XỊN XÒ
import { useTracking } from '../hooks/useTracking'; 

const ProductCard = ({ 
    item, 
    priceInfo, 
    rating, 
    onAddToCart, 
    customBadge 
}) => {
    
    // 👉 2. KHỞI TẠO TRACKING
    const track = useTracking();

    // 👉 3. TỰ ĐỘNG BẮT ĐIỂM SỐ TỪ C#
    const displayRating = item.diemDanhGia ?? item.DiemDanhGia ?? rating ?? 0;

    // Xử lý Thêm giỏ hàng
    const handleCartClick = (e) => {
        if (onAddToCart) {
            onAddToCart(e, item); 
        }
        track('ADD_TO_CART', { maMon: item.maMon || item.MaMon, diemHanhVi: 3.0 }); 
    };

    // Xử lý Xem chi tiết
    const handleViewClick = () => {
        track('VIEW_PRODUCT', { maMon: item.maMon || item.MaMon, diemHanhVi: 1.0 });
    };

    return (
        <motion.div 
            layout 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            style={{ backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', overflow: 'hidden', height: '100%', minHeight: '480px', display: 'flex', flexDirection: 'column', position:'relative' }} 
            whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
        >
            {/* 🎯 1. NHÃN CUSTOM AI (Đã thêm Hiệu ứng Trượt & Bỏ chặn Click) */}
            {customBadge && (
                <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
                    style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 20, pointerEvents: 'none' }} 
                    /* pointerEvents: 'none' giúp khách vẫn click xem chi tiết được dù trỏ chuột đè lên nhãn */
                >
                    {customBadge}
                </motion.div>
            )}

            {/* 🏷️ 2. Nhãn Giảm Giá */}
            {priceInfo?.isSale && (
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{ position: 'absolute', top: '15px', right: '15px', background: '#d63031', color: '#fff', padding: '5px 12px', borderRadius: '30px', fontWeight: 'bold', fontSize: '0.95rem', zIndex: 20, display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 4px 10px rgba(214, 48, 49, 0.4)' }}
                >
                    <FaTag size={12}/> -{priceInfo.percent}%
                </motion.div>
            )}

            {/* 🖼️ 3. Hình Ảnh */}
            <div style={{ height: '260px', position: 'relative', flexShrink: 0 }}>
                <img 
                    src={getImageUrl(item.hinhAnh)} 
                    alt={item.tenMon} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=No+Image'; }} 
                />
                <motion.div initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                    {/* GẮN SỰ KIỆN CLICK VÀO LINK XEM CHI TIẾT */}
                    <Link to={`/product-detail/${item.maMon || item.MaMon}`} onClick={handleViewClick}>
                        <button style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '50%', color: '#2d3436', border: 'none', cursor: 'pointer', display: 'flex', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}>
                            <FaEye size={22} />
                        </button>
                    </Link>
                </motion.div>
            </div>

            {/* 📝 4. Thông Tin & Nút Mua */}
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                    <h3 style={{ fontSize: '1.2rem', margin: '0', color: '#2d3436', fontWeight: '700', lineHeight: '1.4', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.tenMon}
                    </h3>
                    
                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                            {priceInfo?.isSale ? (
                                <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                    <span style={{ color: '#d63031', fontSize: '1.5rem', fontWeight: '800' }}>{priceInfo.finalPrice.toLocaleString()} đ</span>
                                    <span style={{ color: '#b2bec3', fontSize: '1.1rem', textDecoration: 'line-through', fontWeight: '500' }}>{priceInfo.originalPrice.toLocaleString()} đ</span>
                                </div>
                            ) : (
                                <p style={{ color: '#e64a19', fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>
                                    {(item.giaBan || item.gia || 0).toLocaleString()} đ
                                </p>
                            )}
                        </div>
                        
                        <div style={{ color: '#ffa502', display:'flex', alignItems:'center', gap:'4px', fontWeight:'bold', fontSize: '0.95rem' }}>
                            <FaStar /> {displayRating > 0 ? displayRating : 'Mới'}
                        </div>
                    </div>
                </div>

                <motion.button 
                    onClick={handleCartClick} 
                    whileTap={{ scale: 0.95 }} 
                    style={{ width: '100%', padding: '15px', backgroundColor: '#e64a19', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(230, 74, 25, 0.2)', marginTop: 'auto' }}
                >
                    <FaShoppingCart /> ĐẶT MÓN NGAY
                </motion.button>
            </div>
        </motion.div>
    );
};

export default ProductCard;