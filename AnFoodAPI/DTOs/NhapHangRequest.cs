using System;

namespace AnFoodAPI.DTOs
{
    public class NhapHangRequest
    {
        public int MaMon { get; set; }
        public int SoLuong { get; set; }
        public decimal GiaNhap { get; set; }
        public string? GhiChu { get; set; }
        public DateTime? NgayHetHan { get; set; }
    }
}