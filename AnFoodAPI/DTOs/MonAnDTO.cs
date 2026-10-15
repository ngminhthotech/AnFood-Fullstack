using System;
using System.Collections.Generic;
using AnFoodAPI.Models;

namespace AnFoodAPI.DTOs
{
    public class MonAnDTO
    {
        public int MaMon { get; set; }
        public string TenMon { get; set; } = null!;
        public decimal? GiaBan { get; set; } 
        public decimal? GiaVon { get; set; }
        public string? MoTa { get; set; }
        public string? HinhAnh { get; set; }
        public int? SoLuong { get; set; } // Map từ TonKho
        public int? MaDanhMuc { get; set; } 
        public string? TenDanhMuc { get; set; } 
        public DateTime? NgayHetHan { get; set; }
        public int DaBan { get; set; }
        public List<HinhAnhMonAn> HinhAnhMonAns { get; set; } = new List<HinhAnhMonAn>();
        public double DiemDanhGia { get; set; }
    }
}