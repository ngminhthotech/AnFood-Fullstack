using System.Collections.Generic;

namespace AnFoodAPI.DTOs
{
    // Class phụ để hứng món ăn cần thêm tự động
    public class CartActionItem 
    {
        public int productId { get; set; }
        public int quantity { get; set; }
    }

    public class AiResponseDto
    {
        public string message { get; set; } 
        public List<int> suggestedProductIds { get; set; } = new List<int>();
        
        // 👉 TÍNH NĂNG MỚI: Mảng chứa các món AI ra lệnh thêm vào giỏ
        public List<CartActionItem> autoAddItems { get; set; } = new List<CartActionItem>();
    }
}