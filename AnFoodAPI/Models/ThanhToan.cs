using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnFoodAPI.Models
{
    [Table("thanh_toan")]
    public class ThanhToan
    {
        [Key]
        [Column("ma_thanh_toan")]
        public int MaThanhToan { get; set; }

        [Column("ma_don_hang")]
        public int MaDonHang { get; set; }

        [Column("phuong_thuc")]
        public string PhuongThuc { get; set; } // "COD" hoặc "VNPAY"

        [Column("so_tien")]
        public double SoTien { get; set; }

        [Column("trang_thai")]
        public string TrangThai { get; set; } // "Đã thanh toán" hoặc "Chờ thanh toán"

        [Column("ngay_thanh_toan")]
        public DateTime NgayThanhToan { get; set; } = DateTime.Now;
        [ForeignKey("MaDonHang")]
        public virtual DonHang? MaDonHangNavigation { get; set; }
    }
}