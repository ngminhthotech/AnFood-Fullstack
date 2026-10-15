using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnFoodAPI.Models
{
    [Table("voucher")] // Khớp với tên bảng trong MySQL
    public class Voucher
    {
        [Key]
        [Column("ma_voucher")]
        public int MaVoucher { get; set; }

        [Column("ma_code")]
        public string MaCode { get; set; }

        [Column("loai_giam_gia")]
        public string LoaiGiamGia { get; set; }

        [Column("gia_tri_giam")]
        public decimal GiaTriGiam { get; set; }

        [Column("giam_toi_da")]
        public decimal GiamToiDa { get; set; }

        [Column("don_toi_thieu")]
        public decimal DonToiThieu { get; set; }

        [Column("so_luong")]
        public int SoLuong { get; set; }

        [Column("ngay_bat_dau")]
        public DateTime NgayBatDau { get; set; }

        [Column("ngay_ket_thuc")]
        public DateTime NgayKetThuc { get; set; }

        [Column("trang_thai")]
        public bool TrangThai { get; set; }
    }
}