using Microsoft.AspNetCore.Mvc;
using AnFoodAPI.Services;

namespace AnFoodAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IVnPayService _vnPayService;

        // Chỉ Inject VNPay Service (Bỏ Momo/VietQR)
        public PaymentController(IVnPayService vnPayService)
        {
            _vnPayService = vnPayService;
        }

        // ==========================================
        // 1. THANH TOÁN VNPAY (Giữ lại)
        // ==========================================
        [HttpPost("CreatePaymentUrl")]
        public IActionResult CreatePaymentUrl([FromBody] PaymentRequest model)
        {
            try
            {
                var url = _vnPayService.CreatePaymentUrl(model, HttpContext);
                return Ok(new { url = url });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi tạo link VNPay: " + ex.Message });
            }
        }
    }

    // Class dữ liệu đầu vào
    public class PaymentRequest
    {
        public string OrderId { get; set; }
        public decimal Amount { get; set; }
        public string? OrderInfo { get; set; }
        public string? FullName { get; set; }
    }
}