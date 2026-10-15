using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnFoodAPI.Models
{
    [Table("quang_cao")]
    public class QuangCao
    {
        [Key]
        [Column("ma_quang_cao")]
        public int MaQuangCao { get; set; }

        [Column("tieu_de")]
        public string TieuDe { get; set; }

        [Column("mo_ta")]
        public string? MoTa { get; set; }

        [Column("hinh_anh")]
        public string? HinhAnh { get; set; }

        [Column("phan_tram_giam")]
        public int? PhanTramGiam { get; set; }

        [Column("kich_hoat")]
        public bool KichHoat { get; set; }

        // 👇 MỚI THÊM: Liên kết với món ăn
        [Column("ma_mon")]
        public int? MaMon { get; set; } 
        // 👇 MỚI THÊM: Liên kết với Danh Mục
        [Column("ma_danh_muc")]
        public int? MaDanhMuc { get; set; }
    }
}