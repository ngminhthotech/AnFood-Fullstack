using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnFoodAPI.Models;

namespace AnFoodAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuangCaoController : ControllerBase
    {
        private readonly AnshopDbContext _context;
        private readonly IWebHostEnvironment _env;

        public QuangCaoController(AnshopDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // --- HÀM HỖ TRỢ LƯU ẢNH ---
        private async Task<string> SaveImage(IFormFile imageFile)
        {
            // Tạo tên file độc nhất
            string fileName = Path.GetFileNameWithoutExtension(imageFile.FileName);
            string extension = Path.GetExtension(imageFile.FileName);
            string newFileName = $"{fileName}_{DateTime.Now.Ticks}{extension}";

            // Đường dẫn lưu: wwwroot/images/banners
            string path = Path.Combine(_env.WebRootPath, "images", "banners");
            if (!Directory.Exists(path)) Directory.CreateDirectory(path);

            string filePath = Path.Combine(path, newFileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(stream);
            }

            // Trả về đường dẫn tương đối để lưu vào DB
            return $"/images/banners/{newFileName}";
        }

        // 1. LẤY TẤT CẢ DANH SÁCH BANNER
        [HttpGet]
        public async Task<ActionResult<IEnumerable<QuangCao>>> GetQuangCaos()
        {
            return await _context.QuangCaos.OrderByDescending(q => q.MaQuangCao).ToListAsync();
        }

        // 2. LẤY BANNER ĐANG KÍCH HOẠT (Dùng cho trang chủ/menu)
        [HttpGet("Active")]
        public async Task<ActionResult<IEnumerable<QuangCao>>> GetActiveBanners()
        {
            return await _context.QuangCaos.Where(q => q.KichHoat == true).ToListAsync();
        }

        // 3. THÊM MỚI BANNER
        [HttpPost]
        public async Task<ActionResult<QuangCao>> PostQuangCao([FromForm] QuangCao quangCao, IFormFile? imageFile)
        {
            // Xử lý ảnh nếu có upload
            if (imageFile != null)
            {
                quangCao.HinhAnh = await SaveImage(imageFile);
            }

            // Lưu vào database
            _context.QuangCaos.Add(quangCao);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetQuangCaos", new { id = quangCao.MaQuangCao }, quangCao);
        }

        // 4. CẬP NHẬT BANNER (ĐÃ SỬA LỖI THIẾU DỮ LIỆU)
        [HttpPut("{id}")]
        public async Task<IActionResult> PutQuangCao(int id, [FromForm] QuangCao quangCao, IFormFile? imageFile)
        {
            if (id != quangCao.MaQuangCao)
            {
                return BadRequest();
            }

            var existingBanner = await _context.QuangCaos.FindAsync(id);
            if (existingBanner == null)
            {
                return NotFound();
            }

            // --- CẬP NHẬT THÔNG TIN ---
            existingBanner.TieuDe = quangCao.TieuDe;
            existingBanner.MoTa = quangCao.MoTa;
            existingBanner.PhanTramGiam = quangCao.PhanTramGiam;
            existingBanner.KichHoat = quangCao.KichHoat;

            // 👇 QUAN TRỌNG: Cập nhật liên kết Món hoặc Danh mục (Code cũ bị thiếu đoạn này)
            existingBanner.MaMon = quangCao.MaMon;
            existingBanner.MaDanhMuc = quangCao.MaDanhMuc;

            // Xử lý ảnh mới nếu có
            if (imageFile != null)
            {
                existingBanner.HinhAnh = await SaveImage(imageFile);
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.QuangCaos.Any(e => e.MaQuangCao == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(new { message = "Cập nhật thành công!" });
        }

        // 5. XÓA BANNER
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuangCao(int id)
        {
            var quangCao = await _context.QuangCaos.FindAsync(id);
            if (quangCao == null)
            {
                return NotFound();
            }

            _context.QuangCaos.Remove(quangCao);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa banner!" });
        }
    }
}