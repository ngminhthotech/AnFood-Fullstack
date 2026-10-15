using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnFoodAPI.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AnFoodAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DanhMucController : ControllerBase
    {
        private readonly AnshopDbContext _context;

        public DanhMucController(AnshopDbContext context)
        {
            _context = context;
        }

        // 1. LẤY DANH SÁCH (Lấy cả xóa mềm để Admin quản lý)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DanhMuc>>> GetDanhMucs()
        {
            // Lấy tất cả để hiển thị trên Admin (Frontend sẽ tự lọc hoặc hiển thị mờ)
            return await _context.DanhMucs.ToListAsync();
        }

        // 2. LẤY 1 MỤC CHI TIẾT
        [HttpGet("{id}")]
        public async Task<ActionResult<DanhMuc>> GetDanhMuc(int id)
        {
            var danhMuc = await _context.DanhMucs.FindAsync(id);

            if (danhMuc == null)
            {
                return NotFound();
            }

            return danhMuc;
        }

        // 3. THÊM MỚI
        [HttpPost]
        public async Task<ActionResult<DanhMuc>> PostDanhMuc(DanhMuc danhMuc)
        {
            // Khởi tạo các list quan hệ rỗng
            danhMuc.MonAns = new List<MonAn>();
            danhMuc.QuyTacThoiGians = new List<QuyTacThoiGian>();
            danhMuc.IsDeleted = false; // Mặc định chưa xóa

            _context.DanhMucs.Add(danhMuc);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetDanhMuc", new { id = danhMuc.MaDanhMuc }, danhMuc);
        }

        // 4. CẬP NHẬT
        [HttpPut("{id}")]
        public async Task<IActionResult> PutDanhMuc(int id, DanhMuc danhMuc)
        {
            if (id != danhMuc.MaDanhMuc)
            {
                return BadRequest("ID không khớp");
            }

            var existingDM = await _context.DanhMucs.FindAsync(id);
            if (existingDM == null) return NotFound();

            // Cập nhật thông tin (Chỉ cập nhật Tên và Mô tả, KHÔNG cập nhật HinhAnh vì DB không có)
            existingDM.TenDanhMuc = danhMuc.TenDanhMuc;
            existingDM.MoTa = danhMuc.MoTa;
            
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DanhMucExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // 5. XÓA MỀM (Soft Delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDanhMuc(int id)
        {
            var danhMuc = await _context.DanhMucs.FindAsync(id);
            if (danhMuc == null)
            {
                return NotFound();
            }

            // Đánh dấu là đã xóa
            danhMuc.IsDeleted = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa danh mục thành công (Dữ liệu được bảo lưu)." });
        }

        // 6. KHÔI PHỤC (Restore)
        [HttpPut("Restore/{id}")]
        public async Task<IActionResult> RestoreDanhMuc(int id)
        {
            var danhMuc = await _context.DanhMucs.FindAsync(id);
            if (danhMuc == null) return NotFound("Không tìm thấy danh mục");

            danhMuc.IsDeleted = false; // Sống lại
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã khôi phục danh mục thành công!" });
        }

        // 7. LẤY DANH SÁCH ĐÃ XÓA (Optional - API phụ)
        [HttpGet("RacThai")]
        public async Task<ActionResult<IEnumerable<DanhMuc>>> GetDeletedDanhMucs()
        {
            return await _context.DanhMucs.Where(d => d.IsDeleted).ToListAsync();
        }

        private bool DanhMucExists(int id)
        {
            return _context.DanhMucs.Any(e => e.MaDanhMuc == id);
        }
    }
}