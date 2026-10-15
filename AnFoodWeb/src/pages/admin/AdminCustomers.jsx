import React, { useEffect, useState, useMemo } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { 
  Users, Search, Mail, Phone, MapPin, 
  ShieldAlert, ShieldCheck, KeyRound, Ban, Unlock, UserCheck, UserX, AlertTriangle
} from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

// ✅ SỬ DỤNG AXIOS ADMIN (Đã có token và interceptor)
import axiosAdmin from '../../api/axiosAdmin';

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 👉 NÂNG CẤP: State quản lý Modal Xác nhận (Thay cho window.confirm)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, userId: null, actionType: '', title: '', message: '', type: 'info' });

  // ✅ 1. Tự động gọi API khi mở trang
  useEffect(() => {
    fetchCustomers();
  }, []);

  // --- HÀM TẢI DỮ LIỆU ---
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      const response = await axiosAdmin.get('/NguoiDung');
      
      // Tìm mảng dữ liệu (Xử lý mọi trường hợp trả về)
      let rawList = [];
      if (Array.isArray(response)) {
          rawList = response;
      } else if (response && Array.isArray(response.data)) {
          rawList = response.data;
      } else if (response && Array.isArray(response.result)) {
          rawList = response.result;
      } else if (response && Array.isArray(response.content)) {
          rawList = response.content;
      }

      // Chuẩn hóa Key
      const normalizedList = rawList.map(item => ({
          maNguoiDung: item.maNguoiDung || item.MaNguoiDung || item.id || item.ID,
          hoTen:       item.hoTen || item.HoTen || item.fullName || item.FullName || "Người dùng",
          email:       item.email || item.Email || "",
          soDienThoai: item.soDienThoai || item.SoDienThoai || item.PhoneNumber || "",
          diaChi:      item.diaChi || item.DiaChi || item.Address || "Chưa cập nhật",
          vaiTro:      (item.vaiTro || item.VaiTro || "user").toLowerCase(),
          isDeleted:   item.isDeleted || item.IsDeleted || false 
      }));

      // Sắp xếp: Admin lên đầu, sau đó đến user thường, user bị khóa xuống cuối
      normalizedList.sort((a, b) => {
          if (a.vaiTro === 'admin') return -1;
          if (b.vaiTro === 'admin') return 1;
          return a.isDeleted - b.isDeleted;
      });

      setCustomers(normalizedList);

    } catch (err) {
      console.error("Lỗi tải khách hàng:", err);
      if (err.response && err.response.status !== 403) {
          toast.error("❌ Không thể tải danh sách khách hàng.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC TÌM KIẾM ---
  const filteredCustomers = useMemo(() => {
    return customers.filter(user =>
      (user.hoTen && user.hoTen.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.soDienThoai && user.soDienThoai.includes(searchTerm)) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [customers, searchTerm]);

  // --- LOGIC THỐNG KÊ ---
  const stats = useMemo(() => {
    return {
        total: customers.length,
        admins: customers.filter(c => c.vaiTro === 'admin').length,
        users: customers.filter(c => c.vaiTro !== 'admin' && !c.isDeleted).length, 
        locked: customers.filter(c => c.isDeleted).length 
    };
  }, [customers]);

  // --- GỌI MODAL XÁC NHẬN ---
  const triggerAction = (id, actionType) => {
      if (actionType === 'lock') {
          setConfirmModal({
              isOpen: true, userId: id, actionType, type: 'danger',
              title: 'Cảnh báo Khóa tài khoản!',
              message: `Bạn đang thao tác KHÓA tài khoản của người dùng #${id}. Người dùng này sẽ không thể đăng nhập vào hệ thống. Bạn có chắc chắn không?`
          });
      } else if (actionType === 'unlock') {
          setConfirmModal({
              isOpen: true, userId: id, actionType, type: 'success',
              title: 'Xác nhận Mở khóa',
              message: `Xác nhận mở khóa cho người dùng #${id}? Họ sẽ có thể tiếp tục sử dụng hệ thống bình thường.`
          });
      }
  };

  // --- THỰC THI HÀNH ĐỘNG TỪ MODAL ---
  const executeAction = async () => {
      const { userId, actionType } = confirmModal;
      setConfirmModal({ ...confirmModal, isOpen: false });

      if (actionType === 'lock') {
          try {
              await axiosAdmin.delete(`/NguoiDung/${userId}`);
              toast.success("🔒 Đã khóa tài khoản thành công");
              fetchCustomers();
          } catch (err) {
              const msg = err.response?.data?.message || "Không thể khóa tài khoản";
              toast.error("❌ " + msg);
          }
      } else if (actionType === 'unlock') {
          try {
              await axiosAdmin.put(`/NguoiDung/Restore/${userId}`);
              toast.success("✅ Đã mở khóa tài khoản thành công");
              fetchCustomers();
          } catch (err) {
              const msg = err.response?.data?.message || "Không thể mở khóa";
              toast.error("❌ " + msg);
          }
      }
  };

  // --- 🔐 CẤP LẠI MẬT KHẨU ---
  const handleResetPassword = (user) => {
    if (user.isDeleted) {
        return toast.warning("🚫 Không thể cấp lại mật khẩu cho tài khoản đang bị khóa!");
    }

    const newPassword = Math.random().toString(36).slice(-8).toUpperCase();
    navigator.clipboard.writeText(newPassword)
        .then(() => toast.success(`📋 Đã copy mật khẩu mới: ${newPassword}`))
        .catch(() => toast.info(`Mật khẩu mới: ${newPassword}`));

    const subject = encodeURIComponent("Cấp lại Mật Khẩu Mới - FastBite Support");
    const body = encodeURIComponent(
      `Xin chào ${user.hoTen},\n\n` +
      `Chúng tôi nhận được yêu cầu cấp lại mật khẩu của bạn.\n` +
      `🔐 Mật khẩu tạm thời mới của bạn là: ${newPassword}\n\n` +
      `Vui lòng đăng nhập và đổi lại mật khẩu ngay lập tức để bảo mật.\n\n` +
      `Trân trọng,\nĐội ngũ FastBite.`
    );

    setTimeout(() => {
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${user.email}&su=${subject}&body=${body}`, '_blank');
    }, 1000);
  };

  // Helper Avatar
  const getAvatar = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&bold=true&size=128`;
  };

  return (
    <div style={{ padding: '30px', background: '#f4f6f8', minHeight: '100vh', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      
      {/* HEADER CHUYÊN NGHIỆP */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#2d3436', display: 'flex', alignItems: 'center', gap: '12px', margin: '0 0 5px' }}>
                <Users color="#e64a19" size={28} /> Quản Lý Khách Hàng
            </h2>
            <p style={{ margin: 0, color: '#636e72', fontSize: '0.95rem' }}>Quản lý thông tin, phân quyền và bảo mật tài khoản người dùng</p>
        </div>
        
        <div style={{ position: 'relative', width: '350px' }}>
          <Search size={16} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#b2bec3' }} />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên, SĐT, Email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 15px 12px 40px', borderRadius: '8px', border: '1px solid #dfe6e9', outline: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', fontSize: '0.95rem', transition: 'border-color 0.2s' }}
            onFocus={e => e.target.style.borderColor = '#e64a19'}
            onBlur={e => e.target.style.borderColor = '#dfe6e9'}
          />
        </div>
      </div>

      {/* KPI DASHBOARD CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <KpiCard title="Tổng Tài Khoản" value={stats.total} icon={<Users size={24}/>} color="#0984e3" bg="#e3f2fd" />
        <KpiCard title="Đang Hoạt Động" value={stats.users} icon={<UserCheck size={24}/>} color="#27ae60" bg="#e8f5e9" />
        <KpiCard title="Tài Khoản Bị Khóa" value={stats.locked} icon={<UserX size={24}/>} color="#d63031" bg="#ffebee" isAlert={stats.locked > 0} />
        <KpiCard title="Tài Khoản Quản Trị" value={stats.admins} icon={<ShieldCheck size={24}/>} color="#8e44ad" bg="#f4ecf8" />
      </div>

      {/* MAIN TABLE */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 5px 20px rgba(0,0,0,0.03)', overflow: 'hidden', border: '1px solid #f1f2f6', minHeight: '400px' }}>
        {loading ? (
            <div style={{padding:'80px', textAlign:'center', color:'#b2bec3'}}>
                <div className="spinner"></div>
                <div style={{ marginTop: '15px', fontWeight: '600' }}>Đang tải danh sách người dùng...</div>
            </div>
        ) : (
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                <thead>
                    <tr style={{ background: '#f8f9fa', color: '#2d3436', textAlign: 'left', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <th style={{ padding: '18px 25px', borderBottom: '2px solid #eee' }}>Hồ sơ người dùng</th>
                        <th style={{ padding: '18px 25px', borderBottom: '2px solid #eee' }}>Liên hệ</th>
                        <th style={{ padding: '18px 25px', borderBottom: '2px solid #eee' }}>Địa chỉ</th>
                        <th style={{ padding: '18px 25px', borderBottom: '2px solid #eee', textAlign: 'center' }}>Trạng thái</th>
                        <th style={{ padding: '18px 25px', borderBottom: '2px solid #eee', textAlign: 'center' }}>Bảo mật</th>
                        <th style={{ padding: '18px 25px', borderBottom: '2px solid #eee', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCustomers.length > 0 ? filteredCustomers.map(user => (
                    <tr key={user.maNguoiDung} 
                        style={{ 
                            borderBottom: '1px solid #f1f2f6', 
                            transition: 'background-color 0.2s',
                            opacity: user.isDeleted ? 0.6 : 1, 
                            background: user.isDeleted ? '#fafafa' : '#fff'
                        }} 
                        className="hover-row">
                        
                        {/* HỒ SƠ */}
                        <td style={{ padding: '16px 25px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <img 
                                    src={getAvatar(user.hoTen)} 
                                    alt={user.hoTen} 
                                    style={{ 
                                        width: '45px', height: '45px', borderRadius: '12px', 
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                        filter: user.isDeleted ? 'grayscale(100%)' : 'none' 
                                    }} 
                                />
                                <div>
                                    <div style={{ fontWeight: '700', color: '#2d3436', fontSize:'1.05rem' }}>{user.hoTen}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#95a5a6', marginTop:'4px' }}>
                                        Mã KH: <span style={{fontFamily:'monospace', background:'#f1f2f6', padding:'2px 6px', borderRadius:'4px', color:'#2d3436', fontWeight:'600'}}>#{user.maNguoiDung}</span>
                                    </div>
                                </div>
                            </div>
                        </td>

                        {/* LIÊN HỆ */}
                        <td style={{ padding: '16px 25px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', fontSize: '0.85rem', color: '#2d3436' }}>
                                <Mail size={14} color="#636e72" /> 
                                <span>{user.email || <span style={{fontStyle:'italic', color:'#b2bec3'}}>Chưa cập nhật email</span>}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#2d3436' }}>
                                <Phone size={14} color="#636e72" /> 
                                <span>{user.soDienThoai || <span style={{fontStyle:'italic', color:'#b2bec3'}}>Chưa cập nhật SĐT</span>}</span>
                            </div>
                        </td>

                        {/* ĐỊA CHỈ */}
                        <td style={{ padding: '16px 25px', color: '#636e72', fontSize: '0.85rem', maxWidth:'220px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                <MapPin size={14} style={{ marginTop: '3px', color: '#b2bec3', flexShrink:0 }} /> 
                                <span style={{lineHeight:'1.4', overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical'}} title={user.diaChi}>
                                    {user.diaChi || 'Chưa cập nhật địa chỉ'}
                                </span>
                            </div>
                        </td>

                        {/* VAI TRÒ & TRẠNG THÁI */}
                        <td style={{ padding: '16px 25px', textAlign: 'center' }}>
                            {user.vaiTro === 'admin' ? (
                                <span style={{ background: '#f4ecf8', color: '#8e44ad', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid #e8daef' }}>
                                    <ShieldAlert size={14} /> ADMIN
                                </span>
                            ) : user.isDeleted ? (
                                <span style={{ background: '#ffebee', color: '#c0392b', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid #ffcdd2' }}>
                                    <Ban size={14} /> ĐÃ KHÓA
                                </span>
                            ) : (
                                <span style={{ background: '#e8f5e9', color: '#27ae60', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid #c8e6c9' }}>
                                    <UserCheck size={14} /> THÀNH VIÊN
                                </span>
                            )}
                        </td>

                        {/* BẢO MẬT (RESET PASS) */}
                        <td style={{ padding: '16px 25px', textAlign: 'center' }}>
                            <button 
                                onClick={() => handleResetPassword(user)}
                                title={user.isDeleted ? "Mở khóa tài khoản trước khi cấp lại mật khẩu" : "Cấp lại mật khẩu mới"}
                                style={{ ...actionBtnStyle(user.isDeleted ? '#f1f2f6' : '#fff3e0', user.isDeleted ? '#b2bec3' : '#e67e22'), opacity: user.isDeleted ? 0.5 : 1, cursor: user.isDeleted ? 'not-allowed' : 'pointer' }}
                                disabled={user.isDeleted}
                            >
                                <KeyRound size={16} />
                            </button>
                        </td>

                        {/* THAO TÁC (LOCK/UNLOCK) */}
                        <td style={{ padding: '16px 25px', textAlign: 'center' }}>
                            {user.vaiTro !== 'admin' ? (
                                user.isDeleted ? (
                                    <button 
                                        onClick={() => triggerAction(user.maNguoiDung, 'unlock')} 
                                        style={actionBtnStyle('#e8f5e9', '#27ae60')}
                                        title="Mở khóa tài khoản"
                                    >
                                        <Unlock size={16} />
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => triggerAction(user.maNguoiDung, 'lock')} 
                                        style={actionBtnStyle('#ffebee', '#c0392b')}
                                        title="Khóa tài khoản"
                                    >
                                        <Ban size={16} />
                                    </button>
                                )
                            ) : (
                                <div style={{ color: '#b2bec3', fontSize: '0.8rem', fontStyle: 'italic' }}>Không hỗ trợ</div>
                            )}
                        </td>

                    </tr>
                    )) : (
                        <tr>
                            <td colSpan="6" style={{ padding: '60px', textAlign: 'center' }}>
                                <img src="https://cdni.iconscout.com/illustration/premium/thumb/empty-state-2130362-1800926.png" style={{ width: '120px', opacity: 0.5, marginBottom: '15px' }} alt="empty" />
                                <div style={{ color: '#b2bec3', fontSize: '1.1rem', fontWeight: '600' }}>Không tìm thấy khách hàng nào</div>
                            </td>
                        </tr>
                    )}
                </tbody>
                </table>
            </div>
        )}
      </div>

      {/* 👉 NÂNG CẤP: MODAL XÁC NHẬN HÀNH ĐỘNG (Thay thế window.confirm) */}
      {confirmModal.isOpen && (
          <div style={modalOverlayStyle}>
              <div style={{...modalContentStyle, width: '400px', textAlign: 'center', padding: '35px 25px'}} className="fade-in">
                  <div style={{ 
                      width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: confirmModal.type === 'danger' ? '#ffebee' : '#e8f5e9',
                      color: confirmModal.type === 'danger' ? '#d63031' : '#27ae60'
                  }}>
                      {confirmModal.type === 'danger' ? <AlertTriangle size={30} /> : <Unlock size={30} />}
                  </div>
                  <h3 style={{ margin: '0 0 15px', color: '#2d3436', fontSize: '1.4rem' }}>{confirmModal.title}</h3>
                  <p style={{ color: '#636e72', lineHeight: '1.5', marginBottom: '25px' }}>{confirmModal.message}</p>
                  
                  <div style={{ display: 'flex', gap: '15px' }}>
                      <button onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} style={{ flex: 1, padding: '12px', border: '1px solid #dfe6e9', background: '#fff', color: '#636e72', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' }}>
                          Quay lại
                      </button>
                      <button onClick={executeAction} style={{ flex: 1, padding: '12px', border: 'none', background: confirmModal.type === 'danger' ? '#d63031' : '#27ae60', color: '#fff', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', boxShadow: `0 4px 10px ${confirmModal.type === 'danger' ? 'rgba(214,48,49,0.3)' : 'rgba(39,174,96,0.3)'}` }}>
                          Xác nhận
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* CSS Hover Effect & SKELETON */}
      <style>{`
        .hover-row:hover { background-color: #fdfdfd !important; box-shadow: inset 4px 0 0 #e64a19; }
        .fade-in { animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        
        button svg { flex-shrink: 0 !important; display: inline-block !important; }
        
        .spinner {
            width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #e64a19;
            border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// --- STYLES HELPER ---
const KpiCard = ({ title, value, icon, color, bg, isAlert }) => (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #f1f2f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: isAlert ? '0 0 0 2px #d63031, 0 10px 20px rgba(214, 48, 49, 0.15)' : '0 5px 15px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: color }}></div>
        <div>
            <h4 style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#636e72', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>{title}</h4>
            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '900', color: isAlert ? '#d63031' : '#2d3436' }}>{value}</h2>
        </div>
        <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
        </div>
    </div>
);

const actionBtnStyle = (bg, color) => ({
    width: '36px', height: '36px', borderRadius: '8px', 
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', 
    background: bg, color: color, border: 'none', cursor: 'pointer', 
    transition: 'transform 0.1s, box-shadow 0.2s', padding: '0'
});

const modalOverlayStyle = { 
    position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 
};
const modalContentStyle = { 
    background:'#fff', borderRadius:'16px', boxShadow:'0 25px 50px -12px rgba(0,0,0,0.3)', overflow:'hidden' 
};

export default AdminCustomers;