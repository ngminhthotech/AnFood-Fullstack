using System;
using System.Net;
using System.Net.Http;
using System.Security;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace AnFoodAPI.Services
{
    public interface ITextToSpeechService
    {
        Task<byte[]> SynthesizeVietnameseFemaleVoiceAsync(string text, CancellationToken cancellationToken);
    }

    /// <summary>
    /// Lỗi TTS có HTTP status để VoiceBotController chuyển tiếp nguyên trạng về frontend.
    /// </summary>
    public sealed class TextToSpeechException : Exception
    {
        public int StatusCode { get; }

        public TextToSpeechException(int statusCode, string message, Exception innerException = null)
            : base(message, innerException)
        {
            StatusCode = statusCode;
        }
    }

    /// <summary>
    /// Gọi Azure Speech REST API để tạo MP3 từ câu trả lời của FastBite.
    /// API key chỉ tồn tại ở server, không bao giờ gửi xuống trình duyệt.
    /// </summary>
    public sealed class AzureTextToSpeechService : ITextToSpeechService
    {
        private const string DefaultVoice = "vi-VN-HoaiMyNeural";
        private const string OutputFormat = "audio-16khz-128kbitrate-mono-mp3";

        private readonly HttpClient _httpClient;
        private readonly string _speechKey;
        private readonly string _speechRegion;
        private readonly string _voiceName;

        public AzureTextToSpeechService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _speechKey = Environment.GetEnvironmentVariable("AZURE_SPEECH_KEY")
                ?? configuration["AzureSpeech:Key"];
            _speechRegion = Environment.GetEnvironmentVariable("AZURE_SPEECH_REGION")
                ?? configuration["AzureSpeech:Region"];
            _voiceName = configuration["AzureSpeech:Voice"] ?? DefaultVoice;
        }

        public async Task<byte[]> SynthesizeVietnameseFemaleVoiceAsync(
            string text,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(_speechKey) || string.IsNullOrWhiteSpace(_speechRegion))
            {
                throw new TextToSpeechException(
                    StatusCodes.Status503ServiceUnavailable,
                    "TTS Cloud chưa được cấu hình. Hãy đặt AZURE_SPEECH_KEY và AZURE_SPEECH_REGION trên Backend.");
            }

            var cleanText = NormalizeText(text);
            if (string.IsNullOrWhiteSpace(cleanText))
            {
                throw new TextToSpeechException(
                    StatusCodes.Status400BadRequest,
                    "Không có nội dung hợp lệ để tạo giọng nói.");
            }

            var endpoint = $"https://{_speechRegion.Trim()}.tts.speech.microsoft.com/cognitiveservices/v1";
            var ssml = BuildSsml(cleanText);

            using var request = new HttpRequestMessage(HttpMethod.Post, endpoint)
            {
                Content = new StringContent(ssml, Encoding.UTF8, "application/ssml+xml")
            };
            request.Headers.TryAddWithoutValidation("Ocp-Apim-Subscription-Key", _speechKey.Trim());
            request.Headers.TryAddWithoutValidation("X-Microsoft-OutputFormat", OutputFormat);
            request.Headers.TryAddWithoutValidation("User-Agent", "FastBite-VoiceBot");

            try
            {
                using var response = await _httpClient.SendAsync(request, cancellationToken);

                if (!response.IsSuccessStatusCode)
                {
                    var providerError = await response.Content.ReadAsStringAsync(cancellationToken);
                    throw new TextToSpeechException(
                        (int)response.StatusCode,
                        "Azure Speech HTTP " + (int)response.StatusCode + ": " + ExtractProviderError(providerError));
                }

                var audioBytes = await response.Content.ReadAsByteArrayAsync(cancellationToken);
                if (audioBytes.Length == 0)
                {
                    throw new TextToSpeechException(
                        StatusCodes.Status502BadGateway,
                        "Azure Speech trả về tệp âm thanh rỗng.");
                }

                return audioBytes;
            }
            catch (TextToSpeechException)
            {
                throw;
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (TaskCanceledException ex)
            {
                throw new TextToSpeechException(
                    StatusCodes.Status504GatewayTimeout,
                    "Azure Speech hết thời gian phản hồi (504).",
                    ex);
            }
            catch (HttpRequestException ex)
            {
                throw new TextToSpeechException(
                    StatusCodes.Status502BadGateway,
                    "Không thể kết nối Azure Speech (502): " + ex.Message,
                    ex);
            }
        }

        /// <summary>
        /// SSML điều chỉnh nhẹ tốc độ và cao độ để HoaiMy đọc sáng, rõ nhưng vẫn tự nhiên.
        /// SecurityElement.Escape bảo vệ XML khỏi ký tự trong nội dung LLM.
        /// </summary>
        private string BuildSsml(string text)
        {
            var escapedText = SecurityElement.Escape(text) ?? string.Empty;
            var escapedVoiceName = SecurityElement.Escape(_voiceName.Trim()) ?? DefaultVoice;

            return $@"<speak version='1.0' xml:lang='vi-VN'>
  <voice xml:lang='vi-VN' xml:gender='Female' name='{escapedVoiceName}'>
    <prosody rate='+5%' pitch='+12%'>{escapedText}</prosody>
  </voice>
</speak>";
        }

        private static string NormalizeText(string text)
        {
            var clean = Regex.Replace(text ?? string.Empty, @"[*#_~\x60]+", string.Empty);
            clean = Regex.Replace(clean, @"\s+", " ").Trim();

            // Giới hạn để tránh bị lạm dụng endpoint tốn quota, đồng thời giữ phản hồi thoại ngắn gọn.
            return clean.Length <= 600 ? clean : clean.Substring(0, 600).TrimEnd() + "...";
        }

        private static string ExtractProviderError(string responseBody)
        {
            try
            {
                using var document = JsonDocument.Parse(responseBody);
                if (document.RootElement.TryGetProperty("error", out var error)
                    && error.TryGetProperty("message", out var message))
                {
                    return LimitError(message.GetString());
                }
            }
            catch (JsonException)
            {
                // Azure đôi khi trả text/XML; dùng chuỗi đã giới hạn ở dưới.
            }

            return LimitError(responseBody);
        }

        private static string LimitError(string value)
        {
            var clean = Regex.Replace(value ?? "Không có chi tiết lỗi.", @"\s+", " ").Trim();
            return clean.Length <= 400 ? clean : clean.Substring(0, 400) + "...";
        }
    }
}
