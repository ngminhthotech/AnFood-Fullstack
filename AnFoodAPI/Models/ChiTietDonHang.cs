using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnFoodAPI.Models
{
    [Table("chi_tiet_don_hang")]
    public partial class ChiTietDonHang
    {
        [Key]
        [Column("ma_chi_tiet")]
        public int MaChiTiet { get; set; }

        [Column("ma_don_hang")]
        public int? MaDonHang { get; set; }

        [Column("ma_mon")]
        public int? MaMon { get; set; }

        [Column("so_luong")]
        public int? SoLuong { get; set; }

        [Column("don_gia")]
        public decimal? DonGia { get; set; } // ✅ Added this to fix the error

        [Column("gia_ban")]
        public decimal? GiaBan { get; set; }

        [ForeignKey("MaDonHang")]
        public virtual DonHang? DonHang { get; set; }

        [ForeignKey("MaMon")]
        public virtual MonAn? MonAn { get; set; }
    }
}