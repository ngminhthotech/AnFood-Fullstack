using System;

namespace AnFoodAPI.Models
{
    public class ChiTietKho
    {
        public int MaChiTiet { get; set; }
        public int MaMon { get; set; }
        public int? SoLuongNhap { get; set; } 
        public int? SoLuongHienTai { get; set; } 
        public DateTime? NgayNhap { get; set; } 
        public DateTime? NgayHetHan { get; set; } 
        public string? GhiChu { get; set; }

        // Đổi thành MaMonNavigation để đồng bộ với DbContext và Controller
        public virtual MonAn? MaMonNavigation { get; set; }
    }
}