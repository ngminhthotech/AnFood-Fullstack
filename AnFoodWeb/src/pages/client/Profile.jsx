import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaUser, FaKey, FaMapMarkerAlt, FaPlus, FaTrash, FaCheckCircle, 
  FaCamera, FaSignOutAlt, FaEye, FaEyeSlash 
} from 'react-icons/fa';

// ✅ IMPORT CHUẨN
import axiosClient from '../../api/axiosClient';

function Profile({ user, onLogout }) { // Thêm prop onLogout nếu muốn nút đăng xuất hoạt động
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'address', 'password'
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);

  // State đổi mật khẩu
  const [passData, setPassData] = useState({ oldPass: '', newPass: '', confirmPass: '' });
  const [showPass, setShowPass] = useState({ old: false, new: false, confirm: false });

  // State thêm địa chỉ
  const [isAddingAddr, setIsAddingAddr] = useState(false);
  const [newAddress, setNewAddress] = useState({ hoTen: '', sdt: '', diaChi: '' });

  // --- 1. FETCH DỮ LIỆU ---
  useEffect(() => {
    if (activeTab === 'address' && user) {
      fetchAddresses();
    }
  }, [activeTab, user]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/DiaChi/user/${user.id || user.maNguoiDung}`);
      setAddresses(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. XỬ LÝ ĐỊA CHỈ ---
  const handleAddAddress = async (e) => {
    e.preventDefault();
    if(!newAddress.hoTen || !newAddress.sdt || !newAddress.diaChi) return toast.warning("Vui lòng điền đủ thông tin!");

    try {
      await axiosClient.post('/DiaChi', {
        maNguoiDung: user.id || user.maNguoiDung,
        hoTenNguoiNhan: newAddress.hoTen,
        soDienThoai: newAddress.sdt,
        diaChi: newAddress.diaChi,
        macDinh: addresses.length === 0 // Nếu chưa có địa chỉ nào thì cái đầu tiên là mặc định
      });
      toast.success("Thêm địa chỉ thành công!");
      setNewAddress({ hoTen: '', sdt: '', diaChi: '' });
      setIsAddingAddr(false);
      fetchAddresses();
    } catch (err) {
      toast.error("Lỗi thêm địa chỉ. Vui lòng thử lại.");
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa địa chỉ này?")) return;
    try {
      await axiosClient.delete(`/DiaChi/${id}`);
      toast.success("Đã xóa địa chỉ.");
      fetchAddresses();
    } catch (err) {
      toast.error("Không thể xóa địa chỉ này.");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await axiosClient.put(`/DiaChi/SetDefault/${id}/${user.id || user.maNguoiDung}`);
      toast.success("Đã đặt làm địa chỉ mặc định.");
      fetchAddresses();
    } catch (err) {
      toast.error("Lỗi cập nhật.");
    }
  };

  // --- 3. XỬ LÝ ĐỔI MẬT KHẨU ---
  const handleChangePass = async (e) => {
    e.preventDefault();
    if (passData.newPass.length < 6) return toast.warning("Mật khẩu mới phải từ 6 ký tự!");
    if (passData.newPass !== passData.confirmPass) return toast.error("Mật khẩu xác nhận không khớp!");

    try {
      await axiosClient.post('/NguoiDung/DoiMatKhauCaNhan', {
        maNguoiDung: user.id || user.maNguoiDung,
        matKhauCu: passData.oldPass,
        matKhauMoi: passData.newPass
      });
      toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      setPassData({ oldPass: '', newPass: '', confirmPass: '' });
      // Có thể gọi onLogout() ở đây nếu muốn bắt user đăng nhập lại
    } catch (err) {
      toast.error(err.response?.data?.message || "Mật khẩu cũ không đúng!");
    }
  };

  if (!user) return <div style={{ padding: '100px', textAlign: 'center', color: '#666' }}>Vui lòng đăng nhập để xem hồ sơ.</div>;

  return (
    <div style={{ padding: '60px 20px', background: '#f0f2f5', minHeight: '100vh', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', background: '#fff', borderRadius: '20px', display: 'flex', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', minHeight: '600px' }}>
        
        {/* === SIDEBAR === */}
        <div style={{ width: '280px', background: '#2d3436', color: '#fff', padding: '40px 0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px', padding: '0 20px' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #e64a19, #ffcc80)', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold', color: '#fff', border: '4px solid rgba(255,255,255,0.2)', position: 'relative' }}>
              {user.hoTen ? user.hoTen.charAt(0).toUpperCase() : 'U'}
              <div style={{ position: 'absolute', bottom: '0', right: '0', background: '#fff', color: '#2d3436', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}><FaCamera /></div>
            </div>
            <h3 style={{ margin: '0 0 5px', fontSize: '1.2rem' }}>{user.hoTen}</h3>
            <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>{user.email}</p>
          </div>
          
          <nav style={{ flex: 1 }}>
            <button onClick={() => setActiveTab('info')} style={tabStyle(activeTab === 'info')}> <FaUser /> Thông Tin Cá Nhân</button>
            <button onClick={() => setActiveTab('address')} style={tabStyle(activeTab === 'address')}> <FaMapMarkerAlt /> Sổ Địa Chỉ</button>
            <button onClick={() => setActiveTab('password')} style={tabStyle(activeTab === 'password')}> <FaKey /> Đổi Mật Khẩu</button>
          </nav>

          <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
             <button onClick={() => window.location.href='/login'} style={{ ...tabStyle(false), color: '#ff7675' }}> <FaSignOutAlt /> Đăng Xuất</button>
          </div>
        </div>

        {/* === MAIN CONTENT === */}
        <div style={{ flex: 1, padding: '50px', overflowY: 'auto' }}>
          
          {/* TAB 1: INFO */}
          {activeTab === 'info' && (
            <div className="fade-in">
              <h2 style={headStyle}>Hồ Sơ Của Tôi</h2>
              <p style={{ color: '#636e72', marginBottom: '30px' }}>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', rowGap: '25px', alignItems: 'center' }}>
                <label style={{ color: '#636e72', fontWeight: '600' }}>Tên đăng nhập</label>
                <div style={{ fontWeight: 'bold', color: '#2d3436' }}>{user.hoTen}</div>

                <label style={{ color: '#636e72', fontWeight: '600' }}>Email</label>
                <div>{user.email} <span style={{ background: '#e8f5e9', color: '#27ae60', padding: '3px 8px', borderRadius: '5px', fontSize: '0.8rem', marginLeft: '10px' }}>Đã xác thực</span></div>

                <label style={{ color: '#636e72', fontWeight: '600' }}>Số điện thoại</label>
                <div>{user.soDienThoai || 'Chưa cập nhật'}</div>

                <label style={{ color: '#636e72', fontWeight: '600' }}>Vai trò</label>
                <div style={{ textTransform: 'capitalize' }}>{user.vaiTro || 'Thành viên'}</div>
              </div>
            </div>
          )}

          {/* TAB 2: ADDRESS */}
          {activeTab === 'address' && (
            <div className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ ...headStyle, marginBottom: '5px' }}>Địa Chỉ Của Tôi</h2>
                    <p style={{ color: '#636e72', margin: 0 }}>Quản lý địa chỉ nhận hàng</p>
                </div>
                <button onClick={() => setIsAddingAddr(!isAddingAddr)} style={{ background: '#e64a19', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 5px 15px rgba(230, 74, 25, 0.3)' }}>
                    <FaPlus /> Thêm Địa Chỉ Mới
                </button>
              </div>

              {isAddingAddr && (
                <form onSubmit={handleAddAddress} style={{ background: '#f8f9fa', padding: '25px', borderRadius: '15px', marginBottom: '30px', border: '1px solid #eee' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                        <input required placeholder="Họ và tên" value={newAddress.hoTen} onChange={e=>setNewAddress({...newAddress, hoTen: e.target.value})} style={inputStyle} />
                        <input required placeholder="Số điện thoại" value={newAddress.sdt} onChange={e=>setNewAddress({...newAddress, sdt: e.target.value})} style={inputStyle} />
                    </div>
                    <input required placeholder="Địa chỉ cụ thể (Số nhà, Đường, Phường, Quận...)" value={newAddress.diaChi} onChange={e=>setNewAddress({...newAddress, diaChi: e.target.value})} style={{...inputStyle, marginBottom:'20px'}} />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="button" onClick={() => setIsAddingAddr(false)} style={{...btnStyle, background:'#fff', color:'#636e72', border:'1px solid #ddd'}}>Hủy</button>
                        <button type="submit" style={btnStyle}>Lưu Địa Chỉ</button>
                    </div>
                </form>
              )}

              {loading ? <div style={{textAlign:'center'}}>Đang tải...</div> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {addresses.map(item => (
                        <div key={item.maDiaChi} style={{ border: item.macDinh ? '1px solid #e64a19' : '1px solid #eee', padding: '20px', borderRadius: '15px', position: 'relative', background: '#fff', transition: '0.3s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#2d3436', marginBottom: '5px' }}>
                                        {item.hoTenNguoiNhan} 
                                        <span style={{ color: '#636e72', fontWeight: 'normal', marginLeft: '10px', fontSize: '0.9rem' }}>| {item.soDienThoai}</span>
                                    </div>
                                    <div style={{ color: '#636e72' }}>{item.diaChi}</div>
                                    {item.macDinh && <span style={{ display: 'inline-block', marginTop: '10px', fontSize: '0.8rem', color: '#e64a19', border: '1px solid #e64a19', padding: '2px 8px', borderRadius: '5px' }}>Mặc định</span>}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
                                    {!item.macDinh && (
                                        <button onClick={() => handleSetDefault(item.maDiaChi)} style={{ background: 'none', border: 'none', color: '#0984e3', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}>Thiết lập mặc định</button>
                                    )}
                                    <button onClick={() => handleDeleteAddress(item.maDiaChi)} style={{ background: '#ffebee', color: '#d63031', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}><FaTrash /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {addresses.length === 0 && !isAddingAddr && <div style={{ textAlign: 'center', color: '#999', fontStyle: 'italic' }}>Chưa có địa chỉ nào.</div>}
                  </div>
              )}
            </div>
          )}

          {/* TAB 3: PASSWORD */}
          {activeTab === 'password' && (
            <div className="fade-in" style={{ maxWidth: '500px' }}>
              <h2 style={headStyle}>Đổi Mật Khẩu</h2>
              <p style={{ color: '#636e72', marginBottom: '30px' }}>Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
              
              <form onSubmit={handleChangePass}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3436' }}>Mật khẩu hiện tại</label>
                    <div style={{ position: 'relative' }}>
                        <input type={showPass.old ? "text" : "password"} required value={passData.oldPass} onChange={e=>setPassData({...passData, oldPass: e.target.value})} style={inputStyle} />
                        <span onClick={() => setShowPass({...showPass, old: !showPass.old})} style={eyeIconStyle}>{showPass.old ? <FaEyeSlash/> : <FaEye/>}</span>
                    </div>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3436' }}>Mật khẩu mới</label>
                    <div style={{ position: 'relative' }}>
                        <input type={showPass.new ? "text" : "password"} required value={passData.newPass} onChange={e=>setPassData({...passData, newPass: e.target.value})} style={inputStyle} />
                        <span onClick={() => setShowPass({...showPass, new: !showPass.new})} style={eyeIconStyle}>{showPass.new ? <FaEyeSlash/> : <FaEye/>}</span>
                    </div>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3436' }}>Xác nhận mật khẩu mới</label>
                    <div style={{ position: 'relative' }}>
                        <input type={showPass.confirm ? "text" : "password"} required value={passData.confirmPass} onChange={e=>setPassData({...passData, confirmPass: e.target.value})} style={inputStyle} />
                        <span onClick={() => setShowPass({...showPass, confirm: !showPass.confirm})} style={eyeIconStyle}>{showPass.confirm ? <FaEyeSlash/> : <FaEye/>}</span>
                    </div>
                </div>

                <button type="submit" style={btnStyle}>Xác Nhận Đổi</button>
              </form>
            </div>
          )}

        </div>
      </div>
      
      {/* CSS Animation */}
      <style>{`
        .fade-in { animation: fadeIn 0.4s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

// STYLES
const tabStyle = (active) => ({
  padding: '15px 25px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px',
  background: active ? 'rgba(255,255,255,0.1)' : 'transparent', 
  color: active ? '#e64a19' : '#b2bec3',
  borderLeft: active ? '4px solid #e64a19' : '4px solid transparent',
  fontWeight: active ? '600' : 'normal', transition: '0.3s',
  border: 'none', width: '100%', textAlign: 'left', fontSize: '1rem'
});

const headStyle = { margin: '0 0 10px 0', color: '#2d3436', fontSize: '1.8rem' };
const inputStyle = { width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #dfe6e9', outline: 'none', fontSize: '1rem', transition: '0.3s' };
const btnStyle = { padding: '12px 30px', background: '#e64a19', color: '#fff', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 5px 15px rgba(230, 74, 25, 0.3)' };
const eyeIconStyle = { position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#999' };

export default Profile;