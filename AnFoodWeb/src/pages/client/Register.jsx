import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaUserPlus, FaArrowLeft, FaSpinner, FaCheck } from 'react-icons/fa';

// ✅ IMPORT CHUẨN TỪ HỆ THỐNG
import axiosClient from '../../api/axiosClient';

function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    hoTen: '',
    email: '',
    matKhau: '',
    confirmMatKhau: '',
    soDienThoai: '',
    diaChi: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // 1. Validate cơ bản
    if (formData.matKhau !== formData.confirmMatKhau) {
      return toast.error("❌ Mật khẩu nhập lại không khớp!", { theme: "colored" });
    }
    if (formData.matKhau.length < 6) {
        return toast.warning("⚠️ Mật khẩu phải có ít nhất 6 ký tự!");
    }

    setIsLoading(true);
    try {
      // 2. Mapping dữ liệu chuẩn Backend
      const payload = {
        tenNguoiDung: formData.hoTen,  
        email: formData.email,
        matKhau: formData.matKhau,
        soDienThoai: formData.soDienThoai,
        diaChi: formData.diaChi        
      };

      // 3. Gọi API qua axiosClient
      await axiosClient.post('/NguoiDung/DangKy', payload);
      
      toast.success("🎉 Đăng ký thành công! Đang chuyển trang...", { theme: "colored" });
      setTimeout(() => navigate('/login'), 2000);

    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      const msg = error.response?.data?.message || "Đăng ký thất bại. Email có thể đã tồn tại.";
      toast.error("❌ " + msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5', fontFamily: '"Poppins", sans-serif', padding: '40px 20px' }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div style={{ display: 'flex', width: '100%', maxWidth: '1000px', background: '#fff', borderRadius: '25px', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', overflow: 'hidden', minHeight: '600px' }}>
        
        {/* === CỘT TRÁI: BANNER CHÀO MỪNG === */}
        <div style={{ flex: '1', background: 'linear-gradient(135deg, #e64a19 0%, #ff9f43 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px', color: '#fff', position: 'relative' }}>
            <div onClick={() => navigate('/')} style={{ position: 'absolute', top: '30px', left: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', padding: '8px 15px', borderRadius: '30px', backdropFilter: 'blur(5px)', fontSize: '0.9rem', fontWeight: '600' }}>
                <FaArrowLeft /> Trang chủ
            </div>

            <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '10px', textAlign: 'center' }}>Tham Gia Ngay!</h1>
            <p style={{ fontSize: '1.1rem', textAlign: 'center', opacity: 0.9, marginBottom: '30px', lineHeight: '1.6' }}>
                Tạo tài khoản để nhận ưu đãi độc quyền và theo dõi đơn hàng dễ dàng hơn.
            </p>
            
            {/* ✅ FIX ẢNH: Dùng ảnh Vector ổn định & Thêm fallback */}
            <img 
              src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg" 
              alt="Register Illustration" 
              style={{ width: '80%', maxWidth: '350px', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' }} 
              onError={(e) => { e.target.src = 'https://placehold.co/400x300/png?text=Welcome+FastBite'; }}
            />
        </div>

        {/* === CỘT PHẢI: FORM ĐĂNG KÝ === */}
        <div style={{ flex: '1.2', padding: '50px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d3436', marginBottom: '30px', textAlign: 'center' }}>Tạo Tài Khoản Mới</h2>
            
            <form onSubmit={handleRegister}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={inputGroupStyle}>
                        <FaUser style={iconStyle} />
                        <input type="text" name="hoTen" placeholder="Họ và tên" required value={formData.hoTen} onChange={handleChange} style={inputStyle} />
                    </div>
                    <div style={inputGroupStyle}>
                        <FaPhone style={iconStyle} />
                        <input type="text" name="soDienThoai" placeholder="Số điện thoại" required value={formData.soDienThoai} onChange={handleChange} style={inputStyle} />
                    </div>
                </div>

                <div style={inputGroupStyle}>
                    <FaEnvelope style={iconStyle} />
                    <input type="email" name="email" placeholder="Địa chỉ Email" required value={formData.email} onChange={handleChange} style={inputStyle} />
                </div>

                <div style={inputGroupStyle}>
                    <FaMapMarkerAlt style={iconStyle} />
                    <input type="text" name="diaChi" placeholder="Địa chỉ giao hàng (Số nhà, đường...)" required value={formData.diaChi} onChange={handleChange} style={inputStyle} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={inputGroupStyle}>
                        <FaLock style={iconStyle} />
                        <input type="password" name="matKhau" placeholder="Mật khẩu" required value={formData.matKhau} onChange={handleChange} style={inputStyle} />
                    </div>
                    <div style={inputGroupStyle}>
                        <FaCheck style={{ ...iconStyle, color: formData.confirmMatKhau && formData.matKhau === formData.confirmMatKhau ? '#27ae60' : '#b2bec3' }} />
                        <input type="password" name="confirmMatKhau" placeholder="Nhập lại MK" required value={formData.confirmMatKhau} onChange={handleChange} style={inputStyle} />
                    </div>
                </div>

                <button type="submit" disabled={isLoading} style={btnStyle}>
                    {isLoading ? <><FaSpinner className="fa-spin" /> Đang tạo tài khoản...</> : 'ĐĂNG KÝ NGAY'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '25px', fontSize: '0.95rem', color: '#636e72' }}>
                    Bạn đã có tài khoản? <Link to="/login" style={{ color: '#e64a19', fontWeight: 'bold', textDecoration: 'none' }}>Đăng nhập tại đây</Link>
                </div>
            </form>
        </div>

      </div>
      
      {/* CSS Animation */}
      <style>{`
        .fa-spin { animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        input:focus { border-color: #e64a19 !important; background: #fff !important; box-shadow: 0 0 0 3px rgba(230, 74, 25, 0.1); }
      `}</style>
    </div>
  );
}

// STYLES
const inputGroupStyle = { position: 'relative', marginBottom: '20px' };
const iconStyle = { position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#b2bec3', transition: '0.3s' };
const inputStyle = { width: '100%', padding: '14px 15px 14px 45px', borderRadius: '12px', border: '1px solid #dfe6e9', outline: 'none', background: '#f8f9fa', fontSize: '0.95rem', transition: '0.3s', color: '#2d3436' };
const btnStyle = { width: '100%', padding: '16px', borderRadius: '50px', border: 'none', background: 'linear-gradient(to right, #e64a19, #ff7e5f)', color: '#fff', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'transform 0.2s', boxShadow: '0 10px 20px rgba(230, 74, 25, 0.3)' };

export default Register;