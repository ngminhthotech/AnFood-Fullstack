using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnFoodAPI.Models;
using AnFoodAPI.DTOs; // Sếp nhớ đảm bảo đã tạo DanhGiaRequest.cs trong DTOs
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace AnFoodAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DanhGiaController : ControllerBase
    {
        private readonly AnshopDbContext _context;

        public DanhGiaController(AnshopDbContext context)
        {
            _context = context;
        }

        // =============================================================
        // 1. LẤY TOÀN BỘ DANH SÁCH ĐÁNH GIÁ (KÈM TÊN NGƯỜI DÙNG)
        // =============================================================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetDanhGia()
        {
            // Kết nối bảng DanhGia với NguoiDung để lấy HoTen hiển thị ra Frontend
            var query = from d in _context.DanhGias
                        join u in _context.NguoiDungs on d.MaNguoiDung equals u.MaNguoiDung
                        orderby d.NgayDanhGia descending
                        select new
                        {
                            d.MaDanhGia,
                            d.MaMon,
                            d.MaNguoiDung,
                            d.SoSao,
                            d.NhanXet,
                            d.NgayDanhGia,
                            TenHienThi = u.HoTen // Lấy tên thật từ bảng NguoiDung
                        };

            return Ok(await query.ToListAsync());
        }

        // =============================================================
        // 2. LẤY DANH SÁCH ĐÁNH GIÁ THEO MÃ MÓN ĂN (TỐI ƯU HIỆU NĂNG)
        // =============================================================
        [HttpGet("MonAn/{maMon}")]
        public async Task<ActionResult<IEnumerable<object>>> GetDanhGiaByMonAn(int maMon)
        {
            var query = from d in _context.DanhGias
                        join u in _context.NguoiDungs on d.MaNguoiDung equals u.MaNguoiDung
                        where d.MaMon == maMon // Chỉ lấy đánh giá của món khách đang xem
                        orderby d.NgayDanhGia descending
                        select new
                        {
                            d.MaDanhGia,
                            d.MaMon,
                            d.SoSao,
                            d.NhanXet,
                            d.NgayDanhGia,
                            TenHienThi = u.HoTen 
                        };

            return Ok(await query.ToListAsync());
        }

        // =============================================================
        // 3. THÊM ĐÁNH GIÁ MỚI (BẢO MẬT TOKEN & RÀNG BUỘC MUA HÀNG)
        // =============================================================
        [HttpPost]
        [Authorize] // 🔒 BẮT BUỘC PHẢI CÓ TOKEN (ĐÃ ĐĂNG NHẬP) MỚI ĐƯỢC VÀO
        public async Task<ActionResult<DanhGia>> PostDanhGia([FromBody] DanhGiaRequest req)
        {
            try
            {
                // 1. GIẢI MÃ TOKEN ĐỂ LẤY ID NGƯỜI DÙNG
                var userIdClaim = User.FindFirst("MaNguoiDung")?.Value 
                                  ?? User.FindFirst("Id")?.Value 
                                  ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return Unauthorized(new { message = "Token không hợp lệ hoặc đã hết hạn!" });
                }

                int userIdThat = int.Parse(userIdClaim);

                // 2. KIỂM TRA: KHÁCH HÀNG ĐÃ TỪNG MUA MÓN NÀY CHƯA?
                // Đơn hàng phải ở trạng thái "hoan_thanh" mới được tính
                var daMuaHang = await (from ct in _context.ChiTietDonHangs
                                       join dh in _context.DonHangs on ct.MaDonHang equals dh.MaDonHang
                                       where dh.MaNguoiDung == userIdThat 
                                          && ct.MaMon == req.MaMon
                                          && dh.TrangThai == "hoan_thanh" 
                                       select ct).AnyAsync();

                if (!daMuaHang)
                {
                    return BadRequest(new { message = "Bạn phải mua và nhận món ăn này thành công mới được đánh giá nha! 🛒" });
                }

                // 3. KIỂM TRA: KHÁCH HÀNG ĐÃ ĐÁNH GIÁ MÓN NÀY BAO GIỜ CHƯA?
                var daDanhGia = await _context.DanhGias
                    .AnyAsync(d => d.MaNguoiDung == userIdThat && d.MaMon == req.MaMon);
                
                if (daDanhGia)
                {
                     return BadRequest(new { message = "Bạn đã đánh giá món ăn này rồi!" });
                }

                // 4. TẠO ĐÁNH GIÁ MỚI VÀ GẮN ID THẬT
                var danhGiaMoi = new DanhGia
                {
                    MaNguoiDung = userIdThat, // Gắn ID thật lấy từ Token (chống giả mạo)
                    MaMon = req.MaMon,
                    SoSao = req.SoSao,
                    NhanXet = req.NhanXet,
                    NgayDanhGia = DateTime.Now
                };

                // 5. LƯU VÀO DATABASE
                _context.DanhGias.Add(danhGiaMoi);
                await _context.SaveChangesAsync();

                return CreatedAtAction("GetDanhGia", new { id = danhGiaMoi.MaDanhGia }, danhGiaMoi);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }
    }
}