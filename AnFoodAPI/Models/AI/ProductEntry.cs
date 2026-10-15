using Microsoft.ML.Data;

namespace AnFoodAPI.Models.AI
{
    public class ProductEntry
    {
        [LoadColumn(0)]
        public float UserId { get; set; }

        [LoadColumn(1)]
        public float ProductId { get; set; }

        [LoadColumn(2)]
        public float Label { get; set; } // Đây chính là Điểm hành vi
    }
}