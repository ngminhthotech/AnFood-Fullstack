using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnFoodAPI.Models
{
    [Table("mon_an")]
    public partial class MonAn
    {
        public MonAn()
        {
            ChiTietGioHangs = new HashSet<ChiTietGioHang>();
            DanhGia = new HashSet<DanhGia>();
            HinhAnhMonAns = new HashSet<HinhAnhMonAn>();
            ChiTietDonHangs = new HashSet<ChiTietDonHang>();
            HanhViNguoiDungs = new HashSet<HanhViNguoiDung>(); 
            YeuThiches = new HashSet<YeuThich>();
            GoiYAis = new HashSet<GoiYAi>();
        }

        [Key]
        [Column("ma_mon")]
        public int MaMon { get; set; }

        [Column("ten_mon")]
        public string TenMon { get; set; } = null!;

        [Column("gia", TypeName = "decimal(18, 0)")]
        public decimal? Gia { get; set; } // Giá bán

        [Column("gia_von", TypeName = "decimal(18, 0)")]
        public decimal? GiaVon { get; set; } // Giá vốn (Chuẩn ERP)

        [Column("mo_ta")]
        public string? MoTa { get; set; }

        [Column("hinh_anh")]
        public string? HinhAnh { get; set; }

        [Column("ma_danh_muc")]
        public int? MaDanhMuc { get; set; }

        [Column("trang_thai")]
        public string? TrangThai { get; set; }

        [Column("ngay_tao", TypeName = "datetime")]
        public DateTime? NgayTao { get; set; }

        [Column("ban_chay")]
        public int? BanChay { get; set; }
        
        // 👉 ĐÃ FIX: Khai báo cột da_ban để C# hứng dữ liệu từ SQL
        [Column("da_ban")]
        public int? DaBan { get; set; }

        [Column("IsDeleted")]
        public bool IsDeleted { get; set; } = false; 
        
        // --- Quan hệ (Navigation Properties) ---
        [ForeignKey("MaDanhMuc")]
        public virtual DanhMuc? MaDanhMucNavigation { get; set; }
        public virtual ICollection<ChiTietGioHang> ChiTietGioHangs { get; set; }
        public virtual ICollection<ChiTietDonHang> ChiTietDonHangs { get; set; }
        public virtual ICollection<DanhGia> DanhGia { get; set; }
        public virtual ICollection<HinhAnhMonAn> HinhAnhMonAns { get; set; }
        public virtual ICollection<YeuThich> YeuThiches { get; set; }
        public virtual ICollection<GoiYAi> GoiYAis { get; set; }
        public virtual ICollection<HanhViNguoiDung> HanhViNguoiDungs { get; set; } 
    }
}