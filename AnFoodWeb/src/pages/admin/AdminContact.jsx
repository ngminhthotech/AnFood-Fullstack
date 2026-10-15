import React, { useEffect, useState, useMemo } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { 
  FaEnvelope, FaCheckCircle, FaTimesCircle, FaReply, FaSearch, 
  FaTrash, FaInbox, FaEnvelopeOpenText 
} from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

// ✅ SỬ DỤNG AXIOS ADMIN (Đã có token và cấu hình base URL)
import axiosAdmin from '../../api/axiosAdmin';

function AdminContact() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'new', 'processed'
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Tải dữ liệu khi mở trang
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      // Gọi API: axiosAdmin đã cấu hình sẵn .../api nên chỉ cần gọi /LienHe
      const response = await axiosAdmin.get('/LienHe');
      
      console.log("🔥 CONTACT DATA:", response);

      // Xử lý linh hoạt cấu trúc trả về
      let rawList = [];
      if (Array.isArray(response)) {
          rawList = response;
      } else if (response && Array.isArray(response.data)) {
          rawList = response.data;
      }

      // Chuẩn hóa Key (Map chữ Hoa -> thường để tránh lỗi)
      const normalizedList = rawList.map(item => ({
          maLienHe: item.maLienHe || item.MaLienHe || item.id,
          hoTen: item.hoTen || item.HoTen || "Khách ẩn danh",
          email: item.email || item.Email || "",
          soDienThoai: item.soDienThoai || item.SoDienThoai || "",
          noiDung: item.noiDung || item.NoiDung || "",
          ngayGui: item.ngayGui || item.NgayGui || new Date().toISOString(),
          daPhanHoi: item.daPhanHoi !== undefined ? item.daPhanHoi : (item.DaPhanHoi || false)
      }));

      // Sắp xếp tin nhắn mới nhất lên đầu
      const sorted = normalizedList.sort((a, b) => new Date(b.ngayGui) - new Date(a.ngayGui));
      setContacts(sorted);
    } catch (err) {
      console.error("Lỗi tải liên hệ:", err);
      // Chỉ báo lỗi nếu không phải lỗi 403 (font)
      if (err.response?.status !== 403) {
          toast.error("❌ Không thể tải danh sách liên hệ");
      }
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  // --- XỬ LÝ LOGIC ---
  const toggleStatus = async (id, currentStatus) => {
    try {
      // Cập nhật giao diện ngay lập tức (Optimistic UI)
      const updatedContacts = contacts.map(c => 
        c.maLienHe === id ? { ...c, daPhanHoi: !currentStatus } : c
      );
      setContacts(updatedContacts);

      // Gọi API cập nhật
      await axiosAdmin.put(`/LienHe/${id}`, { daPhanHoi: !currentStatus });
      toast.success(currentStatus ? "Đã đánh dấu là: Mới" : "Đã đánh dấu: Đã Xử Lý");
    } catch (err) {
      toast.error("⚠️ Lỗi cập nhật trạng thái!");
      fetchContacts(); // Revert lại dữ liệu cũ nếu lỗi
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("⚠️ Bạn chắc chắn muốn xóa tin nhắn này? Hành động không thể hoàn tác.")) return;
    try {
      await axiosAdmin.delete(`/LienHe/${id}`);
      setContacts(prev => prev.filter(c => c.maLienHe !== id));
      toast.success("🗑️ Đã xóa tin nhắn!");
    } catch (err) {
      toast.error("❌ Lỗi khi xóa tin nhắn!");
    }
  };

  // --- LỌC & TÌM KIẾM ---
  const filteredContacts = useMemo(() => {
    return contacts.filter(item => {
      // 1. Lọc theo Tab Status
      if (filterStatus === 'new' && item.daPhanHoi) return false;
      if (filterStatus === 'processed' && !item.daPhanHoi) return false;

      // 2. Tìm kiếm
      const searchLower = searchTerm.toLowerCase();
      return (
        item.hoTen.toLowerCase().includes(searchLower) ||
        item.email.toLowerCase().includes(searchLower) ||
        (item.soDienThoai && item.soDienThoai.includes(searchTerm))
      );
    });
  }, [contacts, filterStatus, searchTerm]);

  // Thống kê nhanh
  const stats = useMemo(() => ({
    total: contacts.length,
    new: contacts.filter(c => !c.daPhanHoi).length,
    processed: contacts.filter(c => c.daPhanHoi).length
  }), [contacts]);

  // Helper tạo Avatar từ tên
  const getAvatar = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  // Helper tạo Link Mail (Mở Gmail soạn sẵn)
  const getMailLink = (item) => {
    const subject = encodeURIComponent(`Phản hồi liên hệ #${item.maLienHe} - FastBite Support`);
    const body = encodeURIComponent(`Xin chào ${item.hoTen},\n\nCảm ơn bạn đã liên hệ với FastBite. Về vấn đề của bạn ("${item.noiDung}"), chúng tôi xin phản hồi như sau:\n\n...\n\nTrân trọng,\nĐội ngũ FastBite.`);
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${item.email}&su=${subject}&body=${body}`;
  };

  return (
    <div style={{ padding: '30px', background: '#f8f9fa', minHeight: '100vh', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />
      
      {/* HEADER & STATS */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '20px', color: '#2d3436', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.8rem', fontWeight:'800', margin: 0 }}>
          <FaEnvelopeOpenText color="#e64a19" /> Hộp Thư Khách Hàng
        </h2>
        <p style={{ color: '#636e72', marginTop: '5px' }}>Quản lý phản hồi và thắc mắc từ người dùng</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop:'20px' }}>
            <div style={statCardStyle('#e3f2fd', '#0984e3')}>
                <div>
                    <div style={{fontSize:'2rem', fontWeight:'bold'}}>{stats.total}</div>
                    <div style={{fontSize:'0.9rem', opacity:0.8}}>Tổng tin nhắn</div>
                </div>
                <FaInbox size={30} opacity={0.3} />
            </div>
            <div style={statCardStyle('#ffebee', '#d63031')}>
                <div>
                    <div style={{fontSize:'2rem', fontWeight:'bold'}}>{stats.new}</div>
                    <div style={{fontSize:'0.9rem', opacity:0.8}}>Chưa xử lý</div>
                </div>
                <FaEnvelope size={30} opacity={0.3} />
            </div>
            <div style={statCardStyle('#e8f5e9', '#00b894')}>
                <div>
                    <div style={{fontSize:'2rem', fontWeight:'bold'}}>{stats.processed}</div>
                    <div style={{fontSize:'0.9rem', opacity:0.8}}>Đã phản hồi</div>
                </div>
                <FaCheckCircle size={30} opacity={0.3} />
            </div>
        </div>
      </div>

      {/* TOOLBAR (SEARCH & FILTER) */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '15px 15px 0 0', borderBottom: '1px solid #f1f2f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        
        {/* Tabs Filter */}
        <div style={{ display: 'flex', background: '#f1f2f6', padding: '5px', borderRadius: '10px' }}>
            {['all', 'new', 'processed'].map(status => (
                <button 
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    style={{ 
                        padding: '8px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
                        background: filterStatus === status ? '#fff' : 'transparent',
                        color: filterStatus === status ? '#e64a19' : '#636e72',
                        boxShadow: filterStatus === status ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
                        transition: '0.3s'
                    }}
                >
                    {status === 'all' ? 'Tất cả' : status === 'new' ? 'Mới' : 'Đã xử lý'}
                </button>
            ))}
        </div>

        {/* Search Box */}
        <div style={{ position: 'relative', width: '300px' }}>
            <FaSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#b2bec3' }} />
            <input 
                type="text" 
                placeholder="Tìm tên, email, sđt..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 15px 10px 40px', borderRadius: '30px', border: '1px solid #dfe6e9', outline: 'none', transition: '0.3s' }}
                onFocus={(e) => e.target.style.borderColor = '#e64a19'}
                onBlur={(e) => e.target.style.borderColor = '#dfe6e9'}
            />
        </div>
      </div>

      {/* DANH SÁCH */}
      <div style={{ background: '#fff', borderRadius: '0 0 15px 15px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {loading ? <div style={{textAlign:'center', padding:'50px', color:'#999'}}>Đang tải dữ liệu...</div> : (
            <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
                <tr style={{ background: '#f8f9fa', textAlign: 'left', borderBottom: '2px solid #eee', color: '#636e72' }}>
                <th style={{ padding: '20px' }}>Khách hàng</th>
                <th style={{ padding: '20px' }}>Nội dung phản hồi</th>
                <th style={{ padding: '20px', textAlign:'center' }}>Ngày gửi</th>
                <th style={{ padding: '20px', textAlign: 'center' }}>Trạng thái</th>
                <th style={{ padding: '20px', textAlign: 'center' }}>Hành động</th>
                </tr>
            </thead>
            <tbody>
                {filteredContacts.length > 0 ? filteredContacts.map(item => (
                <tr key={item.maLienHe} style={{ borderBottom: '1px solid #f1f2f6', transition: '0.2s' }} className="hover-row">
                    
                    {/* Cột Khách Hàng */}
                    <td style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: `hsl(${item.hoTen.length * 40}, 70%, 80%)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                                {getAvatar(item.hoTen)}
                            </div>
                            <div>
                                <div style={{ fontWeight: '700', color: '#2d3436' }}>{item.hoTen}</div>
                                <div style={{ fontSize: '0.85rem', color: '#636e72' }}>{item.email}</div>
                                <div style={{ fontSize: '0.8rem', color: '#b2bec3' }}>{item.soDienThoai}</div>
                            </div>
                        </div>
                    </td>
                    
                    {/* Cột Nội Dung */}
                    <td style={{ padding: '20px', maxWidth: '350px' }}>
                        <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '10px', color: '#4b5563', fontSize: '0.9rem', lineHeight: '1.5', border: '1px solid #eee' }}>
                            "{item.noiDung}"
                        </div>
                    </td>
                    
                    {/* Cột Ngày Gửi */}
                    <td style={{ padding: '20px', textAlign: 'center', color: '#636e72', fontSize: '0.9rem' }}>
                        <div style={{fontWeight:'600'}}>{new Date(item.ngayGui).toLocaleDateString('vi-VN')}</div>
                        <small style={{color:'#999'}}>{new Date(item.ngayGui).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</small>
                    </td>
                    
                    {/* Cột Trạng Thái */}
                    <td style={{ padding: '20px', textAlign: 'center' }}>
                        {item.daPhanHoi ? (
                            <span style={{ background: '#e8f5e9', color: '#27ae60', padding: '6px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #c8e6c9', display:'inline-flex', alignItems:'center', gap:'5px' }}>
                                <FaCheckCircle size={12}/> Đã xử lý
                            </span>
                        ) : (
                            <span style={{ background: '#ffebee', color: '#e74c3c', padding: '6px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #ffcdd2', display:'inline-flex', alignItems:'center', gap:'5px' }}>
                                <span style={{width:'8px', height:'8px', background:'#e74c3c', borderRadius:'50%', display:'inline-block'}}></span> Mới
                            </span>
                        )}
                    </td>
                    
                    {/* Cột Hành Động */}
                    <td style={{ padding: '20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            {/* Nút Trả lời mail */}
                            <a href={getMailLink(item)} target="_blank" rel="noopener noreferrer" 
                                style={actionBtnStyle('#EA4335', '#fff')} title="Trả lời qua Gmail">
                                <FaReply size={14} />
                            </a>

                            {/* Nút Đổi trạng thái */}
                            <button onClick={() => toggleStatus(item.maLienHe, item.daPhanHoi)} 
                                style={actionBtnStyle(item.daPhanHoi ? '#f1f2f6' : '#00b894', item.daPhanHoi ? '#636e72' : '#fff')} 
                                title={item.daPhanHoi ? "Đánh dấu chưa xem" : "Đánh dấu đã xong"}>
                                {item.daPhanHoi ? <FaTimesCircle size={14} /> : <FaCheckCircle size={14} />}
                            </button>

                            {/* Nút Xóa */}
                            <button onClick={() => handleDelete(item.maLienHe)} 
                                style={actionBtnStyle('#ffebee', '#d63031')} title="Xóa tin nhắn">
                                <FaTrash size={14} />
                            </button>
                        </div>
                    </td>
                </tr>
                )) : (
                <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '60px', color: '#b2bec3' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '10px', opacity: 0.5 }}><FaInbox /></div>
                        Không tìm thấy tin nhắn nào phù hợp.
                    </td>
                </tr>
                )}
            </tbody>
            </table>
            </div>
        )}
      </div>

      {/* CSS Hover Effect & CHỐNG XẸP SVG */}
      <style>{`
        .hover-row:hover { background-color: #fcfcfc; }
        input:focus { border-color: #e64a19 !important; box-shadow: 0 0 0 3px rgba(230, 74, 25, 0.1); }
        
        /* 🔥 BÍ KÍP CHỐNG MẤT ICON 🔥 */
        button svg, a svg {
            flex-shrink: 0 !important;
            display: inline-block !important;
        }
      `}</style>
    </div>
  );
}

// STYLES HELPER (Đã tối ưu lại padding để bung icon)
const statCardStyle = (bg, color) => ({
    background: bg, color: color, padding: '20px', borderRadius: '15px', 
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    boxShadow: '0 4px 10px rgba(0,0,0,0.03)', border: `1px solid ${bg}`
});

const actionBtnStyle = (bg, color) => ({
    width: '35px', height: '35px', borderRadius: '10px', 
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', 
    background: bg, color: color, border: 'none', cursor: 'pointer', 
    transition: '0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    padding: 0, textDecoration: 'none' /* Ép padding = 0 và bỏ gạch chân cho thẻ a */
});

export default AdminContact;