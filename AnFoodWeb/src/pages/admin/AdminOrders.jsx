import React, { useEffect, useState, useMemo } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { FaClipboardList, FaSearch, FaPrint, FaCheck, FaTruck, FaTimes, FaEye, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaExclamationTriangle, FaBan } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

import axiosAdmin from '../../api/axiosAdmin';
import { getImageUrl } from '../../utils/imageHelper';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null); 

  // 👉 NÂNG CẤP: State quản lý Modal Xác nhận (Thay cho window.confirm phèn)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, orderId: null, newStatus: '', title: '', message: '', type: 'info' });

  // --- 1. TẢI DANH SÁCH ĐƠN HÀNG ---
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axiosAdmin.get('/DonHang');
      let data = [];
      if (Array.isArray(response)) data = response;
      else if (response?.data) data = response.data;
      else if (response?.result) data = response.result;

      const sorted = data.sort((a, b) => b.maDonHang - a.maDonHang);
      setOrders(sorted);
    } catch (err) {
      console.error("Lỗi tải đơn:", err);
      if (err.response?.status !== 403) toast.error("❌ Không thể tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. XỬ LÝ IN HÓA ĐƠN ---
  const handlePrintOrder = (order) => {
    if (!order) return;
    const customerName = order.nguoiNhan || order.tenNguoiNhan || order.nguoiDung?.hoTen || "Khách vãng lai";
    const customerPhone = order.soDienThoai || order.sdt || order.nguoiDung?.soDienThoai || "---";
    const customerAddress = order.diaChiGiaoHang || order.diaChi || "Tại quán";
    const orderNote = order.ghiChu || "";
    const dateStr = new Date(order.ngayDat).toLocaleString('vi-VN');
    
    const itemsHtml = (order.chiTietDonHangs || order.chiTiet || []).map(item => {
        const rawImg = item.monAn?.hinhAnh || item.hinhAnh;
        const imgSrc = getImageUrl(rawImg);
        const imgTag = imgSrc ? `<img src="${imgSrc}" class="product-img" onerror="this.style.display='none'" />` : '';
        return `
            <tr>
                <td style="text-align: left;">
                    <div style="font-weight:bold;">${item.monAn?.tenMon || item.tenMon}</div>
                </td>
                <td style="text-align: center;">${imgTag}</td>
                <td style="text-align: center;">${item.soLuong}</td>
                <td style="text-align: right;">${Number(item.donGia).toLocaleString()}</td>
                <td style="text-align: right; font-weight:bold;">${Number(item.soLuong * item.donGia).toLocaleString()}</td>
            </tr>
        `;
    }).join('');

    const printWindow = window.open('', '', 'height=800,width=600');
    printWindow.document.write(`
        <html>
            <head>
                <title>Hóa Đơn #${order.maDonHang}</title>
                <style>
                    body { font-family: 'Segoe UI', sans-serif; padding: 20px; color: #333; line-height: 1.4; }
                    .container { max-width: 100%; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #444; padding-bottom: 15px; }
                    .brand-name { font-size: 26px; font-weight: 900; text-transform: uppercase; margin: 0; color: #e64a19; }
                    .invoice-title { font-size: 20px; font-weight: bold; margin-top: 15px; text-transform: uppercase; }
                    .info-section { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; }
                    .info-col { width: 48%; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
                    th { border-bottom: 2px solid #000; padding: 8px 5px; text-align: left; background: #f8f9fa; }
                    td { border-bottom: 1px solid #eee; padding: 8px 5px; vertical-align: middle; }
                    .product-img { width: 40px; height: 40px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd; }
                    .total-section { text-align: right; font-size: 16px; font-weight: bold; border-top: 2px solid #000; padding-top: 15px; }
                    .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666; font-style: italic; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="brand-name">FASTBITE FOOD</div>
                        <div>123 Đường 3/2, Ninh Kiều, Cần Thơ</div>
                        <div>Hotline: 0393 399 770</div>
                        <div class="invoice-title">HÓA ĐƠN THANH TOÁN</div>
                        <div>Mã đơn: <strong>#${order.maDonHang}</strong></div>
                        <div>Ngày: ${dateStr}</div>
                    </div>
                    <div class="info-section">
                        <div class="info-col">
                            <strong>KHÁCH HÀNG:</strong><br/>${customerName}<br/>${customerPhone}
                        </div>
                        <div class="info-col" style="text-align:right;">
                            <strong>GIAO TỚI:</strong><br/>${customerAddress}<br/>
                            ${orderNote ? `<span style="font-style:italic; color:red;">Note: ${orderNote}</span>` : ""}
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 40%">Món ăn</th>
                                <th style="text-align: center;">Ảnh</th>
                                <th style="text-align: center;">SL</th>
                                <th style="text-align: right;">Đơn giá</th>
                                <th style="text-align: right;">T.Tiền</th>
                            </tr>
                        </thead>
                        <tbody>${itemsHtml}</tbody>
                    </table>
                    <div class="total-section">
                        TỔNG CỘNG: ${formatCurrency(order.tongTien)}
                    </div>
                    <div class="footer">
                        <p>Cảm ơn quý khách đã lựa chọn FastBite!<br/>Chúc quý khách ngon miệng.</p>
                    </div>
                </div>
            </body>
        </html>
    `);
    printWindow.document.close();
    setTimeout(() => { if(printWindow) { printWindow.focus(); printWindow.print(); } }, 500);
  };

  // --- 3. HÀM CHUẨN HÓA TRẠNG THÁI ---
  const normalizeStatus = (status) => {
      if (!status) return '';
      let s = status.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
      if (['choduyet', 'cho_duyet', 'cho_xu_ly'].includes(s)) return 'cho_xu_ly'; 
      if (['danggiao', 'dang_giao'].includes(s)) return 'dang_giao';
      if (['hoanthanh', 'hoan_thanh', 'success'].includes(s)) return 'hoan_thanh';
      if (['dahuy', 'huy', 'da_huy'].includes(s)) return 'huy';
      return s;
  };

  // --- 4. GỌI MODAL XÁC NHẬN ---
  const triggerStatusChange = (maDonHang, newStatus) => {
      if (newStatus === 'huy') {
          setConfirmModal({
              isOpen: true, orderId: maDonHang, newStatus, type: 'danger',
              title: 'Cảnh báo Hủy đơn!',
              message: `Bạn đang thao tác HỦY đơn hàng #${maDonHang}. Hành động này sẽ hoàn lại số lượng món ăn vào kho. Bạn có chắc chắn không?`
          });
      } else if (newStatus === 'dang_giao') {
          setConfirmModal({
              isOpen: true, orderId: maDonHang, newStatus, type: 'success',
              title: 'Duyệt đơn hàng',
              message: `Xác nhận chuyển đơn hàng #${maDonHang} cho Shipper đi giao?`
          });
      } else if (newStatus === 'hoan_thanh') {
          setConfirmModal({
              isOpen: true, orderId: maDonHang, newStatus, type: 'success',
              title: 'Hoàn thành đơn hàng',
              message: `Xác nhận đơn hàng #${maDonHang} đã được giao thành công tới tay khách hàng?`
          });
      }
  };

  // --- 5. EXECUTE CẬP NHẬT TRẠNG THÁI ---
  const executeStatusChange = async () => {
    const { orderId, newStatus } = confirmModal;
    setConfirmModal({ ...confirmModal, isOpen: false }); // Đóng modal

    try {
      await axiosAdmin.put(
        `/DonHang/CapNhatTrangThai/${orderId}`, 
        JSON.stringify(newStatus),
        { headers: { 'Content-Type': 'application/json' } }
      );
      toast.success(`✅ Đã cập nhật thành công đơn #${orderId}`);
      setOrders(prev => prev.map(o => o.maDonHang === orderId ? { ...o, trangThai: newStatus } : o));
      if (selectedOrder?.maDonHang === orderId) {
          setSelectedOrder(prev => ({ ...prev, trangThai: newStatus }));
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ " + (err.response?.data?.message || "Lỗi cập nhật trạng thái"));
    }
  };

  // --- 6. LỌC DỮ LIỆU ---
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const normalizedStatus = normalizeStatus(order.trangThai);
      if (activeTab !== 'all' && activeTab !== normalizedStatus) return false;

      const search = searchTerm.toLowerCase();
      const orderId = String(order.maDonHang);
      const customerName = (order.nguoiNhan || order.tenNguoiNhan || order.nguoiDung?.hoTen || "").toLowerCase();
      const phone = (order.soDienThoai || order.sdt || order.nguoiDung?.soDienThoai || "");

      return orderId.includes(search) || customerName.includes(search) || phone.includes(search);
    });
  }, [orders, activeTab, searchTerm]);

  // --- 7. UI HELPERS ---
  const getStatusBadge = (status) => {
    const s = normalizeStatus(status);
    const config = {
      'cho_xu_ly':  { color: '#d35400', bg: '#ffeaa7', label: '⏳ Chờ Duyệt', border: '#fdcb6e' },
      'dang_giao':  { color: '#0984e3', bg: '#dfe6e9', label: '🚚 Đang Giao', border: '#b2bec3' },
      'hoan_thanh': { color: '#27ae60', bg: '#e8f5e9', label: '✅ Hoàn Thành', border: '#badc58' },
      'huy':        { color: '#c0392b', bg: '#ff7675', label: '❌ Đã Hủy', border: '#d63031' }
    };
    const style = config[s] || { color: '#2d3436', bg: '#f1f2f6', label: status, border: '#dfe6e9' };
    
    return (
        <span style={{ 
            backgroundColor: style.bg, color: style.color, border: `1px solid ${style.border}`,
            padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', display:'inline-block' 
        }}>
            {style.label}
        </span>
    );
  };

  return (
    <div style={{ padding: '30px', background: '#f4f6f8', minHeight: '100vh', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />
      
      {/* HEADER CHUYÊN NGHIỆP */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#2d3436', display: 'flex', alignItems: 'center', gap: '12px', margin: '0 0 5px' }}>
                <FaClipboardList color="#e64a19" /> Quản Lý Đơn Hàng
            </h2>
            <p style={{ margin: 0, color: '#636e72', fontSize: '0.95rem' }}>Theo dõi và cập nhật trạng thái đơn hàng của hệ thống</p>
        </div>
        
        <div style={{ position: 'relative', width: '350px' }}>
            <FaSearch size={16} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#b2bec3' }} />
            <input 
                type="text" placeholder="Tìm kiếm theo mã đơn, sđt, tên..." 
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '12px 15px 12px 40px', borderRadius: '8px', border: '1px solid #dfe6e9', outline: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', fontSize: '0.95rem' }}
            />
        </div>
      </div>

      {/* TABS THIẾT KẾ MỚI */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '20px' }}>
        {[
            { id: 'all', label: 'Tất cả đơn hàng' },
            { id: 'cho_xu_ly', label: 'Chờ duyệt' },
            { id: 'dang_giao', label: 'Đang giao hàng' },
            { id: 'hoan_thanh', label: 'Đã hoàn thành' },
            { id: 'huy', label: 'Đơn đã hủy' }
        ].map(tab => (
            <button 
                key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ 
                    padding: '10px 24px', borderRadius: '8px', border: '1px solid', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem',
                    background: activeTab === tab.id ? '#e64a19' : '#fff',
                    color: activeTab === tab.id ? '#fff' : '#636e72',
                    borderColor: activeTab === tab.id ? '#e64a19' : '#dfe6e9',
                    boxShadow: activeTab === tab.id ? '0 4px 10px rgba(230, 74, 25, 0.2)' : 'none',
                    transition: 'all 0.2s', whiteSpace: 'nowrap'
                }}
            >
                {tab.label}
            </button>
        ))}
      </div>

      {/* BẢNG DỮ LIỆU ĐƠN HÀNG */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 5px 20px rgba(0,0,0,0.03)', overflow: 'hidden', border: '1px solid #f1f2f6' }}>
        {loading ? (
            <div style={{padding:'80px', textAlign:'center', color:'#b2bec3'}}>
                <div className="spinner"></div>
                <div style={{ marginTop: '15px', fontWeight: '600' }}>Đang đồng bộ dữ liệu...</div>
            </div>
        ) : (
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                <thead>
                    <tr style={{ background: '#f8f9fa', color: '#2d3436', textAlign: 'left', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <th style={{ padding: '18px 25px', borderBottom: '2px solid #eee' }}>Mã Đơn</th>
                        <th style={{ padding: '18px 25px', borderBottom: '2px solid #eee' }}>Khách hàng</th>
                        <th style={{ padding: '18px 25px', borderBottom: '2px solid #eee' }}>Tổng tiền</th>
                        <th style={{ padding: '18px 25px', borderBottom: '2px solid #eee', textAlign: 'center' }}>Trạng thái</th>
                        <th style={{ padding: '18px 25px', borderBottom: '2px solid #eee', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders.length > 0 ? filteredOrders.map(order => {
                        const dName = order.nguoiNhan || order.tenNguoiNhan || order.nguoiDung?.hoTen || "Khách vãng lai";
                        const dPhone = order.soDienThoai || order.sdt || order.nguoiDung?.soDienThoai || "";
                        const dAddress = order.diaChiGiaoHang || order.diaChi || "Tại quán";
                        const currentStatus = normalizeStatus(order.trangThai);
                        const cancelReason = order.lyDoHuy || order.LyDoHuy;
                        const isCanceled = ['huy', 'da_huy'].includes(currentStatus);

                        return (
                        <tr key={order.maDonHang} style={{ borderBottom: '1px solid #f1f2f6', transition: '0.2s', background: isCanceled ? '#fafafa' : '#fff' }} className="hover-row">
                            <td style={{ padding: '20px 25px' }}>
                                <div style={{ fontWeight: '800', color: '#e64a19', fontSize: '1.1rem' }}>#{order.maDonHang}</div>
                                <div style={{ fontSize: '0.85rem', color: '#95a5a6', marginTop: '4px' }}>
                                    {new Date(order.ngayDat).toLocaleString('vi-VN')}
                                </div>
                            </td>
                            <td style={{ padding: '20px 25px' }}>
                                <div style={{ fontWeight: '700', color: '#2d3436', fontSize: '1.05rem' }}>{dName}</div>
                                <div style={{ fontSize: '0.85rem', color: '#636e72', display:'flex', alignItems:'center', gap:'6px', margin: '4px 0' }}>
                                    <FaPhone size={12} color="#b2bec3"/> {dPhone}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#636e72', display:'flex', alignItems:'flex-start', gap:'6px', maxWidth: '250px' }}>
                                    <FaMapMarkerAlt size={12} color="#b2bec3" style={{ marginTop: '3px', flexShrink: 0 }} /> 
                                    <span style={{ lineHeight: '1.4' }}>{dAddress}</span>
                                </div>
                            </td>
                            <td style={{ padding: '20px 25px' }}>
                                <div style={{ fontWeight: '800', color: isCanceled ? '#b2bec3' : '#2d3436', fontSize: '1.1rem', textDecoration: isCanceled ? 'line-through' : 'none' }}>
                                    {formatCurrency(order.tongTien)}
                                </div>
                                {/* 👉 HIỂN THỊ LÝ DO HỦY NGAY NGOÀI BẢNG */}
                                {isCanceled && cancelReason && (
                                    <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#d63031', background: '#ffebee', padding: '4px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid #ffcdd2' }}>
                                        <FaBan size={10} /> {cancelReason}
                                    </div>
                                )}
                            </td>
                            <td style={{ padding: '20px 25px', textAlign: 'center' }}>
                                {getStatusBadge(order.trangThai)}
                            </td>
                            <td style={{ padding: '20px 25px', textAlign: 'center' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                    <button onClick={() => setSelectedOrder(order)} style={actionBtnStyle('#e3f2fd', '#0984e3')} title="Xem chi tiết">
                                        <FaEye size={18} style={{ display: 'block', minWidth: '18px' }} />
                                    </button>
                                    
                                    {currentStatus === 'cho_xu_ly' && (
                                        <>
                                            <button onClick={() => triggerStatusChange(order.maDonHang, 'dang_giao')} style={actionBtnStyle('#e8f5e9', '#27ae60')} title="Duyệt đơn (Giao hàng)">
                                                <FaCheck size={18} style={{ display: 'block', minWidth: '18px' }} />
                                            </button>
                                            <button onClick={() => triggerStatusChange(order.maDonHang, 'huy')} style={actionBtnStyle('#ffebee', '#d63031')} title="Hủy đơn hàng">
                                                <FaTimes size={18} style={{ display: 'block', minWidth: '18px' }} />
                                            </button>
                                        </>
                                    )}
                                    
                                    {currentStatus === 'dang_giao' && (
                                        <button onClick={() => triggerStatusChange(order.maDonHang, 'hoan_thanh')} style={actionBtnStyle('#e8f5e9', '#27ae60')} title="Xác nhận hoàn thành">
                                            <FaTruck size={18} style={{ display: 'block', minWidth: '18px' }} />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    )}) : (
                        <tr>
                            <td colSpan="5" style={{ padding: '60px', textAlign: 'center' }}>
                                <img src="https://cdni.iconscout.com/illustration/premium/thumb/empty-state-2130362-1800926.png" style={{ width: '120px', opacity: 0.5, marginBottom: '15px' }} alt="empty" />
                                <div style={{ color: '#b2bec3', fontSize: '1.1rem', fontWeight: '600' }}>Chưa có dữ liệu đơn hàng nào</div>
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
                      {confirmModal.type === 'danger' ? <FaExclamationTriangle size={30} /> : <FaCheck size={30} />}
                  </div>
                  <h3 style={{ margin: '0 0 15px', color: '#2d3436', fontSize: '1.4rem' }}>{confirmModal.title}</h3>
                  <p style={{ color: '#636e72', lineHeight: '1.5', marginBottom: '25px' }}>{confirmModal.message}</p>
                  
                  <div style={{ display: 'flex', gap: '15px' }}>
                      <button onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} style={{ flex: 1, padding: '12px', border: '1px solid #dfe6e9', background: '#fff', color: '#636e72', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' }}>
                          Quay lại
                      </button>
                      <button onClick={executeStatusChange} style={{ flex: 1, padding: '12px', border: 'none', background: confirmModal.type === 'danger' ? '#d63031' : '#27ae60', color: '#fff', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', boxShadow: `0 4px 10px ${confirmModal.type === 'danger' ? 'rgba(214,48,49,0.3)' : 'rgba(39,174,96,0.3)'}` }}>
                          Xác nhận
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL CHI TIẾT ĐƠN HÀNG GIỮ NGUYÊN (NHƯNG CSS ĐẸP HƠN) */}
      {selectedOrder && (
          <div style={modalOverlayStyle}>
              <div style={modalContentStyle} className="fade-in">
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #eee', paddingBottom:'20px', marginBottom:'25px'}}>
                      <h3 style={{margin:0, color:'#2d3436', fontSize: '1.4rem'}}>Chi Tiết Đơn Hàng <span style={{ color: '#e64a19' }}>#{selectedOrder.maDonHang}</span></h3>
                      <button onClick={() => setSelectedOrder(null)} style={{border:'none', background:'#f1f2f6', width: '35px', height: '35px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor:'pointer', color: '#636e72', transition: '0.2s'}} onMouseOver={(e)=>e.currentTarget.style.background='#dfe6e9'} onMouseOut={(e)=>e.currentTarget.style.background='#f1f2f6'}><FaTimes size={16} /></button>
                  </div>
                  
                  {(() => {
                      const mName = selectedOrder.nguoiNhan || selectedOrder.tenNguoiNhan || selectedOrder.nguoiDung?.hoTen || "Khách vãng lai";
                      const mPhone = selectedOrder.soDienThoai || selectedOrder.sdt || selectedOrder.nguoiDung?.soDienThoai || "";
                      const mAddress = selectedOrder.diaChiGiaoHang || selectedOrder.diaChi || "Tại quán";
                      const mNote = selectedOrder.ghiChu || selectedOrder.GhiChu;
                      const cancelReason = selectedOrder.lyDoHuy || selectedOrder.LyDoHuy; 

                      return (
                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'30px', marginBottom:'30px'}}>
                            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', border: '1px solid #f1f2f6' }}>
                                <h4 style={{margin:'0 0 15px', color:'#2d3436', fontSize:'1rem', display: 'flex', alignItems: 'center', gap: '8px'}}><FaPhone color="#0984e3"/> Thông tin khách hàng</h4>
                                <div style={{fontWeight:'700', fontSize: '1.1rem', marginBottom: '8px'}}>{mName}</div>
                                <div style={{ color: '#636e72', marginBottom: '8px' }}>{mPhone}</div>
                                <div style={{fontSize:'0.9rem', color:'#636e72', lineHeight: '1.5'}}>{mAddress}</div>
                            </div>
                            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', border: '1px solid #f1f2f6' }}>
                                <h4 style={{margin:'0 0 15px', color:'#2d3436', fontSize:'1rem', display: 'flex', alignItems: 'center', gap: '8px'}}><FaClipboardList color="#27ae60"/> Trạng thái đơn</h4>
                                <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom: '12px', color: '#636e72'}}><FaCalendarAlt size={14}/> {new Date(selectedOrder.ngayDat).toLocaleString('vi-VN')}</div>
                                <div style={{marginBottom: '12px'}}>{getStatusBadge(selectedOrder.trangThai)}</div>
                                
                                {/* HIỂN THỊ LÝ DO HỦY TRONG MODAL CHI TIẾT */}
                                {cancelReason && (
                                    <div style={{color:'#c0392b', fontWeight:'600', marginTop:'10px', background:'#ffebee', padding:'10px 12px', borderRadius:'8px', borderLeft:'4px solid #c0392b', fontSize: '0.9rem', display: 'flex', alignItems: 'flex-start', gap: '8px'}}>
                                        <FaBan style={{ marginTop: '2px', flexShrink: 0 }} /> <span>{cancelReason}</span>
                                    </div>
                                )}
                                {mNote && <div style={{color:'#0984e3', fontStyle:'italic', marginTop:'10px', background:'#e3f2fd', padding:'8px 12px', borderRadius:'8px', fontSize: '0.9rem'}}>Ghi chú: {mNote}</div>}
                            </div>
                        </div>
                      );
                  })()}

                  <div style={{ border:'1px solid #eee', borderRadius:'10px', overflow: 'hidden', marginBottom:'25px' }}>
                      <h4 style={{margin:0, color:'#2d3436', padding: '15px 20px', background: '#f8f9fa', borderBottom: '1px solid #eee'}}>Danh sách món ăn</h4>
                      <div style={{ padding: '15px 20px', maxHeight:'250px', overflowY:'auto' }}>
                          {(selectedOrder.chiTietDonHangs || selectedOrder.chiTiet || []).map((item, idx) => (
                              <div key={idx} style={{display:'flex', justifyContent:'space-between', marginBottom:'15px', borderBottom:'1px dashed #eee', paddingBottom:'15px'}}>
                                  <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
                                      <div style={{width:'40px', height:'40px', background:'#fffaf8', border:'1px solid #ffe0b2', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', fontWeight:'bold', color:'#e64a19'}}>
                                        {item.soLuong}x
                                      </div>
                                      <div>
                                          <div style={{fontWeight:'700', fontSize:'1rem', color: '#2d3436', marginBottom: '4px'}}>{item.monAn?.tenMon || item.tenMon || "Món không tên"}</div>
                                          <div style={{fontSize:'0.85rem', color:'#b2bec3'}}>{formatCurrency(item.donGia)} / món</div>
                                      </div>
                                  </div>
                                  <span style={{fontWeight:'800', alignSelf:'center', color: '#2d3436'}}>{formatCurrency(item.soLuong * item.donGia)}</span>
                              </div>
                          ))}
                      </div>
                      <div style={{display:'flex', justifyContent:'space-between', padding:'20px', background: '#fffaf8', borderTop:'1px solid #ffe0b2', fontSize:'1.3rem', fontWeight:'900', color:'#e64a19'}}>
                          <span>TỔNG CỘNG</span>
                          <span>{formatCurrency(selectedOrder.tongTien)}</span>
                      </div>
                  </div>

                  <div style={{textAlign:'right', display:'flex', justifyContent:'flex-end', gap:'12px'}}>
                      <button 
                        onClick={() => handlePrintOrder(selectedOrder)} 
                        style={{padding:'12px 30px', border:'1px solid #dfe6e9', background:'#fff', color:'#2d3436', borderRadius:'8px', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px', fontWeight:'700', boxShadow:'0 2px 5px rgba(0,0,0,0.02)', transition: '0.2s'}}
                        onMouseOver={(e)=>e.currentTarget.style.background='#f8f9fa'} onMouseOut={(e)=>e.currentTarget.style.background='#fff'}
                      >
                        <FaPrint size={16}/> In Hóa Đơn
                      </button>
                      <button 
                        onClick={() => setSelectedOrder(null)} 
                        style={{padding:'12px 30px', background:'#2d3436', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'700', boxShadow:'0 4px 10px rgba(0,0,0,0.1)', transition: '0.2s'}}
                        onMouseOver={(e)=>e.currentTarget.style.background='#1e272e'} onMouseOut={(e)=>e.currentTarget.style.background='#2d3436'}
                      >
                        Đóng
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* 5️⃣ STYLE TỔNG HỢP (ANIMATION & SKELETON) */}
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

// STYLES DÙNG CHUNG
const actionBtnStyle = (bg, color) => ({ 
    width: '40px', height: '40px', borderRadius: '8px', 
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', 
    background: bg, color: color, border: 'none', cursor: 'pointer', 
    transition: 'transform 0.1s, box-shadow 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    padding: '0'
});

const modalOverlayStyle = { 
    position:'fixed', top:0, left:0, right:0, bottom:0, 
    background:'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
    display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 
};

const modalContentStyle = { 
    background:'#fff', width:'750px', borderRadius:'20px', padding:'35px', 
    boxShadow:'0 25px 50px -12px rgba(0,0,0,0.3)', maxHeight:'90vh', overflowY:'auto' 
};

export default AdminOrders;