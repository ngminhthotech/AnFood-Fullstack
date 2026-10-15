using AnFoodAPI.Controllers; // Để dùng được class PaymentRequest
// Nếu PaymentRequest bạn để ở namespace khác (ví dụ AnFoodAPI.DTOs) thì nhớ using vào nhé

namespace AnFoodAPI.Services
{
    // 1. Tạo thực đơn (Interface)
    public interface IVnPayService
    {
        string CreatePaymentUrl(PaymentRequest model, HttpContext context);
    }

    // 2. Tạo đầu bếp chính (Service)
    public class VnPayService : IVnPayService
    {
        private readonly IConfiguration _configuration;

        public VnPayService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string CreatePaymentUrl(PaymentRequest model, HttpContext context)
        {
            var timeNow = DateTime.Now;
            var vnpay = new VnPayLibrary(); // Gọi thư viện tính toán

            // 👇 Lấy nguyên liệu từ kho (appsettings.json)
            string vnp_TmnCode = _configuration["VnPay:TmnCode"];
            string vnp_HashSecret = _configuration["VnPay:HashSecret"];
            string vnp_BaseUrl = _configuration["VnPay:BaseUrl"];
            string vnp_ReturnUrl = _configuration["VnPay:ReturnUrl"];

            // 👇 Chế biến món ăn (Tạo dữ liệu gửi đi)
            vnpay.AddRequestData("vnp_Version", "2.1.0");
            vnpay.AddRequestData("vnp_Command", "pay");
            vnpay.AddRequestData("vnp_TmnCode", vnp_TmnCode);
            vnpay.AddRequestData("vnp_Amount", ((long)model.Amount * 100).ToString()); // Nhân 100 theo quy tắc
            vnpay.AddRequestData("vnp_CreateDate", timeNow.ToString("yyyyMMddHHmmss"));
            vnpay.AddRequestData("vnp_CurrCode", "VND");

            // Lấy IP thật của khách (Pro hơn hardcode 127.0.0.1)
            var ipAddress = PaymentHelper.GetIpAddress(context); // 👈 Đổi Utils thành PaymentHelper
            vnpay.AddRequestData("vnp_IpAddr", ipAddress);

            vnpay.AddRequestData("vnp_Locale", "vn");
            vnpay.AddRequestData("vnp_OrderInfo", "Thanh toan don hang " + model.OrderId);
            vnpay.AddRequestData("vnp_OrderType", "other");
            vnpay.AddRequestData("vnp_ReturnUrl", vnp_ReturnUrl);
            vnpay.AddRequestData("vnp_TxnRef", model.OrderId);

            // Trả về món ăn hoàn chỉnh (URL thanh toán)
            return vnpay.CreateRequestUrl(vnp_BaseUrl, vnp_HashSecret);
        }
    }
    // 👇 Tạo class tên riêng để không bị trùng với Utils cũ của bạn
    public static class PaymentHelper
    {
        public static string GetIpAddress(HttpContext context)
        {
            var ipAddress = string.Empty;
            try
            {
                var remoteIpAddress = context.Connection.RemoteIpAddress;
                if (remoteIpAddress != null)
                {
                    if (remoteIpAddress.AddressFamily == System.Net.Sockets.AddressFamily.InterNetworkV6)
                    {
                        remoteIpAddress = System.Net.Dns.GetHostEntry(remoteIpAddress).AddressList
                            .FirstOrDefault(x => x.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork);
                    }
                    ipAddress = remoteIpAddress.ToString();
                }
            }
            catch (Exception ex)
            {
                return "127.0.0.1";
            }
            return ipAddress;
        }
    }

}