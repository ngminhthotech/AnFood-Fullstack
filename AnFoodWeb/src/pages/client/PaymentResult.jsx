import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaHome, FaHistory } from 'react-icons/fa';
import { toast } from 'react-toastify';

// ✅ IMPORT CHUẨN
import axiosClient from '../../api/axiosClient';

function PaymentResult({ clearCart }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State quản lý trạng thái giao diện
  const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'failed'
  const [message, setMessage] = useState('Đang xác thực giao dịch...');
  
  // 🔥 CHỐT CHẶN: Đảm bảo useEffect chỉ chạy logic xử lý 1 lần duy nhất
  const isProcessed = useRef(false);

  useEffect(() => {
    // Nếu đã xử lý rồi thì dừng lại ngay
    if (isProcessed.current) return;
    isProcessed.current = true;

    const processPayment = async () => {
      try {
        // 1. Phân tích tham số URL
        const vnpCode = searchParams.get('vnp_ResponseCode'); 
        const momoCode = searchParams.get('resultCode'); // Hoặc tham số tương ứng của Momo
        
        let isSuccess = false;
        let paymentMethod = '';

        if (vnpCode) {
            paymentMethod = 'VNPAY';
            isSuccess = vnpCode === '00'; // 00 là thành công của VNPay
        } else if (momoCode) {
            paymentMethod = 'MOMO';
            isSuccess = momoCode === '0'; // Giả sử 0 là thành công của Momo
        } else {
            // Không tìm thấy mã trả về -> Truy cập trái phép
            setStatus('failed');
            setMessage('Không tìm thấy thông tin thanh toán.');
            return;
        }

        // 2. Xử lý kết quả
        if (isSuccess) {
            // Lấy thông tin đơn hàng tạm đã lưu ở bước Checkout
            const pendingOrderStr = localStorage.getItem('pendingOrder');
            
            if (!pendingOrderStr) {
                setStatus('failed');
                setMessage('Không tìm thấy thông tin đơn hàng tạm thời. Vui lòng liên hệ CSKH.');
                return;
            }

            const payload = JSON.parse(pendingOrderStr);
            
            // Cập nhật ghi chú phương thức thanh toán
            payload.ghiChu = `${payload.ghiChu || ''} - Đã thanh toán qua ${paymentMethod}`;

            // GỌI API TẠO ĐƠN
            await axiosClient.post('/DonHang/TaoDon', payload);

            // XỬ LÝ THÀNH CÔNG
            setStatus('success');
            setMessage('Giao dịch thành công! Đơn hàng đã được ghi nhận.');
            
            // Dọn dẹp
            localStorage.removeItem('cartItems');   // Xóa giỏ hàng
            localStorage.removeItem('checkoutItems'); // Xóa checkoutItems
            localStorage.removeItem('pendingOrder'); // Xóa đơn tạm
            
            // Dispatch sự kiện để App.jsx cập nhật lại số lượng giỏ hàng trên Header
            window.dispatchEvent(new Event('cart-cleared')); 
            window.dispatchEvent(new Event('cart-updated'));

            if (clearCart) clearCart(); // Gọi hàm props nếu có
            
            toast.success("🎉 Thanh toán thành công!");

            // Tự động chuyển hướng sau 5 giây
            setTimeout(() => navigate('/history'), 5000);

        } else {
            // XỬ LÝ THẤT BẠI TỪ CỔNG THANH TOÁN
            setStatus('failed');
            setMessage(`Giao dịch thất bại hoặc bị hủy bởi người dùng.`);
            toast.error("Giao dịch thất bại.");
        }

      } catch (error) {
        console.error("Lỗi xử lý thanh toán:", error);
        setStatus('failed');
        setMessage('Có lỗi xảy ra khi lưu đơn hàng. Vui lòng liên hệ hotline.');
      }
    };

    processPayment();

  }, [searchParams, navigate, clearCart]);

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', padding: '20px' }}>
      <div style={{ background: '#fff', padding: '50px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '600px', width: '100%' }}>
        
        {/* TRẠNG THÁI: ĐANG XỬ LÝ */}
        {status === 'processing' && (
            <div>
                <FaSpinner className="fa-spin" size={60} color="#e67e22" style={{ marginBottom: '20px' }} />
                <h2 style={{ color: '#2d3436' }}>Đang Xử Lý...</h2>
                <p style={{ color: '#636e72' }}>Vui lòng không tắt trình duyệt.</p>
            </div>
        )}

        {/* TRẠNG THÁI: THÀNH CÔNG */}
        {status === 'success' && (
            <div className="fade-in">
                <FaCheckCircle size={80} color="#27ae60" style={{ marginBottom: '20px' }} />
                <h2 style={{ color: '#27ae60', marginBottom: '10px' }}>Thanh Toán Thành Công!</h2>
                <p style={{ color: '#636e72', marginBottom: '30px', fontSize: '1.1rem' }}>{message}</p>
                
                <div style={{ padding: '15px', background: '#e8f5e9', borderRadius: '10px', color: '#2d3436', marginBottom: '30px' }}>
                    Bạn sẽ được chuyển hướng đến <b>Lịch sử đơn hàng</b> trong giây lát...
                </div>

                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button onClick={() => navigate('/history')} style={{ padding: '12px 25px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaHistory /> Xem đơn hàng
                    </button>
                    <button onClick={() => navigate('/')} style={{ padding: '12px 25px', background: '#fff', color: '#2d3436', border: '1px solid #ddd', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaHome /> Về trang chủ
                    </button>
                </div>
            </div>
        )}

        {/* TRẠNG THÁI: THẤT BẠI */}
        {status === 'failed' && (
            <div className="fade-in">
                <FaTimesCircle size={80} color="#e74c3c" style={{ marginBottom: '20px' }} />
                <h2 style={{ color: '#e74c3c', marginBottom: '10px' }}>Thanh Toán Thất Bại</h2>
                <p style={{ color: '#636e72', marginBottom: '30px', fontSize: '1.1rem' }}>{message}</p>

                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button onClick={() => navigate('/checkout')} style={{ padding: '12px 25px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Thử thanh toán lại
                    </button>
                    <button onClick={() => navigate('/')} style={{ padding: '12px 25px', background: '#fff', color: '#2d3436', border: '1px solid #ddd', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Về trang chủ
                    </button>
                </div>
            </div>
        )}

      </div>
      
      {/* Animation CSS */}
      <style>{`
        .fa-spin { animation: spin 1.5s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .fade-in { animation: fadeIn 0.5s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

export default PaymentResult;