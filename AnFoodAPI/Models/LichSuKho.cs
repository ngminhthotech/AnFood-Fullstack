using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnFoodAPI.Models
{
    // 👇 Ép tên bảng thành snake_case chuẩn
    [Table("lich_su_kho")] 
    public class LichSuKho
    {
        [Key]
        [Column("ma_lich_su")] // 👇 Ép tên cột chuẩn
        public int MaLichSu { get; set; }

        [Column("ma_mon")]
        public int MaMon { get; set; }

        [Column("so_luong")]
        public int SoLuong { get; set; }

        [Column("so_luong_ton_sau_khi_doi")]
        public int SoLuongTonSauKhiDoi { get; set; }

        [StringLength(50)]
        [Column("loai_giao_dich")]
        public string LoaiGiaoDich { get; set; }

        [Column("ngay_tao")]
        public DateTime NgayTao { get; set; }

        [StringLength(255)]
        [Column("ghi_chu")]
        public string GhiChu { get; set; }

        // --- KHÓA NGOẠI ---
        [ForeignKey("MaMon")]
        public virtual MonAn MonAn { get; set; }
    }
}