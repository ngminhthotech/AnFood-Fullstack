import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { 
  FaTrash, FaPlus, FaUtensils, FaEdit, FaSave, 
  FaSync, FaCloudUploadAlt, FaSpinner, FaImage, FaUndo, FaBan, FaBox
} from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

// ✅ SỬ DỤNG AXIOS ADMIN
import axiosAdmin from '../../api/axiosAdmin';

function AdminFood() {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false); 

  // --- STATE QUẢN LÝ FORM ---
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  const [formData, setFormData] = useState({
    tenMon: '',
    giaBan: '', 
    moTa: '',
    maDanhMuc: '',
    hinhAnh: null
  });

  // 🟢 CẤU HÌNH API
  const API_HOST = import.meta.env.VITE_API_ROOT || 'http://localhost:5010';

  const getImageUrl = (imagePath) => {

  if (!imagePath) {
    return 'https://placehold.co/50?text=Food';
  }

  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  const path = imagePath.startsWith('/')
    ? imagePath
    : `/${imagePath}`;

  return `${API_HOST}${path}`;
};

  useEffect(() => {
    fetchCategories();
    fetchFoods();
  }, []);

  // --- 1. TẢI DANH MỤC ---
  const fetchCategories = async () => {
    try {
      const res = await axiosAdmin.get('/DanhMuc');
      const rawData = Array.isArray(res) ? res : (res.data || []);

      const cleanData = rawData.map(item => ({
        maDanhMuc: item.maDanhMuc || item.MaDanhMuc || item.id,
        tenDanhMuc: item.tenDanhMuc || item.TenDanhMuc
      }));

      setCategories(cleanData);

      if (cleanData.length > 0 && !isEditing && !formData.maDanhMuc) {
        setFormData(prev => ({ ...prev, maDanhMuc: cleanData[0].maDanhMuc }));
      }
    } catch (err) { console.error("Lỗi danh mục:", err); }
  };

  // --- 2. TẢI MÓN ĂN ---
  const fetchFoods = async () => {
    try {
      const res = await axiosAdmin.get('/MonAn');
      const rawData = Array.isArray(res) ? res : (res.data || []);
      
      const cleanData = rawData.map(item => {
        const catId = item.maDanhMuc || item.MaDanhMuc || 
                      (item.danhMuc ? item.danhMuc.maDanhMuc : 0) || 
                      (item.DanhMuc ? item.DanhMuc.MaDanhMuc : 0) ||
                      item.categoryId || 0;

        const catName = item.tenDanhMuc || item.TenDanhMuc || 
                        (item.danhMuc ? item.danhMuc.tenDanhMuc : "") ||
                        (item.DanhMuc ? item.DanhMuc.TenDanhMuc : "");

        return {
          ...item,
          maMon: item.maMon || item.MaMon || item.id,
          tenMon: item.tenMon || item.TenMon,
          giaBan: item.GiaBan || item.giaBan || 0, 
          soLuong: item.SoLuong || item.soLuong || item.so_luong || 0, 
          maDanhMuc: catId,
          tenDanhMuc: catName,
          hinhAnh: item.hinhAnh || item.HinhAnh,
          moTa: item.moTa || item.MoTa || '',
          isDeleted: item.isDeleted || item.IsDeleted || false 
        };
      });

      setFoods(cleanData);
    } catch (err) { console.error("Lỗi tải món:", err); }
  };

  // --- 3. XỬ LÝ FORM ---
  const handleChange = (e) => {
    if (e.target.name === 'hinhAnh') {
      const file = e.target.files[0];
      if (file) {
        setFormData({ ...formData, hinhAnh: file });
        setPreviewImage(URL.createObjectURL(file));
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleEditClick = (item) => {
    setIsEditing(true);
    setEditId(item.maMon);
    
    setFormData({
      tenMon: item.tenMon,
      giaBan: item.giaBan, 
      moTa: item.moTa || '',
      maDanhMuc: item.maDanhMuc, 
      hinhAnh: null 
    });

    setPreviewImage(getImageUrl(item.hinhAnh));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setPreviewImage(null);
    setFormData({
      tenMon: '',
      giaBan: '',
      moTa: '',
      maDanhMuc: categories.length > 0 ? categories[0].maDanhMuc : '',
      hinhAnh: null
    });
    if(document.getElementById("fileInput")) document.getElementById("fileInput").value = "";
  };

  // --- 4. GỬI DỮ LIỆU ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tenMon.trim()) return toast.warning("Tên món không được để trống!");
    if (Number(formData.giaBan) <= 0) return toast.warning("Giá bán phải lớn hơn 0!");

    setIsLoading(true);
    
    const data = new FormData();
    data.append('tenMon', formData.tenMon);
    data.append('giaBan', formData.giaBan); 
    data.append('moTa', formData.moTa);
    data.append('maDanhMuc', formData.maDanhMuc);
    if (formData.hinhAnh) {
        data.append('hinhAnh', formData.hinhAnh);
    }

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (isEditing) {
        await axiosAdmin.put(`/MonAn/${editId}`, data, config);
        toast.success("📝 Cập nhật món thành công!");
        handleCancelEdit();
      } else {
        await axiosAdmin.post('/MonAn', data, config);
        toast.success("🎉 Thêm món mới thành công!");
        handleCancelEdit();
      }
      fetchFoods(); 
    } catch (err) {
      toast.error("❌ " + (err.response?.data?.message || "Lỗi xử lý API!"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("⚠️ Bạn có chắc muốn NGỪNG KINH DOANH món này?")) {
      try {
        await axiosAdmin.delete(`/MonAn/${id}`);
        toast.success("🗑️ Đã ngừng kinh doanh món ăn!");
        fetchFoods();
      } catch (err) { toast.error("❌ Lỗi xóa!"); }
    }
  };

  const handleRestore = async (id) => {
    if (window.confirm("♻️ Bạn muốn khôi phục món ăn này để bán lại?")) {
        try {
            await axiosAdmin.put(`/MonAn/Restore/${id}`);
            toast.success("✅ Đã khôi phục món ăn!");
            fetchFoods();
        } catch (err) { toast.error("❌ Lỗi khôi phục!"); }
    }
  };

  const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '0.95rem', width: '100%', outline: 'none' };

  return (
    <div style={{ padding: '0 0 50px 0', fontFamily: '"Poppins", sans-serif' }}>
      <ToastContainer position="top-right" autoClose={2500} theme="colored"/>
      
      <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '30px', maxWidth: '1600px', margin: '0 auto' }}>
        
        {/* 🔥 BÍ KÍP Ở ĐÂY: Thẻ div ngoài cùng làm "Đường ray", thẻ bên trong trượt (sticky) 🔥 */}
        <div style={{ height: '100%' }}>
          <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: '0', zIndex: 20 }}>
            <h3 style={{ marginBottom: '20px', color: isEditing ? '#007bff' : '#28a745', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '2px solid #f1f1f1', paddingBottom: '15px' }}>
              {isEditing ? <><FaEdit /> Cập Nhật Món</> : <><FaPlus /> Thêm Món Mới</>}
            </h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontWeight: '600', marginBottom: '5px', display:'block', color: '#495057' }}>Tên món *</label>
                <input type="text" name="tenMon" value={formData.tenMon} onChange={handleChange} required style={inputStyle} placeholder="Ví dụ: Burger Bò Mỹ..." />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ fontWeight: '600', marginBottom: '5px', display:'block', color: '#495057' }}>Giá bán (VNĐ) *</label>
                  <input type="number" name="giaBan" value={formData.giaBan} onChange={handleChange} required style={inputStyle} placeholder="0" min="0" />
                </div>
                <div>
                  <label style={{ fontWeight: '600', marginBottom: '5px', display:'block', color: '#495057' }}>Danh mục</label>
                  <select name="maDanhMuc" value={formData.maDanhMuc} onChange={handleChange} style={inputStyle}>
                    {categories.map(cat => (
                      <option key={cat.maDanhMuc} value={cat.maDanhMuc}>{cat.tenDanhMuc}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontWeight: '600', marginBottom: '5px', display:'block', color: '#495057' }}>Mô tả</label>
                <textarea name="moTa" value={formData.moTa} onChange={handleChange} rows="3" style={{...inputStyle, resize: 'vertical'}} placeholder="Mô tả thành phần..." />
              </div>

              <div>
                <label style={{ fontWeight: '600', marginBottom: '5px', display:'block', color: '#495057' }}>Hình ảnh</label>
                <div onClick={() => document.getElementById('fileInput').click()} style={{ border: '2px dashed #ced4da', borderRadius: '8px', textAlign: 'center', background: '#f8f9fa', cursor: 'pointer', padding: '20px' }}>
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '8px' }} />
                  ) : (
                    <div style={{ color: '#6c757d' }}>
                      <FaCloudUploadAlt size={30} />
                      <p>Tải ảnh lên</p>
                    </div>
                  )}
                  <input id="fileInput" type="file" name="hinhAnh" onChange={handleChange} accept="image/*" style={{ display: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button disabled={isLoading} type="submit" style={{ flex: 1, padding: '12px', background: isEditing ? '#007bff' : '#28a745', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {isLoading ? <FaSpinner className="fa-spin" /> : (isEditing ? 'LƯU THAY ĐỔI' : 'THÊM MÓN MỚI')}
                </button>
                {isEditing && (
                  <button type="button" onClick={handleCancelEdit} style={{ padding: '12px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>HỦY</button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* === DANH SÁCH BÊN PHẢI (Mở chốt, thả bung lụa cho trang tự kéo dài) === */}
        <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '20px', color: '#343a40', borderBottom: '2px solid #f1f1f1', paddingBottom: '15px' }}>
            <FaUtensils /> Danh Sách Món ({foods.length})
          </h3>
          
          <div className="table-container" style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #f1f1f1' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', position: 'relative' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr style={{ background: '#f8f9fa', color: '#495057', textAlign: 'left', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                  <th style={{ padding: '15px', background: '#f8f9fa' }}>Hình</th>
                  <th style={{ padding: '15px', background: '#f8f9fa' }}>Tên món</th>
                  <th style={{ padding: '15px', background: '#f8f9fa' }}>Giá bán</th>
                  <th style={{ padding: '15px', background: '#f8f9fa' }}>Tồn kho</th>
                  <th style={{ padding: '15px', background: '#f8f9fa' }}>Trạng thái</th>
                  <th style={{ padding: '15px', textAlign: 'center', background: '#f8f9fa' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {foods.map(item => (
                  <tr key={item.maMon} style={{ borderBottom: '1px solid #f1f1f1', opacity: item.isDeleted ? 0.6 : 1 }}>
                    <td style={{ padding: '10px 15px' }}>
                      <img src={getImageUrl(item.hinhAnh)} alt="" style={{ width: '50px', height: '50px', borderRadius: '6px', objectFit: 'cover' }} onError={(e) => e.target.src = 'https://placehold.co/50?text=Food'} />
                    </td>
                    <td style={{ padding: '15px', fontWeight: '600' }}>{item.tenMon}</td>
                    <td style={{ padding: '15px', color: '#dc3545', fontWeight: 'bold' }}>{item.giaBan.toLocaleString()} đ</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ fontWeight:'700', color: item.soLuong > 10 ? '#2b8a3e' : '#f08c00' }}>
                        <FaBox size={12} style={{marginRight:'5px'}}/>{item.soLuong}
                      </span>
                    </td>
                    <td style={{ padding: '15px' }}>
                      {item.isDeleted ? <span className="badge-danger">Ngừng bán</span> : <span className="badge-success">Đang bán</span>}
                    </td>
                    <td style={{ padding: '10px 15px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        {!item.isDeleted && (
                          <button onClick={() => handleEditClick(item)} style={{ border:'none', background:'#e7f5ff', color:'#007bff', padding:'8px', borderRadius:'6px', cursor:'pointer' }} title="Sửa"><FaEdit /></button>
                        )}
                        {item.isDeleted ? (
                          <button onClick={() => handleRestore(item.maMon)} style={{ border:'none', background:'#d3f9d8', color:'#2b8a3e', padding:'8px', borderRadius:'6px', cursor:'pointer' }} title="Khôi phục"><FaUndo /></button>
                        ) : (
                          <button onClick={() => handleDelete(item.maMon)} style={{ border:'none', background:'#ffe3e3', color:'#e03131', padding:'8px', borderRadius:'6px', cursor:'pointer' }} title="Xóa"><FaTrash /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        .badge-success { background: #d3f9d8; color: #2b8a3e; padding: 4px 8px; borderRadius: 4px; font-size: 0.8rem; }
        .badge-danger { background: #ffe3e3; color: #e03131; padding: 4px 8px; borderRadius: 4px; font-size: 0.8rem; }
        .fa-spin { animation: spin 1s infinite linear; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .table-container::-webkit-scrollbar { width: 8px; height: 8px; }
        .table-container::-webkit-scrollbar-track { background: #f8f9fa; border-radius: 8px; }
        .table-container::-webkit-scrollbar-thumb { background: #ced4da; border-radius: 8px; }
        .table-container::-webkit-scrollbar-thumb:hover { background: #adb5bd; }
      `}</style>
    </div>
  );
}

export default AdminFood;