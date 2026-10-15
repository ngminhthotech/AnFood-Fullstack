import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaTrash } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import axiosClient from '../../api/axiosClient'; 
import ProductCard from '../../components/ProductCard';

function Favorites({ user, addToCart }) {
    const [favorites, setFavorites] = useState([]);
    const [banners, setBanners] = useState([]); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        if (!user || !user.id) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const [favRes, bannerRes] = await Promise.all([
                axiosClient.get(`/YeuThich/User/${user.id}`),
                axiosClient.get('/QuangCao/Active').catch(() => [])
            ]);
            
            setFavorites(Array.isArray(favRes) ? favRes : []);
            setBanners(Array.isArray(bannerRes) ? bannerRes : []);
        } catch (error) {
            console.error("Lỗi lấy danh sách yêu thích:", error);
        } finally {
            setLoading(false);
        }
    };

    const getPriceInfo = (item) => {
        if (!item) return { isSale: false, finalPrice: 0, originalPrice: 0, percent: 0 };
        const safeBanners = Array.isArray(banners) ? banners : [];
        const itemId = Number(item.maMon || item.MaMon);
        const itemCatId = Number(item.maDanhMuc || item.MaDanhMuc);
        const originalPrice = Number(item.giaBan || item.gia || 0);

        const itemBanner = safeBanners.find(b => Number(b.maMon) === itemId && Number(b.phanTramGiam) > 0);
        const categoryBanner = safeBanners.find(b => {
            const bCatId = Number(b.maDanhMuc || 0);
            const bMonId = Number(b.maMon || 0);
            return bCatId === itemCatId && bMonId === 0 && Number(b.phanTramGiam) > 0; 
        });

        const appliedBanner = itemBanner || categoryBanner;

        if (appliedBanner) {
            const discountPercent = Number(appliedBanner.phanTramGiam || 0);
            if (discountPercent > 0) {
                return {
                    isSale: true,
                    originalPrice: originalPrice,
                    finalPrice: originalPrice * (1 - discountPercent / 100),
                    percent: discountPercent
                };
            }
        }
        return { isSale: false, originalPrice: originalPrice, finalPrice: originalPrice, percent: 0 };
    };

    const handleRemoveFavorite = async (e, maMon) => {
        e.preventDefault(); 
        e.stopPropagation(); // 👉 Chặn sự kiện click lan xuống thẻ dưới
        try {
            await axiosClient.post('/YeuThich/Toggle', {
                maNguoiDung: user.id,
                maMon: maMon
            });
            setFavorites(favorites.filter(item => (item.maMon || item.MaMon) !== maMon));
            toast.success("Đã bỏ thích món ăn 💔", { autoClose: 1500 });
        } catch (error) {
            toast.error("Có lỗi xảy ra khi xóa!");
        }
    };

    const handleBuyNow = (e, item) => {
        if (e) e.preventDefault();
        addToCart({ ...item, soLuong: 1 });
        toast.success(`Đã thêm ${item.tenMon || item.TenMon} vào giỏ!`, { autoClose: 1500, theme: "colored" });
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><div className="loader">Đang tải danh sách... 🍕</div></div>;

    if (!user || !user.id) {
        return (
            <div style={{ textAlign: 'center', padding: '100px', background: '#f8f9fa', minHeight: '80vh' }}>
                <h2>Vui lòng đăng nhập để xem danh sách yêu thích! 🔒</h2>
            </div>
        );
    }

    return (
        <div style={{ background: '#f8f9fa', minHeight: '80vh', padding: '40px 20px', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
            <ToastContainer />
            <div className="container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '2rem', color: '#2d3436', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaHeart color="#ff4757" /> Món ngon bạn đã thích
                </h2>

                {favorites.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px', background: '#fff', borderRadius: '20px', boxShadow: '0 5px 20px rgba(0,0,0,0.02)' }}>
                        <FaHeart size={60} color="#ffe0e3" style={{ marginBottom: '20px' }} />
                        <h3 style={{ color: '#636e72' }}>Bạn chưa yêu thích món nào cả.</h3>
                        <Link to="/menu" style={{ display: 'inline-block', marginTop: '15px', padding: '12px 30px', background: '#e64a19', color: '#fff', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold', transition: '0.3s' }} onMouseOver={e => e.target.style.transform='scale(1.05)'} onMouseOut={e => e.target.style.transform='scale(1)'}>
                            Khám phá thực đơn ngay
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '30px' }}>
                        {favorites.map((item) => {
                            const currentId = item.maMon || item.MaMon;
                            return (
                                <div key={currentId} style={{ height: '100%' }}>
                                    <ProductCard 
                                        item={item}
                                        priceInfo={getPriceInfo(item)}
                                        rating={item.diemDanhGia || item.DiemDanhGia || 0}
                                        onAddToCart={(e, itemToCart) => handleBuyNow(e, itemToCart)}
                                        
                                        // 👉 FIX LỖI TÀNG HÌNH: Dùng div thay vì button và ép màu cứng
                                        customBadge={
                                            <div 
                                                onClick={(e) => handleRemoveFavorite(e, currentId)}
                                                style={{ 
                                                    background: '#fff', 
                                                    border: '1px solid #ffe0e3', 
                                                    width: '38px', height: '38px', 
                                                    borderRadius: '50%', cursor: 'pointer', 
                                                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)', 
                                                    display: 'flex', justifyContent: 'center', alignItems: 'center', 
                                                    transition: '0.2s' 
                                                }}
                                                onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = '#fff5f6'; }}
                                                onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#fff'; }}
                                                title="Bỏ thích"
                                            >
                                                {/* 👉 Ép màu cứng vào đây */}
                                                <FaTrash size={16} color="#ff4757" /> 
                                            </div>
                                        }
                                    />
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Favorites;