namespace AnFoodAPI.DTOs // Nếu sếp để trong Models thì đổi thành AnFoodAPI.Models
{
    public class DanhGiaRequest
    {
        public int MaMon { get; set; }
        public int SoSao { get; set; }
        public string NhanXet { get; set; }
    }
}