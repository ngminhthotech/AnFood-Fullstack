using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnFoodAPI.Models
{
    [Table("don_hang")] 
    public partial class DonHang
    {
        [Key]
        [Column("ma_don_hang")]
        public int MaDonHang { get; set; }

        [Column("ma_nguoi_dung")]
        public int? MaNguoiDung { get; set; }

        [Column("tong_tien")]
        public decimal? TongTien { get; set; }

        [Column("trang_thai")]
        [MaxLength(50)]
        public string? TrangThai { get; set; }
        

        [Column("ma_dia_chi")]
        public int? MaDiaChi { get; set; }

        [Column("ngay_dat", TypeName = "datetime")]
        public DateTime? NgayDat { get; set; }

        [Column("nguoi_nhan")] 
        public string? NguoiNhan { get; set; }

        [Column("so_dien_thoai")]
        public string? SoDienThoai { get; set; }

        [Column("dia_chi_giao_hang")]
        public string? DiaChiGiaoHang { get; set; }

        [Column("ghi_chu")]
        public string? GhiChu { get; set; }
        
        [Column("ly_do_huy")]
        public string? LyDoHuy { get; set; }

        // ============================================================
        // 👇 3 THUỘC TÍNH MỚI CHO VOUCHER & SHIP
        // ============================================================
        [Column("phi_van_chuyen")]
        public decimal? PhiVanChuyen { get; set; }

        [Column("ma_voucher")]
        public int? MaVoucher { get; set; } 

        [Column("so_tien_giam")]
        public decimal? SoTienGiam { get; set; }

        // ============================================================
        // 👇 CÁC MỐI NỐI (NAVIGATION PROPERTIES)
        // ============================================================
        [ForeignKey("MaNguoiDung")]
        public virtual NguoiDung? NguoiDung { get; set; }

        [ForeignKey("MaDiaChi")]
        public virtual DiaChiGiaoHang? DiaChiGiaoHangNavigation { get; set; }

        public virtual ICollection<ChiTietDonHang> ChiTietDonHangs { get; set; } = new List<ChiTietDonHang>();
        public virtual ICollection<LichSuTrangThaiDonHang> LichSuTrangThaiDonHangs { get; set; } = new List<LichSuTrangThaiDonHang>();
        public virtual ICollection<ThanhToan> ThanhToans { get; set; } = new List<ThanhToan>();
    }
}