import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { 
    FaEdit, FaTrash, FaCloudUploadAlt, FaUtensils, FaListUl, 
    FaSave, FaTimes, FaImages, FaCheckCircle, FaBan, FaTag, FaSpinner 
} from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

// ✅ SỬ DỤNG AXIOS ADMIN
import axiosAdmin from '../../api/axiosAdmin';

const AdminBanner = () => {
    // --- STATE ---
    const [banners, setBanners] = useState([]);
    const [foods, setFoods] = useState([]); 
    const [categories, setCategories] = useState([]); 
    
    // State Form
    const [formData, setFormData] = useState({ 
        tieuDe: '', moTa: '', phanTramGiam: 0, kichHoat: true, maMon: '', maDanhMuc: '' 
    });
    const [applyType, setApplyType] = useState('food');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // 🟢 CẤU HÌNH ĐƯỜNG DẪN ẢNH
    // 🟢 HOST ẢNH
    const API_HOST = import.meta.env.VITE_API_ROOT || 'http://localhost:5010';

    const getImageUrl = (imagePath) => {

    if (!imagePath) {
        return 'https://placehold.co/600x400?text=No+Image';
    }

    if (imagePath.startsWith('http')) {
        return imagePath;
    }

    const path = imagePath.startsWith('/')
        ? imagePath
        : `/${imagePath}`;

    return `${API_HOST}${path}`;
};

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [bannerRes, foodRes, catRes] = await Promise.all([
                axiosAdmin.get('/QuangCao'),
                axiosAdmin.get('/MonAn'),
                axiosAdmin.get('/DanhMuc')
            ]);

            setBanners(Array.isArray(bannerRes) ? bannerRes : []);
            
            const fData = Array.isArray(foodRes) ? foodRes : (foodRes.data || []);
            setFoods(fData.map(m => ({
                maMon: m.maMon || m.MaMon || m.id,
                tenMon: m.tenMon || m.TenMon,
                gia: m.gia || m.Gia
            })));

            const cData = Array.isArray(catRes) ? catRes : (catRes.data || []);
            setCategories(cData.map(c => ({
                maDanhMuc: c.maDanhMuc || c.MaDanhMuc || c.id,
                tenDanhMuc: c.tenDanhMuc || c.TenDanhMuc
            })));

        } catch (err) {
            console.error(err);
            toast.error("Không thể tải dữ liệu.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- XỬ LÝ FORM ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.tieuDe.trim()) return toast.warning("⚠️ Nhập tiêu đề!");
        if (applyType === 'food' && !formData.maMon) return toast.warning("⚠️ Chọn món ăn!");
        if (applyType === 'category' && !formData.maDanhMuc) return toast.warning("⚠️ Chọn danh mục!");

        const data = new FormData();
        data.append('tieuDe', formData.tieuDe);
        data.append('moTa', formData.moTa || '');
        data.append('phanTramGiam', formData.phanTramGiam);
        data.append('kichHoat', formData.kichHoat);
        
        if (applyType === 'food') {
            data.append('maMon', formData.maMon);
            data.append('maDanhMuc', ''); 
        } else {
            data.append('maDanhMuc', formData.maDanhMuc);
            data.append('maMon', '');
        }

        if (selectedFile) data.append('imageFile', selectedFile);

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            if (isEditing) {
                data.append('maQuangCao', editId); 
                await axiosAdmin.put(`/QuangCao/${editId}`, data, config);
                toast.success("✅ Cập nhật xong!");
            } else {
                await axiosAdmin.post('/QuangCao', data, config);
                toast.success("🎉 Thêm mới xong!");
            }
            resetForm();
            fetchData(); 
        } catch (error) { 
            toast.error("❌ Lỗi: " + (error.response?.data?.message || error.message)); 
        }
    };

    const resetForm = () => {
        setFormData({ tieuDe: '', moTa: '', phanTramGiam: 0, kichHoat: true, maMon: '', maDanhMuc: '' });
        setSelectedFile(null);
        setPreviewUrl('');
        setIsEditing(false);
        setEditId(null);
        setApplyType('food');
    };

    const handleDelete = async (id) => {
        if(window.confirm("Xóa banner này?")) {
            try {
                await axiosAdmin.delete(`/QuangCao/${id}`);
                setBanners(prev => prev.filter(b => (b.maQuangCao || b.MaQuangCao) !== id));
                toast.success("Đã xóa!");
            } catch (err) { toast.error("Lỗi xóa!"); }
        }
    };

    const handleEdit = (item) => {
        setIsEditing(true);
        setEditId(item.maQuangCao || item.MaQuangCao);
        const type = (item.maDanhMuc || item.MaDanhMuc) ? 'category' : 'food';
        setApplyType(type);
        setFormData({
            tieuDe: item.tieuDe || item.TieuDe,
            moTa: item.moTa || item.MoTa || '',
            phanTramGiam: item.phanTramGiam || item.PhanTramGiam || 0,
            kichHoat: item.kichHoat !== undefined ? item.kichHoat : item.KichHoat,
            maMon: item.maMon || item.MaMon || '',
            maDanhMuc: item.maDanhMuc || item.MaDanhMuc || ''
        });
        setPreviewUrl(getImageUrl(item.hinhAnh || item.HinhAnh));
        setSelectedFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div style={{ padding: '20px', background: '#f8f9fa', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            <ToastContainer autoClose={2000} theme="colored" />
            
            {/* Header */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', marginBottom: '20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <h2 style={{ margin: 0, color: '#333', display:'flex', alignItems:'center', gap:'10px' }}>
                    <FaImages color="#e64a19" /> Quản Lý Khuyến Mãi
                </h2>
                <span style={{ background:'#eee', padding:'5px 15px', borderRadius:'20px', fontSize:'0.9rem', fontWeight:'bold' }}>
                    {banners.length} Banner
                </span>
            </div>

            <div className="admin-grid">
                
                {/* --- CỘT TRÁI: FORM --- */}
                <div style={{ background: '#fff', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', height: 'fit-content' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '20px', borderBottom:'1px solid #eee', paddingBottom:'10px' }}>
                        {isEditing ? '✏️ Cập Nhật' : '✨ Thêm Mới'}
                    </h3>
                    
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        
                        {/* Upload */}
                        <div onClick={() => document.getElementById('bannerInput').click()} style={{ border: '2px dashed #ddd', borderRadius: '10px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#fafafa', overflow: 'hidden' }}>
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ textAlign: 'center', color: '#999' }}>
                                    <FaCloudUploadAlt size={30} />
                                    <div style={{ fontSize: '0.9rem' }}>Tải ảnh lên</div>
                                </div>
                            )}
                            <input id="bannerInput" type="file" onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                        </div>

                        <div>
                            <label className="form-label">Tiêu đề</label>
                            <input type="text" value={formData.tieuDe} onChange={e => setFormData({...formData, tieuDe: e.target.value})} className="form-input" placeholder="Nhập tiêu đề..." />
                        </div>

                        <div>
                            <label className="form-label">Mô tả</label>
                            <textarea value={formData.moTa} onChange={e => setFormData({...formData, moTa: e.target.value})} className="form-input" rows="2" placeholder="Mô tả ngắn..." />
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', gap: '10px', background: '#f5f5f5', padding: '5px', borderRadius: '8px' }}>
                            <button type="button" onClick={() => setApplyType('food')} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '5px', background: applyType === 'food' ? '#fff' : 'transparent', fontWeight: 'bold', cursor: 'pointer', boxShadow: applyType === 'food' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none' }}>Món Ăn</button>
                            <button type="button" onClick={() => setApplyType('category')} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '5px', background: applyType === 'category' ? '#fff' : 'transparent', fontWeight: 'bold', cursor: 'pointer', boxShadow: applyType === 'category' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none' }}>Danh Mục</button>
                        </div>

                        {applyType === 'food' ? (
                            <select value={formData.maMon} onChange={e => setFormData({...formData, maMon: e.target.value, maDanhMuc: ''})} className="form-input">
                                <option value="">-- Chọn Món --</option>
                                {foods.map(f => <option key={f.maMon} value={f.maMon}>{f.tenMon}</option>)}
                            </select>
                        ) : (
                            <select value={formData.maDanhMuc} onChange={e => setFormData({...formData, maDanhMuc: e.target.value, maMon: ''})} className="form-input">
                                <option value="">-- Chọn Danh Mục --</option>
                                {categories.map(c => <option key={c.maDanhMuc} value={c.maDanhMuc}>{c.tenDanhMuc}</option>)}
                            </select>
                        )}

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <div style={{ flex: 1 }}>
                                <label className="form-label">% Giảm</label>
                                <input type="number" value={formData.phanTramGiam} onChange={e => setFormData({...formData, phanTramGiam: e.target.value})} className="form-input" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="form-label">Trạng thái</label>
                                <button type="button" onClick={() => setFormData({...formData, kichHoat: !formData.kichHoat})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', background: formData.kichHoat ? '#e8f5e9' : '#ffebee', color: formData.kichHoat ? 'green' : 'red', fontWeight: 'bold', cursor: 'pointer' }}>
                                    {formData.kichHoat ? 'Đang chạy' : 'Tạm ẩn'}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button type="submit" style={{ flex: 1, padding: '12px', background: '#e64a19', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
                                {isEditing ? 'LƯU' : 'THÊM MỚI'}
                            </button>
                            {isEditing && (
                                <button type="button" onClick={resetForm} style={{ padding: '12px', background: '#ccc', color: '#333', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Hủy</button>
                            )}
                        </div>
                    </form>
                </div>

                {/* --- CỘT PHẢI: DANH SÁCH --- */}
                <div>
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>Đang tải...</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                            {banners.map(banner => {
                                const isFood = !!(banner.maMon || banner.MaMon);
                                const targetName = isFood 
                                    ? foods.find(f => f.maMon == (banner.maMon || banner.MaMon))?.tenMon 
                                    : categories.find(c => c.maDanhMuc == (banner.maDanhMuc || banner.MaDanhMuc))?.tenDanhMuc;

                                return (
                                    <div key={banner.maQuangCao || banner.MaQuangCao} className="banner-card">
                                        <div style={{ height: '180px', position: 'relative', background: '#eee' }}>
                                            {getImageUrl(banner.hinhAnh || banner.HinhAnh) ? (
                                                <img src={getImageUrl(banner.hinhAnh || banner.HinhAnh)} alt="B" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.src='https://placehold.co/600x400?text=No+Image'}/>
                                            ) : (
                                                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#aaa' }}>No Image</div>
                                            )}
                                            
                                            {(banner.phanTramGiam || banner.PhanTramGiam) > 0 && (
                                                <span style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'red', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                    -{banner.phanTramGiam || banner.PhanTramGiam}%
                                                </span>
                                            )}
                                            <span style={{ position: 'absolute', top: '10px', right: '10px', background: (banner.kichHoat || banner.KichHoat) ? 'green' : 'gray', color: '#fff', padding: '3px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                                {(banner.kichHoat || banner.KichHoat) ? 'ON' : 'OFF'}
                                            </span>
                                        </div>

                                        <div style={{ padding: '15px' }}>
                                            <h4 style={{ margin: '0 0 5px', fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {banner.tieuDe || banner.TieuDe}
                                            </h4>
                                            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '10px' }}>
                                                Áp dụng: <b>{targetName || "Tất cả"}</b>
                                            </div>
                                            
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                                <button onClick={() => handleEdit(banner)} style={{ background: '#e3f2fd', color: '#1976d2', border: 'none', padding: '8px', borderRadius: '5px', cursor: 'pointer' }}><FaEdit /></button>
                                                <button onClick={() => handleDelete(banner.maQuangCao || banner.MaQuangCao)} style={{ background: '#ffebee', color: '#d32f2f', border: 'none', padding: '8px', borderRadius: '5px', cursor: 'pointer' }}><FaTrash /></button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* CSS ĐƠN GIẢN, CHẮC CHẮN */}
            <style>{`
                .admin-grid {
                    display: grid;
                    grid-template-columns: 350px 1fr; /* Form cố định 350px, còn lại cho list */
                    gap: 30px;
                    align-items: start;
                }
                .form-label { display: block; margin-bottom: 5px; font-weight: 600; font-size: 0.9rem; color: #555; }
                .form-input { width: 100%; padding: 10px; border: 1px solid #ddd; borderRadius: 5px; outline: none; }
                .banner-card { background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 1px solid #eee; }
                
                /* Responsive cho màn hình nhỏ */
                @media (max-width: 900px) {
                    .admin-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default AdminBanner;