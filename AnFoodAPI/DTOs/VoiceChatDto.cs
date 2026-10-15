namespace AnFoodAPI.DTOs
{
    public class VoiceChatRequest
    {
        public int? MaNguoiDung { get; set; }
        public string UserText { get; set; } // Lời nói của khách đã dịch thành text
    }

    public class VoiceChatResponse
    {
        public string AiText { get; set; } // Câu trả lời của AI
    }

    /// <summary>
    /// Nội dung được chuyển thành MP3. Chỉ frontend FastBite gọi endpoint này sau khi nhận AiText.
    /// </summary>
    public class VoiceSynthesisRequest
    {
        public string Text { get; set; }
    }
}
