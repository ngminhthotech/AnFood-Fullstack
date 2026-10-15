using System;

namespace AnFoodAPI.Models
{
    public partial class ChiTietPhieuKho
    {
        public int MaChiTietPhieu { get; set; }
        public int MaPhieu { get; set; }
        public int MaMon { get; set; }
        public int SoLuong { get; set; }
        public decimal? DonGia { get; set; } 

        public virtual PhieuKho MaPhieuNavigation { get; set; } = null!;
        public virtual MonAn MaMonNavigation { get; set; } = null!;
    }
}