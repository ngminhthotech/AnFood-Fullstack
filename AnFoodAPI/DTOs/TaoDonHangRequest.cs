namespace AnFoodAPI.DTOs
{
    public class TaoDonHangRequest
    {
        public int MaNguoiDung { get; set; }
        public string NguoiNhan { get; set; }
        public string SoDienThoai { get; set; }
        public string DiaChiGiaoHang { get; set; } // Lưu ý: Tên phải khớp với bên React gửi lên
        public string GhiChu { get; set; }
    }
}