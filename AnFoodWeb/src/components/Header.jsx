import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaUser, FaSignOutAlt, FaHistory, FaUserShield, FaHeart } from 'react-icons/fa'; 
import logoImg from '../assets/logo.png'; 

// 👉 1. IMPORT COMPONENT TOP BAR VÀO ĐÂY
import UserContextBanner from './UserContextBanner'; 

function Header({ user, onLogout }) {
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0); 

  // --- 1. LOGIC CẬP NHẬT GIỎ HÀNG (REAL-TIME) ---
  const updateCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
      const total = cart.reduce((sum, item) => sum + Number(item.soLuong || item.quantity || 1), 0);
      setCartCount(total);
    } catch (e) {
      setCartCount(0);
    }
  };

  useEffect(() => {
    updateCartCount();
    const handleCartUpdate = () => updateCartCount();
    
    window.addEventListener('cart-updated', handleCartUpdate); 
    window.addEventListener('cart-cleared', () => setCartCount(0)); 
    window.addEventListener('storage', handleCartUpdate); 

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
      window.removeEventListener('cart-cleared', () => setCartCount(0));
      window.removeEventListener('storage', handleCartUpdate);
    };
  }, []);

  // --- 2. LOGIC KIỂM TRA ACTIVE LINK ---
  const isActive = (path) => {
    return location.pathname === path;
  };

  const getLinkStyle = (path) => {
    const active = isActive(path);
    return {
      textDecoration: 'none',
      color: active ? '#e64a19' : '#2d3436',
      fontSize: '1rem',
      fontWeight: active ? 'bold' : '600',
      position: 'relative',
      transition: 'color 0.3s ease'
    };
  };

  const ActiveIndicator = () => (
    <div
      style={{
        position: 'absolute', bottom: '-5px', left: '0', right: '0',
        height: '3px', backgroundColor: '#e64a19', borderRadius: '2px'
      }}
    ></div>
  );

  // --- 3. LOGIC KIỂM TRA ADMIN ---
  const isAdmin = user && (
      user.ma_vai_tro === 1 ||      
      user.maVaiTro === 1 ||        
      user.vaiTro === 1 ||          
      user.vaiTro === 'admin' ||    
      (user.vaiTro && typeof user.vaiTro === 'string' && user.vaiTro.toLowerCase() === 'admin') 
  );

  return (
    // 👉 2. WRAPPER TỔNG: Ôm cả Top Bar và Header, giữ cố định trên cùng
    <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)', // Chuyển shadow ra ngoài khối tổng
        backgroundColor: '#fff'
    }}>
      
      {/* 👉 3. GẮN TOP BAR LÊN CAO NHẤT */}
      <UserContextBanner />

      {/* 4. MAIN HEADER: Nằm ngay dưới Top Bar, gỡ bỏ thuộc tính fixed cũ */}
      <header
        style={{
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '10px 40px', 
          backgroundColor: '#fff', 
          borderBottom: '1px solid #ddd',
          fontFamily: '"Poppins", sans-serif',
          boxSizing: 'border-box'
        }}
      >
        {/* 1. LOGO */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={logoImg} 
              alt="FastBite Logo"
              onError={(e) => e.target.style.display = 'none'} 
              style={{ height: '50px', marginRight: '10px', objectFit: 'contain' }}
            />
            <span style={{ color: '#e64a19', fontSize: '1.8rem', fontWeight: 'bold', fontFamily: '"Playfair Display", serif' }}>
              FastBite
            </span>
          </div>
        </Link>

        {/* 2. MENU ĐIỀU HƯỚNG CHÍNH */}
        <nav style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <Link to="/" style={getLinkStyle('/')}>
            Trang Chủ {isActive('/') && <ActiveIndicator />}
          </Link>
          <Link to="/menu" style={getLinkStyle('/menu')}>
            Thực Đơn {isActive('/menu') && <ActiveIndicator />}
          </Link>
          <Link to="/suggest" style={getLinkStyle('/suggest')}>
            AI Gợi Ý {isActive('/suggest') && <ActiveIndicator />}
          </Link>
          <Link to="/contact" style={getLinkStyle('/contact')}>
            Liên Hệ {isActive('/contact') && <ActiveIndicator />}
          </Link>
        </nav>

        {/* 3. KHU VỰC CÔNG CỤ BÊN PHẢI */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
          
          {/* Icon Tìm kiếm */}
          <FaSearch style={{ fontSize: '1.2rem', color: '#636e72', cursor: 'pointer' }} />
          
          {/* NÚT YÊU THÍCH */}
          <Link
            to="/favorites"
            style={{ textDecoration: 'none', color: '#ff4757', display: 'flex', alignItems: 'center', transition: 'transform 0.2s' }}
            title="Món ăn yêu thích"
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <FaHeart style={{ fontSize: '1.4rem' }} />
          </Link>

          {/* Giỏ hàng */}
          <Link
            to="/cart"
            style={{ textDecoration: 'none', color: '#636e72', fontSize: '1rem', display: 'flex', alignItems: 'center', position: 'relative' }}
          >
            <FaShoppingCart style={{ fontSize: '1.4rem' }} />
            {cartCount > 0 && (
              <span
                style={{
                  position: 'absolute', top: '-8px', right: '-8px',
                  backgroundColor: '#e64a19', color: '#fff',
                  borderRadius: '50%', width: '18px', height: '18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid #fff'
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>

          {/* 4. USER SECTION */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              
              {/* NÚT ADMIN */}
              {isAdmin && (
                <Link 
                  to="/admin" 
                  style={{ 
                    textDecoration: 'none', color: '#fff', backgroundColor: '#2d3436', 
                    fontSize: '0.85rem', fontWeight: 'bold',
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '6px 15px', borderRadius: '20px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                  }}
                >
                  <FaUserShield /> QUẢN TRỊ
                </Link>
              )}

              {/* NÚT LỊCH SỬ */}
              <Link 
                to="/history" 
                style={{ 
                  textDecoration: 'none', 
                  color: isActive('/history') ? '#e64a19' : '#555', 
                  fontSize: '0.9rem', fontWeight: '600',
                  display: 'flex', alignItems: 'center', gap: '5px',
                  backgroundColor: '#f5f5f5', padding: '6px 12px', borderRadius: '15px'
                }}
              >
                <FaHistory /> Đơn hàng
              </Link>

              {/* Link đến Profile */}
              <Link 
                 to="/profile"
                 style={{ 
                   textDecoration: 'none',
                   display: 'flex', alignItems: 'center', gap: '5px', 
                   fontWeight: 'bold', color: '#2d3436', cursor: 'pointer' 
                 }}
                 title="Quản lý tài khoản"
              >
                  <FaUser /> <span>{user.hoTen || user.name || "Thành viên"}</span>
              </Link>

              {/* Nút Logout */}
              <button
                onClick={onLogout}
                style={{
                  border: '1px solid #e64a19', backgroundColor: '#fff', color: '#e64a19',
                  padding: '5px 15px', borderRadius: '20px', fontWeight: '600', cursor: 'pointer',
                  fontSize: '0.9rem', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '5px'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e64a19'; e.currentTarget.style.color = '#fff'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#e64a19'; }}
              >
                <FaSignOutAlt />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              style={{
                textDecoration: 'none', color: '#e64a19', fontSize: '1rem', fontWeight: 'bold',
                border: '2px solid #e64a19', borderRadius: '30px', padding: '6px 20px',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e64a19'; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#e64a19'; }}
            >
              Đăng Nhập
            </Link>
          )}

        </div>
      </header>
    </div>
  );
}

export default Header;  