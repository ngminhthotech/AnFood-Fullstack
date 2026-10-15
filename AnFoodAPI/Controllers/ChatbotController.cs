using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using AnFoodAPI.Models;
using AnFoodAPI.Services;
using AnFoodAPI.DTOs;

namespace AnFoodAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatbotController : ControllerBase
    {
        private readonly AnshopDbContext _context;
        private readonly IChatbotService _chatbotService;

        public ChatbotController(AnshopDbContext context, IChatbotService chatbotService)
        {
            _context = context;
            _chatbotService = chatbotService;
        }

        [HttpPost("SendMessage")]
        public async Task<IActionResult> SendMessage([FromBody] TinNhanRequest req)
        {
            try 
            {
                // 1. LƯU TIN NHẮN CỦA KHÁCH HÀNG
                var userMsg = new LichSuChat {
                    MaNguoiDung = req.MaNguoiDung, 
                    NoiDung = req.NoiDung,
                    NguoiGui = "User", 
                    ThoiGian = DateTime.Now
                };
                _context.LichSuChats.Add(userMsg);
                await _context.SaveChangesAsync(); // Lưu luôn để AI kịp đọc ở bước sau

                // 2. GỌI TRÍ TUỆ NHÂN TẠO (Nhận về Object chuẩn)
                AiResponseDto aiResult = await _chatbotService.LayPhanHoiTuAiAsync(req.MaNguoiDung, req.NoiDung);

                // 3. LƯU TIN NHẮN CỦA AI (Chỉ lưu phần văn bản, bỏ qua mảng ID)
                var botMsg = new LichSuChat {
                    MaNguoiDung = req.MaNguoiDung, 
                    NoiDung = string.IsNullOrWhiteSpace(aiResult.message) ? "Dạ FastBite đã nhận yêu cầu." : aiResult.message,
                    NguoiGui = "Bot", 
                    ThoiGian = DateTime.Now
                };
                _context.LichSuChats.Add(botMsg);
                await _context.SaveChangesAsync();

                // 4. TRẢ KẾT QUẢ VỀ FRONTEND (Framework sẽ tự động chuyển Object này thành JSON chuẩn)
                return Ok(aiResult);
            }
            catch (Exception ex)
            {
                // Bắt lỗi an toàn cấp Controller
                return StatusCode(500, new AiResponseDto { 
                    message = "Dạ máy chủ đang bận xử lý, anh/chị thử lại sau giây lát nha!",
                    suggestedProductIds = new System.Collections.Generic.List<int>()
                });
            }
        }
    }
}