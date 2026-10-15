using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace AnFoodAPI.DTOs
{
    public class TaoPhieuKhoRequest
    {
        [Required]
        public string LoaiPhieu { get; set; } = "NHAP"; // "NHAP" hoặc "XUAT"
        
        [Required]
        public int MaNguoiDung { get; set; }
        
        public string? GhiChu { get; set; }
        
        public decimal TongTien { get; set; }

        // Danh sách các món ăn nằm trong phiếu này
        [Required]
        public List<ChiTietPhieuRequest> DanhSachMon { get; set; } = new List<ChiTietPhieuRequest>();
    }

    public class ChiTietPhieuRequest
    {
        [Required]
        public int MaMon { get; set; }
        
        [Required]
        public int SoLuong { get; set; }
        
        public decimal DonGia { get; set; } // Giá nhập (nếu là phiếu NHẬP)
        
        public DateTime? NgayHetHan { get; set; } // Hạn sử dụng của lô này (chỉ dùng khi NHẬP)
    }
}