using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnFoodAPI.Models
{
    [Table("nguoi_dung")]
    public partial class NguoiDung
    {
        [Key]
        [Column("ma_nguoi_dung")]
        public int MaNguoiDung { get; set; }

        [Column("ho_ten")]
        public string? HoTen { get; set; }

        [Column("email")]
        public string? Email { get; set; }

        [Column("mat_khau")]
        public string? MatKhau { get; set; }

        [Column("so_dien_thoai")]
        public string? SoDienThoai { get; set; }

        [Column("trang_thai")]
        public string? TrangThai { get; set; } 

        [Column("dia_chi")]
        public string? DiaChi { get; set; }

        [Column("ma_vai_tro")]
        public int? MaVaiTro { get; set; }

        

        [Column("ngay_tao")]
        public DateTime? NgayTao { get; set; }

        [Column("otp_code")]
        public string? OtpCode { get; set; }

        [Column("otp_expiry")]
        public DateTime? OtpExpiry { get; set; }

        // 👇 Đã fix: Để bool? để tránh lỗi null từ Database
        public bool? IsDeleted { get; set; } 

        // --------------------------------------------------------
        // 👇 QUAN TRỌNG: ĐÃ XÓA 'InverseProperty' ĐỂ HẾT LỖI 500
        // --------------------------------------------------------
        public virtual ICollection<DonHang> DonHangs { get; set; } = new List<DonHang>();

        public virtual ICollection<DanhGia> DanhGia { get; set; } = new List<DanhGia>();

        public virtual ICollection<DiaChiGiaoHang> DiaChiGiaoHangs { get; set; } = new List<DiaChiGiaoHang>();

        public virtual ICollection<GioHang> GioHangs { get; set; } = new List<GioHang>();

        public virtual ICollection<GoiYAi> GoiYAis { get; set; } = new List<GoiYAi>();

        public virtual ICollection<HanhViNguoiDung> HanhViNguoiDungs { get; set; } = new List<HanhViNguoiDung>();

        public virtual ICollection<ThongBao> ThongBaos { get; set; } = new List<ThongBao>();

        public virtual ICollection<YeuThich> YeuThiches { get; set; } = new List<YeuThich>();

        [ForeignKey("MaVaiTro")]
        public virtual VaiTro? MaVaiTroNavigation { get; set; }
        

    }
}