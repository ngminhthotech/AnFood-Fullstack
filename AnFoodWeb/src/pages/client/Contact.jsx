import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaPaperPlane, 
  FaClock, FaSpinner, FaFacebookF, FaGlobe
} from 'react-icons/fa';

// ✅ IMPORT CHUẨN TỪ HỆ THỐNG
import axiosClient from '../../api/axiosClient';

function Contact() {
  const [formData, setFormData] = useState({
    hoTen: '',
    email: '',
    soDienThoai: '',
    noiDung: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. VALIDATE DỮ LIỆU
    if (!formData.hoTen.trim() || !formData.email.trim() || !formData.noiDung.trim()) {
        toast.warning("Vui lòng điền đầy đủ thông tin!");
        return;
    }

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(formData.soDienThoai)) {
       toast.warning("Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)!");
       return;
    }

    setIsLoading(true);

    try {
      // 2. GỬI API (Dùng axiosClient chuẩn)
      await axiosClient.post('/LienHe', {
        ...formData,
        ngayGui: new Date().toISOString(),
        daPhanHoi: false
      });

      // 3. THÔNG BÁO THÀNH CÔNG
      toast.success("🎉 Gửi tin nhắn thành công! Chúng tôi sẽ liên hệ sớm.");
      
      // Reset form
      setFormData({ hoTen: '', email: '', soDienThoai: '', noiDung: '' });

    } catch (error) {
      console.error("Lỗi gửi liên hệ:", error);
      toast.error("❌ Gửi thất bại. Vui lòng thử lại sau!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '60px 20px', background: '#f8f9fa', fontFamily: '"Poppins", sans-serif', minHeight: '100vh' }}>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h2 style={{ fontSize: '2.5rem', color: '#2d3436', fontWeight: '800', marginBottom: '15px' }}>
          Liên Hệ Với <span style={{ color: '#e64a19' }}>FastBite</span>
        </h2>
        <p style={{ color: '#636e72', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.6' }}>
          Chúng tôi luôn lắng nghe bạn! Hãy để lại lời nhắn nếu bạn cần hỗ trợ hoặc muốn đóng góp ý kiến.
        </p>
      </div>

      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
        
        {/* === CỘT TRÁI: THÔNG TIN LIÊN HỆ === */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Card Thông Tin */}
          <div style={{ background: '#fff', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <h3 style={{ borderBottom: '2px solid #f1f2f6', paddingBottom: '20px', marginBottom: '30px', color: '#2d3436', fontSize:'1.4rem' }}>📍 Thông Tin Cửa Hàng</h3>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '25px' }}>
              <div style={{ background: '#fff0e6', color: '#e64a19', padding: '15px', borderRadius: '50%', fontSize:'1.2rem' }}><FaMapMarkerAlt /></div>
              <div>
                <strong style={{ display: 'block', fontSize: '1.1rem', color: '#2d3436', marginBottom:'5px' }}>Địa chỉ</strong>
                <span style={{ color: '#636e72', lineHeight:'1.5' }}>168 Nguyễn Văn Cừ Nối Dài, An Bình, Ninh Kiều, Cần Thơ (ĐH Nam Cần Thơ)</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '25px' }}>
              <div style={{ background: '#e3f2fd', color: '#0984e3', padding: '15px', borderRadius: '50%', fontSize:'1.2rem' }}><FaPhoneAlt /></div>
              <div>
                <strong style={{ display: 'block', fontSize: '1.1rem', color: '#2d3436', marginBottom:'5px' }}>Hotline</strong>
                <span style={{ color: '#636e72', fontWeight:'600' }}>0939 933 770</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
              <div style={{ background: '#e8f5e9', color: '#00b894', padding: '15px', borderRadius: '50%', fontSize:'1.2rem' }}><FaEnvelope /></div>
              <div>
                <strong style={{ display: 'block', fontSize: '1.1rem', color: '#2d3436', marginBottom:'5px' }}>Email</strong>
                <span style={{ color: '#636e72' }}>nguyenminhthodev365@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Card Giờ Mở Cửa & Mạng Xã Hội */}
          <div style={{ background: '#fff', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <h3 style={{ borderBottom: '2px solid #f1f2f6', paddingBottom: '20px', marginBottom: '25px', color: '#2d3436', display: 'flex', alignItems: 'center', gap: '10px', fontSize:'1.4rem' }}>
              <FaClock color="#f39c12" /> Giờ Mở Cửa
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, color: '#636e72', fontSize: '1rem' }}>
              <li style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', borderBottom:'1px dashed #eee', paddingBottom:'10px' }}>
                <span>Thứ 2 - Thứ 6:</span> <span style={{ fontWeight: 'bold', color:'#2d3436' }}>08:00 - 22:00</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Cuối tuần:</span> <span style={{ fontWeight: 'bold', color: '#e64a19' }}>07:00 - 23:00</span>
              </li>
            </ul>

            <div style={{ marginTop:'30px', paddingTop:'20px', borderTop:'2px solid #f1f2f6' }}>
                <strong style={{ display:'block', marginBottom:'15px', color:'#2d3436' }}>Kết nối với chúng tôi:</strong>
                <div style={{ display:'flex', gap:'15px' }}>
                    <a href="#" style={{ width:'40px', height:'40px', borderRadius:'50%', background:'#3b5998', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}><FaFacebookF /></a>
                    <a href="#" style={{ width:'40px', height:'40px', borderRadius:'50%', background:'#e64a19', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}><FaGlobe /></a>
                </div>
            </div>
          </div>
        </div>

        {/* === CỘT PHẢI: FORM GỬI TIN === */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          <div style={{ background: '#fff', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '10px', color: '#2d3436', fontSize:'1.5rem', fontWeight:'800' }}>💌 Gửi Phản Hồi</h3>
            <p style={{ color:'#999', marginBottom:'30px' }}>Chúng tôi sẽ trả lời bạn trong vòng 24h.</p>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{display:'block', marginBottom:'8px', fontWeight:'600', color:'#2d3436', fontSize:'0.9rem'}}>Họ tên <span style={{color:'red'}}>*</span></label>
                  <input type="text" name="hoTen" placeholder="Nhập họ tên..." required value={formData.hoTen} onChange={handleChange} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #dfe6e9', background: '#f9f9f9', outline:'none', transition:'0.3s' }} onFocus={e => e.target.style.borderColor = '#e64a19'} onBlur={e => e.target.style.borderColor = '#dfe6e9'} />
                </div>
                <div>
                  <label style={{display:'block', marginBottom:'8px', fontWeight:'600', color:'#2d3436', fontSize:'0.9rem'}}>Số điện thoại <span style={{color:'red'}}>*</span></label>
                  <input type="text" name="soDienThoai" placeholder="Nhập SĐT..." required value={formData.soDienThoai} onChange={handleChange} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #dfe6e9', background: '#f9f9f9', outline:'none', transition:'0.3s' }} onFocus={e => e.target.style.borderColor = '#e64a19'} onBlur={e => e.target.style.borderColor = '#dfe6e9'} />
                </div>
              </div>

              <div>
                <label style={{display:'block', marginBottom:'8px', fontWeight:'600', color:'#2d3436', fontSize:'0.9rem'}}>Email <span style={{color:'red'}}>*</span></label>
                <input type="email" name="email" placeholder="Nhập email..." value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #dfe6e9', background: '#f9f9f9', outline:'none', transition:'0.3s' }} onFocus={e => e.target.style.borderColor = '#e64a19'} onBlur={e => e.target.style.borderColor = '#dfe6e9'} />
              </div>

              <div>
                <label style={{display:'block', marginBottom:'8px', fontWeight:'600', color:'#2d3436', fontSize:'0.9rem'}}>Nội dung <span style={{color:'red'}}>*</span></label>
                <textarea rows="5" name="noiDung" placeholder="Bạn cần hỗ trợ gì?..." required value={formData.noiDung} onChange={handleChange} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #dfe6e9', background: '#f9f9f9', resize: 'vertical', outline:'none', transition:'0.3s' }} onFocus={e => e.target.style.borderColor = '#e64a19'} onBlur={e => e.target.style.borderColor = '#dfe6e9'} ></textarea>
              </div>

              <button type="submit" disabled={isLoading} style={{ padding: '16px', borderRadius: '50px', border: 'none', background: isLoading ? '#bdc3c7' : 'linear-gradient(to right, #e64a19, #ff7e5f)', color: '#fff', fontWeight: 'bold', fontSize: '1.1rem', cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', transition: '0.3s', boxShadow: '0 5px 15px rgba(230, 74, 25, 0.3)' }}>
                {isLoading ? <><FaSpinner className="fa-spin" /> Đang gửi...</> : <><FaPaperPlane /> GỬI TIN NHẮN</>}
              </button>

            </form>
          </div>

          {/* Bản Đồ (Đã Fix Link ĐH Nam Cần Thơ) */}
          <div style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', height: '300px', border:'5px solid #fff' }}>
            <iframe 
                title="DNC Map" 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.053353866295!2d105.72983631476484!3d10.012451992842426!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a08821676e6a39%3A0x629cb2462e7019!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBOYW0gQuG6p24gVGjGoQ!5e0!3m2!1svi!2s!4v1645432432432!5m2!1svi!2s" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy">
            </iframe>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Contact;