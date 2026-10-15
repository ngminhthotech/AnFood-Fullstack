using System;
using System.Threading;
using System.Threading.Tasks;
using AnFoodAPI.DTOs;
using AnFoodAPI.Models;
using AnFoodAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;


namespace AnFoodAPI.Controllers
{
    /// <summary>
    /// API chuyên cho luồng Speech-to-Text -> Gemini -> Text-to-Speech.
    /// Controller chỉ điều phối dữ liệu; toàn bộ nghiệp vụ AI nằm ở ChatbotService.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class VoiceBotController : ControllerBase
    {
        private const int MaxVoiceTextLength = 1000;
        private const int MaxSynthesisTextLength = 600;

        private readonly AnshopDbContext _context;
        private readonly IChatbotService _chatbotService;
        private readonly ITextToSpeechService _textToSpeechService;
        private readonly ILogger<VoiceBotController> _logger;

        public VoiceBotController(
            AnshopDbContext context,
            IChatbotService chatbotService,
            ITextToSpeechService textToSpeechService,
            ILogger<VoiceBotController> logger)
        {
            _context = context;
            _chatbotService = chatbotService;
            _textToSpeechService = textToSpeechService;
            _logger = logger;
        }

        /// <summary>
        /// Nhận văn bản do Web Speech API nhận diện và trả lại câu trả lời để frontend đọc bằng TTS.
        /// </summary>
        [HttpPost("ask")]
        [ProducesResponseType(typeof(VoiceChatResponse), 200)]
        public async Task<ActionResult<VoiceChatResponse>> Ask(
            [FromBody] VoiceChatRequest request,
            CancellationToken cancellationToken)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.UserText))
            {
                return BadRequest(new
                {
                    status = StatusCodes.Status400BadRequest,
                    message = "Không nhận được nội dung giọng nói."
                });
            }

            var userText = request.UserText.Trim();
            if (userText.Length > MaxVoiceTextLength)
            {
                return BadRequest(new
                {
                    status = StatusCodes.Status400BadRequest,
                    message = $"Nội dung giọng nói không được dài quá {MaxVoiceTextLength} ký tự."
                });
            }

            try
            {
                // Lưu trước để ChatbotService có thể lấy cả câu hỏi mới nhất trong 3 tin gần đây.
                _context.LichSuChats.Add(new LichSuChat
                {
                    MaNguoiDung = request.MaNguoiDung,
                    NoiDung = userText,
                    NguoiGui = "User",
                    ThoiGian = DateTime.UtcNow
                });
                await _context.SaveChangesAsync(cancellationToken);

                // Single Source of Truth: Controller không gọi HttpClient/Gemini trực tiếp.
                var aiResult = await _chatbotService.LayPhanHoiTuAiAsync(
                    request.MaNguoiDung,
                    userText);

                var aiText = aiResult?.message?.Trim();
                if (string.IsNullOrWhiteSpace(aiText))
                {
                    aiText = "Dạ, em chưa có câu trả lời phù hợp. Anh/chị thử nói lại giúp em nhé.";
                }

                // Lưu câu trả lời để hội thoại sau có đủ ngữ cảnh (đã được Service làm sạch giá).
                _context.LichSuChats.Add(new LichSuChat
                {
                    MaNguoiDung = request.MaNguoiDung,
                    NoiDung = aiText,
                    NguoiGui = "Bot",
                    ThoiGian = DateTime.UtcNow
                });
                await _context.SaveChangesAsync(cancellationToken);

                return Ok(new VoiceChatResponse { AiText = aiText });
            }
            catch (GeminiApiException ex)
            {
                // Giữ nguyên status (đặc biệt 429) để frontend hiển thị đúng lỗi quota.
                _logger.LogWarning(
                    ex,
                    "VoiceBot không gọi được Gemini. HTTP status: {StatusCode}",
                    ex.StatusCode);

                return StatusCode(ex.StatusCode, new
                {
                    status = ex.StatusCode,
                    message = ex.Message
                });
            }
            catch (OperationCanceledException)
            {
                return BadRequest(new
                {
                    status = StatusCodes.Status400BadRequest,
                    message = "Yêu cầu VoiceBot đã bị hủy."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi không xác định khi xử lý VoiceBot.");

                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    status = StatusCodes.Status500InternalServerError,
                    message = "Hệ thống đang gặp sự cố khi xử lý VoiceBot. Anh/chị vui lòng thử lại sau."
                });
            }
        }

        /// <summary>
        /// Chuyển AiText thành MP3 bằng Azure Speech (giọng Nữ HoaiMy Neural).
        /// Browser chỉ nhận audio; Azure key luôn được giữ kín ở Backend.
        /// </summary>
        [HttpPost("synthesize")]
        [Produces("audio/mpeg")]
        public async Task<IActionResult> Synthesize(
            [FromBody] VoiceSynthesisRequest request,
            CancellationToken cancellationToken)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Text))
            {
                return BadRequest(new
                {
                    status = StatusCodes.Status400BadRequest,
                    message = "Không nhận được nội dung để đọc."
                });
            }

            var text = request.Text.Trim();
            if (text.Length > MaxSynthesisTextLength)
            {
                return BadRequest(new
                {
                    status = StatusCodes.Status400BadRequest,
                    message = $"Nội dung đọc không được dài quá {MaxSynthesisTextLength} ký tự."
                });
            }

            try
            {
                var audioBytes = await _textToSpeechService
                    .SynthesizeVietnameseFemaleVoiceAsync(text, cancellationToken);

                return File(audioBytes, "audio/mpeg");
            }
            catch (TextToSpeechException ex)
            {
                _logger.LogWarning(ex, "VoiceBot TTS lỗi. HTTP status: {StatusCode}", ex.StatusCode);
                return StatusCode(ex.StatusCode, new
                {
                    status = ex.StatusCode,
                    message = ex.Message
                });
            }
            catch (OperationCanceledException)
            {
                return BadRequest(new
                {
                    status = StatusCodes.Status400BadRequest,
                    message = "Yêu cầu tạo giọng nói đã bị hủy."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi không xác định khi tạo giọng nói VoiceBot.");
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    status = StatusCodes.Status500InternalServerError,
                    message = "Không thể tạo giọng nói ở thời điểm này."
                });
            }
        }
    }
}
