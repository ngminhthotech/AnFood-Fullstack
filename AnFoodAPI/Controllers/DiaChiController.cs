using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnFoodAPI.Models;

namespace AnFoodAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DiaChiController : ControllerBase
    {
        private readonly AnshopDbContext _context;

        public DiaChiController(AnshopDbContext context)
        {
            _context = context;
        }

        // 1. Lấy danh sách địa chỉ của User
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUserId(int userId)
        {
            var list = await _context.DiaChiGiaoHangs
                .Where(d => d.MaNguoiDung == userId)
                .OrderByDescending(d => d.MacDinh) // Địa chỉ mặc định lên đầu
                .ToListAsync();
            return Ok(list);
        }

        // 2. Thêm địa chỉ mới
        [HttpPost]
        public async Task<IActionResult> Create(DiaChiGiaoHang model)
        {
            // Nếu đây là địa chỉ đầu tiên, tự động set mặc định
            if (!_context.DiaChiGiaoHangs.Any(d => d.MaNguoiDung == model.MaNguoiDung))
            {
                model.MacDinh = true;
            }

            model.NgayTao = DateTime.Now;
            _context.DiaChiGiaoHangs.Add(model);
            await _context.SaveChangesAsync();
            return Ok(model);
        }

        // 3. Xóa địa chỉ
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.DiaChiGiaoHangs.FindAsync(id);
            if (item == null) return NotFound();

            _context.DiaChiGiaoHangs.Remove(item);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa địa chỉ" });
        }

        // 4. Thiết lập địa chỉ mặc định
        [HttpPut("SetDefault/{id}/{userId}")]
        public async Task<IActionResult> SetDefault(int id, int userId)
        {
            var all = await _context.DiaChiGiaoHangs.Where(d => d.MaNguoiDung == userId).ToListAsync();
            foreach (var item in all)
            {
                item.MacDinh = (item.MaDiaChi == id); // Chỉ địa chỉ được chọn mới là True
            }
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã đặt làm địa chỉ mặc định" });
        }
    }
}