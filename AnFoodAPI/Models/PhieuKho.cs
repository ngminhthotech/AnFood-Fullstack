using System;
using System.Collections.Generic;

namespace AnFoodAPI.Models
{
    public partial class PhieuKho
    {
        public int MaPhieu { get; set; }
        public string LoaiPhieu { get; set; } = null!; 
        public int? MaNguoiDung { get; set; } 
        public DateTime? NgayTao { get; set; }
        public string? GhiChu { get; set; }
        public decimal? TongTien { get; set; } 

        public virtual NguoiDung? MaNguoiDungNavigation { get; set; }
        public virtual ICollection<ChiTietPhieuKho> ChiTietPhieuKhos { get; set; } = new List<ChiTietPhieuKho>();
    }
}