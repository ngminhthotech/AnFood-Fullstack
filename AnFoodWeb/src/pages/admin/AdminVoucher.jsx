import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { 
    FaTicketAlt, FaRandom, FaTrash, FaEdit, 
    FaSave, FaTimes, FaBan, FaClock, FaCheckCircle 
} from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

// ✅ SỬ DỤNG AXIOS ADMIN ĐỒNG BỘ VỚI CÁC TRANG KHÁC
import axiosAdmin from '../../api/axiosAdmin';

const AdminVoucher = () => {
    // --- STATE ---
    const [vouchers, setVouchers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    // Form Default
    const defaultForm = {
        maCode: '',
        loaiGiamGia: 'TienMat',
        giaTriGiam: '',
        giamToiDa: 0,
        donToiThieu: 0,
        soLuong: 100,
        ngayBatDau: new Date().toISOString().slice(0, 16),
        ngayKetThuc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        trangThai: true
    };
    const [formData, setFormData] = useState(defaultForm);

    // --- FETCH DATA ---
    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await axiosAdmin.get('/Voucher/GetAll');
            setVouchers(Array.isArray(res) ? res : (res.data || []));
        } catch (err) {
            toast.error("Không thể tải danh sách Voucher.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- XỬ LÝ FORM ---
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Thuật toán sinh mã Auto
    const handleGenerateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let randomString = '';
        for (let i = 0; i < 6; i++) {
            randomString += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData({ ...formData, maCode: `FB-${randomString}` });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.maCode.trim()) return toast.warning("⚠️ Nhập mã giảm giá!");
        if (!formData.giaTriGiam) return toast.warning("⚠️ Nhập giá trị giảm!");

        const payload = {
            maCode: formData.maCode.toUpperCase(),
            loaiGiamGia: formData.loaiGiamGia,
            giaTriGiam: Number(formData.giaTriGiam),
            giamToiDa: Number(formData.giamToiDa),
            donToiThieu: Number(formData.donToiThieu),
            soLuong: Number(formData.soLuong),
            ngayBatDau: formData.ngayBatDau,
            ngayKetThuc: formData.ngayKetThuc,
            trangThai: formData.trangThai
        };

        try {
            if (isEditing) {
                // Tùy chọn: Sếp cần viết thêm API PUT ở Backend nếu muốn sửa
                await axiosAdmin.put(`/Voucher/Update/${editId}`, payload);
                toast.success("✅ Cập nhật mã xong!");
            } else {
                await axiosAdmin.post('/Voucher/Create', payload);
                toast.success("🎉 Tạo mã mới thành công!");
            }
            resetForm();
            fetchData(); 
        } catch (error) { 
            toast.error("❌ Lỗi: " + (error.response?.data?.message || "Kiểm tra lại dữ liệu!")); 
        }
    };

    const resetForm = () => {
        setFormData(defaultForm);
        setIsEditing(false);
        setEditId(null);
    };

    const handleEdit = (item) => {
        setIsEditing(true);
        setEditId(item.maVoucher);
        setFormData({
            maCode: item.maCode,
            loaiGiamGia: item.loaiGiamGia,
            giaTriGiam: item.giaTriGiam,
            giamToiDa: item.giamToiDa || 0,
            donToiThieu: item.donToiThieu || 0,
            soLuong: item.soLuong,
            ngayBatDau: item.ngayBatDau ? new Date(item.ngayBatDau).toISOString().slice(0, 16) : defaultForm.ngayBatDau,
            ngayKetThuc: item.ngayKetThuc ? new Date(item.ngayKetThuc).toISOString().slice(0, 16) : defaultForm.ngayKetThuc,
            trangThai: item.trangThai !== undefined ? item.trangThai : true
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if(window.confirm("Sếp có chắc muốn xóa mã này vĩnh viễn không?")) {
            try {
                // Tùy chọn: Sếp cần viết thêm API DELETE ở Backend nếu muốn xóa
                await axiosAdmin.delete(`/Voucher/Delete/${id}`);
                setVouchers(prev => prev.filter(v => v.maVoucher !== id));
                toast.success("Đã xóa mã!");
            } catch (err) { toast.error("Chức năng xóa chưa được mở ở Backend!"); }
        }
    };

    return (
        <div style={{ padding: '20px', background: '#f8f9fa', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            <ToastContainer autoClose={2000} theme="colored" />
            
            {/* Header đồng bộ Banner */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', marginBottom: '20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <h2 style={{ margin: 0, color: '#333', display:'flex', alignItems:'center', gap:'10px' }}>
                    <FaTicketAlt color="#e64a19" /> Quản Lý Mã Khuyến Mãi
                </h2>
                <span style={{ background:'#eee', padding:'5px 15px', borderRadius:'20px', fontSize:'0.9rem', fontWeight:'bold' }}>
                    {vouchers.length} Mã Voucher
                </span>
            </div>

            <div className="admin-grid">
                
                {/* --- CỘT TRÁI: FORM --- */}
                <div style={{ background: '#fff', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', height: 'fit-content', position: 'sticky', top: '20px' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '20px', borderBottom:'1px solid #eee', paddingBottom:'10px' }}>
                        {isEditing ? '✏️ Cập Nhật Mã' : '✨ Tạo Mã Mới'}
                    </h3>
                    
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        
                        <div>
                            <label className="form-label">Mã Voucher (Code)</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input type="text" name="maCode" value={formData.maCode} onChange={handleChange} className="form-input" style={{ flex: 1, textTransform: 'uppercase', fontWeight: 'bold', color: '#e64a19' }} placeholder="VD: FASTBITE50" />
                                <button type="button" onClick={handleGenerateCode} style={{ background: '#2d3436', color: '#fff', border: 'none', padding: '0 15px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }} title="Tạo mã ngẫu nhiên">
                                    <FaRandom /> Auto
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                <label className="form-label">Loại giảm</label>
                                <select name="loaiGiamGia" value={formData.loaiGiamGia} onChange={handleChange} className="form-input">
                                    <option value="TienMat">Tiền mặt (đ)</option>
                                    <option value="PhanTram">Phần trăm (%)</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Giá trị</label>
                                <input type="number" name="giaTriGiam" value={formData.giaTriGiam} onChange={handleChange} className="form-input" placeholder={formData.loaiGiamGia === 'TienMat' ? 'VD: 30000' : 'VD: 15'} />
                            </div>
                        </div>

                        {formData.loaiGiamGia === 'PhanTram' && (
                            <div>
                                <label className="form-label">Mức giảm tối đa (đ)</label>
                                <input type="number" name="giamToiDa" value={formData.giamToiDa} onChange={handleChange} className="form-input" placeholder="VD: 50000" />
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                <label className="form-label">Đơn tối thiểu (đ)</label>
                                <input type="number" name="donToiThieu" value={formData.donToiThieu} onChange={handleChange} className="form-input" placeholder="VD: 150000" />
                            </div>
                            <div>
                                <label className="form-label">Số lượng</label>
                                <input type="number" name="soLuong" value={formData.soLuong} onChange={handleChange} className="form-input" />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                <label className="form-label">Bắt đầu</label>
                                <input type="datetime-local" name="ngayBatDau" value={formData.ngayBatDau} onChange={handleChange} className="form-input" style={{ fontSize: '0.85rem' }} />
                            </div>
                            <div>
                                <label className="form-label">Kết thúc</label>
                                <input type="datetime-local" name="ngayKetThuc" value={formData.ngayKetThuc} onChange={handleChange} className="form-input" style={{ fontSize: '0.85rem' }} />
                            </div>
                        </div>

                        <div>
                            <label className="form-label">Trạng thái</label>
                            <button type="button" onClick={() => setFormData({...formData, trangThai: !formData.trangThai})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', background: formData.trangThai ? '#e8f5e9' : '#ffebee', color: formData.trangThai ? 'green' : 'red', fontWeight: 'bold', cursor: 'pointer' }}>
                                {formData.trangThai ? 'Đang kích hoạt' : 'Tạm khóa mã'}
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button type="submit" style={{ flex: 1, padding: '12px', background: '#e64a19', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
                                {isEditing ? 'CẬP NHẬT MÃ' : 'THÊM MÃ MỚI'}
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
                    ) : vouchers.length === 0 ? (
                        /* 👉 ĐÂY LÀ GIAO DIỆN KHI CHƯA CÓ MÃ NÀO (EMPTY STATE) */
                        <div style={{ background: '#fff', padding: '60px 20px', borderRadius: '24px', textAlign: 'center', border: '2px dashed #dfe6e9', boxShadow: '0 5px 20px rgba(0,0,0,0.02)' }}>
                            <div style={{ fontSize: '3.5rem', opacity: 0.3, marginBottom: '15px' }}>🎟️</div>
                            <h4 style={{ color: '#2d3436', margin: '0 0 10px', fontSize: '1.2rem' }}>Chưa có mã khuyến mãi nào!</h4>
                            <p style={{ color: '#b2bec3', fontSize: '0.95rem', margin: 0 }}>Hãy điền thông tin bên trái để tạo mã đầu tiên nhé sếp.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                            {vouchers.map(v => {
                                const isExpired = new Date(v.ngayKetThuc) < new Date();
                                
                                return (
                                    <div key={v.maVoucher} className="voucher-card" style={{ opacity: v.trangThai && !isExpired ? 1 : 0.6 }}>
                                        {/* Phần trên Card (Màu) */}
                                        <div style={{ background: v.trangThai && !isExpired ? '#e64a19' : '#636e72', color: '#fff', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ fontWeight: '900', fontSize: '1.2rem', letterSpacing: '1px' }}>{v.maCode}</div>
                                            {isExpired ? <FaBan title="Hết hạn" /> : (v.trangThai ? <FaCheckCircle title="Đang chạy" /> : <FaClock title="Đã khóa" />)}
                                        </div>

                                        {/* Phần thân Card */}
                                        <div style={{ padding: '15px', position: 'relative' }}>
                                            <h4 style={{ margin: '0 0 10px', color: '#2d3436', fontSize: '1.1rem' }}>
                                                {v.loaiGiamGia === 'TienMat' ? `Giảm ${v.giaTriGiam.toLocaleString()}đ` : `Giảm ${v.giaTriGiam}%`}
                                            </h4>
                                            
                                            <div style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.6' }}>
                                                <div>• Đơn tối thiểu: <b>{v.donToiThieu.toLocaleString()}đ</b></div>
                                                {v.loaiGiamGia === 'PhanTram' && v.giamToiDa > 0 && (
                                                    <div>• Giảm tối đa: <b>{v.giamToiDa.toLocaleString()}đ</b></div>
                                                )}
                                                <div>• Lượt dùng còn lại: <b>{v.soLuong}</b></div>
                                                <div style={{ color: isExpired ? 'red' : '#666' }}>• HSD: <b>{new Date(v.ngayKetThuc).toLocaleDateString('vi-VN')}</b></div>
                                            </div>
                                            
                                            {/* Nút thao tác ẩn hiện */}
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px', borderTop: '1px dashed #eee', paddingTop: '10px' }}>
                                                <button onClick={() => handleEdit(v)} style={{ background: '#e3f2fd', color: '#1976d2', border: 'none', padding: '8px', borderRadius: '5px', cursor: 'pointer' }}><FaEdit /></button>
                                                <button onClick={() => handleDelete(v.maVoucher)} style={{ background: '#ffebee', color: '#d32f2f', border: 'none', padding: '8px', borderRadius: '5px', cursor: 'pointer' }}><FaTrash /></button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* CSS ĐỒNG BỘ Y CHANG BANNER */}
            <style>{`
                .admin-grid {
                    display: grid;
                    grid-template-columns: 350px 1fr; 
                    gap: 30px;
                    align-items: start;
                }
                .form-label { display: block; margin-bottom: 5px; font-weight: 600; font-size: 0.9rem; color: #555; }
                .form-input { width: 100%; padding: 10px; border: 1px solid #ddd; borderRadius: 5px; outline: none; }
                .form-input:focus { border-color: #e64a19; }
                
                .voucher-card { 
                    background: #fff; 
                    border-radius: 10px; 
                    overflow: hidden; 
                    box-shadow: 0 4px 10px rgba(0,0,0,0.05); 
                    border: 1px solid #eee;
                    transition: transform 0.2s ease;
                }
                .voucher-card:hover { transform: translateY(-5px); box-shadow: 0 8px 15px rgba(0,0,0,0.1); }
                
                /* Responsive cho màn hình nhỏ */
                @media (max-width: 900px) {
                    .admin-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default AdminVoucher;