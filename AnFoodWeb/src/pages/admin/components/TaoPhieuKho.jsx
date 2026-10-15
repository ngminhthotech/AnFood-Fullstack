import React, { useState, useEffect } from 'react';

const TaoPhieuKho = () => {
    const [loaiPhieu, setLoaiPhieu] = useState('NHAP');
    const [ghiChu, setGhiChu] = useState('');
    const [monAns, setMonAns] = useState([]); // Danh sách món từ API
    const [danhSachMon, setDanhSachMon] = useState([
        { maMon: '', soLuong: 1, donGia: 0, ngayHetHan: '' }
    ]);

    // Lấy danh sách món ăn khi vừa mở trang để đưa vào ô chọn
    useEffect(() => {
        fetch('http://localhost:5010/api/MonAn')
            .then(res => res.json())
            .then(data => {
                // Xử lý dữ liệu trả về (tùy cấu trúc API của bạn)
                const items = Array.isArray(data) ? data : (data.result || []);
                setMonAns(items);
            })
            .catch(err => console.error("Lỗi lấy danh sách món:", err));
    }, []);

    // Xử lý thêm/xóa dòng món ăn
    const handleAddRow = () => {
        setDanhSachMon([...danhSachMon, { maMon: '', soLuong: 1, donGia: 0, ngayHetHan: '' }]);
    };

    const handleRemoveRow = (index) => {
        const list = [...danhSachMon];
        list.splice(index, 1);
        setDanhSachMon(list);
    };

    const handleChangeRow = (index, field, value) => {
        const list = [...danhSachMon];
        list[index][field] = value;
        setDanhSachMon(list);
    };

    // Tự động tính tổng tiền
    const tongTien = danhSachMon.reduce((sum, item) => 
        sum + (Number(item.soLuong) * Number(item.donGia)), 0
    );

    // Gửi dữ liệu lên API Backend
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra xem đã chọn món ăn chưa
        if (danhSachMon.some(m => !m.maMon)) {
            alert("Vui lòng chọn món ăn cho tất cả các dòng!");
            return;
        }

        const payload = {
            loaiPhieu: loaiPhieu,
            maNguoiDung: 1, // Fix cứng ID Admin. Sau này bạn thay bằng ID từ LocalStorage/Token
            ghiChu: ghiChu,
            tongTien: tongTien,
            danhSachMon: danhSachMon.map(m => ({
                maMon: Number(m.maMon),
                soLuong: Number(m.soLuong),
                donGia: Number(m.donGia),
                ngayHetHan: m.ngayHetHan ? new Date(m.ngayHetHan).toISOString() : null 
            }))
        };

        try {
            const response = await fetch('http://localhost:5010/api/PhieuKho/TaoPhieu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            
            if (response.ok && result.success) {
                alert(`Thành công: ${result.message}`);
                // Reset form sau khi tạo xong
                setDanhSachMon([{ maMon: '', soLuong: 1, donGia: 0, ngayHetHan: '' }]);
                setGhiChu('');
            } else {
                alert("Lỗi từ server: " + result.message);
            }
        } catch (error) {
            alert("Lỗi kết nối đến Backend!");
        }
    };

    return (
        <div style={{ padding: '10px', width: '100%' }}>
            <h2 style={{ marginBottom: '20px', color: '#1a73e8' }}>🛒 THIẾT LẬP PHIẾU KHO</h2>
            
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                    <div style={{ flex: '1' }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Loại Phiếu: </label>
                        <select 
                            value={loaiPhieu} 
                            onChange={e => setLoaiPhieu(e.target.value)} 
                            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                        >
                            <option value="NHAP">NHẬP KHO (Cộng thêm hàng)</option>
                            <option value="XUAT">XUẤT KHO (Trừ bớt hàng)</option>
                        </select>
                    </div>
                    <div style={{ flex: '3' }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Ghi chú: </label>
                        <input 
                            type="text" 
                            value={ghiChu} 
                            onChange={e => setGhiChu(e.target.value)} 
                            placeholder="Ví dụ: Nhập hàng từ NCC ABC..." 
                            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} 
                        />
                    </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', background: 'white' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f4f4f4', borderBottom: '2px solid #ddd' }}>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Sản Phẩm</th>
                            <th style={{ padding: '12px', textAlign: 'center', width: '120px' }}>Số Lượng</th>
                            <th style={{ padding: '12px', textAlign: 'center', width: '150px' }}>Đơn Giá (VNĐ)</th>
                            {loaiPhieu === 'NHAP' && <th style={{ padding: '12px', textAlign: 'center', width: '180px' }}>Hạn Sử Dụng</th>}
                            <th style={{ padding: '12px', textAlign: 'center', width: '80px' }}>Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {danhSachMon.map((item, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px' }}>
                                    <select 
                                        value={item.maMon} 
                                        onChange={e => handleChangeRow(index, 'maMon', e.target.value)}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    >
                                        <option value="">-- Chọn món ăn --</option>
                                        {monAns.map(mon => (
                                            <option key={mon.maMon} value={mon.maMon}>{mon.tenMon}</option>
                                        ))}
                                    </select>
                                </td>
                                <td style={{ padding: '10px' }}>
                                    <input 
                                        type="number" min="1" 
                                        value={item.soLuong} 
                                        onChange={e => handleChangeRow(index, 'soLuong', e.target.value)} 
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', textAlign: 'center' }}
                                    />
                                </td>
                                <td style={{ padding: '10px' }}>
                                    <input 
                                        type="number" min="0" 
                                        value={item.donGia} 
                                        onChange={e => handleChangeRow(index, 'donGia', e.target.value)} 
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', textAlign: 'right' }}
                                    />
                                </td>
                                {loaiPhieu === 'NHAP' && (
                                    <td style={{ padding: '10px' }}>
                                        <input 
                                            type="datetime-local" 
                                            value={item.ngayHetHan} 
                                            onChange={e => handleChangeRow(index, 'ngayHetHan', e.target.value)} 
                                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                        />
                                    </td>
                                )}
                                <td style={{ padding: '10px', textAlign: 'center' }}>
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveRow(index)} 
                                        style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        ❌ Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button 
                        type="button" 
                        onClick={handleAddRow} 
                        style={{ padding: '10px 15px', backgroundColor: '#e0e0e0', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        ➕ Thêm mặt hàng
                    </button>
                    
                    <h3 style={{ margin: 0, color: '#d32f2f' }}>Tổng Tiền: {tongTien.toLocaleString('vi-VN')} VNĐ</h3>
                </div>

                <div style={{ marginTop: '30px', textAlign: 'right' }}>
                    <button 
                        type="submit" 
                        style={{ padding: '12px 30px', backgroundColor: '#4CAF50', color: 'white', fontSize: '16px', fontWeight: 'bold', border: 'none', borderRadius: '5px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    >
                        💾 XÁC NHẬN LƯU PHIẾU
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TaoPhieuKho;