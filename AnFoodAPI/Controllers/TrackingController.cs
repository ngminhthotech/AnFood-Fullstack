using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using AnFoodAPI.Models;

namespace AnFoodAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TrackingController : ControllerBase
    {
        private readonly AnshopDbContext _context;

        public TrackingController(AnshopDbContext context)
        {
            _context = context;
        }

        // POST: api/Tracking/Record
        // Giữ nguyên Endpoint này để Frontend cũ không bị lỗi
        [HttpPost("Record")]
        public async Task<IActionResult> RecordBehavior([FromBody] TrackingRequest request)
        {
            // Kiểm tra tính hợp lệ cơ bản
            if (request == null || request.MaMon <= 0 || string.IsNullOrEmpty(request.HanhVi))
            {
                // Trả về Ok() thay vì BadRequest để tránh đỏ màn hình Console của React
                return Ok(new { success = false, message = "Dữ liệu không hợp lệ hoặc thiếu thông tin." });
            }

            // 👉 BƯỚC NÂNG CẤP LÕI: QUY ĐỔI HÀNH VI RA ĐIỂM CHO ML.NET HỌC
            float diem = 0;
            string hanhViLower = request.HanhVi.ToLower();

            // Xử lý bao quát các từ khóa hành vi từ Frontend bắn lên
            if (hanhViLower == "view" || hanhViLower == "xem") 
                diem = 1.0f; // Xem món: 1 điểm
            else if (hanhViLower == "cart" || hanhViLower == "addtocart" || hanhViLower == "them_gio") 
                diem = 3.0f; // Thêm vào giỏ hàng: 3 điểm
            else if (hanhViLower == "purchase" || hanhViLower == "mua") 
                diem = 5.0f; // Chốt đơn: 5 điểm
            else 
                diem = 0.5f;

            try
            {
                // 👉 LƯU VÀO BẢNG CHUYÊN DỤNG CHO AI (AiLichSuHanhVi)
                var trackingRecord = new AiLichSuHanhVi
                {
                    // Nếu MaNguoiDung = 0 hoặc null thì lưu null (khách vãng lai)
                    MaNguoiDung = request.MaNguoiDung > 0 ? request.MaNguoiDung : null,
                    MaMon = request.MaMon,
                    LoaiHanhVi = hanhViLower,
                    DiemHanhVi = diem, // Cột quan trọng nhất để train Model
                    NgayTao = DateTime.Now
                };

                _context.AiLichSuHanhVis.Add(trackingRecord);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Đã ghi nhận hành vi cho AI học." });
            }
            catch (Exception ex)
            {
                // 👉 IN LỖI RA TERMINAL ĐỂ DEVELOPER DỄ DEBUG
                Console.WriteLine("\n=== [CẢNH BÁO LỖI TRACKING AI] ===");
                Console.WriteLine("Lỗi: " + ex.Message);
                if (ex.InnerException != null) Console.WriteLine("Chi tiết: " + ex.InnerException.Message);
                Console.WriteLine("===============================\n");

                return Ok(new { success = false, message = "Lỗi ghi nhận ngầm: " + ex.Message });
            }
        }
    }

    // Class nhận dữ liệu từ ReactJS gửi lên
    public class TrackingRequest
    {
        public int? MaNguoiDung { get; set; }
        public int MaMon { get; set; }
        public string HanhVi { get; set; }
    }
}