using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnFoodAPI.Models;
using System.Threading.Tasks;
using System;
using System.Linq; // Nhớ thêm using Linq để dùng Select, OrderBy

namespace AnFoodAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class YeuThichController : ControllerBase
    {
        private readonly AnshopDbContext _context;

        public YeuThichController(AnshopDbContext context)
        {
            _context = context;
        }

        // 1. Kiểm tra trạng thái khi tải trang
        [HttpGet("Check")]
        public async Task<IActionResult> CheckFavorite([FromQuery] int maNguoiDung, [FromQuery] int maMon)
        {
            if (maNguoiDung <= 0 || maMon <= 0) return BadRequest("Dữ liệu không hợp lệ.");

            var exists = await _context.YeuThiches
                .AnyAsync(y => y.MaNguoiDung == maNguoiDung && y.MaMon == maMon);
            
            return Ok(new { isFavorite = exists });
        }

        // 2. Bật/Tắt Yêu thích (Toggle)
        [HttpPost("Toggle")]
        public async Task<IActionResult> ToggleFavorite([FromBody] YeuThichRequest req)
        {
            if (req.MaNguoiDung <= 0 || req.MaMon <= 0) return BadRequest("Dữ liệu không hợp lệ.");

            // Tìm xem đã thích chưa
            var existing = await _context.YeuThiches
                .FirstOrDefaultAsync(y => y.MaNguoiDung == req.MaNguoiDung && y.MaMon == req.MaMon);

            if (existing != null)
            {
                // Đã thích -> Hủy
                _context.YeuThiches.Remove(existing);
                await _context.SaveChangesAsync();
                return Ok(new { isFavorite = false, message = "Đã bỏ thích món ăn 💔" });
            }
            else
            {
                // Chưa thích -> Thêm
                var newFav = new YeuThich 
                { 
                    MaNguoiDung = req.MaNguoiDung, 
                    MaMon = req.MaMon, 
                    NgayTao = DateTime.Now 
                };
                _context.YeuThiches.Add(newFav);
                await _context.SaveChangesAsync();
                return Ok(new { isFavorite = true, message = "Đã thêm vào yêu thích ❤️" });
            }
        }

        // =========================================================
        // 3. LẤY DANH SÁCH YÊU THÍCH CỦA 1 NGƯỜI DÙNG (API MỚI)
        // =========================================================
        [HttpGet("User/{maNguoiDung}")]
        public async Task<IActionResult> GetFavoritesByUser(int maNguoiDung)
        {
            if (maNguoiDung <= 0) return BadRequest("Dữ liệu không hợp lệ.");

            var favorites = await _context.YeuThiches
                .Where(y => y.MaNguoiDung == maNguoiDung)
                .Include(y => y.MaMonNavigation) // Kéo theo thông tin món ăn
                    .ThenInclude(m => m.HinhAnhMonAns) // Kéo theo hình ảnh chi tiết
                .OrderByDescending(y => y.NgayTao) // Mới thích ưu tiên xếp lên đầu
                .Select(y => new 
                {
                    MaYeuThich = y.MaYeuThich,
                    MaMon = y.MaMonNavigation.MaMon,
                    TenMon = y.MaMonNavigation.TenMon,
                    GiaBan = y.MaMonNavigation.Gia,
                    MoTa = y.MaMonNavigation.MoTa,
                    // Xử lý lấy ảnh thông minh (có ảnh đại diện thì lấy, không thì lấy ảnh đầu tiên trong thư viện)
                    HinhAnh = !string.IsNullOrEmpty(y.MaMonNavigation.HinhAnh) 
                                ? y.MaMonNavigation.HinhAnh 
                                : y.MaMonNavigation.HinhAnhMonAns.Select(h => h.DuongDan).FirstOrDefault()
                })
                .ToListAsync();

            return Ok(favorites);
        }
    }

    public class YeuThichRequest
    {
        public int MaNguoiDung { get; set; }
        public int MaMon { get; set; }
    }
}