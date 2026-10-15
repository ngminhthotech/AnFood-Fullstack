using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnFoodAPI.Models;
using AnFoodAPI.DTOs;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace AnFoodAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GioHangController : ControllerBase
    {
        private readonly AnshopDbContext _context;

        public GioHangController(AnshopDbContext context)
        {
            _context = context;
        }

        // =======================================================
        // 1. LẤY GIỎ HÀNG (ĐÃ FIX LỖI MẤT HÌNH ẢNH)
        // =======================================================
        [HttpGet("{maNguoiDung}")]
        public async Task<IActionResult> GetGioHang(int maNguoiDung)
        {
            try
            {
                // 🔥 BƯỚC 1: Lôi thẳng toàn bộ dữ liệu lên RAM bằng ToListAsync
                var gioHangs = await _context.GioHangs
                    .AsNoTracking()
                    .Include(g => g.ChiTietGioHangs)
                        .ThenInclude(ct => ct.MonAn)
                            .ThenInclude(m => m.HinhAnhMonAns)
                    .Where(g => g.MaNguoiDung == maNguoiDung)
                    .ToListAsync();

                var gioHang = gioHangs.FirstOrDefault();

                if (gioHang == null || !gioHang.ChiTietGioHangs.Any()) 
                    return Ok(new List<object>());

                // 🔥 BƯỚC 2: Cắt gọt và lấy ảnh chuẩn trên RAM
                var result = gioHang.ChiTietGioHangs.Select(ct => new
                {
                    maMon = ct.MaMon,
                    tenMon = ct.MonAn?.TenMon, 
                    gia = ct.MonAn?.Gia ?? 0,
                    // 👉 Đồng bộ logic lấy ảnh như MonAnController
                    hinhAnh = !string.IsNullOrEmpty(ct.MonAn?.HinhAnh) 
                                ? ct.MonAn.HinhAnh 
                                : (ct.MonAn?.HinhAnhMonAns?.FirstOrDefault()?.DuongDan ?? "https://placehold.co/100x100?text=Food"),
                    quantity = ct.SoLuong ?? 0
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi Server: " + ex.Message });
            }
        }

        // =======================================================
        // 2. THÊM VÀO GIỎ (ĐÃ FIX LỖI SỐ LƯỢNG NHẢY LOẠN XẠ)
        // =======================================================
        [HttpPost("Them")]
        public async Task<IActionResult> ThemVaoGio([FromBody] ThemVaoGioRequest req)
        {
            if (req == null || req.MaNguoiDung <= 0 || req.MaMon <= 0 || req.SoLuong <= 0)
                return BadRequest(new { success = false, message = "Dữ liệu gửi lên không hợp lệ." });

            try
            {
                var gioHang = await _context.GioHangs.FirstOrDefaultAsync(g => g.MaNguoiDung == req.MaNguoiDung);
                
                if (gioHang == null)
                {
                    gioHang = new GioHang { MaNguoiDung = req.MaNguoiDung, NgayTao = DateTime.Now };
                    _context.GioHangs.Add(gioHang);
                    await _context.SaveChangesAsync(); 
                }

                var chiTiet = await _context.ChiTietGioHangs
                    .FirstOrDefaultAsync(ct => ct.MaGioHang == gioHang.MaGioHang && ct.MaMon == req.MaMon);

                if (chiTiet != null) 
                {
                    // 🔥 FIX LỖI NHẢY SỐ LƯỢNG: Ghi đè số lượng người dùng gửi lên, KHÔNG CỘNG DỒN!
                    chiTiet.SoLuong = req.SoLuong; 
                    _context.ChiTietGioHangs.Update(chiTiet);
                }
                else
                {
                    chiTiet = new ChiTietGioHang { MaGioHang = gioHang.MaGioHang, MaMon = req.MaMon, SoLuong = req.SoLuong };
                    _context.ChiTietGioHangs.Add(chiTiet);
                }

                await _context.SaveChangesAsync();
                return Ok(new { success = true, message = "Cập nhật giỏ hàng thành công!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi Server: " + ex.Message });
            }
        }

        // =======================================================
        // 3. CẬP NHẬT SỐ LƯỢNG (+ / -)
        // =======================================================
        [HttpPost("CapNhat")]
        public async Task<IActionResult> CapNhatGioHang([FromBody] ThemVaoGioRequest req)
        {
            if (req == null || req.MaNguoiDung <= 0 || req.MaMon <= 0)
                return BadRequest(new { success = false, message = "Dữ liệu gửi lên không hợp lệ." });

            try
            {
                var chiTiet = await _context.ChiTietGioHangs
                    .Include(ct => ct.GioHang)
                    .FirstOrDefaultAsync(ct => ct.GioHang.MaNguoiDung == req.MaNguoiDung && ct.MaMon == req.MaMon);

                if (chiTiet == null) 
                    return NotFound(new { success = false, message = "Không tìm thấy món này trong giỏ hàng." });

                if (req.SoLuong <= 0) 
                {
                    _context.ChiTietGioHangs.Remove(chiTiet); 
                }
                else 
                {
                    chiTiet.SoLuong = req.SoLuong; 
                    _context.ChiTietGioHangs.Update(chiTiet);
                }

                await _context.SaveChangesAsync();
                return Ok(new { success = true, message = "Cập nhật số lượng thành công!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi Server: " + ex.Message });
            }
        }

        // =======================================================
        // 4. XÓA MÓN ĂN (NÚT THÙNG RÁC)
        // =======================================================
        [HttpDelete("Xoa/{maNguoiDung}/{maMon}")]
        public async Task<IActionResult> XoaMonKhoiGio(int maNguoiDung, int maMon)
        {
            try
            {
                var chiTiet = await _context.ChiTietGioHangs
                    .Include(ct => ct.GioHang)
                    .FirstOrDefaultAsync(ct => ct.GioHang.MaNguoiDung == maNguoiDung && ct.MaMon == maMon);

                if (chiTiet != null)
                {
                    _context.ChiTietGioHangs.Remove(chiTiet);
                    await _context.SaveChangesAsync();
                }
                
                return Ok(new { success = true, message = "Đã xóa món ăn khỏi giỏ." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi Server: " + ex.Message });
            }
        }
    }
}