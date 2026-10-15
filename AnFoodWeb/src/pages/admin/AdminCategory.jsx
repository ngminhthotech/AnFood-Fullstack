import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { 
  FaTrash, FaPlus, FaEdit, FaSave, FaSync, FaListAlt, FaLayerGroup, FaSpinner, FaUndo, FaBan
} from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

// ✅ SỬ DỤNG AXIOS ADMIN (Đã cấu hình BaseURL + Token)
import axiosAdmin from '../../api/axiosAdmin';

function AdminCategory() {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ tenDanhMuc: '', moTa: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false); // State loading cho nút bấm

  // --- 1. LOAD DANH SÁCH (Chuẩn hóa dữ liệu) ---
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axiosAdmin.get('/DanhMuc');
      
      console.log("🔥 CATEGORY DATA:", response);

      // Xử lý linh hoạt cấu trúc trả về
      let rawList = [];
      if (Array.isArray(response)) {
          rawList = response;
      } else if (response && Array.isArray(response.data)) {
          rawList = response.data;
      } else if (response && Array.isArray(response.result)) {
          rawList = response.result;
      }

      // Chuẩn hóa Key & Sắp xếp (Chưa xóa lên đầu, Đã xóa xuống cuối)
      const normalizedList = rawList.map(item => ({
          maDanhMuc: item.maDanhMuc || item.MaDanhMuc || item.id,
          tenDanhMuc: item.tenDanhMuc || item.TenDanhMuc || "Chưa đặt tên",
          moTa: item.moTa || item.MoTa || "",
          isDeleted: item.isDeleted || item.IsDeleted || false // Nhận trạng thái xóa mềm
      })).sort((a, b) => a.isDeleted - b.isDeleted);

      setCategories(normalizedList);
    } catch (err) {
      console.error("Lỗi tải danh mục:", err);
      toast.error("❌ Không thể tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  // Gọi hàm khi mở trang
  useEffect(() => {
    fetchCategories();
  }, []);

  // --- 2. XỬ LÝ FORM ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = (cat) => {
    setIsEditing(true);
    setEditId(cat.maDanhMuc);
    setFormData({ 
        tenDanhMuc: cat.tenDanhMuc, 
        moTa: cat.moTa || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({ tenDanhMuc: '', moTa: '' });
  };

  // --- 3. THÊM / SỬA ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tenDanhMuc.trim()) return toast.warning("Tên danh mục không được để trống!");

    try {
      setSubmitting(true);
      const payload = isEditing 
        ? { maDanhMuc: editId, ...formData } 
        : formData;

      if (isEditing) {
        await axiosAdmin.put(`/DanhMuc/${editId}`, payload);
        toast.success("📝 Cập nhật danh mục thành công!");
      } else {
        await axiosAdmin.post('/DanhMuc', payload);
        toast.success("🎉 Thêm danh mục mới thành công!");
      }
      
      handleCancel();
      fetchCategories(); 
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Lỗi hệ thống, vui lòng thử lại!";
      toast.error("❌ " + msg);
    } finally {
        setSubmitting(false);
    }
  };

  // --- 4. XÓA MỀM (SOFT DELETE) ---
  const handleDelete = async (id) => {
    if (window.confirm("⚠️ Bạn có chắc muốn NGỪNG HOẠT ĐỘNG danh mục này?")) {
      try {
        await axiosAdmin.delete(`/DanhMuc/${id}`);
        toast.success("🗑️ Đã ngừng hoạt động danh mục!");
        fetchCategories();
      } catch (err) {
        const msg = err.response?.data?.message || "Không thể xóa";
        toast.error("⚠️ " + msg);
      }
    }
  };

  // --- 5. KHÔI PHỤC (RESTORE) ---
  const handleRestore = async (id) => {
    if (window.confirm("♻️ Bạn muốn khôi phục danh mục này hoạt động trở lại?")) {
        try {
            await axiosAdmin.put(`/DanhMuc/Restore/${id}`);
            toast.success("✅ Đã khôi phục danh mục!");
            fetchCategories();
        } catch (err) {
            toast.error("❌ Lỗi khôi phục: " + (err.response?.data?.message || err.message));
        }
    }
  };

  return (
    <div style={{ padding: '30px', background: '#f8f9fa', minHeight: '100vh', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#2d3436', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.8rem', margin: 0 }}>
            {/* THÊM SIZE */}
            <FaLayerGroup size={28} color="#e64a19" /> Quản Lý Danh Mục
        </h2>
      </div>

      <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start' }}>
        
        {/* === CỘT TRÁI: FORM === */}
        <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', position: 'sticky', top: '20px' }}>
          <h3 style={{ marginBottom: '20px', color: isEditing ? '#0984e3' : '#2d3436', display: 'flex', alignItems: 'center', gap: '10px', fontSize:'1.2rem', borderBottom:'2px solid #f1f2f6', paddingBottom:'15px' }}>
            {/* THÊM SIZE */}
            {isEditing ? <><FaEdit size={20} /> Cập Nhật Danh Mục</> : <><FaPlus size={20} /> Thêm Danh Mục Mới</>}
          </h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontWeight: '600', fontSize: '0.9rem', color: '#636e72', marginBottom: '8px', display: 'block' }}>Tên danh mục <span style={{color:'red'}}>*</span></label>
              <input 
                type="text" name="tenDanhMuc" 
                value={formData.tenDanhMuc} onChange={handleChange} 
                required placeholder="Ví dụ: Burger, Pizza..." 
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ fontWeight: '600', fontSize: '0.9rem', color: '#636e72', marginBottom: '8px', display: 'block' }}>Mô tả ngắn</label>
              <textarea 
                name="moTa" 
                value={formData.moTa} onChange={handleChange} 
                placeholder="Nhập mô tả..." 
                rows="3"
                style={{ ...inputStyle, resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button 
                type="submit" 
                disabled={submitting}
                style={{ flex: 1, padding: '12px', background: isEditing ? '#0984e3' : '#e64a19', color: '#fff', border: 'none', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', transition:'0.2s', opacity: submitting ? 0.7 : 1 }}
              >
                {/* THÊM SIZE */}
                {submitting ? <FaSpinner className="fa-spin" size={16}/> : <FaSave size={16} />} 
                {isEditing ? "LƯU THAY ĐỔI" : "THÊM MỚI"}
              </button>
              
              {isEditing && (
                <button type="button" onClick={handleCancel} style={{ padding: '12px 20px', background: '#f1f2f6', color: '#636e72', border: 'none', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', transition:'0.2s', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {/* THÊM SIZE */}
                  <FaSync size={16} /> Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        {/* === CỘT PHẢI: DANH SÁCH === */}
        <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '20px', color: '#2d3436', display: 'flex', alignItems: 'center', gap: '10px', fontSize:'1.2rem', borderBottom:'2px solid #f1f2f6', paddingBottom:'15px' }}>
            {/* THÊM SIZE */}
            <FaListAlt size={22} color="#00b894" /> Danh Sách Hiện Có <span style={{fontSize:'0.9rem', color:'#fff', background:'#00b894', padding:'2px 8px', borderRadius:'10px', marginLeft:'5px'}}>{categories.length}</span>
          </h3>
          
          {loading ? <div style={{textAlign:'center', padding:'40px', color:'#999'}}><FaSpinner className="fa-spin" size={24}/> Đang tải dữ liệu...</div> : (
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                    <thead>
                    <tr style={{ background:'#f8f9fa', borderBottom: '2px solid #eee', color: '#636e72', textAlign: 'left' }}>
                        <th style={{ padding: '15px', borderRadius: '10px 0 0 10px' }}>Tên danh mục</th>
                        <th style={{ padding: '15px' }}>Mô tả</th>
                        <th style={{ padding: '15px' }}>Trạng thái</th>
                        <th style={{ padding: '15px', textAlign: 'right', borderRadius: '0 10px 10px 0' }}>Thao tác</th>
                    </tr>
                    </thead>
                    <tbody>
                    {categories.length > 0 ? categories.map(cat => (
                        <tr key={cat.maDanhMuc} 
                            style={{ 
                                borderBottom: '1px solid #f1f2f6', 
                                transition: '0.2s',
                                opacity: cat.isDeleted ? 0.6 : 1, // Làm mờ nếu đã xóa
                                background: cat.isDeleted ? '#f9f9f9' : '#fff'
                            }} 
                            className="hover-row">
                        
                        <td style={{ padding: '15px' }}>
                            <div style={{ fontWeight: '700', color: cat.isDeleted ? '#999' : '#2d3436', fontSize: '1rem', textDecoration: cat.isDeleted ? 'line-through' : 'none' }}>
                                {cat.tenDanhMuc}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#b2bec3', marginTop: '2px' }}>ID: {cat.maDanhMuc}</div>
                        </td>
                        
                        <td style={{ padding: '15px', color: '#636e72', fontSize: '0.9rem' }}>
                            {cat.moTa || <span style={{ color: '#ccc', fontStyle: 'italic' }}>Không có mô tả</span>}
                        </td>

                        {/* Cột Trạng Thái */}
                        <td style={{ padding: '15px' }}>
                            {cat.isDeleted ? (
                                <span style={{ background: '#ffe3e3', color: '#e03131', padding: '5px 10px', borderRadius: '15px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                    <FaBan size={10}/> Đã xóa
                                </span>
                            ) : (
                                <span style={{ background: '#d3f9d8', color: '#2b8a3e', padding: '5px 10px', borderRadius: '15px', fontSize: '0.8rem' }}>
                                    Hoạt động
                                </span>
                            )}
                        </td>

                        <td style={{ padding: '15px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            
                            {!cat.isDeleted && (
                                <button onClick={() => handleEditClick(cat)} title="Sửa" style={actionBtnStyle('#e3f2fd', '#0984e3')}>
                                    {/* THÊM SIZE */}
                                    <FaEdit size={16} />
                                </button>
                            )}

                            {cat.isDeleted ? (
                                <button onClick={() => handleRestore(cat.maDanhMuc)} title="Khôi phục" style={actionBtnStyle('#d3f9d8', '#2b8a3e')}>
                                    {/* THÊM SIZE */}
                                    <FaUndo size={16} />
                                </button>
                            ) : (
                                <button onClick={() => handleDelete(cat.maDanhMuc)} title="Ngừng hoạt động" style={actionBtnStyle('#ffebee', '#d63031')}>
                                    {/* THÊM SIZE */}
                                    <FaTrash size={16} />
                                </button>
                            )}
                            
                            </div>
                        </td>
                        </tr>
                    )) : (
                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#999', fontStyle: 'italic' }}>Chưa có danh mục nào.</td></tr>
                    )}
                    </tbody>
                </table>
            </div>
          )}
        </div>

      </div>
      
      {/* CSS Helper - ĐÃ BỔ SUNG FIX LỖI ẨN SVG */}
      <style>{`
        .hover-row:hover { background-color: #fdfdfd !important; }
        input:focus, textarea:focus { border-color: #e64a19 !important; box-shadow: 0 0 0 3px rgba(230, 74, 25, 0.1); }
        .fa-spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        
        /* Bổ sung CSS cho toàn bộ svg trong nút action để ép nó hiển thị */
        button svg {
            flex-shrink: 0 !important;
            display: inline-block !important;
        }

        @media (max-width: 768px) {
            .grid-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// STYLES - ĐÃ THÊM PADDING: 0 ĐỂ CHỐNG XẸP
const inputStyle = { width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #dfe6e9', outline: 'none', transition: '0.3s', fontSize: '0.95rem' };
const actionBtnStyle = (bg, color) => ({ border: 'none', background: bg, color: color, width: '35px', height: '35px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s', padding: '0' });

export default AdminCategory;