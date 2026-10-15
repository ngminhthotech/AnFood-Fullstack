import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBoxOpen, FaClock, FaMapMarkerAlt, FaShoppingBag, FaTimes, FaChevronRight, FaStore } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import axiosClient from '../../api/axiosClient';
import { getImageUrl } from '../../utils/imageHelper';

function OrderHistory({ user }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); 
  
  // State quản lý Modal Hủy Đơn
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // --- 1. FETCH DỮ LIỆU ---
  const fetchOrders = async () => {
    if (!user || !user.id) {
      setOrders([]);
      return;
    }
    setLoading(true);
    try {
      const res = await axiosClient.get(`/DonHang/LichSu/${user.id}`);
      setOrders(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Lỗi lấy lịch sử:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  // --- 2. LỌC ĐƠN HÀNG THEO TAB ---
  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return orders;
    return orders.filter(order => {
        const s = order.trangThai ? order.trangThai.toLowerCase() : '';
        if (activeTab === 'cho_xu_ly') return ['choduyet', 'cho_xu_ly'].includes(s);
        if (activeTab === 'dang_giao') return ['dang_giao', 'danggiao'].includes(s);
        if (activeTab === 'hoan_thanh') return ['hoan_thanh', 'hoanthanh', 'success'].includes(s);
        if (activeTab === 'huy') return ['huy', 'da_huy', 'dahuy'].includes(s);
        return true;
    });
  }, [orders, activeTab]);

  // --- 3. XỬ LÝ HỦY ĐƠN ---
  const handleOpenCancelModal = (maDonHang) => {
      setCancelOrderId(maDonHang);
      setCancelReason('');
      setShowCancelModal(true);
  };

  const submitCancelOrder = async () => {
      if (!cancelReason.trim()) {
          return toast.warning("Vui lòng nhập lý do hủy đơn!");
      }

      try {
          await axiosClient.post('/DonHang/KhachHangHuyDon', {
              maDonHang: cancelOrderId,
              maNguoiDung: user.id,
              lyDoHuy: cancelReason
          });
          
          toast.success("Đã hủy đơn hàng thành công!");
          setShowCancelModal(false);
          fetchOrders(); 
      } catch (error) {
          toast.error(error.response?.data?.message || "Không thể hủy đơn hàng lúc này!");
      }
  };

  // --- 4. UI HELPERS ---
  const getStatusBadge = (status) => {
    const s = status ? status.toLowerCase() : '';
    if (['choduyet', 'cho_xu_ly'].includes(s)) return <span style={{ color: '#e67e22', fontWeight: 'bold' }}>CHỜ XÁC NHẬN</span>;
    if (['dang_giao', 'danggiao'].includes(s)) return <span style={{ color: '#0984e3', fontWeight: 'bold' }}>ĐANG GIAO HÀNG</span>;
    if (['hoan_thanh', 'hoanthanh', 'success'].includes(s)) return <span style={{ color: '#27ae60', fontWeight: 'bold' }}>ĐÃ GIAO THÀNH CÔNG</span>;
    if (['huy', 'da_huy', 'dahuy'].includes(s)) return <span style={{ color: '#d63031', fontWeight: 'bold' }}>ĐÃ HỦY</span>;
    return <span style={{ color: '#636e72', fontWeight: 'bold' }}>KHÔNG RÕ</span>;
  };

  const isCanceled = (status) => {
      const s = status ? status.toLowerCase() : '';
      return ['huy', 'da_huy', 'dahuy'].includes(s);
  };

  // --- RENDER TRẠNG THÁI CHƯA ĐĂNG NHẬP ---
  if (!user) return (
    <div style={{ padding: '80px 20px', textAlign: 'center', minHeight:'60vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <FaBoxOpen size={60} color="#dfe6e9" style={{marginBottom:'20px'}}/>
        <h3 style={{color:'#2d3436'}}>Bạn chưa đăng nhập</h3>
        <p style={{color:'#636e72'}}>Vui lòng đăng nhập để xem lịch sử đơn hàng của bạn.</p>
        <Link to="/login" style={{ marginTop:'20px', padding:'12px 35px', background:'#e64a19', color:'#fff', borderRadius:'50px', textDecoration:'none', fontWeight:'bold', transition: '0.3s' }}>Đăng nhập ngay</Link>
    </div>
  );

  return (
    <div style={{ padding: '30px 20px 60px', background: '#f5f5f5', minHeight: '100vh', fontFamily: '"Segoe UI", "Plus Jakarta Sans", sans-serif' }}>
      <ToastContainer position="top-center" autoClose={2000} />
      
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#2d3436', margin: '0 0 5px 0' }}>Đơn hàng của tôi</h2>
            <p style={{ color: '#636e72', margin: 0, fontSize: '0.95rem' }}>Quản lý và theo dõi trạng thái các món ngon bạn đã đặt</p>
        </div>
        
        {/* TABS NAVIGATION CỰC XỊN (Giống Shopee) */}
        <div style={{ display: 'flex', background: '#fff', borderRadius: '10px', padding: '5px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflowX: 'auto' }}>
            {[
                { id: 'all', label: 'Tất cả' },
                { id: 'cho_xu_ly', label: 'Chờ xác nhận' },
                { id: 'dang_giao', label: 'Đang giao' },
                { id: 'hoan_thanh', label: 'Hoàn thành' },
                { id: 'huy', label: 'Đã hủy' }
            ].map(tab => (
                <button 
                    key={tab.id} 
                    onClick={() => setActiveTab(tab.id)}
                    style={{ 
                        flex: 1, minWidth: '120px', padding: '15px 10px', border: 'none', background: 'transparent', cursor: 'pointer',
                        fontWeight: activeTab === tab.id ? 'bold' : '600', 
                        color: activeTab === tab.id ? '#e64a19' : '#636e72',
                        borderBottom: activeTab === tab.id ? '3px solid #e64a19' : '3px solid transparent',
                        fontSize: '0.95rem', transition: 'all 0.2s', whiteSpace: 'nowrap'
                    }}
                >
                    {tab.label}
                </button>
            ))}
        </div>

        {/* LOADING & EMPTY STATE */}
        {loading ? (
            <div style={{ padding: '100px', textAlign: 'center', color:'#999' }}>Đang tải dữ liệu...</div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ background: '#fff', padding: '80px 20px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <img src="https://cdni.iconscout.com/illustration/premium/thumb/empty-cart-7359557-6024626.png" alt="Empty" style={{ width: '180px', marginBottom: '20px', opacity: 0.9 }} />
            <h3 style={{ fontSize: '1.2rem', color: '#2d3436', marginBottom: '10px' }}>Chưa có đơn hàng nào</h3>
            <p style={{ color: '#636e72', marginBottom: '25px' }}>Trải nghiệm hương vị tuyệt vời tại FastBite ngay!</p>
            <Link to="/menu" style={{ display: 'inline-block', padding: '12px 40px', background: '#e64a19', color: '#fff', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' }}>
                Khám phá Thực Đơn
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* DANH SÁCH ĐƠN HÀNG */}
            {filteredOrders.map(order => {
              if (!order || !order.maDonHang) return null;
              const chiTietItems = Array.isArray(order.chiTiet) ? order.chiTiet : (Array.isArray(order.ChiTiet) ? order.ChiTiet : []);
              const currentStatus = order.trangThai ? order.trangThai.toLowerCase() : '';
              const isCancel = isCanceled(order.trangThai);
              const lyDoHuy = order.lyDoHuy || order.LyDoHuy;
              
              return (
              <div key={order.maDonHang} style={{ background: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                
                {/* 1. Header Card: Store Name & Status */}
                <div style={{ padding: '15px 20px', borderBottom: '1px solid #f1f2f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap:'10px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontWeight: 'bold', color: '#2d3436' }}>
                    <FaStore size={18} color="#636e72" /> FastBite Official
                    <span style={{ background:'#f1f2f6', color:'#636e72', padding:'4px 10px', borderRadius:'4px', fontSize:'0.8rem', marginLeft: '5px' }}>
                        Mã: #{order.maDonHang}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '0.9rem' }}>
                      <span style={{ color: '#b2bec3', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <FaClock /> {order.ngayDat ? new Date(order.ngayDat).toLocaleString('vi-VN') : 'N/A'}
                      </span>
                      <span style={{ borderLeft: '1px solid #dfe6e9', height: '15px' }}></span>
                      {getStatusBadge(order.trangThai)}
                  </div>
                </div>

                {/* 2. Body Card: Danh sách món */}
                <div style={{ padding: '20px', cursor: 'pointer' }} onClick={() => navigate(`/product-detail/${chiTietItems[0]?.maMon || ''}`)}>
                  {chiTietItems.length > 0 ? chiTietItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', marginBottom: idx !== chiTietItems.length - 1 ? '15px' : '0' }}>
                      <img 
                        src={getImageUrl(item.hinhAnh || item.HinhAnh)} 
                        alt={item.tenMon} 
                        style={{ 
                            width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #f1f2f6', 
                            filter: isCancel ? 'grayscale(100%) opacity(0.7)' : 'none' // Làm xám ảnh nếu đơn hủy
                        }} 
                        onError={(e) => e.target.src = 'https://placehold.co/100x100?text=Food'}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '1rem', color: isCancel ? '#636e72' : '#2d3436', marginBottom: '5px' }}>
                            {item.tenMon || item.TenMon || 'Tên món ăn'}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#636e72' }}>
                            Phân loại: Mặc định
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#2d3436', marginTop: '5px' }}>
                            x{item.soLuong || item.SoLuong || 0}
                        </div>
                      </div>
                      <div style={{ color: isCancel ? '#b2bec3' : '#2d3436', fontSize: '0.95rem' }}>
                        {((item.giaBan || item.GiaBan || item.donGia || 0)).toLocaleString()} đ
                      </div>
                    </div>
                  )) : <div style={{ textAlign: 'center', color: '#b2bec3', fontStyle:'italic' }}>Không có chi tiết món ăn</div>}
                </div>

                {/* HIỂN THỊ LÝ DO HỦY CHUẨN UX */}
                {isCancel && lyDoHuy && (
                    <div style={{ padding: '12px 20px', background: '#fff0f0', color: '#c0392b', fontSize: '0.9rem', borderTop: '1px dashed #ffcdd2', borderBottom: '1px dashed #ffcdd2', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaTimes size={14} /> <b>Lý do hủy:</b> {lyDoHuy}
                    </div>
                )}

                {/* 3. Footer Card: Thành tiền & Hành động */}
                <div style={{ background: '#fffaf8', borderTop: '1px solid #f1f2f6', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.9rem', color: '#636e72' }}>Thành tiền:</span>
                        <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: isCancel ? '#b2bec3' : '#e64a19' }}>
                            {(order.tongTien || 0).toLocaleString()} đ
                        </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#b2bec3', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FaMapMarkerAlt /> {order.diaChiGiaoHang || order.diaChi || 'Không có địa chỉ'}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {/* Nút Hủy Đơn (Chỉ hiện khi chờ duyệt) */}
                            {['choduyet', 'cho_xu_ly'].includes(currentStatus) && (
                                <button 
                                    onClick={() => handleOpenCancelModal(order.maDonHang)}
                                    style={{ padding: '8px 20px', borderRadius: '4px', background: '#fff', border: '1px solid #d63031', color: '#d63031', fontWeight: '600', cursor: 'pointer', transition: '0.2s', fontSize: '0.9rem' }}
                                    onMouseOver={(e) => { e.currentTarget.style.background = '#fff0f0'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; }}
                                >
                                    Hủy Đơn Hàng
                                </button>
                            )}

                            {/* Nút Mua Lại (Hiện khi đã giao hoặc đã hủy) */}
                            {(['hoan_thanh', 'hoanthanh', 'success'].includes(currentStatus) || isCancel) && (
                                <button 
                                    onClick={() => navigate('/menu')}
                                    style={{ padding: '8px 20px', borderRadius: '4px', background: '#e64a19', border: '1px solid #e64a19', color: '#fff', fontWeight: '600', cursor: 'pointer', transition: '0.2s', fontSize: '0.9rem' }}
                                    onMouseOver={(e) => { e.currentTarget.style.background = '#d35400'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.background = '#e64a19'; }}
                                >
                                    Mua Lại
                                </button>
                            )}

                            <button 
                                onClick={() => navigate('/contact')}
                                style={{ padding: '8px 20px', borderRadius: '4px', background: '#fff', border: '1px solid #dfe6e9', color: '#2d3436', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}
                            >
                                Liên hệ quán
                            </button>
                        </div>
                    </div>
                </div>

              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL NHẬP LÝ DO HỦY ĐƠN (GIAO DIỆN XỊN) */}
      {showCancelModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div style={{ background: '#fff', width: '450px', borderRadius: '12px', padding: '25px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', animation: 'fadeIn 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <h3 style={{ margin: 0, color: '#2d3436', fontSize: '1.2rem', fontWeight: 'bold' }}>Lý do hủy đơn hàng</h3>
                      <button onClick={() => setShowCancelModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#b2bec3' }}><FaTimes /></button>
                  </div>
                  
                  <div style={{ background: '#fff9f4', padding: '10px 15px', borderRadius: '8px', color: '#d35400', fontSize: '0.85rem', marginBottom: '20px' }}>
                      ⚠️ Lưu ý: Hành động này không thể hoàn tác. Tiền (nếu đã thanh toán) sẽ được hoàn lại theo chính sách của FastBite.
                  </div>
                  
                  {/* Tag lý do chọn nhanh */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
                      {["Tôi muốn cập nhật địa chỉ/sdt", "Tôi muốn thay đổi món ăn", "Tôi tìm thấy giá rẻ hơn", "Đổi ý, không muốn mua nữa"].map(reason => (
                          <span 
                              key={reason} 
                              onClick={() => setCancelReason(reason)}
                              style={{ 
                                  padding: '8px 12px', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer', transition: '0.2s',
                                  background: cancelReason === reason ? '#ffebee' : '#f8f9fa', 
                                  color: cancelReason === reason ? '#c0392b' : '#2d3436', 
                                  border: cancelReason === reason ? '1px solid #ffcdd2' : '1px solid #dfe6e9', 
                                  fontWeight: cancelReason === reason ? '600' : 'normal' 
                              }}
                          >
                              {reason}
                          </span>
                      ))}
                  </div>

                  <textarea 
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Hoặc nhập lý do khác (tùy chọn)..."
                      rows="3"
                      style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #dfe6e9', outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  ></textarea>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                      <button onClick={() => setShowCancelModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #dfe6e9', background: '#fff', color: '#2d3436', fontWeight: 'bold', cursor: 'pointer' }}>KHÔNG</button>
                      <button onClick={submitCancelOrder} style={{ flex: 1, padding: '12px', borderRadius: '6px', border: 'none', background: '#e64a19', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>ĐỒNG Ý HỦY</button>
                  </div>
              </div>
          </div>
      )}
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}

export default OrderHistory;