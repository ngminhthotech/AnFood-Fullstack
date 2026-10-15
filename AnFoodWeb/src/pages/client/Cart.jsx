import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaArrowLeft, FaShoppingBag, FaTruck, FaShieldAlt } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import axiosClient from '../../api/axiosClient';
import { getImageUrl } from '../../utils/imageHelper';
import { calculateFinalPrice } from '../../utils/priceHelper'; 
import CartUpSell from '../../components/CartUpSell'; 

function Cart({ user, addToCart }) {
  const [cartItems, setCartItems] = useState([]);
  const [banners, setBanners] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false); 
  const navigate = useNavigate();

  const FREE_SHIPPING_THRESHOLD = 150000; 

  const syncToLocalStorage = (items) => {
    localStorage.setItem('cartItems', JSON.stringify(items));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const fetchCartData = async () => {
      try {
        setLoading(true);
        const bannerRes = await axiosClient.get('/QuangCao/Active');
        setBanners(Array.isArray(bannerRes) ? bannerRes : []);

        if (user && (user.id || user.maNguoiDung)) {
          const userId = user.id || user.maNguoiDung;
          const cartRes = await axiosClient.get(`/GioHang/${userId}`);
          
          if (Array.isArray(cartRes) && cartRes.length > 0) {
            const normalizedCart = cartRes.map(item => ({
                ...item,
                maMon: item.maMon || item.MaMon,
                tenMon: item.tenMon || item.TenMon,
                hinhAnh: item.hinhAnh || item.HinhAnh,
                giaBan: Number(item.giaBan || item.gia || 0),
                soLuong: item.soLuong || item.quantity || 1,
                maDanhMuc: item.maDanhMuc || item.MaDanhMuc 
            }));
            setCartItems(normalizedCart);
            syncToLocalStorage(normalizedCart);
          } else {
            setCartItems([]);
            syncToLocalStorage([]);
          }
        } 
        else {
          const localCart = JSON.parse(localStorage.getItem('cartItems')) || [];
          const cleanLocalCart = localCart.map(item => ({
              ...item,
              giaBan: Number(item.giaBan || item.gia || 0)
          }));
          setCartItems(Array.isArray(cleanLocalCart) ? cleanLocalCart : []);
        }
      } catch (err) {
        setCartItems([]);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => { fetchCartData(); }, [user]);

  useEffect(() => {
      const handleCartCleared = () => {
          setCartItems([]);
          localStorage.removeItem('cartItems');
      };
      window.addEventListener('cart-cleared', handleCartCleared);
      return () => window.removeEventListener('cart-cleared', handleCartCleared);
  }, []);

  const handleUpdateQuantity = async (maMon, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;

    const updatedCart = cartItems.map(item => item.maMon === maMon ? { ...item, soLuong: newQty } : item);
    setCartItems(updatedCart);
    syncToLocalStorage(updatedCart);

    if (user) {
        setIsUpdating(true);
        try {
            await axiosClient.post('/GioHang/CapNhat', {
                maNguoiDung: user.id || user.maNguoiDung,
                maMon: maMon, soLuong: newQty
            });
        } catch (error) {} finally { setIsUpdating(false); }
    }
  };

  const handleRemove = async (maMon) => {
    if (!window.confirm("Xóa món này khỏi giỏ?")) return;
    const newCart = cartItems.filter(item => item.maMon !== maMon);
    setCartItems(newCart);
    syncToLocalStorage(newCart);
    toast.info("Đã xóa món ăn", { autoClose: 1000, theme: "colored" });
    if (user) {
        try { await axiosClient.delete(`/GioHang/Xoa/${user.id || user.maNguoiDung}/${maMon}`); } catch (error) {}
    }
  };

  const totalAmount = useMemo(() => {
    return cartItems.reduce((total, item) => {
        const { finalPrice } = calculateFinalPrice(item, banners);
        return total + (finalPrice * (item.soLuong || 1));
    }, 0);
  }, [cartItems, banners]);

  // 👇 HÀM CHECKOUT ĐÃ ĐƯỢC FIX LỖI "UNDEFINED DATA" CỦA AXIOS 👇
  const handleProceedToCheckout = async () => {
    if (!user) { toast.warning("Vui lòng đăng nhập để thanh toán!", { theme: "colored" }); return; }
    if (cartItems.length === 0) { toast.error("Giỏ hàng đang trống!", { theme: "colored" }); return; }
    
    try {
        const payload = cartItems.map(item => ({
            maMonAn: item.maMon,
            soLuong: item.soLuong,
            giaBan: item.giaBan
        }));

        const res = await axiosClient.post('/DonHang/KiemTraTonKho', payload);

        // BẮT CẢ 2 TRƯỜNG HỢP TRẢ VỀ CỦA AXIOS (có .data hoặc lột vỏ)
        if (res.success || (res.data && res.data.success)) {
            const checkoutData = cartItems.map(item => {
                const { finalPrice, originalPrice } = calculateFinalPrice(item, banners);
                return {
                    ...item,
                    giaGoc: originalPrice, 
                    giaBan: finalPrice, 
                    soLuong: item.soLuong || 1
                };
            });
            localStorage.setItem('checkoutItems', JSON.stringify(checkoutData));
            navigate('/checkout');
        }
    } catch (error) {
        if (error.response && error.response.status === 400) {
            // HIỆN POPUP CUSTOM XỊN XÒ KHI BỊ HẾT HÀNG / HẾT DATE
            toast(
                <div style={{ padding: '5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '28px' }}>🛒</span>
                        <strong style={{ fontSize: '1.1rem', color: '#d32f2f' }}>Món này đã hết hàng!</strong>
                    </div>
                    <div style={{ fontSize: '0.95rem', color: '#2d3436', marginBottom: '15px', lineHeight: '1.5' }}>
                        {error.response.data.message.replace('⚠️ Ôi không! ', '')}
                    </div>
                    <div style={{ background: '#e3f2fd', padding: '12px', borderRadius: '10px', fontSize: '0.9rem', color: '#1976d2', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>💡</span> Mẹo: Khám phá các món ngon ở mục "Khách hàng cũng mua kèm" bên dưới nhé!
                    </div>
                </div>, 
                { 
                    position: "top-center", 
                    autoClose: 6000,
                    hideProgressBar: true,
                    style: { borderRadius: '16px', padding: '15px', minWidth: '380px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' } 
                }
            );
        } else {
            toast.error("Có lỗi xảy ra khi kiểm tra giỏ hàng.", { theme: "colored" });
        }
    }
  };

  const shippingProgress = Math.min((totalAmount / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const isFreeShip = totalAmount >= FREE_SHIPPING_THRESHOLD;

  if (loading) return <div style={{ minHeight:'60vh', display:'flex', justifyContent:'center', alignItems:'center' }}><div className="loader">Đang tải giỏ hàng...</div></div>;

  return (
    <div style={{ padding: '50px 20px', background: '#f8f9fa', minHeight: '100vh', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      <ToastContainer />
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#2d3436', margin: 0 }}>Giỏ Hàng <span style={{ color: '#e64a19' }}>({cartItems.length})</span></h2>
            <Link to="/menu" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#636e72', fontWeight: '700', transition: '0.2s' }}><FaArrowLeft /> Tiếp tục chọn món</Link>
        </div>

        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
            <FaShoppingBag size={80} color="#ffe0b2" style={{ marginBottom:'20px' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#2d3436' }}>Giỏ hàng đang trống trơn!</h3>
            <Link to="/menu" style={{ display: 'inline-block', marginTop: '20px', background: '#e64a19', color: '#fff', padding: '15px 40px', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold' }}>Khám Phá Thực Đơn</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px', alignItems: 'start' }}>
            
            {/* CỘT TRÁI */}
            <div>
              {/* THANH FREE SHIP */}
              <div style={{ background: '#fff', padding: '20px 25px', borderRadius: '20px', marginBottom: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)', border: '1px solid #ffeaa7' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', color: '#2d3436' }}>
                          <FaTruck color="#e64a19" size={20} />
                          {isFreeShip ? "Tuyệt vời! Bạn đã được Miễn phí giao hàng." : `Mua thêm ${(FREE_SHIPPING_THRESHOLD - totalAmount).toLocaleString()}đ để được Freeship!`}
                      </div>
                      <div style={{ fontWeight: '800', color: '#e64a19' }}>{Math.floor(shippingProgress)}%</div>
                  </div>
                  <div style={{ height: '8px', background: '#f1f2f6', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ width: `${shippingProgress}%`, height: '100%', background: 'linear-gradient(90deg, #ff9f43, #e64a19)', transition: 'width 0.5s ease' }}></div>
                  </div>
              </div>

              {/* LIST MÓN */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {cartItems.map((item) => {
                  const { finalPrice, originalPrice, isSale, percent } = calculateFinalPrice(item, banners);
                  return (
                    <div key={item.maMon} style={{ background: '#fff', borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.02)', border: '1px solid #f1f2f6' }}>
                      <div style={{ position: 'relative' }}>
                          <img src={getImageUrl(item.hinhAnh)} alt={item.tenMon} style={{ width: '90px', height: '90px', borderRadius: '15px', objectFit: 'cover' }} onError={(e) => e.target.src='https://placehold.co/90?text=Food'}/>
                          {isSale && <span style={{ position: 'absolute', top: '-5px', left: '-5px', background: '#e64a19', color: '#fff', fontSize: '0.7rem', fontWeight: 'bold', padding: '3px 6px', borderRadius: '8px' }}>-{percent}%</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#2d3436', marginBottom: '5px' }}>{item.tenMon}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontWeight: '800', color: '#e64a19', fontSize: '1.1rem' }}>{finalPrice.toLocaleString()}đ</span>
                              {isSale && <span style={{ textDecoration: 'line-through', color: '#b2bec3', fontSize: '0.9rem' }}>{originalPrice.toLocaleString()}đ</span>}
                          </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', background: '#f5f6fa', borderRadius: '50px', padding: '5px 15px', border: '1px solid #eee' }}>
                          <button onClick={() => handleUpdateQuantity(item.maMon, item.soLuong, -1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#636e72', padding: '5px' }}><FaMinus size={12} /></button>
                          <span style={{ margin: '0 15px', fontWeight: '800', fontSize: '1.1rem', color: '#2d3436', width: '20px', textAlign: 'center' }}>{item.soLuong}</span>
                          <button onClick={() => handleUpdateQuantity(item.maMon, item.soLuong, 1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#636e72', padding: '5px' }}><FaPlus size={12} /></button>
                      </div>
                      
                      <button 
                          onClick={() => handleRemove(item.maMon)} 
                          style={{ 
                              border: 'none', 
                              background: '#ffebee', 
                              width: '42px', 
                              height: '42px', 
                              borderRadius: '50%', 
                              display: 'flex', 
                              justifyContent: 'center', 
                              alignItems: 'center', 
                              cursor: 'pointer',
                              boxShadow: '0 2px 5px rgba(211, 47, 47, 0.1)',
                              flexShrink: 0 
                          }}
                          title="Xóa món này"
                      >
                          <FaTrash style={{ color: '#d32f2f', fontSize: '16px', minWidth: '16px', minHeight: '16px' }} />
                      </button>
                      
                    </div>
                  );
                })}
              </div>
              
              {/* UP-SELL AI */}
              <CartUpSell cartItems={cartItems} onAddToCart={async (item) => {
                  if (addToCart) addToCart({ ...item, soLuong: 1 });
                  if (user) {
                      try { await axiosClient.post('/GioHang/Them', { maNguoiDung: user.id || user.maNguoiDung, maMon: item.maMon || item.MaMon, soLuong: 1 }); } catch (error) {} 
                  } else {
                      const currentLocal = JSON.parse(localStorage.getItem('cartItems')) || [];
                      const existingIndex = currentLocal.findIndex(i => i.maMon === (item.maMon || item.MaMon));
                      if (existingIndex >= 0) currentLocal[existingIndex].soLuong += 1;
                      else currentLocal.push({ ...item, soLuong: 1, giaBan: item.giaBan || item.gia || 0 });
                      syncToLocalStorage(currentLocal);
                  }
                  toast.success(`Đã thêm ${item.tenMon || item.TenMon} vào giỏ! 🛒`, { position: "top-center", autoClose: 1000, theme: "colored" });
                  fetchCartData(); 
              }} />
            </div>

            {/* CỘT PHẢI - CHỈ CÓ TÍNH TIỀN */}
            <div style={{ position: 'sticky', top: '20px' }}>
                <div style={{ background: '#fff', padding: '30px', borderRadius: '24px', boxShadow: '0 5px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f2f6' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '25px', color: '#2d3436', borderBottom: '2px dashed #f1f2f6', paddingBottom: '15px' }}>Chi Tiết Thanh Toán</h3>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#636e72', fontWeight: '600' }}>
                        <span>Tạm tính ({cartItems.length} món):</span>
                        <span>{totalAmount.toLocaleString()} đ</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', color: '#636e72', fontWeight: '600' }}>
                        <span>Phí giao hàng:</span>
                        <span style={{ color: isFreeShip ? '#00b894' : '#2d3436' }}>{isFreeShip ? 'Miễn phí' : '30,000 đ'}</span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #f1f2f6', alignItems: 'center' }}>
                        <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#2d3436' }}>Tổng cộng:</span>
                        <span style={{ color: '#e64a19', fontSize: '1.8rem', fontWeight: '900' }}>
                            {(totalAmount + (isFreeShip ? 0 : 30000)).toLocaleString()} đ
                        </span>
                    </div>
                    
                    <button onClick={handleProceedToCheckout} style={{ width: '100%', padding: '18px', background: '#e64a19', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer', marginTop: '30px', boxShadow: '0 10px 20px rgba(230, 74, 25, 0.2)' }}>
                        Tiến Hành Thanh Toán
                    </button>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px', color: '#b2bec3', fontSize: '0.85rem', fontWeight: '600' }}>
                        <FaShieldAlt size={14} /> Thanh toán an toàn & bảo mật
                    </div>
                </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;