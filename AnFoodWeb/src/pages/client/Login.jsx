import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEnvelope, FaLock, FaSignInAlt, FaArrowLeft, FaPaperPlane, FaKey, FaCheckCircle, FaSpinner } from 'react-icons/fa';

// ✅ IMPORT CHUẨN TỪ HỆ THỐNG
import axiosClient from '../../api/axiosClient';

function Login({ onLogin }) {
  // view: 'login' | 'input-email' | 'input-otp'
  const [view, setView] = useState('login'); 
  
  // State đăng nhập
  const [formData, setFormData] = useState({ email: '', matKhau: '' });
  
  // State quên mật khẩu
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // --- XỬ LÝ ĐĂNG NHẬP ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.matKhau) return toast.warning("Vui lòng nhập đầy đủ thông tin!");
    
    setIsLoading(true);
    try {
      // Dùng axiosClient (đã config base URL)
      const res = await axiosClient.post('/NguoiDung/DangNhap', formData);
      
      // Kiểm tra phản hồi từ server
      if (res) {
        // 👇 QUAN TRỌNG: Lưu token để axiosAdmin dùng
        const token = res.token || res.data?.token || res.accessToken;
        const userData = res.user || res.data?.user || res;

        if (token) {
            localStorage.setItem('accessToken', token); 
        } else {
            console.warn("⚠️ Không tìm thấy token trong phản hồi API");
        }

        // Lưu thông tin user
        localStorage.setItem('user', JSON.stringify(userData));

        toast.success("🎉 Đăng nhập thành công!", { theme: "colored" });
        
        // Cập nhật state global (nếu có)
        if (onLogin) onLogin(userData); 
        
        // Chuyển hướng
        setTimeout(() => {
            if (userData.vaiTro === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/');
            }
        }, 1000);
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("❌ Sai email hoặc mật khẩu!", { theme: "colored" });
    } finally { setIsLoading(false); }
  };

  // --- BƯỚC 1: GỬI MÃ OTP ---
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return toast.warning("Vui lòng nhập email!");
    
    setIsLoading(true);
    try {
      await axiosClient.post('/NguoiDung/GuiOTP', { email: forgotEmail });
      toast.success(`📧 Đã gửi mã OTP đến ${forgotEmail}`);
      setView('input-otp');
    } catch (error) {
      toast.error("❌ Email không tồn tại hoặc lỗi hệ thống.");
    } finally { setIsLoading(false); }
  };

  // --- BƯỚC 2: XÁC NHẬN OTP & ĐỔI MK ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otpCode || !newPassword) return toast.warning("Vui lòng nhập đầy đủ thông tin!");

    setIsLoading(true);
    try {
      await axiosClient.post('/NguoiDung/DoiMatKhauOTP', {
        email: forgotEmail,
        otp: otpCode,
        matKhauMoi: newPassword
      });
      toast.success("🎉 Đổi mật khẩu thành công! Hãy đăng nhập ngay.");
      setTimeout(() => setView('login'), 2000);
    } catch (error) {
      toast.error("❌ Mã OTP không đúng hoặc hết hạn.");
    } finally { setIsLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5', fontFamily: '"Poppins", sans-serif', padding: '20px' }}>
      <ToastContainer position="top-center" autoClose={2000} />

      <div style={{ display: 'flex', width: '100%', maxWidth: '900px', background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', minHeight: '550px' }}>
        
        {/* === CỘT TRÁI: ẢNH MINH HỌA (MOBILE SẼ ẨN) === */}
        <div style={{ flex: 1, background: 'linear-gradient(135deg, #e64a19, #ffcc80)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', padding: '40px', position: 'relative' }} className="hidden-mobile">
            <div onClick={() => navigate('/')} style={{ position: 'absolute', top: '30px', left: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', padding: '8px 15px', borderRadius: '30px', backdropFilter: 'blur(5px)', fontSize: '0.9rem', fontWeight: '600' }}>
                <FaArrowLeft /> Trang chủ
            </div>
            <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '10px' }}>FastBite</h1>
            <p style={{ fontSize: '1.1rem', textAlign: 'center', opacity: 0.9 }}>Thưởng thức món ngon, giao hàng siêu tốc chỉ trong tích tắc!</p>
            {/* Ảnh minh họa vector - dùng link ổn định */}
            <img src="https://cdni.iconscout.com/illustration/premium/thumb/login-3305943-2757111.png" alt="Login" style={{ width: '80%', marginTop: '30px', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' }} onError={(e) => e.target.style.display='none'} />
        </div>

        {/* === CỘT PHẢI: FORM === */}
        <div style={{ flex: 1, padding: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          {/* --- VIEW 1: ĐĂNG NHẬP --- */}
          {view === 'login' && (
            <form onSubmit={handleLoginSubmit} className="fade-in">
              <h2 style={{ color: '#2d3436', fontWeight: 'bold', marginBottom: '30px', fontSize: '1.8rem' }}>Chào mừng trở lại! 👋</h2>
              
              <div style={{ marginBottom: '20px', position: 'relative' }}>
                <FaEnvelope style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#b2bec3' }} />
                <input type="email" placeholder="Email của bạn" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={inputStyle} required />
              </div>
              <div style={{ marginBottom: '15px', position: 'relative' }}>
                <FaLock style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#b2bec3' }} />
                <input type="password" placeholder="Mật khẩu" value={formData.matKhau} onChange={e => setFormData({...formData, matKhau: e.target.value})} style={inputStyle} required />
              </div>

              <div style={{ textAlign: 'right', marginBottom: '30px' }}>
                <span onClick={() => setView('input-email')} style={{ color: '#e64a19', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>Quên mật khẩu?</span>
              </div>

              <button type="submit" disabled={isLoading} style={btnStyle}>
                {isLoading ? <><FaSpinner className="fa-spin" /> Đang xử lý...</> : <><FaSignInAlt /> ĐĂNG NHẬP</>}
              </button>

              <div style={{ textAlign: 'center', marginTop: '25px', fontSize: '0.9rem' }}>
                Chưa có tài khoản? <Link to="/register" style={{ color: '#e64a19', fontWeight: 'bold', textDecoration: 'none' }}>Đăng ký ngay</Link>
              </div>
            </form>
          )}

          {/* --- VIEW 2: QUÊN MẬT KHẨU --- */}
          {view === 'input-email' && (
            <form onSubmit={handleSendOtp} className="fade-in">
              <div onClick={() => setView('login')} style={{ cursor: 'pointer', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '5px', color: '#636e72', fontWeight:'600' }}><FaArrowLeft /> Quay lại</div>
              <h2 style={{ color: '#2d3436', fontWeight: 'bold', marginBottom: '10px' }}>Quên Mật Khẩu? 🔑</h2>
              <p style={{ color: '#636e72', marginBottom: '30px' }}>Đừng lo, hãy nhập email để nhận mã xác thực.</p>
              
              <div style={{ marginBottom: '30px', position: 'relative' }}>
                <FaEnvelope style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#b2bec3' }} />
                <input type="email" placeholder="Nhập email của bạn" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} style={inputStyle} required />
              </div>

              <button type="submit" disabled={isLoading} style={btnStyle}>
                {isLoading ? 'Đang gửi...' : <><FaPaperPlane /> GỬI MÃ OTP</>}
              </button>
            </form>
          )}

          {/* --- VIEW 3: ĐỔI MẬT KHẨU --- */}
          {view === 'input-otp' && (
            <form onSubmit={handleResetPassword} className="fade-in">
              <div onClick={() => setView('input-email')} style={{ cursor: 'pointer', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '5px', color: '#636e72', fontWeight:'600' }}><FaArrowLeft /> Quay lại</div>
              <h2 style={{ color: '#2d3436', fontWeight: 'bold', marginBottom: '10px' }}>Đặt Lại Mật Khẩu 🔐</h2>
              <p style={{ color: '#636e72', marginBottom: '30px' }}>Mã OTP đã gửi tới <b>{forgotEmail}</b></p>
              
              <div style={{ marginBottom: '20px', position: 'relative' }}>
                <FaKey style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#e64a19' }} />
                <input type="text" placeholder="Nhập mã OTP (6 số)" maxLength="6" value={otpCode} onChange={e => setOtpCode(e.target.value)} style={{...inputStyle, letterSpacing: '3px', fontWeight: 'bold', fontSize: '1.1rem'}} required />
              </div>

              <div style={{ marginBottom: '30px', position: 'relative' }}>
                <FaLock style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#b2bec3' }} />
                <input type="password" placeholder="Nhập mật khẩu mới" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle} required />
              </div>

              <button type="submit" disabled={isLoading} style={{...btnStyle, background: '#27ae60'}}>
                {isLoading ? 'Đang cập nhật...' : <><FaCheckCircle /> XÁC NHẬN ĐỔI MK</>}
              </button>
            </form>
          )}

        </div>
      </div>
      
      {/* CSS Animation & Responsive */}
      <style>{`
        .fade-in { animation: fadeIn 0.5s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fa-spin { animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
            .hidden-mobile { display: none !important; }
            div[style*="width: 900px"] { width: 100% !important; height: auto !important; min-height: 100vh; border-radius: 0; }
        }
      `}</style>
    </div>
  );
}

// Styles
const inputStyle = { width: '100%', padding: '15px 15px 15px 45px', borderRadius: '10px', border: '1px solid #dfe6e9', outline: 'none', background: '#f8f9fa', fontSize: '1rem', transition: '0.3s' };
const btnStyle = { width: '100%', padding: '15px', borderRadius: '10px', border: 'none', background: '#e64a19', color: '#fff', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: '0.3s', boxShadow: '0 5px 15px rgba(230, 74, 25, 0.3)' };

export default Login;