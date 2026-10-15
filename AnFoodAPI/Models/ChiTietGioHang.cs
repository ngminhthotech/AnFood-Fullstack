using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations; // 👈 1. THÊM THƯ VIỆN NÀY ĐỂ DÙNG [Key]
using System.ComponentModel.DataAnnotations.Schema;

namespace AnFoodAPI.Models
{
    public partial class ChiTietGioHang
    {
        [Key] // 👈 2. CHỈ ĐỊNH RÕ RÀNG ĐÂY LÀ KHÓA CHÍNH (Fix triệt để lỗi sập)
        public int MaChiTietGio { get; set; }

        public int? MaGioHang { get; set; }

        public int? MaMon { get; set; }

        public int? SoLuong { get; set; }

        // Khóa ngoại cho Giỏ Hàng
        [ForeignKey("MaGioHang")]
        [System.Text.Json.Serialization.JsonIgnore]
        public virtual GioHang? GioHang { get; set; }

        // Khóa ngoại cho Món Ăn
        [ForeignKey("MaMon")]
        public virtual MonAn? MonAn { get; set; }
    }
}