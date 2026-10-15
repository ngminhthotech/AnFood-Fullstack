using AnFoodAPI.Controllers; // Chứa TaoDonRequest (Hoặc sếp có thể move DTO này sang thư mục DTOs)
using System.Threading.Tasks;

namespace AnFoodAPI.Services
{
    public interface IOrderService
    {
        // Trả về 1 Tuple chứa kết quả: Thành công hay không, Lời nhắn, Mã đơn hàng
        Task<(bool Success, string Message, int? MaDonHang)> CreateOrderAsync(TaoDonRequest req);
    }
}