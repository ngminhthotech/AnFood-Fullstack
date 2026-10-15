using System; // 👈 QUAN TRỌNG: Phải có dòng này mới dùng được DateTime

namespace AnFoodAPI.DTOs
{
    // Đây là cái "hộp" để hứng dữ liệu Admin gửi lên
    public class CapNhatKhoRequest
    {
        public int MaMon { get; set; }
        public int SoLuongThayDoi { get; set; } // Ví dụ: 10 (nhập thêm), -5 (bán đi)
        public string GhiChu { get; set; }      // Ví dụ: "Nhập hàng sáng nay"
        public string LoaiGiaoDich { get; set; } // "NhapHang", "HuyHang"
        
        public DateTime? NgayHetHan { get; set; } // Ngày hết hạn (có thể null)
    }
}