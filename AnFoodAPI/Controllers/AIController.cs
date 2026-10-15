using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using AnFoodAPI.Models;
using AnFoodAPI.Services;

namespace AnFoodAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AIController : ControllerBase
    {
        private readonly AnshopDbContext _context;
        private readonly IRecommendationService _aiService;

        public AIController(AnshopDbContext context, IRecommendationService aiService)
        {
            _context = context;
            _aiService = aiService;
        }

        [HttpPost("Train")]
        public async Task<IActionResult> TrainAIModel()
        {
            // Lấy data có sẵn từ DB (Chỉ lấy dữ liệu của user đã đăng nhập để học cho chuẩn)
            var trainingData = await _context.AiLichSuHanhVis
                                             .Where(x => x.MaNguoiDung != null)
                                             .ToListAsync();

            if (trainingData.Count < 10)
            {
                return BadRequest(new { success = false, message = $"Chưa đủ dữ liệu để AI học. Hiện có {trainingData.Count} dòng, cần tối thiểu 10 dòng." });
            }

            // Kích hoạt học
            string resultMessage = _aiService.TrainModel(trainingData);

            if (resultMessage.Contains("thành công"))
            {
                return Ok(new { success = true, message = resultMessage, totalDataLearned = trainingData.Count });
            }
            
            return StatusCode(500, new { success = false, message = resultMessage });
        }

        [HttpGet("TestPredict")]
        public IActionResult TestPredictScore(int userId, int productId)
        {
            float predictedScore = _aiService.PredictScore(userId, productId);

            return Ok(new 
            { 
                success = true, 
                user_id = userId,
                product_id = productId,
                predicted_score = predictedScore
            });
        }
    }
}