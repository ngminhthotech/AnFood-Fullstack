using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using AnFoodAPI.Services;
using AnFoodAPI.DTOs;

namespace AnFoodAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WardAssistantController : ControllerBase
    {
        private readonly IChatbotService _chatbotService;

        public WardAssistantController(IChatbotService chatbotService)
        {
            _chatbotService = chatbotService;
        }

        [HttpPost("ask")]
        public async Task<IActionResult> AskQuestion([FromBody] WardApiRequest req)
        {
            // 1. Chặn lỗi nếu quản lý gửi message rỗng
            if (req == null || string.IsNullOrWhiteSpace(req.Message))
            {
                return Ok(new 
                { 
                    success = false, 
                    data = (object)null, 
                    message = "Nội dung câu hỏi không được để trống" 
                });
            }

            try
            {
                // 2. Mượn tạm Service của FastBite để lấy câu trả lời (Truyền null cho ID người dùng vì khách vãng lai)
                AiResponseDto aiResult = await _chatbotService.LayPhanHoiTuAiAsync(null, req.Message);

                // 3. Trả về đúng format bọc trong success/data/message
                return Ok(new 
                {
                    success = true,
                    data = new {
                        aiText = aiResult.message // Chỉ lấy câu trả lời text
                    },
                    message = "Lấy thông tin thành công"
                });
            }
            catch (Exception ex)
            {
                // 4. Báo lỗi chuẩn format
                return StatusCode(500, new 
                { 
                    success = false, 
                    data = (object)null, 
                    message = $"Máy chủ đang bận: {ex.Message}" 
                });
            }
        }
    }
}