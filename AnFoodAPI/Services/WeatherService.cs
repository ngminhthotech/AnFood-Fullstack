using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace AnFoodAPI.Services
{
    public interface IWeatherService
    {
        Task<string> GetCurrentWeatherAsync(double lat, double lon);
    }

    public class WeatherService : IWeatherService
    {
        private readonly HttpClient _httpClient;
        // 👉 Đăng ký 1 tài khoản free trên openweathermap.org để lấy Key. 
        // Tạm thời mình để một key demo, sếp nên thay bằng key của sếp sau.
        private readonly string _apiKey = "b6907d289e10d714a6e88b30761fae22"; 

        public WeatherService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<string> GetCurrentWeatherAsync(double lat, double lon)
        {
            try
            {
                // Gọi API lấy thời tiết theo tọa độ
                string url = $"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={_apiKey}&units=metric";
                
                var response = await _httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode) return "Clear"; // Fallback mặc định nếu lỗi

                string jsonResult = await response.Content.ReadAsStringAsync();
                
                using JsonDocument doc = JsonDocument.Parse(jsonResult);
                
                // Lấy ra trạng thái thời tiết chính (Rain, Clear, Clouds, Thunderstorm...)
                string mainWeather = doc.RootElement
                                        .GetProperty("weather")[0]
                                        .GetProperty("main").GetString();

                // Kiểm tra nhiệt độ (nếu nắng nhưng quá nóng)
                double temp = doc.RootElement.GetProperty("main").GetProperty("temp").GetDouble();
                if (mainWeather == "Clear" && temp >= 33.0)
                {
                    return "Hot"; 
                }

                return mainWeather;
            }
            catch (Exception)
            {
                // Nếu không có mạng hoặc lỗi, mặc định là trời Quang đãng
                return "Clear";
            }
        }
    }
}