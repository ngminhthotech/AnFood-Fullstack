namespace AnFoodAPI.DTOs
{
    // DTO dùng để hứng dữ liệu khi "Thêm vào giỏ"
    public class ThemVaoGioRequest
    {
        public int MaNguoiDung { get; set; }
        public int MaMon { get; set; }
        public int SoLuong { get; set; }
    }

    // DTO dùng để trả dữ liệu giỏ hàng về cho Frontend (nếu cần)
    public class GioHangItemDto
    {
        public int MaMon { get; set; }
        public string TenMon { get; set; }
        public decimal Gia { get; set; }
        public string HinhAnh { get; set; }
        public int SoLuong { get; set; }
    }
}