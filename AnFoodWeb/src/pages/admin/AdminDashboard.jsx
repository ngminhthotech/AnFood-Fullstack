import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { 
  FaDollarSign, FaShoppingCart, FaUserFriends, 
  FaChartLine, FaFileExport 
} from 'react-icons/fa';
import { 
  PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ComposedChart, Line
} from 'recharts';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ✅ IMPORT CHUẨN
import axiosAdmin from '../../api/axiosAdmin';
import { getImageUrl } from '../../utils/imageHelper';

// Bảng màu tươi sáng cho biểu đồ danh mục
const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560', '#2F3640'];

function AdminDashboard() {
  const [data, setData] = useState({
    doanhThu: 0, 
    donHang: 0, 
    monAn: 0, 
    tongKhach: 0, 
    aov: 0,
    statusData: [], 
    topSanPham: [], 
    donMoi: [], 
    revenueChart: [], 
    lowStock: []
  });
  
  const [loading, setLoading] = useState(true);
  const [timeSpan, setTimeSpan] = useState('week');
  
  // 🔥 KHỞI TẠO STATE CHO TỪ NGÀY - ĐẾN NGÀY
  const [startDate, setStartDate] = useState(() => {
      let d = new Date(); d.setDate(d.getDate() - 7); 
      return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // --- HÀM TẢI DỮ LIỆU ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axiosAdmin.get(`/ThongKe/Dashboard?timeSpan=${timeSpan}&startDate=${startDate}&endDate=${endDate}`);
      
      if (!res) throw new Error("Không nhận được dữ liệu");

      const rawStatus = res.statusData || [];
      const formattedPie = rawStatus.map((item, index) => ({
          name: item.name,
          value: item.value,
          color: PIE_COLORS[index % PIE_COLORS.length]
      }));

      setData({
          doanhThu: Number(res.doanhThu) || 0,
          donHang: Number(res.donHang) || 0,
          tongKhach: Number(res.tongKhach) || 0,
          aov: Number(res.aov) || 0,
          statusData: formattedPie,
          revenueChart: Array.isArray(res.revenueChart) ? res.revenueChart : [],
          topSanPham: Array.isArray(res.topSanPham) ? res.topSanPham : [],
          donMoi: Array.isArray(res.donMoi) ? res.donMoi : [],
          lowStock: Array.isArray(res.lowStock) ? res.lowStock : []
      });

    } catch (err) {
      console.error("🔥 Lỗi tải Dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeSpan !== 'custom') {
        fetchData();
    }
  }, [timeSpan]);

  // --- XUẤT EXCEL ---
  const handleExport = async () => {
    try {
        const wb = XLSX.utils.book_new();
        const createSheet = (header, body, name) => {
            const ws = XLSX.utils.aoa_to_sheet([header, ...body]);
            XLSX.utils.book_append_sheet(wb, ws, name);
        };

        createSheet(
            ["Ngày", "Doanh Thu", "Số Đơn"], 
            (data.revenueChart || []).map(i => [i.date || i.Date, i.doanhThu || i.DoanhThu, i.soDon || i.SoDon || 0]), 
            "Doanh Thu"
        );

        createSheet(
            ["Danh Mục", "Số Lượng Bán"], 
            (data.statusData || []).map(i => [i.name, i.value]), 
            "Tỷ Lệ Danh Mục"
        );

        const fileName = `BaoCao_FastBite_${new Date().toISOString().slice(0,10)}.xlsx`;
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(dataBlob, fileName);
        
        toast.success("Xuất báo cáo thành công!");
    } catch (err) {
        console.error(err);
        toast.error("Lỗi khi xuất file Excel");
    }
  };

  const getStatusBadge = (status) => {
     if(!status) return <span style={{color:'#ccc'}}>N/A</span>;
     const sKey = status.toLowerCase();
     const map = {
         'choduyet': { label: '⏳ Chờ duyệt', bg: '#fff3cd', color: '#856404' },
         'cho_xu_ly': { label: '⏳ Chờ duyệt', bg: '#fff3cd', color: '#856404' },
         'dang_giao': { label: '🚀 Đang giao', bg: '#d1ecf1', color: '#0c5460' },
         'hoan_thanh': { label: '✅ Hoàn thành', bg: '#d4edda', color: '#155724' },
         'huy': { label: '🗑️ Đã hủy', bg: '#f8d7da', color: '#721c24' },
     };
     
     const confKey = Object.keys(map).find(k => sKey.includes(k));
     const style = confKey ? map[confKey] : { label: status, bg: '#f5f6fa', color: '#636e72' };

     return (
        <span style={{ backgroundColor: style.bg, color: style.color, padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
            {style.label}
        </span>
     );
  };

  return (
    // 🔥 BƯỚC 1: Lớp vỏ ngoài cùng (Chỉ chứa Scrollbar dán sát mép phải, không dùng Padding)
    <div className="dashboard-container" style={{ background: '#f8f9fa', height: '100vh', overflowY: 'auto', overflowX: 'hidden' }}>
      
      {/* 🔥 BƯỚC 2: Lớp lõi bên trong (Chứa Padding để tạo khoảng cách cho nội dung) */}
      <div style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', padding: '30px', maxWidth: '100%' }}>
        <ToastContainer autoClose={2000} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
            <h2 style={{ color: '#2d3436', fontWeight: '800', fontSize: '1.8rem', margin: 0 }}>
                Dashboard FastBite
            </h2>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#fff', padding: '8px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                <select value={timeSpan} onChange={(e) => setTimeSpan(e.target.value)} style={controlStyle}>
                    <option value="today">Hôm nay</option>
                    <option value="week">7 ngày qua</option>
                    <option value="last_30_days">30 ngày qua</option>
                    <option value="this_month">Tháng này</option>
                    <option value="this_year">Năm nay</option>
                    <option value="custom">Tùy chọn...</option>
                    <option value="all">Toàn bộ</option>
                </select>

                {timeSpan === 'custom' && (
                    <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={controlStyle} title="Từ ngày" />
                        <span style={{color:'#b2bec3', fontWeight:'bold'}}>-</span>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={controlStyle} title="Đến ngày" />
                    </div>
                )}
                
                <button onClick={fetchData} style={{...iconBtnStyle, width: 'auto', padding: '0 15px', gap: '8px'}} title="Làm mới dữ liệu"> 
                <span className={loading ? "fa-spin" : ""} style={{ fontSize: '1.4rem', lineHeight: '1', display: 'inline-block' }}>
                    ↻
                </span>
                <span style={{ fontWeight: '600' }}>Làm mới</span>
                </button>
                <button onClick={handleExport} style={primaryBtnStyle}> 
                    <FaFileExport /> Xuất Excel 
                </button>

                {/* 👉 NÚT HUẤN LUYỆN AI CỰC NGẦU DÀNH CHO SẾP */}
                <span style={{ width: '1px', height: '24px', background: '#dfe6e9', margin: '0 5px' }}></span> 
                <button 
                    onClick={async (e) => {
                        const btn = e.currentTarget;
                        btn.disabled = true;
                        const originalText = btn.innerHTML;
                        btn.innerHTML = `<span class="fa-spin" style="display:inline-block">⚙️</span> Đang huấn luyện...`;
                        
                        try {
                            const res = await axiosAdmin.post('/api/Recommendation/TrainAI');
                            if (res && res.success) {
                                toast.success("🧠 " + res.message, { position: "top-center", autoClose: 3000, theme: "colored" });
                            } else {
                                toast.warning(res?.message || "Cần thêm dữ liệu để AI học tập!", { position: "top-center" });
                            }
                        } catch (err) {
                            toast.error("Lỗi kết nối Máy chủ AI!", { position: "top-center" });
                        } finally {
                            btn.innerHTML = originalText;
                            btn.disabled = false;
                        }
                    }} 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#ff4757', color: '#fff', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(255, 71, 87, 0.3)', fontSize:'0.9rem', transition: 'all 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                > 
                    🚀 Cập Nhật Bộ Não AI 
                </button>
            </div>
        </div>

        {loading && data.doanhThu === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px', color: '#b2bec3' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="fa-spin" style={{ transformOrigin: 'center' }}>
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
                <p style={{marginTop:'10px'}}>Đang tải dữ liệu thống kê...</p>
            </div>
        ) : (
            <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <KpiCard title="Doanh thu" value={data.doanhThu.toLocaleString()} unit="đ" icon={<FaDollarSign />} color="#00b894" bg="#e0f9f4" />
                <KpiCard title="Đơn hàng" value={data.donHang} icon={<FaShoppingCart />} color="#0984e3" bg="#e3f2fd" />
                <KpiCard title="Giá trị TB/Đơn" value={data.aov.toLocaleString()} unit="đ" icon={<FaChartLine />} color="#6c5ce7" bg="#ede9fe" />
                <KpiCard title="Khách hàng" value={data.tongKhach} icon={<FaUserFriends />} color="#e17055" bg="#ffece6" />
            </div>

            <div className="grid-charts" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px', marginBottom: '30px' }}>
                <div style={cardStyle}>
                    <h3 style={cardTitleStyle}>📈 Hiệu Suất Kinh Doanh</h3>
                    <div style={{ height: '350px', width: '100%' }}> 
                        {data.revenueChart && data.revenueChart.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={data.revenueChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorDoanhThu" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0984e3" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#0984e3" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey={data.revenueChart[0].Date ? "Date" : "date"} axisLine={false} tickLine={false} tick={{fill: '#636e72', fontSize: 12}} />
                                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tickFormatter={val => val>=1000000 ? `${(val/1000000).toFixed(1)}M` : `${val/1000}k`} />
                                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
                                    <RechartsTooltip formatter={(val) => new Intl.NumberFormat('vi-VN').format(val) + ' đ'} />
                                    
                                    <Area yAxisId="left" type="monotone" dataKey={data.revenueChart[0].DoanhThu ? "DoanhThu" : "doanhThu"} name="Doanh Thu" stroke="#0984e3" fillOpacity={1} fill="url(#colorDoanhThu)" />
                                    <Line yAxisId="right" type="monotone" dataKey={data.revenueChart[0].SoDon ? "SoDon" : "soDon"} name="Số Đơn" stroke="#e67e22" strokeWidth={2} dot={{r: 4}} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={emptyStateStyle}>Chưa có dữ liệu biểu đồ</div>
                        )}
                    </div>
                </div>

                <div style={cardStyle}>
                    <h3 style={cardTitleStyle}>🍕 Tỷ Lệ Danh Mục</h3>
                    <div style={{ height: '350px', width: '100%' }}> 
                        {data.statusData && data.statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={data.statusData} 
                                        innerRadius={0} 
                                        outerRadius={100}
                                        paddingAngle={0} 
                                        dataKey="value"
                                        nameKey="name" 
                                        label={({ name, percent, value }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                                        labelLine={true}
                                    >
                                        {data.statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip formatter={(val) => `${val} sản phẩm`} />
                                    <Legend verticalAlign="bottom" wrapperStyle={{paddingTop: '20px'}} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={emptyStateStyle}>Chưa có đơn hàng nào</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid-bottom" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '25px' }}>
                <div style={cardStyle}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'20px', alignItems:'center' }}>
                        <h3 style={cardTitleStyle}>📋 Đơn Vừa Đặt</h3>
                        <button style={{border:'none', background:'none', color:'#0984e3', fontWeight:'600', cursor:'pointer'}}>Xem tất cả &rarr;</button>
                    </div>
                    <div style={{overflowX: 'auto'}}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: '#636e72', fontSize: '0.85rem', borderBottom: '2px solid #f1f5f9' }}>
                                    <th style={{padding:'12px'}}>Mã Đơn</th>
                                    <th style={{padding:'12px'}}>Khách Hàng</th>
                                    <th style={{padding:'12px'}}>Tổng Tiền</th>
                                    <th style={{padding:'12px'}}>Trạng Thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.donMoi && data.donMoi.length > 0 ? data.donMoi.slice(0, 5).map((order) => (
                                    <tr key={order.maDonHang || order.MaDonHang} style={{ borderBottom: '1px dashed #f1f5f9' }}>
                                        <td style={{padding:'12px', fontWeight:'bold', color:'#2d3436'}}>
                                            #{order.maDonHang || order.MaDonHang}
                                        </td>
                                        <td style={{padding:'12px', fontSize:'0.9rem'}}>
                                            {order.nguoiNhan || order.NguoiNhan || 'Khách vãng lai'}
                                        </td>
                                        <td style={{padding:'12px', fontWeight:'bold', color:'#e64a19'}}>
                                            {(order.tongTien || order.TongTien || 0).toLocaleString()}đ
                                        </td>
                                        <td style={{padding:'12px'}}>
                                            {getStatusBadge(order.trangThai || order.TrangThai)}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" style={emptyStateStyle}>Chưa có đơn hàng mới</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style={cardStyle}>
                    <h3 style={cardTitleStyle}>👑 Món Ăn Ngôi Sao</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop:'10px' }}>
                        {data.topSanPham && data.topSanPham.length > 0 ? data.topSanPham.slice(0, 5).map((item, idx) => (
                            <div key={idx} style={{ display:'flex', alignItems:'center', gap:'15px', paddingBottom:'10px', borderBottom: idx < 4 ? '1px dashed #f1f5f9' : 'none' }}>
                                <div style={{
                                    width:'32px', height:'32px', borderRadius:'50%', 
                                    background: idx === 0 ? '#ff7675' : (idx === 1 ? '#fdcb6e' : (idx === 2 ? '#74b9ff' : '#f1f2f6')), 
                                    color: idx < 3 ? '#fff' : '#636e72', 
                                    display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', fontSize:'0.9rem'
                                }}>
                                    {idx + 1}
                                </div>
                                
                                <div style={{width:'40px', height:'40px', borderRadius:'8px', overflow:'hidden', background:'#eee'}}>
                                    <img 
                                        src={getImageUrl(item.hinhAnh || item.HinhAnh)} 
                                        alt="mon" 
                                        style={{width:'100%', height:'100%', objectFit:'cover'}} 
                                        onError={(e) => e.target.src = 'https://placehold.co/40'}
                                    />
                                </div>

                                <div style={{flex:1}}>
                                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                        <span style={{fontWeight:'600', color:'#2d3436', fontSize:'0.95rem'}}>{item.tenMon || item.TenMon}</span>
                                        <span style={{fontWeight:'700', color:'#0984e3', fontSize:'0.9rem'}}>
                                            {item.soLuongBan || item.SoLuongBan} <span style={{fontSize:'0.8rem', fontWeight:'400', color:'#b2bec3'}}>bán</span>
                                        </span>
                                    </div>
                                    <div style={{fontSize:'0.8rem', color:'#b2bec3'}}>
                                        Doanh thu: {(item.doanhThu || item.DoanhThu || 0).toLocaleString()}đ
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div style={emptyStateStyle}>Chưa có dữ liệu bán hàng</div>
                        )}
                    </div>
                </div>

            </div>
            </>
        )}
      </div>
      
      {/* 🔥 BƯỚC 3: CSS Tàng hình rãnh cuộn, chỉ hiện con lăn cực mảnh */}
      <style>{`
          .fa-spin { animation: spin 1s infinite linear; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          
          @media (max-width: 900px) { 
              .grid-charts, .grid-bottom { grid-template-columns: 1fr !important; } 
          }

          /* Tùy chỉnh thanh cuộn dính sát mép, siêu mảnh */
          .dashboard-container::-webkit-scrollbar {
              width: 6px; 
          }
          .dashboard-container::-webkit-scrollbar-track {
              background: transparent; /* Rãnh cuộn trong suốt hoàn toàn */
          }
          .dashboard-container::-webkit-scrollbar-thumb {
              background: #cbd5e1; 
              border-radius: 10px;
          }
          .dashboard-container::-webkit-scrollbar-thumb:hover {
              background: #94a3b8; 
          }
      `}</style>
    </div>
  );
}

const KpiCard = ({ title, value, unit, icon, color, bg }) => (
    <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition:'transform 0.2s' }} 
         onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
         onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: color }}>
                {icon}
            </div>
        </div>
        <div>
            <div style={{ color: '#636e72', fontSize: '0.9rem', fontWeight: '600' }}>{title}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#2d3436', marginTop: '5px' }}>
                {value} <span style={{fontSize:'1rem', color:'#b2bec3', fontWeight:'500'}}>{unit}</span>
            </div>
        </div>
    </div>
);

const cardStyle = { background: '#fff', borderRadius: '20px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' };
const cardTitleStyle = { color: '#2d3436', margin: 0, fontSize: '1.1rem', display:'flex', alignItems:'center', fontWeight:'700', marginBottom:'20px' };
const controlStyle = { padding: '8px 12px', borderRadius: '8px', border: '1px solid #dfe6e9', outline: 'none', background: '#fff', color: '#2d3436', fontWeight: '600', cursor: 'pointer', fontSize:'0.9rem' };
const iconBtnStyle = { width:'36px', height:'36px', borderRadius:'8px', border:'1px solid #dfe6e9', background:'#fff', color:'#636e72', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:'1rem' };
const primaryBtnStyle = { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#0984e3', color: '#fff', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 10px rgba(9, 132, 227, 0.3)', fontSize:'0.9rem' };
const emptyStateStyle = { textAlign:'center', paddingTop:'50px', paddingBottom:'50px', color:'#b2bec3', fontStyle:'italic' };

export default AdminDashboard;  