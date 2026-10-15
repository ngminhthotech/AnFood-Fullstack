using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations; // 👈 1. Thêm thư viện này để dùng được [Key]
using System.ComponentModel.DataAnnotations.Schema;

namespace AnFoodAPI.Models;

[Table("gio_hang")] // Đánh dấu rõ tên bảng trong CSDL
public partial class GioHang
{
    [Key] // 👈 2. Đánh dấu đây là Khóa chính (Fix triệt để lỗi sập server)
    public int MaGioHang { get; set; }

    public int? MaNguoiDung { get; set; }

    public DateTime? NgayTao { get; set; }

    public virtual ICollection<ChiTietGioHang> ChiTietGioHangs { get; set; } = new List<ChiTietGioHang>();

    [ForeignKey("MaNguoiDung")]
    public virtual NguoiDung? MaNguoiDungNavigation { get; set; }
}