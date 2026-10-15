import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { 
    FaMapMarkerAlt, FaCreditCard, FaTicketAlt, 
    FaTruck, FaShieldAlt, FaMoneyBillWave 
} from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

// ✅ IMPORT CHUẨN TỪ HỆ THỐNG
import axiosClient from '../../api/axiosClient';

function Checkout({ clearCart }) {
  const navigate = useNavigate();
  
  // ✅ 1. LẤY USER AN TOÀN
  const user = useMemo(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch { return null; }
  }, []);

  // 👉 CẤU HÌNH HỆ THỐNG
  const FREE_SHIPPING_THRESHOLD = 150000; // Đơn từ 150k được freeship
  const BASE_SHIPPING_FEE = 30000;        // Phí ship mặc định

  // --- STATE ---
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [summary, setSummary] = useState({ tamTinh: 0, phiShip: 0 });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(false); 

  // State quản lý Voucher
  const [couponInput, setCouponInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [isCheckingVoucher, setIsCheckingVoucher] = useState(false);

  const [formData, setFormData] = useState({
    nguoiNhan: user?.hoTen || '',
    soDienThoai: user?.soDienThoai || '',
    diaChiGiaoHang: '', 
    ghiChu: '',
    phuongThuc: 'COD'
  });

  // --- 2. KHỞI TẠO DỮ LIỆU ---
  useEffect(() => {
    if (!user) {
      toast.warning("Vui lòng đăng nhập để thanh toán!");
      navigate('/login');
      return;
    }

    const loadCartData = () => {
        let itemsToCheckout = [];
        try {
            const rawCheckout = localStorage.getItem('checkoutItems');
            if (rawCheckout) {
                itemsToCheckout = JSON.parse(rawCheckout);
            } else {
                const rawCart = localStorage.getItem('cartItems');
                itemsToCheckout = rawCart ? JSON.parse(rawCart) : [];
            }
        } catch (e) {
            console.error("Lỗi đọc giỏ hàng:", e);
        }

        if (!Array.isArray(itemsToCheckout) || itemsToCheckout.length === 0) {
            toast.info("Giỏ hàng trống, hãy chọn món trước nhé!");
            navigate('/menu');
            return;
        }

        const cleanCart = itemsToCheckout.map(item => ({
            ...item,
            soLuong: Number(item.soLuong || item.quantity || 1),
            giaBan: Number(item.giaBan || item.gia || item.price || 0)
        }));

        setCheckoutItems(cleanCart);

        // Tính tiền hàng và tiền ship
        const tamTinh = cleanCart.reduce((sum, item) => sum + (item.giaBan * item.soLuong), 0);
        const phiShip = tamTinh >= FREE_SHIPPING_THRESHOLD ? 0 : BASE_SHIPPING_FEE;
        
        setSummary({ tamTinh, phiShip });
    };

    loadCartData();

    // Lấy địa chỉ đã lưu
    const fetchAddress = async () => {
        try {
            const userId = user.id || user.maNguoiDung;
            const res = await axiosClient.get(`/DiaChi/user/${userId}`);
            const addressData = Array.isArray(res) ? res : [];
            setSavedAddresses(addressData);
            
            const defaultAddr = addressData.find(d => d.macDinh);
            if (defaultAddr) fillFormData(defaultAddr);
            else if (user.diaChi) {
                setFormData(prev => ({ ...prev, diaChiGiaoHang: user.diaChi }));
            }
        } catch (err) { console.error("Lỗi lấy địa chỉ:", err); }
    };
    fetchAddress();

  }, [user, navigate]);

  const fillFormData = (addr) => {
    setFormData(prev => ({ 
        ...prev, 
        nguoiNhan: addr.hoTenNguoiNhan, 
        soDienThoai: addr.soDienThoai, 
        diaChiGiaoHang: addr.diaChi 
    }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- 3. XỬ LÝ VOUCHER ---
  const handleApplyVoucher = async () => {
      if (!couponInput.trim()) { toast.warning("Sếp chưa nhập mã kìa!"); return; }
      
      setIsCheckingVoucher(true);
      try {
          const res = await axiosClient.post('/Voucher/Check', {
              maCode: couponInput.trim(),
              tongTienDonHang: summary.tamTinh // Backend check trên giá trị hàng hóa
          });

          if (res && res.hopLe) {
              setAppliedVoucher({
                  maCode: couponInput.trim(),
                  maVoucher: res.maVoucher,
                  soTienGiam: res.soTienGiam
              });
              toast.success(`🎉 ${res.message}`);
          }
      } catch (err) {
          setAppliedVoucher(null);
          toast.error(err.response?.data?.message || "Mã không hợp lệ hoặc đã hết hạn!");
      } finally {
          setIsCheckingVoucher(false);
      }
  };

  const handleRemoveVoucher = () => {
      setAppliedVoucher(null);
      setCouponInput('');
      toast.info("Đã gỡ mã giảm giá");
  };

  // --- TÍNH TỔNG TIỀN CUỐI CÙNG ---
  const tongCongCuoiCung = useMemo(() => {
      const tienGiam = appliedVoucher ? appliedVoucher.soTienGiam : 0;
      let total = summary.tamTinh + summary.phiShip - tienGiam;
      return total > 0 ? total : 0; // Tránh trường hợp voucher bự quá làm âm tiền
  }, [summary, appliedVoucher]);

  // --- 4. XỬ LÝ ĐẶT HÀNG ---
  const handleOrder = async (e) => {
    e.preventDefault();
    
    if (!formData.diaChiGiaoHang.trim() || !formData.soDienThoai.trim()) {
      toast.warning("Vui lòng điền đầy đủ địa chỉ và số điện thoại!");
      return;
    }

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(formData.soDienThoai)) {
        toast.warning("Số điện thoại không hợp lệ!");
        return;
    }

    setIsLoading(true);

    // 👉 PAYLOAD SIÊU CHUẨN ĐỂ GỬI XUỐNG C#
    const payload = {
        maNguoiDung: user.id || user.maNguoiDung,
        nguoiNhan: formData.nguoiNhan,
        soDienThoai: formData.soDienThoai,
        diaChiGiaoHang: formData.diaChiGiaoHang, 
        ghiChu: formData.ghiChu,
        
        // Dữ liệu tiền bạc
        tongTien: tongCongCuoiCung, 
        phiVanChuyen: summary.phiShip,
        maVoucher: appliedVoucher ? appliedVoucher.maVoucher : null,
        soTienGiam: appliedVoucher ? appliedVoucher.soTienGiam : 0,

        chiTietDonHangs: checkoutItems.map(item => ({
            maMonAn: item.maMon || item.maMonAn || item.id,
            soLuong: item.soLuong,
            giaBan: item.giaBan 
        }))
    };

    try {
        if (formData.phuongThuc === 'VNPAY') {
            const fakeOrderId = new Date().getTime().toString();
            const res = await axiosClient.post('/Payment/CreatePaymentUrl', {
                orderId: fakeOrderId,
                amount: tongCongCuoiCung, // Thanh toán đúng số tiền cuối
                orderInfo: `Thanh toan don hang ${fakeOrderId}`,
                fullName: formData.nguoiNhan
            });
            if (res && res.url) {
                localStorage.setItem('pendingOrder', JSON.stringify(payload));
                window.location.href = res.url;
            }
        } else {
            const res = await axiosClient.post('/DonHang/TaoDon', payload);
            if (res) {
                toast.success("🎉 Đặt hàng thành công!", { theme: "colored" });
                localStorage.removeItem('cartItems'); 
                localStorage.removeItem('checkoutItems');
                window.dispatchEvent(new Event('cart-cleared')); 
                if (clearCart) clearCart(); 
                setTimeout(() => navigate('/history'), 1500); 
            }
        }
    } catch (err) {
        console.error("Lỗi đặt hàng:", err);
        toast.error("Đặt hàng thất bại! Vui lòng thử lại.");
    } finally {
        setIsLoading(false);
    }
  };

  const getButtonColor = () => formData.phuongThuc === 'VNPAY' ? '#005baa' : '#e64a19';

  if (!user) return null;

  return (
    <div style={{ padding: '60px 20px', background: '#f8f9fa', minHeight: '100vh', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      <ToastContainer position="top-center" autoClose={2000} />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#2d3436', margin: '0 0 10px' }}>Thanh Toán</h1>
            <Link to="/cart" style={{ color: '#636e72', textDecoration: 'none', fontWeight: '700', transition: '0.2s' }} onMouseOver={e=>e.target.style.color='#e64a19'} onMouseOut={e=>e.target.style.color='#636e72'}>
                ← Quay lại giỏ hàng
            </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px', alignItems: 'start' }}>
          
          {/* 🔴 CỘT TRÁI: FORM ĐIỀN THÔNG TIN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* THÔNG TIN GIAO HÀNG */}
            <div style={{ background: '#fff', padding: '35px', borderRadius: '24px', boxShadow: '0 5px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f2f6' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '25px', color: '#2d3436', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FaMapMarkerAlt color="#e64a19" /> Thông tin giao hàng
              </h2>
              
              {savedAddresses.length > 0 && (
                <div style={{ marginBottom: '25px', background: '#fff9f5', padding: '20px', borderRadius: '16px', border: '1px dashed #ffccbc' }}>
                  <label style={{ fontWeight: '700', color: '#d84315', display: 'block', marginBottom: '10px', fontSize: '0.95rem' }}>📍 Chọn nhanh địa chỉ đã lưu:</label>
                  <select defaultValue="" onChange={(e) => { 
                      if (e.target.value === "") return;
                      const selected = savedAddresses.find(a => a.maDiaChi === parseInt(e.target.value)); 
                      if(selected) fillFormData(selected); 
                  }} style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #ffab91', outline: 'none', cursor: 'pointer', background: '#fff', fontWeight: '600' }}>
                    <option value="">-- Nhấn để chọn địa chỉ --</option>
                    {savedAddresses.map(addr => (<option key={addr.maDiaChi} value={addr.maDiaChi}>{addr.hoTenNguoiNhan} - {addr.diaChi}</option>))}
                  </select>
                </div>
              )}
              
              <form id="checkout-form" onSubmit={handleOrder} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <label style={{ fontWeight:'700', fontSize:'0.9rem', color: '#636e72', marginBottom: '8px', display: 'block' }}>Họ và tên người nhận</label>
                        <input type="text" name="nguoiNhan" value={formData.nguoiNhan} onChange={handleChange} required style={{ width:'100%', padding: '15px', border: '1px solid #dfe6e9', borderRadius: '12px', background: '#f8f9fa', outline: 'none', fontWeight: '600' }} />
                    </div>
                    <div>
                        <label style={{ fontWeight:'700', fontSize:'0.9rem', color: '#636e72', marginBottom: '8px', display: 'block' }}>Số điện thoại liên hệ</label>
                        <input type="text" name="soDienThoai" value={formData.soDienThoai} onChange={handleChange} required style={{ width:'100%', padding: '15px', border: '1px solid #dfe6e9', borderRadius: '12px', background: '#f8f9fa', outline: 'none', fontWeight: '600' }} />
                    </div>
                </div>
                <div>
                    <label style={{ fontWeight:'700', fontSize:'0.9rem', color: '#636e72', marginBottom: '8px', display: 'block' }}>Địa chỉ giao hàng chi tiết</label>
                    <textarea name="diaChiGiaoHang" value={formData.diaChiGiaoHang} onChange={handleChange} required rows="3" placeholder="Số nhà, Tên đường, Phường/Xã..." style={{ width:'100%', padding: '15px', border: '1px solid #dfe6e9', borderRadius: '12px', background: '#f8f9fa', outline: 'none', fontWeight: '600', resize: 'none' }} />
                </div>
                <div>
                    <label style={{ fontWeight:'700', fontSize:'0.9rem', color: '#636e72', marginBottom: '8px', display: 'block' }}>Ghi chú cho quán (Tùy chọn)</label>
                    <input type="text" name="ghiChu" value={formData.ghiChu} onChange={handleChange} placeholder="Ví dụ: Xin thêm tương ớt, không hành..." style={{ width:'100%', padding: '15px', border: '1px solid #dfe6e9', borderRadius: '12px', background: '#f8f9fa', outline: 'none', fontWeight: '600' }} />
                </div>
              </form>
            </div>

            {/* PHƯƠNG THỨC THANH TOÁN */}
            <div style={{ background: '#fff', padding: '35px', borderRadius: '24px', boxShadow: '0 5px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f2f6' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '25px', color: '#2d3436', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaCreditCard color="#e64a19" /> Phương thức thanh toán
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', border: formData.phuongThuc === 'COD' ? '2px solid #e64a19' : '2px solid #f1f2f6', borderRadius: '16px', background: formData.phuongThuc === 'COD' ? '#fff9f5' : '#fff', cursor: 'pointer', transition: '0.2s' }}>
                        <input type="radio" name="phuongThuc" value="COD" checked={formData.phuongThuc === 'COD'} onChange={handleChange} style={{ transform: 'scale(1.5)', accentColor: '#e64a19' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ width: '45px', height: '45px', background: '#ffe0b2', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <FaMoneyBillWave color="#e64a19" size={20} />
                            </div>
                            <div>
                                <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#2d3436' }}>Thanh toán khi nhận hàng</div>
                                <div style={{ fontSize: '0.9rem', color: '#636e72', marginTop: '3px' }}>Trả tiền mặt (COD) cho shipper</div>
                            </div>
                        </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', border: formData.phuongThuc === 'VNPAY' ? '2px solid #005baa' : '2px solid #f1f2f6', borderRadius: '16px', background: formData.phuongThuc === 'VNPAY' ? '#f0f8ff' : '#fff', cursor: 'pointer', transition: '0.2s' }}>
                        <input type="radio" name="phuongThuc" value="VNPAY" checked={formData.phuongThuc === 'VNPAY'} onChange={handleChange} style={{ transform: 'scale(1.5)', accentColor: '#005baa' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ width: '45px', height: '45px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fff', borderRadius: '8px', border: '1px solid #eee' }}>
                                <img src="https://vinadesign.vn/uploads/images/2023/05/vnpay-logo-vinadesign-25-12-57-55.jpg" alt="VNPAY" style={{ width: '35px', objectFit: 'contain' }} />
                            </div>
                            <div>
                                <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#005baa' }}>Thanh toán qua VNPAY</div>
                                <div style={{ fontSize: '0.9rem', color: '#636e72', marginTop: '3px' }}>Quét mã QR bằng App Ngân Hàng</div>
                            </div>
                        </div>
                    </label>
                </div>
            </div>

          </div>

          {/* 🔴 CỘT PHẢI: HÓA ĐƠN & VOUCHER (ĐÃ CHUYỂN SANG LIGHT MODE) */}
          <div style={{ background: '#fff', padding: '35px', borderRadius: '24px', height: 'fit-content', position: 'sticky', top: '20px', boxShadow: '0 5px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f2f6' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '25px', fontWeight: '800', color: '#2d3436', borderBottom: '2px dashed #f1f2f6', paddingBottom: '15px' }}>Chi tiết đơn hàng</h3>
            
            {/* DANH SÁCH MÓN */}
            <div className="custom-scrollbar" style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '25px', paddingRight: '10px' }}>
                {checkoutItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                    <div style={{ display:'flex', gap: '15px', alignItems: 'center' }}>
                      <div style={{ width: '35px', height: '35px', background: '#f8f9fa', border: '1px solid #dfe6e9', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '0.9rem', color: '#2d3436' }}>
                          {item.soLuong}x
                      </div>
                      <span style={{ fontWeight: '600', color: '#2d3436', fontSize: '0.95rem' }}>{item.tenMon}</span>
                    </div>
                    <div style={{ fontWeight: '800', color: '#2d3436' }}>
                      {(item.giaBan * item.soLuong).toLocaleString()} đ
                    </div>
                  </div>
                ))}
            </div>

            {/* NHẬP MÃ GIẢM GIÁ */}
            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '16px', marginBottom: '25px', border: '1px solid #f1f2f6' }}>
                <div style={{ fontWeight: '800', marginBottom: '12px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#2d3436' }}>
                    <FaTicketAlt color="#00b894" size={18} /> Mã Khuyến Mãi
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        type="text" 
                        placeholder="Nhập mã ở đây..." 
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        disabled={appliedVoucher != null}
                        style={{ flex: 1, padding: '12px 15px', borderRadius: '10px', border: '1px solid #dfe6e9', background: '#fff', color: '#2d3436', outline: 'none', textTransform: 'uppercase', fontWeight: 'bold' }} 
                    />
                    {appliedVoucher ? (
                        <button type="button" onClick={handleRemoveVoucher} style={{ background: '#ff7675', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Hủy</button>
                    ) : (
                        <button type="button" onClick={handleApplyVoucher} disabled={isCheckingVoucher} style={{ background: '#2d3436', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '10px', fontWeight: 'bold', cursor: isCheckingVoucher ? 'not-allowed' : 'pointer' }}>
                            {isCheckingVoucher ? '...' : 'Áp dụng'}
                        </button>
                    )}
                </div>
            </div>

            {/* TÍNH TOÁN */}
            <div style={{ borderTop: '2px dashed #f1f2f6', paddingTop: '20px', marginBottom: '20px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'15px', color:'#636e72', fontWeight: '600' }}>
                    <span>Tạm tính:</span> <span>{summary.tamTinh.toLocaleString()} đ</span>
                </div>
                
                <div style={{ display:'flex', justifyContent:'space-between', color:'#636e72', fontWeight: '600', alignItems: 'center', marginBottom: '15px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Phí vận chuyển:</span> 
                    <span style={{ color: summary.phiShip === 0 ? '#00b894' : '#2d3436' }}>
                        {summary.phiShip === 0 ? 'Miễn phí' : `${summary.phiShip.toLocaleString()} đ`}
                    </span>
                </div>

                {/* Dòng báo Freeship */}
                {summary.phiShip > 0 && (
                    <div style={{ marginBottom: '15px', fontSize: '0.85rem', color: '#e64a19', background: '#fff5f2', padding: '10px 15px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                        <FaTruck size={16} /> Mua thêm {(FREE_SHIPPING_THRESHOLD - summary.tamTinh).toLocaleString()}đ để Freeship!
                    </div>
                )}

                {/* Tiền Voucher giảm */}
                {appliedVoucher && (
                    <div style={{ display:'flex', justifyContent:'space-between', color:'#00b894', fontWeight: '800', alignItems: 'center' }}>
                        <span>Voucher giảm:</span> 
                        <span>- {appliedVoucher.soTienGiam.toLocaleString()} đ</span>
                    </div>
                )}
            </div>

            <div style={{ borderTop: '2px solid #f1f2f6', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#2d3436' }}>Tổng cộng:</span> 
              <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#e64a19' }}>{tongCongCuoiCung.toLocaleString()} đ</span>
            </div>

            <button 
                type="submit" 
                form="checkout-form"
                disabled={isLoading}
                style={{ width: '100%', padding: '18px', background: isLoading ? '#b2bec3' : getButtonColor(), color: '#fff', fontWeight: '900', border: 'none', borderRadius: '16px', cursor: isLoading ? 'not-allowed' : 'pointer', fontSize: '1.1rem', transition: '0.3s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(230, 74, 25, 0.2)' }}
            >
              {isLoading ? 'ĐANG XỬ LÝ...' : (formData.phuongThuc === 'VNPAY' ? 'THANH TOÁN VNPAY' : 'CHỐT ĐƠN HÀNG')}
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px', color: '#b2bec3', fontSize: '0.85rem', fontWeight: '600' }}>
                <FaShieldAlt size={14} /> Thanh toán an toàn & bảo mật
            </div>
          </div>

        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f2f6; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a4b0be; }
      `}</style>
    </div>
  );
}

export default Checkout;