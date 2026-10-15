import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  FaHome, FaUtensils, FaClipboardList, FaSignOutAlt, 
  FaChartBar, FaUserFriends, FaBars, FaBullhorn, FaBell, FaSearch, 
  FaBox, FaBoxOpen, FaTicketAlt // 👉 THÊM ICON VÉ VOUCHER Ở ĐÂY
} from 'react-icons/fa'; 
import { Slide } from 'react-toastify';

function AdminLayout() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('Administrator');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.hoTen) {
      setAdminName(user.hoTen);
    }
  }, []);

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi trang quản trị?")) {
      localStorage.removeItem('user');
      navigate('/'); 
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: '"Poppins", sans-serif', backgroundColor: '#f3f4f6' }}>
      
      <style>
        {`
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.4); }
          
          .fade-in { animation: fadeIn 0.4s ease-in-out; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}
      </style>

      {/* ================= SIDEBAR ================= */}
      <aside style={{ 
          width: '280px', 
          backgroundColor: '#1e1e2d', 
          color: '#ffffff',
          flexShrink: 0, 
          display: 'flex', 
          flexDirection: 'column',
          height: '100%', 
          boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
          zIndex: 100
      }}>
        
        <div style={{ height: '80px', display: 'flex', alignItems: 'center', padding: '0 25px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
           <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #ff6b6b, #e64a19)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#fff', marginRight: '12px', boxShadow: '0 4px 10px rgba(230, 74, 25, 0.4)' }}>
              <FaUtensils />
           </div>
           <div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '0.5px', lineHeight: '1' }}>FAST<span style={{ color: '#e64a19' }}>BITE</span></div>
              <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '4px', letterSpacing: '1px' }}>ADMIN PANEL</div>
           </div>
        </div>

        <div style={{ padding: '25px' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '15px', padding: '15px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <img src="https://ui-avatars.com/api/?name=Admin&background=e64a19&color=fff" alt="Admin" style={{ borderRadius: '10px', width: '45px', height: '45px' }} />
                <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: '600', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{adminName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                        <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 5px #10b981' }}></span> Online
                    </div>
                </div>
            </div>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '0 15px 20px' }}>
          <div style={{ padding: '0 10px 10px', fontSize: '0.75rem', color: '#ffffff', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Tổng Quan
          </div>
          <SidebarLink to="/admin/dashboard" icon={<FaChartBar />} label="Dashboard" />
          
          <div style={{ padding: '20px 10px 10px', fontSize: '0.75rem', color: '#ffffff', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Quản Lý Cửa Hàng
          </div>
          <SidebarLink to="/admin/food" icon={<FaUtensils />} label="Món Ăn" />
          <SidebarLink to="/admin/orders" icon={<FaClipboardList />} label="Đơn Hàng" />
          <SidebarLink to="/admin/categories" icon={<FaHome />} label="Danh Mục" />
          <SidebarLink to="/admin/inventory" icon={<FaBoxOpen />} label="Kho Hàng" />
          
          <div style={{ padding: '20px 10px 10px', fontSize: '0.75rem', color: '#ffffff', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
             Marketing & CSKH
          </div>
          <SidebarLink to="/admin/customers" icon={<FaUserFriends />} label="Khách Hàng" />
          
          {/* 👉 CỤM NÚT ĐÃ ĐƯỢC TÁCH RA RÕ RÀNG */}
          <SidebarLink to="/admin/banner" icon={<FaBullhorn />} label="Banner Quảng Cáo" />
          <SidebarLink to="/admin/voucher" icon={<FaTicketAlt />} label="Mã Khuyến Mãi" />
          
          
          <SidebarLink to="/admin/feedbacks" icon={<FaClipboardList />} label="Phản Hồi" />
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', background: '#1a1a27' }}>
           <button 
             onClick={handleLogout}
             style={{ 
               width: '100%', 
               padding: '12px', 
               background: 'rgba(239, 68, 68, 0.1)', 
               color: '#ef4444', 
               border: '1px solid rgba(239, 68, 68, 0.2)', 
               borderRadius: '10px', 
               cursor: 'pointer', 
               display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: '600',
               transition: 'all 0.3s'
             }}
             onMouseOver={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
             onMouseOut={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
           >
             <FaSignOutAlt /> Đăng Xuất
           </button>
        </div>

      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
        <header style={{ 
            height: '70px', 
            background: '#fff', 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
            padding: '0 30px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            zIndex: 90
        }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#64748b' }}>
              <FaBars style={{ cursor: 'pointer', fontSize: '1.2rem' }} />
              <div style={{ position: 'relative' }}>
                 <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                 <input type="text" placeholder="Tìm kiếm nhanh..." style={{ padding: '8px 15px 8px 35px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', color: '#334155', width: '250px' }} />
              </div>
           </div>

           <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ position: 'relative', cursor: 'pointer' }}>
                 <FaBell style={{ fontSize: '1.2rem', color: '#64748b' }} />
                 <span style={{ position: 'absolute', top: '-5px', right: '-5px', width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }}></span>
              </div>
              <div style={{ textAlign: 'right' }}>
                 <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>{new Date().toLocaleDateString('vi-VN')}</div>
                 <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Admin Panel</div>
              </div>
           </div>
        </header>

        <main className="fade-in" style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
           <Outlet /> 
        </main>
      </div>
    </div>
  );
}

// 🔥 VŨ KHÍ TỐI THƯỢNG: ÉP CỨNG MÀU TRẮNG VÀO TẬN CÙNG THẺ SPAN 🔥
const SidebarLink = ({ to, icon, label }) => (
  <NavLink 
    to={to} 
    style={({ isActive }) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 15px',
      marginBottom: '5px',
      borderRadius: '10px',
      textDecoration: 'none',
      transition: 'all 0.3s ease',
      background: isActive ? 'linear-gradient(90deg, #ff6b6b 0%, #e64a19 100%)' : 'transparent',
      boxShadow: isActive ? '0 4px 15px rgba(230, 74, 25, 0.4)' : 'none',
      fontWeight: isActive ? '600' : '500',
      position: 'relative',
      overflow: 'hidden',
      opacity: isActive ? 1 : 0.6 
    })}
    onMouseOver={(e) => {
        if (!e.currentTarget.classList.contains('active')) {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translateX(5px)';
        }
    }}
    onMouseOut={(e) => {
        if (!e.currentTarget.classList.contains('active')) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.opacity = '0.6';
            e.currentTarget.style.transform = 'translateX(0)';
        }
    }}
  >
    <span style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', color: '#ffffff' }}>{icon}</span>
    <span style={{ fontSize: '0.95rem', color: '#ffffff' }}>{label}</span>
  </NavLink>
);

export default AdminLayout;