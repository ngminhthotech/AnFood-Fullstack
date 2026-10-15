import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom';

// --- IMPORT CLIENT API MỚI ---
import axiosClient from './api/axiosClient';

// --- STYLE ---
import './styles/App.css';

// --- COMPONENTS ---
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';

// 👉 TÍNH NĂNG MỚI: TÍCH HỢP CHATBOT VÀ VOICEBOT
import ChatWidget from './components/ChatWidget'; 
import VoiceBot from './components/VoiceBot'; // <-- THÊM IMPORT VOICEBOT Ở ĐÂY

// --- LAYOUTS ---
import AdminLayout from './layouts/AdminLayout';

// --- PAGES CLIENT ---
import Home from './pages/client/Home';
import Menu from './pages/client/Menu';
import Cart from './pages/client/Cart';
import ProductDetail from './pages/client/ProductDetail';
import Checkout from './pages/client/Checkout';
import Login from './pages/client/Login';
import OrderHistory from './pages/client/OrderHistory';
import Contact from './pages/client/Contact'; 
import Suggest from './pages/client/Suggest'; 
import Register from './pages/client/Register'; 
import Profile from './pages/client/Profile';
import PaymentResult from './pages/client/PaymentResult';
import Favorites from './pages/client/Favorites'; 
import AiRecommendedList from './components/AiRecommendedList'; 

// --- PAGES ADMIN ---
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFood from './pages/admin/AdminFood';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCategory from './pages/admin/AdminCategory';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminInventory from './pages/admin/AdminInventory'; 
import AdminContact from './pages/admin/AdminContact';
import AdminBanner from './pages/admin/AdminBanner';
import AdminVoucher from './pages/admin/AdminVoucher';

// HÀM HELPER
const normalizeUser = (userData) => {
  if (!userData) return null;
  let finalRole = 'customer';
  // Kiểm tra vai trò an toàn
  if (['admin', 'Admin'].includes(userData.vaiTro) || ['admin', 'Admin'].includes(userData.VaiTro)) {
    finalRole = 'admin';
  } else if ([1].includes(userData.ma_vai_tro) || [1].includes(userData.MaVaiTro) || [1].includes(userData.maVaiTro)) {
    finalRole = 'admin';
  }
  return {
    ...userData,
    id: userData.id || userData.MaNguoiDung || userData.maNguoiDung || userData.ma_nguoi_dung,
    vaiTro: finalRole,
    ma_vai_tro: userData.ma_vai_tro || userData.MaVaiTro || userData.maVaiTro
  };
};

// LAYOUT KHÁCH HÀNG (Đã fix UI khoảng trắng)
const CustomerLayout = ({ cartCount, user, onLogout, foods, addToCart, cartItems }) => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Header cartCount={cartCount} user={user} onLogout={onLogout} />
    <main style={{ flex: 1, paddingTop: '115px' }}>
      <Outlet />
    </main>
    <Footer />
    
    {/* 👉 TÍNH NĂNG MỚI: HIỂN THỊ CÁC WIDGET AI Ở GÓC MÀN HÌNH */}
    <ChatWidget foods={foods} addToCart={addToCart} />
    <VoiceBot /> {/* <-- GẮN THÊM VOICEBOT VÀO LAYOUT TỔNG */}
  </div>
);

// --- COMPONENT APP ---
function App() {
  const [foods, setFoods] = useState([]);
  const [user, setUser] = useState(() => {
    try {
        const savedUser = localStorage.getItem('user');
        return savedUser ? normalizeUser(JSON.parse(savedUser)) : null;
    } catch { return null; }
  });

  const [cartItems, setCartItems] = useState(() => {
    try {
        if (localStorage.getItem('user')) return []; 
        const savedCart = localStorage.getItem('cartItems');
        const parsed = savedCart ? JSON.parse(savedCart) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });

  const fetchCartFromDB = async (userId) => {
    if (!userId) return;
    try {
      const res = await axiosClient.get(`/GioHang/${userId}`);
      const cartData = Array.isArray(res.data) ? res.data : [];
      setCartItems(cartData);
    } catch (err) { 
      console.error("Lỗi tải giỏ hàng:", err);
      setCartItems([]);
    }
  };

  const syncLocalCartToDB = async (userId) => {
    let localCart = [];
    try {
      const localCartString = localStorage.getItem('cartItems');
      const parsed = localCartString ? JSON.parse(localCartString) : [];
      localCart = Array.isArray(parsed) ? parsed : [];
    } catch { localCart = []; }

    if (localCart.length > 0) {
      for (const item of localCart) {
        if (item && item.maMon && typeof item.quantity === 'number') {
          try {
            await axiosClient.post(`/GioHang/Them`, {
              maNguoiDung: userId, 
              maMon: item.maMon, 
              soLuong: item.quantity
            });
          } catch (err) { console.error(`Lỗi đồng bộ:`, err); }
        }
      }
      localStorage.removeItem('cartItems');
    }
  };

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await axiosClient.get(`/MonAn`);
        const safeFoods = Array.isArray(res.data) ? res.data : [];
        setFoods(safeFoods);
      } catch (error) {
        console.error("Lỗi kết nối API MonAn:", error);
        setFoods([]); 
      }
    };
    fetchFoods();
  }, []);

  useEffect(() => {
    if (user && user.id) {
      fetchCartFromDB(user.id);
    } else {
      try {
        const cartString = localStorage.getItem('cartItems');
        const parsed = cartString ? JSON.parse(cartString) : [];
        setCartItems(Array.isArray(parsed) ? parsed : []);
      } catch { setCartItems([]); }
    }
  }, [user]);

  const handleLogin = async (userData) => {
    const safeUser = normalizeUser(userData);
    setUser(safeUser);
    localStorage.setItem('user', JSON.stringify(safeUser));
    await syncLocalCartToDB(safeUser.id);
    fetchCartFromDB(safeUser.id);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setCartItems([]);
    alert("Đã đăng xuất!");
    window.location.href = "/";
  };

  const addToCart = async (product) => {
    if (!product || !product.maMon) return;

    if (product.trangThai && product.trangThai !== 'con_ban') {
       alert("Sản phẩm này hiện đang tạm hết hàng!");
       return;
    }

    // ==============================================================
    // 👉 TÍNH NĂNG MỚI: THEO DÕI HÀNH VI "THÊM VÀO GIỎ" (AddToCart)
    // ==============================================================
    try {
      // Gắn try-catch và fire-and-forget (không await) để web vẫn mượt
      axiosClient.post('/Tracking/Record', {
        maNguoiDung: (user && user.id) ? user.id : 0, // Nếu chưa đăng nhập thì gửi 0
        maMon: product.maMon,
        hanhVi: "AddToCart"
      }).catch(err => console.log("Lỗi tracking giỏ hàng (ẩn danh):", err));
    } catch (err) {}
    // ==============================================================

    const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
    let newCart = [...safeCartItems];
    const existingItem = newCart.find((item) => item?.maMon === product.maMon);
    
    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 0) + 1;
    } else {
      newCart.push({ ...product, quantity: 1 });
    }
    
    setCartItems(newCart);

    if (user && user.id) {
      try {
        await axiosClient.post(`/GioHang/Them`, {
          maNguoiDung: user.id, maMon: product.maMon, soLuong: 1
        });
      } catch (err) { console.error("❌ Lỗi lưu DB:", err); }
    } else {
      localStorage.setItem('cartItems', JSON.stringify(newCart));
    }
  };

  const clearCart = () => {
    setCartItems([]);
    if (!user) {
      localStorage.removeItem('cartItems');
    }
  };

  return (
    <Router>
      <Routes>
        <Route element={
            <CustomerLayout 
                cartCount={Array.isArray(cartItems) ? cartItems.reduce((total, item) => total + (item.quantity || item.soLuong || 1), 0) : 0}
                user={user} 
                onLogout={handleLogout} 
                foods={foods}          
                addToCart={addToCart}
                cartItems={cartItems}   
            />
        }>
          {/* Đã bổ sung addToCart cho trang Home */}
          <Route path="/" element={<Home foods={foods} addToCart={addToCart} />} />
          <Route path="menu" element={<Menu addToCart={addToCart} />} />
          <Route path="cart" element={<Cart user={user} />} />
          <Route path="checkout" element={<Checkout cartItems={cartItems} clearCart={clearCart} />} />
          <Route path="history" element={<OrderHistory user={user} />} />
          <Route path="product-detail/:productId" element={<ProductDetail addToCart={addToCart} user={user} />} />
          <Route path="login" element={<Login onLogin={handleLogin} />} />
          <Route path="register" element={<Register />} />  
          <Route path="profile" element={<Profile user={user} />} />
          <Route path="payment-result" element={<PaymentResult clearCart={clearCart} />} />
          <Route path="contact" element={<Contact />} />
          <Route path="suggest" element={<Suggest addToCart={addToCart} />} />
          <Route path="favorites" element={<Favorites user={user} addToCart={addToCart} />} />  
        </Route>

        <Route element={<PrivateRoute user={user} requiredRole="admin" />}>
            <Route path="/admin" element={<AdminLayout />}>
               <Route index element={<AdminDashboard />} />
               <Route path="dashboard" element={<AdminDashboard />} />
               <Route path="food" element={<AdminFood />} />
               <Route path="orders" element={<AdminOrders />} />
               <Route path="categories" element={<AdminCategory />} />
               <Route path="customers" element={<AdminCustomers />} />
               <Route path="inventory" element={<AdminInventory />} />
               <Route path="feedbacks" element={<AdminContact />} />
               <Route path="banner" element={<AdminBanner />} />
               <Route path="voucher" element={<AdminVoucher />} />
            </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;