using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnFoodAPI.Models;

namespace AnFoodAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HinhAnhMonAnController : ControllerBase
    {
        private readonly AnshopDbContext _context;

        public HinhAnhMonAnController(AnshopDbContext context)
        {
            _context = context;
        }

        [HttpGet("{maMon}")]
        public async Task<IActionResult> GetHinhAnhsByMonAn(int maMon)
        {
            // Truy vấn danh sách hình ảnh của món ăn dựa trên maMon
            var hinhAnhs = await _context.HinhAnhMonAns
                .Where(h => h.MaMon == maMon)
                .Select(h => h.DuongDan)
                .ToListAsync();

            // Kiểm tra nếu không có hình ảnh nào
            if (hinhAnhs == null || !hinhAnhs.Any())
            {
                return NotFound(new { message = "Không tìm thấy hình ảnh cho món ăn này." });
            }

            return Ok(hinhAnhs);
        }
    }
}