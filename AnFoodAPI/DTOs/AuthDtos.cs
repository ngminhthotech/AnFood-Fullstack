namespace AnFoodAPI.DTOs
{
    public class DangKyRequest
    {
        public string TenNguoiDung { get; set; }
        public string Email { get; set; }
        public string MatKhau { get; set; } // Lưu ý: Thực tế nên mã hóa, nhưng tạm thời lưu text để test
        public string SoDienThoai { get; set; }
        public string DiaChi { get; set; }
    }

    public class DangNhapRequest
    {
        public string Email { get; set; } // Hoặc Username tùy bạn
        public string MatKhau { get; set; }
    }
}