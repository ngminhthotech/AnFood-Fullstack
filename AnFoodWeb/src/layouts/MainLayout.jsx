import React from 'react';
import { Outlet } from 'react-router-dom'; // Outlet là nơi nội dung thay đổi sẽ hiện ra
import Header from '../components/Header';
import Footer from '../components/Footer';


const MainLayout = ({ cartCount, user, onLogout }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* 1. Header luôn cố định ở trên */}
      <Header cartCount={cartCount} user={user} onLogout={onLogout} />

      {/* 2. Nội dung thay đổi (Trang chủ, Menu, Giỏ hàng...) sẽ hiện ở đây */}
      <main style={{ flex: 1 }}>
        <Outlet /> 
      </main>

      {/* 3. Footer luôn cố định ở dưới */}
      <Footer />
      
    </div>
  );
};

export default MainLayout;