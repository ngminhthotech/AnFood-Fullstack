using AnFoodAPI.Models; // 👈 Đã sửa thành tên Project của bạn
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace AnFoodAPI.Controllers // 👈 Đã sửa thành AnFoodAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LienHeController : ControllerBase
    {
        private readonly AnshopDbContext _context; // Giữ nguyên tên class DbContext của bạn

        public LienHeController(AnshopDbContext context)
        {
            _context = context;
        }

        // POST: api/LienHe
        [HttpPost]
        public async Task<ActionResult<LienHe>> GuiLienHe(LienHe lienHe)
        {
            try
            {
                // Gán giá trị mặc định server-side
                lienHe.NgayGui = DateTime.Now;
                lienHe.DaPhanHoi = false;

                _context.LienHes.Add(lienHe);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Gửi liên hệ thành công!", data = lienHe });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi gửi liên hệ: " + ex.Message });
            }
        }



        [HttpGet]
        public async Task<ActionResult<IEnumerable<LienHe>>> LayDanhSachLienHe()
        {
            return await _context.LienHes.OrderByDescending(x => x.NgayGui).ToListAsync();
        }

        // 👇 (Tùy chọn) API Đánh dấu đã phản hồi
        [HttpPut("{id}")]
        public async Task<IActionResult> DanhDauDaPhanHoi(int id)
        {
            var lh = await _context.LienHes.FindAsync(id);
            if (lh == null) return NotFound();

            lh.DaPhanHoi = !lh.DaPhanHoi; // Đảo ngược trạng thái
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật trạng thái thành công!" });
        }

    }
}