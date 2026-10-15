import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
    Package, AlertTriangle, Search, Download, RefreshCw, X, 
    ArrowDownRight, ArrowUpRight, Settings, Calendar, History, 
    TrendingUp, DollarSign, Clock, PlusCircle, FileText, ChevronRight,
    Box, BarChart2
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import dayjs from 'dayjs';

// 👉 IMPORT COMPONENT TẠO PHIẾU KHO MỚI 👈
import TaoPhieuKho from './components/TaoPhieuKho';

const API_HOST = import.meta.env.VITE_API_URL || 'http://localhost:5010';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

const AdminInventory = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const [activeTab, setActiveTab] = useState('ton_kho'); 
    const [historyPhieu, setHistoryPhieu] = useState([]); 

    const [showModal, setShowModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [warningItems, setWarningItems] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    
    const [amount, setAmount] = useState('');
    const [price, setPrice] = useState(''); 
    const [note, setNote] = useState('');
    const [expiryDays, setExpiryDays] = useState(''); 
    const [transactionType, setTransactionType] = useState('import');

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_HOST}/MonAn`);
            const data = Array.isArray(res.data) ? res.data : (res.result || []);
            
            const processedData = data.map(p => ({
                ...p,
                giaBan: p.giaBan || p.gia || 0,
                giaVon: p.giaVon || 0,
                soLuong: p.soLuong ?? 0, 
                ngayHetHan: p.ngayHetHan 
            }));

            setProducts(processedData);

            const today = dayjs();
            const critical = processedData.filter(p => {
                const lowStock = p.soLuong <= 5;
                const nearExpiry = p.ngayHetHan && dayjs(p.ngayHetHan).diff(today, 'day') <= 3;
                return lowStock || nearExpiry;
            });

            if (critical.length > 0 && activeTab === 'ton_kho') {
                setWarningItems(critical);
                setShowWarningModal(true);
            }
        } catch (error) { toast.error("Lỗi kết nối server!"); } 
        finally { setLoading(false); }
    };

    const fetchHistoryPhieu = async () => {
        try {
            const res = await axios.get(`${API_HOST}/PhieuKho`);
            setHistoryPhieu(res.data);
        } catch (error) { toast.error("Không tải được danh sách phiếu!"); }
    };

    const fetchHistory = async (maMon) => {
        try {
            const res = await axios.get(`${API_HOST}/KhoHang/LichSu/${maMon}`);
            setHistoryData(res.data);
        } catch (error) { toast.error("Không tải được lịch sử!"); }
    };

    useEffect(() => { 
        fetchProducts(); 
        fetchHistoryPhieu(); 
    }, []);

    const kpi = useMemo(() => {
        const totalValue = products.reduce((acc, p) => acc + (p.soLuong * p.giaVon), 0);
        const potentialProfit = products.reduce((acc, p) => acc + (p.soLuong * (p.giaBan - p.giaVon)), 0);
        return {
            total: products.length,
            value: totalValue,
            profit: potentialProfit,
            low: products.filter(p => p.soLuong > 0 && p.soLuong <= 5).length,
            out: products.filter(p => p.soLuong <= 0).length,
        };
    }, [products]);

    const filteredData = products.filter(item => {
        const matchSearch = item.tenMon.toLowerCase().includes(searchTerm.toLowerCase());
        const stock = item.soLuong;
        if (filterStatus === 'low') return matchSearch && stock > 0 && stock <= 10;
        if (filterStatus === 'out') return matchSearch && stock <= 0;
        return matchSearch;
    });

    const handleSubmit = async () => {
        if (!amount || parseInt(amount) <= 0) return toast.warning("⚠️ Số lượng không hợp lệ!");
        
        try {
            if (transactionType === 'import') {
                if (!price || parseFloat(price) <= 0) return toast.error("⛔ Hãy nhập giá vốn!");
                
                let calculatedExpiry = null;
                if (expiryDays && parseInt(expiryDays) > 0) {
                    calculatedExpiry = dayjs().add(parseInt(expiryDays), 'day').toISOString();
                }

                await axios.post(`${API_HOST}/KhoHang/NhapHang`, {
                    maMon: selectedProduct.maMon,
                    soLuong: parseInt(amount),
                    giaNhap: parseFloat(price),
                    ghiChu: note || 'Nhập kho thủ công',
                    ngayHetHan: calculatedExpiry
                });
            } else {
                await axios.post(`${API_HOST}/KhoHang/CapNhat`, {
                    maMon: selectedProduct.maMon,
                    soLuongThayDoi: -parseInt(amount),
                    ghiChu: note || 'Xuất hủy',
                    loaiGiaoDich: 'XuatKho'
                });
            }
            toast.success("✅ Cập nhật thành công!");
            setShowModal(false);
            setAmount(''); setPrice(''); setNote(''); setExpiryDays('');
            fetchProducts(); 
            fetchHistoryPhieu(); 
        } catch (error) {
            toast.error("❌ Lỗi: " + (error.response?.data?.message || error.message));
        }
    };

    const openActionModal = (product) => {
        setSelectedProduct(product);
        setTransactionType('import');
        setAmount(''); setPrice(product.giaVon || ''); setNote(''); setExpiryDays('');
        setShowModal(true);
    };

    const openHistoryModal = (product) => {
        setSelectedProduct(product);
        setHistoryData([]);
        setShowHistoryModal(true);
        fetchHistory(product.maMon);
    };

    const renderExpiryStatus = (date) => {
        if (!date) return <span style={{color:'#b2bec3', fontStyle: 'italic'}}>Không có HSD</span>;
        const diff = dayjs(date).diff(dayjs(), 'day');
        let color = '#27ae60'; let bg = '#e8f5e9'; let text = `Còn ${diff} ngày`;

        if (diff < 0) { color = '#d63031'; bg = '#ffebee'; text = 'Đã hết hạn'; }
        else if (diff <= 3) { color = '#e67e22'; bg = '#fff3e0'; text = `Sắp hết hạn (${diff} ngày)`; }

        return (
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                <div style={{ padding: '6px', background: bg, borderRadius: '6px', color: color, display: 'flex' }}><Calendar size={14}/></div>
                <div>
                    <div style={{fontSize:'0.85rem', fontWeight:'700', color: '#2d3436'}}>{dayjs(date).format('DD/MM/YYYY')}</div>
                    <div style={{fontSize:'0.75rem', color, fontWeight: '600'}}>{text}</div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ padding: '30px', background: '#f4f6f8', minHeight: '100vh', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
            <ToastContainer position="top-right" autoClose={2000} theme="colored" />

            {/* HEADER CHUYÊN NGHIỆP */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#2d3436', display: 'flex', alignItems: 'center', gap: '12px', margin: '0 0 5px' }}>
                        <Box color="#e64a19" size={28} /> Hệ Thống Kho ERP
                    </h2>
                    <p style={{ margin: 0, color: '#636e72', fontSize: '0.95rem' }}>Quản lý tồn kho, dòng tiền và kiểm soát hạn sử dụng sản phẩm</p>
                </div>
                <div style={{display:'flex', gap:'12px'}}>
                    <button onClick={() => { fetchProducts(); fetchHistoryPhieu(); }} style={btnStyle('#fff', '#2d3436', '#dfe6e9')}>
                        <RefreshCw size={16}/> Đồng bộ dữ liệu
                    </button>
                    <button style={btnStyle('#fff', '#e64a19', '#e64a19')}>
                        <Download size={16}/> Xuất Excel
                    </button>
                    <button onClick={() => setActiveTab('tao_phieu')} style={btnStyle('#e64a19', '#fff', '#e64a19')}>
                        <PlusCircle size={16}/> Lập Phiếu Mới
                    </button>
                </div>
            </div>

            {/* BẢNG KPI DASHBOARD */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <KpiCard title="Tổng Vốn Tồn Kho" value={`${(kpi.value/1000000).toFixed(1)}M VNĐ`} icon={<DollarSign size={24}/>} color="#0984e3" bg="#e3f2fd" />
                <KpiCard title="Lãi Dự Kiến" value={`${(kpi.profit/1000000).toFixed(1)}M VNĐ`} icon={<TrendingUp size={24}/>} color="#27ae60" bg="#e8f5e9" />
                <KpiCard title="Cần Nhập / Hết Hạn" value={kpi.low + kpi.out} icon={<AlertTriangle size={24}/>} color="#d63031" bg="#ffebee" isAlert={kpi.low + kpi.out > 0} />
                <KpiCard title="Tổng Mặt Hàng" value={kpi.total} icon={<Package size={24}/>} color="#e67e22" bg="#fff3e0" />
            </div>

            {/* TABS NAVIGATION */}
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '20px' }}>
                {[
                    { id: 'ton_kho', label: 'Danh Mục Tồn Kho', icon: <BarChart2 size={16}/> },
                    { id: 'lich_su', label: 'Lịch Sử Chứng Từ', icon: <FileText size={16}/> },
                    { id: 'tao_phieu', label: 'Tạo Phiếu Nhập/Xuất', icon: <PlusCircle size={16}/> }
                ].map(tab => (
                    <button 
                        key={tab.id} onClick={() => setActiveTab(tab.id)}
                        style={{ 
                            padding: '12px 24px', borderRadius: '8px', border: '1px solid', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: activeTab === tab.id ? '#2d3436' : '#fff',
                            color: activeTab === tab.id ? '#fff' : '#636e72',
                            borderColor: activeTab === tab.id ? '#2d3436' : '#dfe6e9',
                            boxShadow: activeTab === tab.id ? '0 4px 10px rgba(45, 52, 54, 0.2)' : '0 2px 5px rgba(0,0,0,0.02)',
                            transition: 'all 0.2s', whiteSpace: 'nowrap'
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* MAIN CONTENT AREA */}
            <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 5px 20px rgba(0,0,0,0.03)', overflow: 'hidden', border: '1px solid #f1f2f6', minHeight: '400px' }}>
                
                {/* TAB 1: TỒN KHO */}
                {activeTab === 'ton_kho' && (
                    <>
                        <div style={{ padding: '20px 25px', borderBottom: '1px solid #f1f2f6', display: 'flex', gap: '15px', justifyContent: 'space-between', background: '#fff' }}>
                            <div style={{ position: 'relative', width: '350px' }}>
                                <Search size={16} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#b2bec3' }} />
                                <input 
                                    type="text" placeholder="Tìm kiếm món ăn, ID..." 
                                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                    style={{ width: '100%', padding: '10px 15px 10px 40px', borderRadius: '8px', border: '1px solid #dfe6e9', outline: 'none', boxSizing: 'border-box', fontSize: '0.9rem' }}
                                />
                            </div>
                            <select 
                                style={{ width: '220px', padding: '10px 15px', borderRadius: '8px', border: '1px solid #dfe6e9', outline: 'none', color: '#2d3436', fontWeight: '600', cursor: 'pointer' }} 
                                value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                            >
                                <option value="all">Tất cả sản phẩm</option>
                                <option value="low">⚠️ Sắp hết hàng (≤ 10)</option>
                                <option value="out">❌ Đã hết hàng</option>
                            </select>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                                <thead>
                                    <tr style={{ background: '#f8f9fa', color: '#636e72', textAlign: 'left', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        <th style={{ padding: '16px 25px', borderBottom: '2px solid #eee' }}>Sản Phẩm</th>
                                        <th style={{ padding: '16px 25px', borderBottom: '2px solid #eee' }}>Hạn Sử Dụng</th>
                                        <th style={{ padding: '16px 25px', borderBottom: '2px solid #eee', textAlign:'right' }}>Giá (Vốn/Bán)</th>
                                        <th style={{ padding: '16px 25px', borderBottom: '2px solid #eee', textAlign:'right' }}>Hiệu Quả (Lãi)</th>
                                        <th style={{ padding: '16px 25px', borderBottom: '2px solid #eee', textAlign:'center' }}>Tồn Kho</th>
                                        <th style={{ padding: '16px 25px', borderBottom: '2px solid #eee', textAlign:'center' }}>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? <tr><td colSpan="6" style={{textAlign:'center', padding:'60px', color:'#b2bec3'}}><div className="spinner"></div><div style={{marginTop:'15px'}}>Đang tải kho...</div></td></tr> : 
                                     filteredData.map(item => {
                                         const profit = item.giaBan - item.giaVon;
                                         const margin = item.giaBan > 0 ? (profit / item.giaBan) * 100 : 0;
                                         
                                         let marginColor = '#d63031'; let marginBg = '#ffebee'; let marginLabel = 'LỖ';
                                         if (margin >= 30) { marginColor = '#27ae60'; marginBg = '#e8f5e9'; marginLabel = 'TỐT'; }
                                         else if (margin > 0) { marginColor = '#e67e22'; marginBg = '#fff3e0'; marginLabel = 'MỎNG'; }
                                         if (item.giaVon === 0) { marginColor = '#636e72'; marginBg = '#f1f2f6'; marginLabel = 'CHƯA NHẬP VỐN'; }

                                         return (
                                            <tr key={item.maMon} className="hover-row" style={{ borderBottom: '1px solid #f1f2f6', transition: '0.2s' }}>
                                                <td style={{ padding: '16px 25px' }}>
                                                    <div style={{fontWeight:'700', color: '#2d3436', fontSize: '1.05rem'}}>{item.tenMon}</div>
                                                    <div style={{fontSize:'0.8rem', color:'#b2bec3', marginTop: '4px'}}>Mã SP: #{item.maMon}</div>
                                                </td>
                                                <td style={{ padding: '16px 25px' }}>{renderExpiryStatus(item.ngayHetHan)}</td>
                                                <td style={{ padding: '16px 25px', textAlign:'right' }}>
                                                    <div style={{color:'#636e72', fontSize: '0.85rem'}}>Vốn: <b>{formatCurrency(item.giaVon)}</b></div>
                                                    <div style={{color:'#e64a19', fontWeight:'bold', fontSize: '1rem', marginTop: '4px'}}>Bán: {formatCurrency(item.giaBan)}</div>
                                                </td>
                                                <td style={{ padding: '16px 25px', textAlign:'right' }}>
                                                    <div style={{fontWeight:'700', color: profit > 0 ? '#27ae60' : '#d63031', fontSize: '1rem'}}>
                                                        {profit > 0 ? '+' : ''}{formatCurrency(profit)}
                                                    </div>
                                                    <div style={{ fontSize:'0.75rem', fontWeight:'bold', color: marginColor, background: marginBg, padding:'2px 8px', borderRadius:'4px', display:'inline-block', marginTop:'4px' }}>
                                                        {margin.toFixed(1)}% ({marginLabel})
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px 25px', textAlign:'center' }}>
                                                    <div style={{fontWeight:'900', fontSize:'1.2rem', color: item.soLuong <= 5 ? '#d63031' : '#2d3436'}}>{item.soLuong}</div>
                                                    {item.soLuong <= 0 ? <div style={{fontSize:'0.75rem', color:'#fff', background:'#d63031', padding:'2px 6px', borderRadius:'4px', marginTop:'4px', fontWeight:'bold', display:'inline-block'}}>HẾT HÀNG</div> : 
                                                     item.soLuong <= 5 ? <div style={{fontSize:'0.75rem', color:'#fff', background:'#e67e22', padding:'2px 6px', borderRadius:'4px', marginTop:'4px', fontWeight:'bold', display:'inline-block'}}>SẮP HẾT</div> : null}
                                                </td>
                                                <td style={{ padding: '16px 25px', textAlign:'center' }}>
                                                    <div style={{display:'flex', gap:'8px', justifyContent:'center'}}>
                                                        <button onClick={() => openHistoryModal(item)} style={actionBtnStyle('#e3f2fd', '#0984e3')} title="Xem Lịch sử"><History size={16}/></button>
                                                        <button onClick={() => openActionModal(item)} style={actionBtnStyle('#e8f5e9', '#27ae60')} title="Điều chỉnh nhanh"><Settings size={16}/></button>
                                                    </div>
                                                </td>
                                            </tr>
                                         );
                                     })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* TAB 2: LỊCH SỬ CHỨNG TỪ */}
                {activeTab === 'lich_su' && (
                    <div style={{overflowX: 'auto'}}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                            <thead>
                                <tr style={{ background: '#f8f9fa', color: '#636e72', textAlign: 'left', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    <th style={{ padding: '16px 25px', borderBottom: '2px solid #eee' }}>Mã Phiếu</th>
                                    <th style={{ padding: '16px 25px', borderBottom: '2px solid #eee' }}>Loại Chứng Từ</th>
                                    <th style={{ padding: '16px 25px', borderBottom: '2px solid #eee' }}>Người Lập</th>
                                    <th style={{ padding: '16px 25px', borderBottom: '2px solid #eee' }}>Thời Gian</th>
                                    <th style={{ padding: '16px 25px', borderBottom: '2px solid #eee', textAlign:'right' }}>Tổng Giá Trị</th>
                                    <th style={{ padding: '16px 25px', borderBottom: '2px solid #eee' }}>Ghi Chú</th>
                                    <th style={{ padding: '16px 25px', borderBottom: '2px solid #eee' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyPhieu.length === 0 ? <tr><td colSpan="7" style={{textAlign:'center', padding:'60px', color:'#b2bec3'}}>Chưa có phiếu kho nào được lập.</td></tr> :
                                 historyPhieu.map(p => (
                                    <tr key={p.maPhieu} className="hover-row" style={{ borderBottom: '1px solid #f1f2f6', transition: '0.2s' }}>
                                        <td style={{ padding: '16px 25px', fontWeight: '800', color: '#2d3436' }}>#PK-{p.maPhieu}</td>
                                        <td style={{ padding: '16px 25px' }}>
                                            <span style={{ 
                                                padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                background: p.loaiPhieu === 'NHAP' ? '#e8f5e9' : '#ffebee', 
                                                color: p.loaiPhieu === 'NHAP' ? '#27ae60' : '#d63031' 
                                            }}>
                                                {p.loaiPhieu === 'NHAP' ? <ArrowDownRight size={14}/> : <ArrowUpRight size={14}/>}
                                                PHIẾU {p.loaiPhieu}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 25px', fontWeight: '600' }}>{p.nguoiLap}</td>
                                        <td style={{ padding: '16px 25px', color: '#636e72', fontSize: '0.9rem' }}>{dayjs(p.ngayTao).format('DD/MM/YYYY HH:mm')}</td>
                                        <td style={{ padding: '16px 25px', textAlign:'right', fontWeight:'800', color: '#e64a19', fontSize: '1.05rem' }}>{formatCurrency(p.tongTien)}</td>
                                        <td style={{ padding: '16px 25px', color: '#636e72', fontSize: '0.85rem', fontStyle: 'italic', maxWidth: '200px' }}>{p.ghiChu}</td>
                                        <td style={{ padding: '16px 25px', textAlign: 'center' }}>
                                            <button style={{border:'none', background:'none', color:'#b2bec3', cursor:'pointer'}}><ChevronRight size={20}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* TAB 3: TẠO PHIẾU MỚI (CHỨA COMPONENT CON) */}
                {activeTab === 'tao_phieu' && (
                    <div style={{ padding: '25px' }} className="fade-in">
                        <TaoPhieuKho onSuccess={() => { fetchProducts(); fetchHistoryPhieu(); setActiveTab('lich_su'); }} />
                    </div>
                )}
            </div>

            {/* MODAL NHẬP XUẤT NHANH */}
            {showModal && selectedProduct && (
                <div style={modalOverlayStyle}>
                    <div style={{...modalContentStyle, width: '480px'}} className="fade-in">
                        <div style={{padding:'20px 25px', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <h3 style={{margin:0, color:'#2d3436'}}>Điều chỉnh: <span style={{color:'#e64a19'}}>{selectedProduct.tenMon}</span></h3>
                            <button onClick={() => setShowModal(false)} style={{border:'none', background:'#f1f2f6', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor:'pointer', color: '#636e72'}}><X size={16}/></button>
                        </div>
                        <div style={{padding:'25px'}}>
                            <div style={{display:'flex', gap:'10px', marginBottom:'20px', background:'#f8f9fa', padding:'5px', borderRadius:'8px'}}>
                                <button style={{flex:1, padding:'10px', border:'none', borderRadius:'6px', fontWeight:'bold', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', transition: '0.2s', background: transactionType==='import'?'#e8f5e9':'transparent', color: transactionType==='import'?'#27ae60':'#636e72', boxShadow: transactionType==='import'?'0 2px 5px rgba(0,0,0,0.05)':'none'}} onClick={()=>setTransactionType('import')}>
                                    <ArrowDownRight size={18} /> NHẬP KHO
                                </button>
                                <button style={{flex:1, padding:'10px', border:'none', borderRadius:'6px', fontWeight:'bold', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', transition: '0.2s', background: transactionType==='export'?'#ffebee':'transparent', color: transactionType==='export'?'#d63031':'#636e72', boxShadow: transactionType==='export'?'0 2px 5px rgba(0,0,0,0.05)':'none'}} onClick={()=>setTransactionType('export')}>
                                    <ArrowUpRight size={18} /> XUẤT / HỦY
                                </button>
                            </div>

                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom: '20px'}}>
                                <div>
                                    <label style={labelStyle}>Số lượng</label>
                                    <input type="number" style={inputStyle} autoFocus value={amount} onChange={e => setAmount(e.target.value)} placeholder="0"/>
                                </div>
                                {transactionType === 'import' && (
                                    <div>
                                        <label style={labelStyle}>HSD (Số ngày)</label>
                                        <div style={{position:'relative'}}>
                                            <Clock size={16} style={{position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#b2bec3'}}/>
                                            <input type="number" style={{...inputStyle, paddingLeft:'35px'}} placeholder="VD: 7" value={expiryDays} onChange={e => setExpiryDays(e.target.value)} />
                                        </div>
                                        {expiryDays && (
                                            <div style={{fontSize:'0.75rem', color:'#27ae60', marginTop:'6px', fontWeight:'bold'}}>
                                                ➔ Hết hạn: {dayjs().add(parseInt(expiryDays), 'day').format('DD/MM/YYYY')}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {transactionType === 'import' && (
                                <div style={{marginBottom: '20px'}}>
                                    <label style={labelStyle}>Giá nhập đơn vị (VNĐ)</label>
                                    <input type="number" style={inputStyle} value={price} onChange={e => setPrice(e.target.value)} placeholder="Nhập giá vốn..."/>
                                </div>
                            )}

                            <div>
                                <label style={labelStyle}>Ghi chú điều chỉnh</label>
                                <textarea style={{...inputStyle, resize: 'none'}} rows="3" value={note} onChange={e => setNote(e.target.value)} placeholder="Lý do nhập/xuất..."></textarea>
                            </div>
                        </div>
                        <div style={{padding:'20px 25px', background:'#f8f9fa', borderTop:'1px solid #eee', display:'flex', gap:'12px'}}>
                            <button onClick={() => setShowModal(false)} style={{flex: 1, ...btnStyle('#fff', '#2d3436', '#dfe6e9')}}>Hủy Bỏ</button>
                            <button onClick={handleSubmit} style={{flex: 1, ...btnStyle(transactionType==='import'?'#27ae60':'#d63031', '#fff', 'transparent')}}>XÁC NHẬN</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL LỊCH SỬ MÓN ĂN */}
            {showHistoryModal && (
                <div style={modalOverlayStyle}>
                    <div style={{...modalContentStyle, width:'700px'}} className="fade-in">
                        <div style={{padding:'20px 25px', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <h3 style={{margin:0, color:'#2d3436'}}>Lịch Sử Giao Dịch: <span style={{color:'#e64a19'}}>{selectedProduct?.tenMon}</span></h3>
                            <button onClick={() => setShowHistoryModal(false)} style={{border:'none', background:'#f1f2f6', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor:'pointer', color: '#636e72'}}><X size={16}/></button>
                        </div>
                        <div style={{padding: '20px', maxHeight:'400px', overflowY:'auto'}}>
                            {historyData.length === 0 ? <div style={{textAlign:'center', color:'#b2bec3', padding:'40px'}}>Chưa có lịch sử xuất nhập kho.</div> : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ color: '#636e72', textAlign: 'left', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '2px solid #eee' }}>
                                            <th style={{ padding: '12px', background: '#fff' }}>Thời gian</th>
                                            <th style={{ padding: '12px', background: '#fff' }}>Loại</th>
                                            <th style={{ padding: '12px', background: '#fff', textAlign: 'center' }}>SL Biến Động</th>
                                            <th style={{ padding: '12px', background: '#fff', textAlign: 'center' }}>Tồn Cuối</th>
                                            <th style={{ padding: '12px', background: '#fff' }}>Ghi chú</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historyData.map((h, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #f1f2f6' }}>
                                                <td style={{ padding: '15px 12px', color:'#636e72', fontSize:'0.85rem' }}>{dayjs(h.ngay).format('DD/MM/YYYY HH:mm')}</td>
                                                <td style={{ padding: '15px 12px' }}>
                                                    <span style={{
                                                        padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                                                        background: h.loaiGiaoDich === 'NhapHang' ? '#e8f5e9' : h.loaiGiaoDich === 'XuatBan' ? '#fff3e0' : '#ffebee',
                                                        color: h.loaiGiaoDich === 'NhapHang' ? '#27ae60' : h.loaiGiaoDich === 'XuatBan' ? '#e67e22' : '#d63031'
                                                    }}>
                                                        {h.loaiGiaoDich === 'NhapHang' ? 'NHẬP' : h.loaiGiaoDich === 'XuatBan' ? 'BÁN HÀNG' : 'XUẤT/HỦY'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '15px 12px', textAlign: 'center', fontWeight:'bold', color:h.soLuong>0?'#27ae60':'#d63031', fontSize: '1.1rem' }}>
                                                    {h.soLuong>0?`+${h.soLuong}`:h.soLuong}
                                                </td>
                                                <td style={{ padding: '15px 12px', textAlign: 'center', fontWeight:'900', color: '#2d3436', fontSize: '1.1rem' }}>{h.soLuongTonSauKhiDoi}</td>
                                                <td style={{ padding: '15px 12px', color:'#636e72', fontStyle:'italic', fontSize:'0.85rem', maxWidth: '200px' }}>{h.ghiChu}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 🔥 MODAL CẢNH BÁO KHẨN CẤP */}
            {showWarningModal && (
                <div style={{...modalOverlayStyle, zIndex: 9999}}>
                    <div style={{...modalContentStyle, width: '650px', padding: 0, borderTop: '6px solid #d63031'}} className="fade-in">
                        <div style={{padding:'30px 30px 15px', textAlign:'center'}}>
                            <div style={{width:'70px', height:'70px', background:'#ffebee', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', boxShadow: '0 0 0 10px rgba(214, 48, 49, 0.1)'}}>
                                <AlertTriangle size={36} color="#d63031" />
                            </div>
                            <h2 style={{margin:0, color:'#d63031', fontSize:'1.8rem', fontWeight: '900'}}>BÁO ĐỘNG KHO HÀNG!</h2>
                            <p style={{color:'#636e72', margin:'10px 0 0 0', fontSize: '1.05rem'}}>Hệ thống phát hiện <b>{warningItems.length} mặt hàng</b> sắp hết tồn kho hoặc sắp hết hạn sử dụng.</p>
                        </div>
                        <div style={{padding:'10px 30px 20px', maxHeight:'300px', overflowY:'auto'}}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                                <thead style={{position:'sticky', top:0, zIndex: 10}}>
                                    <tr style={{background:'#ffebee'}}>
                                        <th style={{padding: '12px 15px', textAlign: 'left', color:'#c0392b', fontSize: '0.9rem', textTransform: 'uppercase'}}>Mặt hàng</th>
                                        <th style={{padding: '12px 15px', textAlign: 'center', color:'#c0392b', fontSize: '0.9rem', textTransform: 'uppercase'}}>Tồn</th>
                                        <th style={{padding: '12px 15px', textAlign: 'right', color:'#c0392b', fontSize: '0.9rem', textTransform: 'uppercase'}}>Hạn dùng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {warningItems.map(item => {
                                        const days = item.ngayHetHan ? dayjs(item.ngayHetHan).diff(dayjs(), 'day') : 999;
                                        return (
                                            <tr key={item.maMon} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={{padding: '12px 15px', fontWeight:'700', color: '#2d3436'}}>{item.tenMon}</td>
                                                <td style={{padding: '12px 15px', fontWeight:'bold', color: item.soLuong<=5?'#d63031':'#2d3436', textAlign:'center', fontSize: '1.1rem'}}>{item.soLuong}</td>
                                                <td style={{padding: '12px 15px', textAlign:'right'}}>
                                                    {days < 0 ? <span style={{ background: '#d63031', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Quá hạn</span> : 
                                                     days <= 3 ? <span style={{ background: '#e67e22', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Còn {days} ngày</span> : 
                                                     <span style={{fontSize:'0.9rem', color: '#636e72', fontWeight: '600'}}>{dayjs(item.ngayHetHan).format('DD/MM/YYYY')}</span>}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div style={{padding:'25px 30px', display:'flex', gap:'15px', background:'#f8f9fa', borderTop: '1px solid #eee'}}>
                            <button onClick={() => setShowWarningModal(false)} style={{flex:1, ...btnStyle('#fff', '#2d3436', '#dfe6e9')}}>Để xem sau</button>
                            <button onClick={() => { setShowWarningModal(false); setActiveTab('tao_phieu'); }} style={{flex:2, ...btnStyle('#d63031', '#fff', 'transparent')}}>LẬP PHIẾU NHẬP NGAY</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .hover-row:hover { background-color: #fffcf5 !important; }
                .fade-in { animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(15px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
                button svg { flex-shrink: 0 !important; display: inline-block !important; }
                .spinner { width: 30px; height: 30px; border: 3px solid #f1f2f6; border-top: 3px solid #e64a19; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

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

const btnStyle = (bg, color, border) => ({
    padding: '10px 20px', borderRadius: '8px', background: bg, color: color, border: `1px solid ${border}`,
    fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
    boxShadow: bg !== '#fff' ? `0 4px 10px ${bg}40` : '0 2px 5px rgba(0,0,0,0.02)', transition: '0.2s'
});

const actionBtnStyle = (bg, color) => ({ 
    width: '36px', height: '36px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', 
    background: bg, color: color, border: 'none', cursor: 'pointer', transition: '0.2s', padding: '0'
});

const inputStyle = { width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #dfe6e9', outline: 'none', boxSizing: 'border-box', fontSize: '0.95rem', color: '#2d3436' };
const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#636e72', marginBottom: '6px' };

const modalOverlayStyle = { 
    position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 
};
const modalContentStyle = { 
    background:'#fff', borderRadius:'16px', boxShadow:'0 25px 50px -12px rgba(0,0,0,0.3)', overflow:'hidden' 
};

export default AdminInventory;