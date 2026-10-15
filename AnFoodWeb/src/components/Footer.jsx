import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaYoutube, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

function Footer() {
  return (
    <footer style={{ backgroundColor: '#2d3436', color: '#fff', padding: '80px 0 40px', marginTop: 'auto', borderTop: '5px solid #e64a19', fontFamily: '"Poppins", sans-serif' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Grid chia cột */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', marginBottom: '60px' }}>
          
          {/* CỘT 1: THƯƠNG HIỆU */}
          <div>
            <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.2rem', color: '#e64a19', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              FastBite.
            </h3>
            <p style={{ color: '#b2bec3', lineHeight: '1.8', marginBottom: '25px', fontSize: '0.95rem' }}>
              Trải nghiệm đặt đồ ăn nhanh chóng, tiện lợi với hàng ngàn món ăn hấp dẫn đang chờ bạn thưởng thức.
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <a href="#" style={{ color: '#fff', fontSize: '1.5rem', transition: '0.3s', opacity: 0.8 }} onMouseOver={e => e.target.style.opacity = 1} onMouseOut={e => e.target.style.opacity = 0.8}><FaFacebook /></a>
              <a href="#" style={{ color: '#fff', fontSize: '1.5rem', transition: '0.3s', opacity: 0.8 }} onMouseOver={e => e.target.style.opacity = 1} onMouseOut={e => e.target.style.opacity = 0.8}><FaInstagram /></a>
              <a href="#" style={{ color: '#fff', fontSize: '1.5rem', transition: '0.3s', opacity: 0.8 }} onMouseOver={e => e.target.style.opacity = 1} onMouseOut={e => e.target.style.opacity = 0.8}><FaYoutube /></a>
            </div>
          </div>

          {/* CỘT 2: LIÊN KẾT NHANH */}
          <div>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '25px', fontWeight: '700', color: '#fff' }}>Về Chúng Tôi</h4>
            <ul style={{ listStyle: 'none', padding: 0, color: '#b2bec3', lineHeight: '2.5' }}>
              <li><Link to="/" style={{ color: 'inherit', textDecoration: 'none', transition: '0.3s' }}>Trang chủ</Link></li>
              <li><Link to="/menu" style={{ color: 'inherit', textDecoration: 'none', transition: '0.3s' }}>Thực đơn & Khuyến mãi</Link></li>
              <li><Link to="/history" style={{ color: 'inherit', textDecoration: 'none', transition: '0.3s' }}>Tra cứu đơn hàng</Link></li>
            </ul>
          </div>

          {/* CỘT 3: LIÊN HỆ */}
          <div>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '25px', fontWeight: '700', color: '#fff' }}>Liên Hệ</h4>
            <div style={{ color: '#b2bec3', lineHeight: '1.8', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaPhone style={{ color: '#e64a19' }} /> 
                <span style={{ fontWeight: 'bold', color: '#fff' }}>0393399770</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaEnvelope style={{ color: '#e64a19' }} /> 
                <span style={{ fontWeight: 'bold', color: '#fff' }}>nmthodev365@fastbite.vn</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'start', gap: '10px' }}>
                <FaMapMarkerAlt style={{ color: '#e64a19', marginTop: '5px' }} /> 
                <span style={{ fontWeight: 'bold', color: '#fff' }}>Đại học Nam Cần Thơ,<br/>Ninh Kiều, Thành Phố Cần Thơ</span>
              </div>
            </div>
          </div>

        </div>

        {/* COPYRIGHT */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '30px', textAlign: 'center', color: '#636e72', fontSize: '0.9rem' }}>
          © 2026 FastBite. All rights reserved. Designed for AnFood Project.
        </div>
      </div>
    </footer>
  );
}

export default Footer;