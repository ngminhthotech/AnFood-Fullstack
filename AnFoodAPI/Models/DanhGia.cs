using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnFoodAPI.Models // ⚠️ Lưu ý: Đổi 'AnFoodAPI' thành tên namespace dự án của bạn nếu khác
{
    [Table("danh_gia")] // Tên bảng chính xác trong SQL của bạn
    public class DanhGia
    {
        [Key]
        [Column("ma_danh_gia")]
        public int MaDanhGia { get; set; }

        [Column("ma_nguoi_dung")]
        public int MaNguoiDung { get; set; }

        [Column("ma_mon")]
        public int MaMon { get; set; } // Quan trọng để lọc món ăn

        [Column("so_sao")]
        public int SoSao { get; set; }

        [Column("nhan_xet")]
        public string? NhanXet { get; set; } // Dấu ? cho phép null

        [Column("ngay_danh_gia")]
        public DateTime NgayDanhGia { get; set; }
    }
}