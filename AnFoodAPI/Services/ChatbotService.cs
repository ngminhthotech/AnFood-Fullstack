using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using AnFoodAPI.DTOs;
using AnFoodAPI.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace AnFoodAPI.Services
{
    public interface IChatbotService
    {
        Task<AiResponseDto> LayPhanHoiTuAiAsync(int? maNguoiDung, string cauHoi);
    }

    public sealed class GeminiApiException : Exception
    {
        public int StatusCode { get; }

        public GeminiApiException(int statusCode, string message, Exception innerException = null)
            : base(message, innerException)
        {
            StatusCode = statusCode;
        }
    }

    public class ChatbotService : IChatbotService
    {
        private const string DefaultModel = "gemini-2.5-flash";
        private const int MaxAiMessageLength = 800;

        private static readonly CultureInfo VietnameseCulture = CultureInfo.GetCultureInfo("vi-VN");
        private static readonly Regex NumberInHistoryRegex = new Regex(@"\p{Nd}+(?:[.,]\p{Nd}+)*", RegexOptions.Compiled);
        private static readonly Regex UnsafeMoneyRegex = new Regex(@"(?i)(\d[\d.,\s]*\s*(đ|vnđ|vnd|đồng)|\b\p{L}+\s+(nghìn|triệu)\b)", RegexOptions.Compiled);
        private static readonly Regex PriceIntentRegex = new Regex(@"(?i)(giá|bao\s*nhiêu|mấy\s*tiền|mấy\s*đồng|bao\s*nhieu|gia\s*bao|thành\s*phần|có\s*những\s*gì)", RegexOptions.Compiled);

        private const string SystemInstruction = @"
Bạn là nhân viên tư vấn nhiệt tình, duyên dáng và chuyên nghiệp của cửa hàng FastBite. Luôn xưng ""em"" và gọi khách là ""anh/chị"".

Nhiệm vụ & Kỹ năng cốt lõi:
1. BÁO GIÁ & THÀNH PHẦN: Chỉ sử dụng thông tin từ [BẢNG GIÁ CHUẨN]. Báo giá rõ ràng (VD: 30.000 VNĐ) và có thể tư vấn thành phần món ăn nếu khách hỏi.
2. UP-SALE / CROSS-SELL (Bán chéo): Khi khách gọi đồ ăn (VD: Gà rán, Burger, Lạp xưởng), hãy khéo léo gợi ý thêm 1 loại đồ uống (Nước ngọt, Trà). Nếu khách gọi nước, hãy gợi ý thêm đồ ăn vặt.
3. BẺ LÁI KHI HẾT MÓN: Nếu khách hỏi món không có trong [BẢNG GIÁ CHUẨN], tuyệt đối KHÔNG bịa giá. Hãy xin lỗi nhẹ nhàng và chủ động gợi ý 1-2 món Best-Seller hoặc món có tính chất tương tự.
4. THÔNG TIN CHUNG CỦA FASTBITE: 
   - Giờ mở cửa: 08:00 sáng đến 22:00 tối các ngày trong tuần.
   - Phí giao hàng (Ship): Freeship cho đơn hàng từ 50.000đ trong bán kính 3km tại khu vực Cần Thơ. Các khu vực xa hơn phí ship là 15.000đ.
5. KHUYẾN MÃI: Chủ động áp dụng hoặc nhắc nhở khách về các chương trình trong [THÔNG TIN KHUYẾN MÃI].
6. TÁC PHONG: Câu văn ngắn gọn, nói chuyện tự nhiên như người thật, kết thúc câu có 'ạ' để thể hiện sự lễ phép. Tuyệt đối không dùng markdown (*, #).

Chỉ trả về đúng một JSON object, theo đúng cấu trúc:
{
  ""buoc_1_xac_dinh_mon"": ""Tên món chính khách hỏi (đúng y như trong thực đơn), hoặc rỗng nếu không xác định"",
  ""buoc_2_gia_tra_cuu"": 0,
  ""message"": ""Câu tư vấn chính thức của bạn (Bao gồm báo giá, gợi ý mua thêm, hoặc giải đáp thông tin)""
}

Lưu ý: buoc_2_gia_tra_cuu là số nguyên giá tiền của món chính. Nếu không có món, trả về 0.
";

        private readonly AnshopDbContext _context;
        private readonly IRecommendationService _recommendationService;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IReadOnlyList<string> _apiKeys;
        private readonly string _model;

        public ChatbotService(
            AnshopDbContext context,
            IRecommendationService recommendationService,
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration)
        {
            _context = context;
            _recommendationService = recommendationService;
            _httpClientFactory = httpClientFactory;

            var apiKeysText = Environment.GetEnvironmentVariable("GEMINI_API_KEYS")
                ?? configuration["GeminiAI:ApiKeys"]
                ?? configuration["GeminiAI:ApiKey"];

            _apiKeys = (apiKeysText ?? string.Empty)
                .Split(new[] { ',', ';', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(key => key.Trim().Trim('"', '\''))
                .Where(key => !string.IsNullOrWhiteSpace(key))
                .ToList();

            _model = (configuration["GeminiAI:Model"] ?? DefaultModel).Trim();
            if (string.IsNullOrWhiteSpace(_model))
            {
                _model = DefaultModel;
            }
        }

        public async Task<AiResponseDto> LayPhanHoiTuAiAsync(int? maNguoiDung, string cauHoi)
        {
            if (string.IsNullOrWhiteSpace(cauHoi))
            {
                return CreateResponse("Dạ, em chưa nhận được câu hỏi của anh/chị. Anh/chị nói lại giúp em nhé.", Array.Empty<int>());
            }

            var activeFoods = await _context.MonAns
                .AsNoTracking()
                .Where(food => food.TrangThai == "con_ban" && !food.IsDeleted)
                .OrderBy(food => food.TenMon)
                .ToListAsync();

            var officialMenu = activeFoods
                .Where(food => food.Gia.HasValue)
                .Select(food => new OfficialFood(food.MaMon, food.TenMon, RoundToWholeDong(food.Gia.Value), food.MoTa ?? "Đang cập nhật"))
                .ToList();

            var suggestedProductIds = GetSuggestedProductIds(activeFoods, maNguoiDung);

            if (officialMenu.Count == 0)
            {
                return CreateResponse("Dạ, thực đơn hiện chưa có món đang bán để em tra cứu. Anh/chị vui lòng thử lại sau ạ.", suggestedProductIds);
            }

            if (_apiKeys.Count == 0)
            {
                throw new GeminiApiException(StatusCodes.Status503ServiceUnavailable, "Gemini chưa được cấu hình API key. Hãy đặt biến GEMINI_API_KEYS hoặc GeminiAI:ApiKey.");
            }

            var standardPriceTable = BuildStandardPriceTable(officialMenu);
            var sanitizedHistory = await GetSanitizedHistoryAsync(maNguoiDung);
            
            var currentPromotions = "Giảm 10% cho đơn hàng trên 100.000 VNĐ (Nhập mã: FASTBITE10). Tặng kèm Trà Đào khi mua Combo Gà Rán.";

            var userContent = BuildUserContent(standardPriceTable, currentPromotions, sanitizedHistory, cauHoi);

            var aiAnswer = await GenerateGeminiAnswerAsync(userContent);
            var safeMessage = BuildVerifiedMessage(aiAnswer, officialMenu, cauHoi);

            return CreateResponse(safeMessage, suggestedProductIds);
        }

        private IReadOnlyList<int> GetSuggestedProductIds(IReadOnlyCollection<MonAn> activeFoods, int? maNguoiDung)
        {
            if (maNguoiDung.HasValue && maNguoiDung.Value > 0)
            {
                return activeFoods
                    .Select(food => new
                    {
                        food.MaMon,
                        Score = _recommendationService.PredictScore(maNguoiDung.Value, food.MaMon)
                    })
                    .OrderByDescending(item => item.Score)
                    .Take(5)
                    .Select(item => item.MaMon)
                    .ToList();
            }

            return activeFoods
                .OrderByDescending(food => food.BanChay ?? 0)
                .Take(5)
                .Select(food => food.MaMon)
                .ToList();
        }

        private static string BuildStandardPriceTable(IEnumerable<OfficialFood> foods)
        {
            var table = new StringBuilder();

            foreach (var food in foods)
            {
                table.Append($"- {food.Name}: {FormatVietnameseMoney(food.Price)} (Thành phần: {food.Description})").AppendLine();
            }

            return table.ToString().TrimEnd();
        }

        private async Task<string> GetSanitizedHistoryAsync(int? maNguoiDung)
        {
            if (!maNguoiDung.HasValue || maNguoiDung.Value <= 0)
            {
                return "(Khách vãng lai chưa có lịch sử.)";
            }

            var latestHistory = await _context.LichSuChats
                .AsNoTracking()
                .Where(item => item.MaNguoiDung == maNguoiDung.Value)
                .OrderByDescending(item => item.ThoiGian)
                .Take(3)
                .ToListAsync();

            latestHistory.Reverse();

            if (latestHistory.Count == 0)
            {
                return "(Chưa có lịch sử.)";
            }

            return string.Join(
                Environment.NewLine,
                latestHistory.Select(item =>
                {
                    var sender = string.Equals(item.NguoiGui, "Bot", StringComparison.OrdinalIgnoreCase)
                        ? "FastBite"
                        : "Khách";
                    var content = NumberInHistoryRegex.Replace(item.NoiDung ?? string.Empty, "[GIÁ_TIỀN]");

                    return sender + ": " + content;
                }));
        }

        private static string BuildUserContent(string standardPriceTable, string promotions, string sanitizedHistory, string userQuestion)
        {
            return new StringBuilder()
                .AppendLine("[BẢNG GIÁ VÀ THÀNH PHẦN MÓN ĂN - DỮ LIỆU DB]")
                .AppendLine(standardPriceTable)
                .AppendLine()
                .AppendLine("[THÔNG TIN KHUYẾN MÃI HÔM NAY]")
                .AppendLine(promotions)
                .AppendLine()
                .AppendLine("[3 TIN LỊCH SỬ GẦN NHẤT]")
                .AppendLine(sanitizedHistory)
                .AppendLine()
                .AppendLine("[CÂU HỎI HIỆN TẠI CỦA KHÁCH]")
                .AppendLine(userQuestion.Trim())
                .ToString();
        }

        private async Task<GeminiStructuredAnswer> GenerateGeminiAnswerAsync(string userContent)
        {
            GeminiApiException lastQuotaException = null;

            foreach (var apiKey in _apiKeys)
            {
                var client = _httpClientFactory.CreateClient();
                client.Timeout = TimeSpan.FromSeconds(45);

                var requestPayload = new
                {
                    system_instruction = new
                    {
                        parts = new[]
                        {
                            new { text = SystemInstruction }
                        }
                    },
                    contents = new[]
                    {
                        new
                        {
                            role = "user",
                            parts = new[]
                            {
                                new { text = userContent }
                            }
                        }
                    },
                    generationConfig = new
                    {
                        temperature = 0.4,
                        responseMimeType = "application/json"
                    }
                };

                var jsonOptions = new JsonSerializerOptions
                {
                    Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
                };
                var requestJson = JsonSerializer.Serialize(requestPayload, jsonOptions);
                var endpoint = "https://generativelanguage.googleapis.com/v1beta/models/"
                    + Uri.EscapeDataString(_model)
                    + ":generateContent";

                try
                {
                    using var request = new HttpRequestMessage(HttpMethod.Post, endpoint)
                    {
                        Content = new StringContent(requestJson, Encoding.UTF8, "application/json")
                    };
                    request.Headers.TryAddWithoutValidation("x-goog-api-key", apiKey);

                    using var response = await client.SendAsync(request);
                    var responseBody = await response.Content.ReadAsStringAsync();

                    if (response.StatusCode == HttpStatusCode.TooManyRequests)
                    {
                        lastQuotaException = new GeminiApiException(
                            StatusCodes.Status429TooManyRequests,
                            "Quota Exceeded (429): " + ExtractProviderError(responseBody));
                        continue;
                    }

                    if (!response.IsSuccessStatusCode)
                    {
                        throw new GeminiApiException(
                            (int)response.StatusCode,
                            "Gemini HTTP " + (int)response.StatusCode + ": " + ExtractProviderError(responseBody));
                    }

                    return ParseGeminiAnswer(responseBody);
                }
                catch (GeminiApiException)
                {
                    throw;
                }
                catch (TaskCanceledException ex)
                {
                    throw new GeminiApiException(
                        StatusCodes.Status504GatewayTimeout,
                        "Gemini hết thời gian phản hồi (504).",
                        ex);
                }
                catch (HttpRequestException ex)
                {
                    throw new GeminiApiException(
                        StatusCodes.Status502BadGateway,
                        "Không thể kết nối đến Gemini (502): " + ex.Message,
                        ex);
                }
            }

            throw lastQuotaException ?? new GeminiApiException(
                StatusCodes.Status503ServiceUnavailable,
                "Gemini hiện không có API key khả dụng.");
        }

        private static GeminiStructuredAnswer ParseGeminiAnswer(string responseBody)
        {
            try
            {
                using var responseDocument = JsonDocument.Parse(responseBody);
                if (!responseDocument.RootElement.TryGetProperty("candidates", out var candidates)
                    || candidates.GetArrayLength() == 0)
                {
                    throw new GeminiApiException(
                        StatusCodes.Status502BadGateway,
                        "Gemini không trả về candidate hợp lệ.");
                }

                var parts = candidates[0]
                    .GetProperty("content")
                    .GetProperty("parts");

                var answerText = string.Concat(
                    parts.EnumerateArray()
                        .Where(part => part.TryGetProperty("text", out _))
                        .Select(part => part.GetProperty("text").GetString()));

                if (string.IsNullOrWhiteSpace(answerText))
                {
                    throw new GeminiApiException(
                        StatusCodes.Status502BadGateway,
                        "Gemini trả về candidate nhưng không có nội dung JSON.");
                }

                var codeFence = new string((char)96, 3);
                answerText = answerText
                    .Trim()
                    .Replace(codeFence + "json", string.Empty, StringComparison.OrdinalIgnoreCase)
                    .Replace(codeFence, string.Empty)
                    .Trim();

                var parseOptions = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                    NumberHandling = JsonNumberHandling.AllowReadingFromString,
                    AllowTrailingCommas = true,
                    ReadCommentHandling = JsonCommentHandling.Skip
                };

                var answer = JsonSerializer.Deserialize<GeminiStructuredAnswer>(answerText, parseOptions);
                if (answer == null || string.IsNullOrWhiteSpace(answer.Message) || answer.Price < 0)
                {
                    throw new JsonException("JSON không đúng cấu trúc bắt buộc.");
                }

                return answer;
            }
            catch (GeminiApiException)
            {
                throw;
            }
            catch (Exception ex) when (ex is JsonException or KeyNotFoundException or InvalidOperationException)
            {
                throw new GeminiApiException(
                    StatusCodes.Status502BadGateway,
                    "Gemini trả về JSON không đúng cấu trúc VoiceBot.",
                    ex);
            }
        }

        private static string BuildVerifiedMessage(GeminiStructuredAnswer answer, IReadOnlyCollection<OfficialFood> officialMenu, string question)
        {
            var foodFromModel = FindFoodByName(officialMenu, answer.DetectedFoodName);
            var statedPrice = RoundToWholeDong(answer.Price);

            if (foodFromModel != null && statedPrice == foodFromModel.Price)
            {
                return CleanAiMessage(answer.Message);
            }

            if (statedPrice == 0 && string.IsNullOrWhiteSpace(answer.DetectedFoodName))
            {
                 return CleanAiMessage(answer.Message);
            }

            if (IsPriceQuestion(question))
            {
                return "Dạ, món này hiện chưa có thông tin giá chính xác trên hệ thống. Anh/chị cho em xin lại tên món nhé ạ.";
            }

            return CleanAiMessage(answer.Message);
        }

        private static string CleanAiMessage(string message)
        {
            var clean = Regex.Replace(message ?? string.Empty, @"[*#_~\x60]+", string.Empty);
            clean = Regex.Replace(clean, @"\s+", " ").Trim();

            if (clean.Length > MaxAiMessageLength)
            {
                clean = clean.Substring(0, MaxAiMessageLength).TrimEnd() + "...";
            }

            return clean;
        }

        private static bool IsPriceQuestion(string question)
        {
            return PriceIntentRegex.IsMatch(question ?? string.Empty);
        }

        private static OfficialFood FindFoodByName(
            IEnumerable<OfficialFood> officialMenu,
            string detectedFoodName)
        {
            var normalizedDetectedName = NormalizeForMatching(detectedFoodName);
            if (string.IsNullOrWhiteSpace(normalizedDetectedName))
            {
                return null;
            }

            var menuWithNormalizedNames = officialMenu
                .Select(food => new
                {
                    Food = food,
                    NormalizedName = NormalizeForMatching(food.Name)
                })
                .ToList();

            var exactMatch = menuWithNormalizedNames
                .FirstOrDefault(item => item.NormalizedName == normalizedDetectedName);
            if (exactMatch != null)
            {
                return exactMatch.Food;
            }

            return menuWithNormalizedNames
                .Where(item => item.NormalizedName.Length >= 3
                    && normalizedDetectedName.Contains(item.NormalizedName, StringComparison.Ordinal))
                .OrderByDescending(item => item.NormalizedName.Length)
                .Select(item => item.Food)
                .FirstOrDefault();
        }

        private static string NormalizeForMatching(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return string.Empty;
            }

            var decomposed = value.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
            var builder = new StringBuilder();

            foreach (var character in decomposed)
            {
                if (CharUnicodeInfo.GetUnicodeCategory(character) != UnicodeCategory.NonSpacingMark)
                {
                    builder.Append(character == 'đ' ? 'd' : character);
                }
            }

            return Regex.Replace(builder.ToString(), @"[^a-z0-9]+", string.Empty);
        }

        private static decimal RoundToWholeDong(decimal amount)
        {
            return decimal.Round(amount, 0, MidpointRounding.AwayFromZero);
        }

        private static string FormatVietnameseMoney(decimal amount)
        {
            return RoundToWholeDong(amount).ToString("#,0", VietnameseCulture) + " VNĐ";
        }

        private static string ExtractProviderError(string responseBody)
        {
            try
            {
                using var document = JsonDocument.Parse(responseBody);
                if (document.RootElement.TryGetProperty("error", out var error)
                    && error.TryGetProperty("message", out var message))
                {
                    return LimitDebugText(message.GetString());
                }
            }
            catch (JsonException)
            {
            }

            return LimitDebugText(responseBody);
        }

        private static string LimitDebugText(string value)
        {
            var result = Regex.Replace(value ?? "Không có chi tiết lỗi.", @"\s+", " ").Trim();
            return result.Length <= 500 ? result : result.Substring(0, 500) + "...";
        }

        private static AiResponseDto CreateResponse(string message, IReadOnlyList<int> suggestedProductIds)
        {
            return new AiResponseDto
            {
                message = message,
                suggestedProductIds = suggestedProductIds.ToList()
            };
        }

        private sealed record OfficialFood(int Id, string Name, decimal Price, string Description);

        private sealed class GeminiStructuredAnswer
        {
            [JsonPropertyName("buoc_1_xac_dinh_mon")]
            public string DetectedFoodName { get; set; }

            [JsonPropertyName("buoc_2_gia_tra_cuu")]
            [JsonNumberHandling(JsonNumberHandling.AllowReadingFromString)]
            public decimal Price { get; set; }

            [JsonPropertyName("message")]
            public string Message { get; set; }
        }
    }
}