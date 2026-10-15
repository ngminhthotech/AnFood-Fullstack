using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.Extensions.DependencyInjection; // Đã thêm để hỗ trợ chạy ngầm
using AnFoodAPI.Models;
using AnFoodAPI.Services; 
using AnFoodAPI.DTOs;

namespace AnFoodAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecommendationController : ControllerBase
    {
        private readonly AnshopDbContext _context;
        private readonly IRecommendationService _aiService; 
        private readonly IWeatherService _weatherService;
        private readonly IServiceScopeFactory _scopeFactory; // Đã thêm để hỗ trợ Background Task

        // Đã inject IServiceScopeFactory vào Constructor
        public RecommendationController(AnshopDbContext context, IRecommendationService aiService, IWeatherService weatherService, IServiceScopeFactory scopeFactory)
        {
            _context = context;
            _aiService = aiService; 
            _weatherService = weatherService; 
            _scopeFactory = scopeFactory; 
        }

        // ======================================================================
        // 1. CẤP ĐỘ MAX LEVEL: ML.NET COLLABORATIVE FILTERING + CONTEXT-AWARE
        // ======================================================================
        [HttpGet("ForUser/{userId}")]
        public async Task<IActionResult> GetRecommendationsForUser(int userId, [FromQuery] double lat = 10.0452, [FromQuery] double lon = 105.7469)
        {
            try
            {
                // 👉 BƯỚC 0: KÉO DỮ LIỆU NGỮ CẢNH LÊN ĐẦU TIÊN
                string currentWeather = await _weatherService.GetCurrentWeatherAsync(lat, lon);
                int currentHour = DateTime.UtcNow.AddHours(7).Hour; // Giờ VN chuẩn

                // ==========================================
                // PHASE 1: KIỂM TRA CACHE TRONG BẢNG GOI_Y_AI
                // ==========================================
                var cacheData = await _context.GoiYAis
                    .Where(g => g.MaNguoiDung == userId)
                    .OrderByDescending(g => g.Diem)
                    .ToListAsync();

                // 👉 Cache 15 phút để đảm bảo Thời tiết luôn được Update Real-time
                if (cacheData.Any() && cacheData.First().ThoiGian > DateTime.Now.AddMinutes(-15))
                {
                    var cacheIds = cacheData.Select(c => c.MaMon).ToList();
                    var cachedMonAns = await _context.MonAns
                        .Include(m => m.HinhAnhMonAns)
                        .Include(m => m.MaDanhMucNavigation)
                        .Where(m => cacheIds.Contains((int)m.MaMon) && !m.IsDeleted && m.TrangThai == "con_ban")
                        .ToListAsync();

                    var sortedCachedResult = cachedMonAns.OrderBy(m => cacheIds.IndexOf((int)m.MaMon)).ToList();
                    
                    var finalCachedResult = new List<MonAnDTO>();
                    foreach (var m in sortedCachedResult)
                    {
                        double diemTB = await _context.DanhGias.Where(d => d.MaMon == m.MaMon).AverageAsync(d => (double?)d.SoSao) ?? 0.0;
                        finalCachedResult.Add(new MonAnDTO {
                            MaMon = m.MaMon,
                            TenMon = m.TenMon,
                            GiaBan = m.Gia,
                            MoTa = m.MoTa,
                            HinhAnh = !string.IsNullOrEmpty(m.HinhAnh) ? m.HinhAnh : m.HinhAnhMonAns.FirstOrDefault()?.DuongDan,
                            MaDanhMuc = m.MaDanhMuc,
                            DiemDanhGia = Math.Round(diemTB, 1)
                        });
                    }
                    
                    return Ok(new { 
                        success = true, 
                        type = "ai-personalized-cached", 
                        context = new { weather = currentWeather, hour = currentHour }, 
                        data = finalCachedResult
                    });
                }

                // ==========================================
                // PHASE 2: MISS CACHE -> KÍCH HOẠT LÕI AI ML.NET VÀ NGỮ CẢNH
                // ==========================================
                var allActiveFoods = await _context.MonAns
                    .Include(m => m.HinhAnhMonAns)
                    .Include(m => m.MaDanhMucNavigation)
                    .Where(m => !m.IsDeleted && m.TrangThai == "con_ban")
                    .ToListAsync();

                var scoredItems = new List<Tuple<MonAn, float>>();

                foreach (var food in allActiveFoods)
                {
                    // 1. LÕI TOÁN HỌC TỪ ML.NET
                    float aiScore = _aiService.PredictScore(userId, food.MaMon);

                    // 2. NHẬN THỨC NGỮ CẢNH
                    float contextMultiplier = 1.0f;

                    // Quy tắc 1: Khung giờ
                    if (currentHour >= 6 && currentHour <= 9 && food.MaDanhMuc == 3) 
                        contextMultiplier += 0.5f; // Sáng sớm thèm đồ uống
                    else if (currentHour >= 21 && currentHour <= 23 && (food.MaDanhMuc == 5 || food.MaDanhMuc == 6)) 
                        contextMultiplier += 0.5f; // Khuya thèm ăn vặt, gà rán

                    // Quy tắc 2: Thời tiết
                    if (currentWeather == "Rain" || currentWeather == "Thunderstorm" || currentWeather == "Drizzle") 
                    {
                        if (food.MaDanhMuc == 2 || food.MaDanhMuc == 5) contextMultiplier += 0.8f; // Mưa -> Lẩu, Pizza, Gà rán
                    }
                    else if (currentWeather == "Clear" || currentWeather == "Hot") 
                    {
                        if (food.MaDanhMuc == 3) contextMultiplier += 0.6f; // Nóng -> Đồ uống
                    }

                    // 3. TÍNH ĐIỂM CHUNG CUỘC
                    float finalScore = aiScore * contextMultiplier;
                    scoredItems.Add(new Tuple<MonAn, float>(food, finalScore));
                }

                // Lọc ra Top 30 món để Frontend có đủ dữ liệu phân loại vào các kệ
                var topRecommendations = scoredItems
                    .OrderByDescending(x => x.Item2)
                    .Take(30) 
                    .ToList();

                // ==========================================
                // FALLBACK: BÀI TOÁN KHỞI ĐỘNG LẠNH (COLD-START)
                // ==========================================
                if (!topRecommendations.Any() || topRecommendations.All(x => x.Item2 == 0))
                {
                    var topSelling = allActiveFoods
                        .OrderByDescending(m => m.BanChay)
                        .Take(30) 
                        .ToList();
                    
                    var finalTopSelling = new List<MonAnDTO>();
                    foreach (var m in topSelling)
                    {
                        double diemTB = await _context.DanhGias.Where(d => d.MaMon == m.MaMon).AverageAsync(d => (double?)d.SoSao) ?? 0.0;
                        finalTopSelling.Add(new MonAnDTO {
                            MaMon = m.MaMon,
                            TenMon = m.TenMon,
                            GiaBan = m.Gia,
                            MoTa = m.MoTa,
                            HinhAnh = !string.IsNullOrEmpty(m.HinhAnh) ? m.HinhAnh : m.HinhAnhMonAns.FirstOrDefault()?.DuongDan,
                            MaDanhMuc = m.MaDanhMuc,
                            DiemDanhGia = Math.Round(diemTB, 1)
                        });
                    }

                    return Ok(new { 
                        success = true, 
                        type = "cold-start-trending", 
                        context = new { weather = currentWeather, hour = currentHour }, 
                        data = finalTopSelling
                    });
                }

                var finalFoodList = topRecommendations.Select(x => x.Item1).ToList();

                // ==========================================
                // PHASE 3: GHI KẾT QUẢ VÀO CACHE DB
                // ==========================================
                if (cacheData.Any()) _context.GoiYAis.RemoveRange(cacheData); 

                var newCaches = finalFoodList.Select((m, index) => new GoiYAi {
                    MaNguoiDung = userId,
                    MaMon = m.MaMon,
                    Diem = topRecommendations[index].Item2,
                    ThoiGian = DateTime.Now
                }).ToList();

                _context.GoiYAis.AddRange(newCaches);
                await _context.SaveChangesAsync();

                var finalAIFoods = new List<MonAnDTO>();
                foreach (var m in finalFoodList)
                {
                    double diemTB = await _context.DanhGias.Where(d => d.MaMon == m.MaMon).AverageAsync(d => (double?)d.SoSao) ?? 0.0;
                    finalAIFoods.Add(new MonAnDTO {
                        MaMon = m.MaMon,
                        TenMon = m.TenMon,
                        GiaBan = m.Gia,
                        MoTa = m.MoTa,
                        HinhAnh = !string.IsNullOrEmpty(m.HinhAnh) ? m.HinhAnh : m.HinhAnhMonAns.FirstOrDefault()?.DuongDan,
                        MaDanhMuc = m.MaDanhMuc,
                        DiemDanhGia = Math.Round(diemTB, 1)
                    });
                }

                return Ok(new { 
                    success = true, 
                    type = "ai-personalized", 
                    context = new { weather = currentWeather, hour = currentHour }, 
                    data = finalAIFoods
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine("LỖI GỢI Ý AI: " + ex.Message);
                return Ok(new { success = false, type = "error", message = ex.Message }); 
            }
        }

        // ======================================================================
        // 2. PHÂN TÍCH GIỎ HÀNG (MARKET BASKET ANALYSIS) - Item-based Filtering
        // ======================================================================
        [HttpGet("Related/{maMon}")]
        public async Task<IActionResult> GetCollaborativeRelated(int maMon)
        {
            try
            {
                var usersWhoViewedThis = await _context.AiLichSuHanhVis 
                    .Where(h => h.MaMon == maMon && h.MaNguoiDung != null)
                    .Select(h => h.MaNguoiDung)
                    .Distinct()
                    .ToListAsync();

                if (usersWhoViewedThis.Count < 2)
                {
                    var currentItem = await _context.MonAns.FindAsync(maMon);
                    var fallbackRelated = await _context.MonAns
                        .Include(m => m.HinhAnhMonAns)
                        .Where(m => m.MaDanhMuc == currentItem.MaDanhMuc && m.MaMon != maMon && !m.IsDeleted)
                        .OrderBy(x => Guid.NewGuid()) 
                        .Take(4)
                        .ToListAsync();
                        
                    var finalFallback = new List<MonAnDTO>();
                    foreach(var m in fallbackRelated)
                    {
                        double diemTB = await _context.DanhGias.Where(d => d.MaMon == m.MaMon).AverageAsync(d => (double?)d.SoSao) ?? 0.0;
                        finalFallback.Add(new MonAnDTO {
                            MaMon = m.MaMon,
                            TenMon = m.TenMon,
                            GiaBan = m.Gia,
                            MoTa = m.MoTa,
                            HinhAnh = !string.IsNullOrEmpty(m.HinhAnh) ? m.HinhAnh : m.HinhAnhMonAns.FirstOrDefault()?.DuongDan,
                            MaDanhMuc = m.MaDanhMuc,
                            DiemDanhGia = Math.Round(diemTB, 1)
                        });
                    }

                    return Ok(new { success = true, type = "content-based", data = finalFallback });
                }

                var relatedItemsList = await _context.AiLichSuHanhVis 
                    .Where(h => usersWhoViewedThis.Contains(h.MaNguoiDung) && h.MaMon != maMon)
                    .GroupBy(h => h.MaMon)
                    .Select(g => new {
                        MaMon = g.Key,
                        Score = g.Sum(x => x.DiemHanhVi) 
                    })
                    .OrderByDescending(x => x.Score)
                    .Take(4)
                    .ToListAsync();

                var relatedItemIds = relatedItemsList.Select(r => r.MaMon).ToList();
                
                var collaborativeResult = await _context.MonAns
                    .Include(m => m.HinhAnhMonAns)
                    .Where(m => relatedItemIds.Contains(m.MaMon) && !m.IsDeleted && m.TrangThai == "con_ban")
                    .ToListAsync();

                var finalSortedResult = collaborativeResult
                    .OrderBy(m => relatedItemIds.IndexOf(m.MaMon))
                    .ToList();

                var finalCollaborative = new List<MonAnDTO>();
                foreach(var m in finalSortedResult)
                {
                    double diemTB = await _context.DanhGias.Where(d => d.MaMon == m.MaMon).AverageAsync(d => (double?)d.SoSao) ?? 0.0;
                    finalCollaborative.Add(new MonAnDTO {
                        MaMon = m.MaMon,
                        TenMon = m.TenMon,
                        GiaBan = m.Gia,
                        MoTa = m.MoTa,
                        HinhAnh = !string.IsNullOrEmpty(m.HinhAnh) ? m.HinhAnh : m.HinhAnhMonAns.FirstOrDefault()?.DuongDan,
                        MaDanhMuc = m.MaDanhMuc,
                        DiemDanhGia = Math.Round(diemTB, 1)
                    });
                }

                return Ok(new { success = true, type = "item-based-collaborative", data = finalCollaborative });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, type = "error", message = ex.Message });
            }
        }

        // ======================================================================
        // 3. RETARGETING: GỢI Ý MUA LẠI MÓN QUEN
        // ======================================================================
        [HttpGet("BuyAgain/{userId}")]
        public async Task<IActionResult> GetBuyAgain(int userId)
        {
            try
            {
                if (userId <= 0) return Ok(new { success = true, data = new List<MonAnDTO>() });

                var boughtItemIds = await (from d in _context.DonHangs
                                        join c in _context.ChiTietDonHangs on d.MaDonHang equals c.MaDonHang
                                        where d.MaNguoiDung == userId
                                        group c by c.MaMon into g
                                        orderby g.Sum(x => x.SoLuong) descending 
                                        select g.Key)
                                        .Take(20) 
                                        .ToListAsync();

                if (!boughtItemIds.Any())
                {
                    return Ok(new { success = true, data = new List<MonAnDTO>() });
                }

                var buyAgainResult = await _context.MonAns
                    .Include(m => m.HinhAnhMonAns)
                    .Where(m => boughtItemIds.Contains(m.MaMon) && !m.IsDeleted && m.TrangThai == "con_ban")
                    .ToListAsync();

                var finalResult = buyAgainResult.OrderBy(m => boughtItemIds.IndexOf(m.MaMon)).ToList();

                var finalBuyAgain = new List<MonAnDTO>();
                foreach(var m in finalResult)
                {
                    double diemTB = await _context.DanhGias.Where(d => d.MaMon == m.MaMon).AverageAsync(d => (double?)d.SoSao) ?? 0.0;
                    finalBuyAgain.Add(new MonAnDTO {
                        MaMon = m.MaMon,
                        TenMon = m.TenMon,
                        GiaBan = m.Gia,
                        MoTa = m.MoTa,
                        HinhAnh = !string.IsNullOrEmpty(m.HinhAnh) ? m.HinhAnh : m.HinhAnhMonAns.FirstOrDefault()?.DuongDan,
                        MaDanhMuc = m.MaDanhMuc,
                        DiemDanhGia = Math.Round(diemTB, 1)
                    });
                }

                return Ok(new { success = true, data = finalBuyAgain });
            }
            catch (Exception ex)
            {
                return Ok(new { success = true, data = new List<MonAnDTO>(), message = ex.Message });
            }
        }

        // ======================================================================
        // ======================================================================
        // 👉 4. TASTE PROFILE: ĐỌC VỊ KHÁCH HÀNG (DỮ LIỆU THẬT 100%)
        // ======================================================================
        [HttpGet("TasteProfile/{userId}")]
        public async Task<IActionResult> GetTasteProfile(int userId)
        {
            try
            {
                if (userId <= 0) return Ok(new { success = false, data = new string[0] });

                // 👉 SỬA LỖI BẰNG CÁCH DÙNG JOIN TRỰC TIẾP (Bỏ .Include)
                var categoryScores = await (from h in _context.AiLichSuHanhVis
                                            join m in _context.MonAns on h.MaMon equals m.MaMon
                                            where h.MaNguoiDung == userId
                                            group h by m.MaDanhMuc into g
                                            select new {
                                                MaDanhMuc = g.Key,
                                                TotalScore = g.Sum(x => x.DiemHanhVi) // Cộng dồn điểm
                                            }).ToListAsync();

                if (!categoryScores.Any()) return Ok(new { success = false, data = new string[0] });

                // Tổng điểm tất cả các danh mục
                var totalScore = categoryScores.Sum(c => c.TotalScore);
                if (totalScore <= 0) return Ok(new { success = false, data = new string[0] });

                // Quy đổi ra % và gán Nhãn (Tag) tương ứng
                var profile = categoryScores.Select(c => {
                    int percent = (int)Math.Round((double)c.TotalScore / totalScore * 100);
                    string label = "";
                    string color = "";

                    // Gán tên và màu sắc dựa vào MaDanhMuc của FastBite
                    switch (c.MaDanhMuc)
                    {
                        case 1: label = "Nhóm FastFood"; color = "#e67e22"; break;
                        case 2: label = "Hệ Cay Nồng / Lẩu"; color = "#d63031"; break;
                        case 3: label = "Team Giải Khát"; color = "#0984e3"; break;
                        case 4: label = "Fan Cứng Pizza"; color = "#f39c12"; break;
                        case 5: label = "Đạo Gà Rán / Đồ Chiên"; color = "#e17055"; break;
                        case 6: label = "Thánh Ăn Vặt"; color = "#8e44ad"; break;
                        default: label = "Món Ăn Khác"; color = "#2d3436"; break;
                    }

                    return new { label, percent, color };
                })
                .OrderByDescending(p => p.percent) // Xếp từ cao xuống thấp
                .Take(4) // Chỉ lấy 4 đặc điểm cao nhất
                .ToList();

                return Ok(new { success = true, data = profile });
            }
            catch (Exception ex)
            {
                // Dùng Ok kèm success = false để React không bị crash khi lỗi
                return Ok(new { success = false, message = ex.Message }); 
            }
        }

        // ======================================================================
        // 👉 5. CART CROSS-SELL: 3 CHIẾN THUẬT KẾT HỢP
        // ======================================================================
        [HttpPost("CartCrossSell")]
        public async Task<ActionResult<IEnumerable<MonAnDTO>>> GetCartCrossSell([FromBody] List<int> cartItemIds)
        {
            if (cartItemIds == null || !cartItemIds.Any()) return Ok(new List<MonAnDTO>());

            var resultList = new List<MonAn>();

            // CHIẾN THUẬT 1: Collaborative Filtering (Người ta cũng mua)
            var frequentlyBoughtTogether = await _context.ChiTietDonHangs
                .Where(ct => _context.ChiTietDonHangs.Any(inner => cartItemIds.Contains(inner.MaMon ?? 0) && inner.MaDonHang == ct.MaDonHang))
                .Where(ct => !cartItemIds.Contains(ct.MaMon ?? 0))
                .GroupBy(ct => ct.MaMon)
                .OrderByDescending(g => g.Count())
                .Select(g => g.Key)
                .Take(2)
                .ToListAsync();

            foreach (var id in frequentlyBoughtTogether)
            {
                var mon = await _context.MonAns.Include(m => m.HinhAnhMonAns).FirstOrDefaultAsync(m => m.MaMon == id);
                if (mon != null && mon.TrangThai != "ngung_ban" && mon.IsDeleted != true) resultList.Add(mon);
            }

            // CHIẾN THUẬT 2: Thiếu gì bù nấy
            bool hasDrink = await _context.MonAns.AnyAsync(m => cartItemIds.Contains(m.MaMon) && m.MaDanhMuc == 3);
            if (!hasDrink)
            {
                var bestDrink = await _context.MonAns
                    .Include(m => m.HinhAnhMonAns)
                    .Where(m => m.MaDanhMuc == 3 && m.TrangThai != "ngung_ban" && m.IsDeleted != true && !cartItemIds.Contains(m.MaMon))
                    .OrderBy(m => Guid.NewGuid()) 
                    .FirstOrDefaultAsync();
                
                if (bestDrink != null && !resultList.Any(r => r.MaMon == bestDrink.MaMon)) resultList.Add(bestDrink);
            }

            // CHIẾN THUẬT 3: Giá rẻ tiện tay
            var impulseItems = await _context.MonAns
                .Include(m => m.HinhAnhMonAns)
                .Where(m => m.MaDanhMuc == 6 && (m.Gia ?? 0) <= 35000 && m.TrangThai != "ngung_ban" && m.IsDeleted != true && !cartItemIds.Contains(m.MaMon))
                .OrderBy(m => Guid.NewGuid()) 
                .Take(2)
                .ToListAsync();

            foreach (var item in impulseItems)
            {
                if (!resultList.Any(r => r.MaMon == item.MaMon)) resultList.Add(item);
            }

            // Map sang DTO
            var finalCrossSell = new List<MonAnDTO>();
            foreach (var m in resultList.Take(4))
            {
                double diemTB = await _context.DanhGias.Where(d => d.MaMon == m.MaMon).AverageAsync(d => (double?)d.SoSao) ?? 0.0;
                finalCrossSell.Add(new MonAnDTO {
                    MaMon = m.MaMon,
                    TenMon = m.TenMon,
                    GiaBan = m.Gia,
                    MoTa = m.MoTa,
                    HinhAnh = !string.IsNullOrEmpty(m.HinhAnh) ? m.HinhAnh : m.HinhAnhMonAns.FirstOrDefault()?.DuongDan,
                    MaDanhMuc = m.MaDanhMuc,
                    DiemDanhGia = Math.Round(diemTB, 1)
                });
            }

            return Ok(finalCrossSell);
        }

        // ======================================================================
        // 6. API DÀNH CHO ADMIN: BẤM NÚT HUẤN LUYỆN LẠI AI MODEL
        // ======================================================================
        [HttpPost("TrainAI")]
        public async Task<IActionResult> TrainAIModel()
        {
            try
            {
                var trainingData = await _context.AiLichSuHanhVis.ToListAsync();

                if (trainingData.Count < 10)
                {
                    return Ok(new { success = false, message = "Dữ liệu quá ít (< 10 dòng). Cần thêm dữ liệu để AI có thể học!" });
                }

                string result = _aiService.TrainModel(trainingData);

                return Ok(new { success = true, message = result });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // ======================================================================
        // 7. API TRACKING: HÚT DỮ LIỆU HÀNH VI NGƯỜI DÙNG (FIRE-AND-FORGET)
        // ======================================================================
        public class TrackingRequest
        {
            public int MaNguoiDung { get; set; }
            public string LoaiHanhVi { get; set; } // 'VIEW_PRODUCT', 'VIEW_CATEGORY', 'SEARCH'
            public int? MaMon { get; set; }
            public int? MaDanhMuc { get; set; }
            public string TuKhoa { get; set; }
            public float DiemHanhVi { get; set; }
        }

        [HttpPost("TrackBehavior")]
        public IActionResult TrackBehavior([FromBody] TrackingRequest req)
        {
            if (req.MaNguoiDung <= 0) return Ok();

            // CHẠY NGẦM KHÔNG CHỜ KẾT QUẢ - BẢO VỆ HIỆU NĂNG SERVER
            _ = Task.Run(async () =>
            {
                try
                {
                    using (var scope = _scopeFactory.CreateScope())
                    {
                        var dbContext = scope.ServiceProvider.GetRequiredService<AnshopDbContext>();
                        
                        // 1. Click món ăn
                        if (req.MaMon.HasValue)
                        {
                            var existing = await dbContext.AiLichSuHanhVis.FirstOrDefaultAsync(x => x.MaNguoiDung == req.MaNguoiDung && x.MaMon == req.MaMon);
                            if (existing != null) existing.DiemHanhVi += req.DiemHanhVi;
                            else dbContext.AiLichSuHanhVis.Add(new AiLichSuHanhVi { MaNguoiDung = req.MaNguoiDung, MaMon = req.MaMon.Value, DiemHanhVi = req.DiemHanhVi });
                        }
                        // 2. Click danh mục (Lấy 2 món hot nhất danh mục đó làm đại diện)
                        else if (req.MaDanhMuc.HasValue)
                        {
                            var topItems = await dbContext.MonAns.Where(m => m.MaDanhMuc == req.MaDanhMuc && m.TrangThai == "con_ban").OrderByDescending(m => m.BanChay).Take(2).ToListAsync();
                            foreach(var item in topItems)
                            {
                                var existing = await dbContext.AiLichSuHanhVis.FirstOrDefaultAsync(x => x.MaNguoiDung == req.MaNguoiDung && x.MaMon == item.MaMon);
                                if (existing != null) existing.DiemHanhVi += req.DiemHanhVi;
                                else dbContext.AiLichSuHanhVis.Add(new AiLichSuHanhVi { MaNguoiDung = req.MaNguoiDung, MaMon = item.MaMon, DiemHanhVi = req.DiemHanhVi });
                            }
                        }
                        // 3. Tìm kiếm từ khóa
                        else if (!string.IsNullOrEmpty(req.TuKhoa))
                        {
                            var searchItems = await dbContext.MonAns.Where(m => m.TenMon.Contains(req.TuKhoa) && m.TrangThai == "con_ban").Take(2).ToListAsync();
                            foreach(var item in searchItems)
                            {
                                var existing = await dbContext.AiLichSuHanhVis.FirstOrDefaultAsync(x => x.MaNguoiDung == req.MaNguoiDung && x.MaMon == item.MaMon);
                                if (existing != null) existing.DiemHanhVi += req.DiemHanhVi;
                                else dbContext.AiLichSuHanhVis.Add(new AiLichSuHanhVi { MaNguoiDung = req.MaNguoiDung, MaMon = item.MaMon, DiemHanhVi = req.DiemHanhVi });
                            }
                        }
                        
                        await dbContext.SaveChangesAsync();
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine("LỖI GHI NHẬN HÀNH VI (CHẠY NGẦM): " + ex.Message);
                }
            });

            // Trả về luôn cho Frontend chạy tiếp, không bắt nó đợi DB lưu xong
            return Ok(new { success = true, message = "Behavior queued for tracking" });
        }
    }
}