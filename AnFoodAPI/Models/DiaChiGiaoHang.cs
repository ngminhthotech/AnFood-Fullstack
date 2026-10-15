using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnFoodAPI.Models
{
    [Table("dia_chi_giao_hang")]
    public class DiaChiGiaoHang
    {
        [Key]
        [Column("ma_dia_chi")]
        public int MaDiaChi { get; set; }

        [Column("ma_nguoi_dung")]
        public int MaNguoiDung { get; set; }

        [Column("ho_ten_nguoi_nhan")]
        public string HoTenNguoiNhan { get; set; }

        [Column("so_dien_thoai")]
        public string SoDienThoai { get; set; }

        [Column("dia_chi")]
        public string DiaChi { get; set; }

        [Column("mac_dinh")]
        public bool MacDinh { get; set; }

        [Column("ngay_tao")]
        public DateTime? NgayTao { get; set; }

        // 👇👇 THÊM DÒNG NÀY VÀO ĐỂ SỬA LỖI 👇👇
        [ForeignKey("MaNguoiDung")]
        public virtual NguoiDung? MaNguoiDungNavigation { get; set; }
    }
}