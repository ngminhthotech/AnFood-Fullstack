using Microsoft.AspNetCore.Http; // 👈 Bắt buộc có dòng này để dùng IFormFile

namespace AnFoodAPI.DTOs
{
    public class MonAnRequest
    {
        public string TenMon { get; set; }
        public decimal GiaBan { get; set; }
        public decimal? GiaVon { get; set; }
        public string MoTa { get; set; }
        public int MaDanhMuc { get; set; }
        public IFormFile? HinhAnh { get; set; }
    }
}