using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnFoodAPI.Models
{
    [Table("lien_he")]
    public class LienHe
    {
        [Key]
        [Column("ma_lien_he")]
        public int MaLienHe { get; set; }

        [Column("ho_ten")]
        public string HoTen { get; set; }

        [Column("email")]
        public string Email { get; set; }

        [Column("so_dien_thoai")]
        public string SoDienThoai { get; set; }

        [Column("noi_dung")]
        public string NoiDung { get; set; }

        [Column("da_phan_hoi")]
        public bool? DaPhanHoi { get; set; } = false; // Mặc định là chưa phản hồi

        [Column("ngay_gui")]
        public DateTime? NgayGui { get; set; } = DateTime.Now;
    }
}