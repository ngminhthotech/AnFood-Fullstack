using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnFoodAPI.Models;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;

namespace AnFoodAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ThongKeController : ControllerBase
    {
        private readonly AnshopDbContext _context;

        public ThongKeController(AnshopDbContext context)
        {
            _context = context;
        }

        // GET: api/ThongKe/Dashboard
        // 🔥 NÂNG CẤP: Nhận tham số startDate và endDate từ React
        [HttpGet("Dashboard")]
        public async Task<IActionResult> GetDashboardStats(string? timeSpan = "week", DateTime? startDate = null, DateTime? endDate = null)
        {
            try
            {
                // 1. KHỞI TẠO QUERY VÀ MỐC THỜI GIAN MẶC ĐỊNH
                var query = _context.DonHangs.AsQueryable();
                DateTime now = DateTime.Now;
                DateTime start = now.Date.AddDays(-6);
                DateTime end = now.Date.AddDays(1).AddTicks(-1); // Cuối ngày hôm nay

                // 2. XỬ LÝ LỌC THỜI GIAN ĐA DẠNG
                switch (timeSpan?.ToLower())
                {
                    case "today":
                        start = now.Date;
                        end = now.Date.AddDays(1).AddTicks(-1);
                        break;
                    case "week":
                        start = now.Date.AddDays(-6);
                        end = now.Date.AddDays(1).AddTicks(-1);
                        break;
                    case "last_30_days": // Thêm mới
                        start = now.Date.AddDays(-29);
                        end = now.Date.AddDays(1).AddTicks(-1);
                        break;
                    case "this_month":   // Đổi từ "month" sang "this_month" cho chuẩn React
                    case "month":
                        start = new DateTime(now.Year, now.Month, 1);
                        end = start.AddMonths(1).AddTicks(-1); // Cuối tháng
                        break;
                    case "this_year":    // Thêm mới
                        start = new DateTime(now.Year, 1, 1);
                        end = new DateTime(now.Year + 1, 1, 1).AddTicks(-1);
                        break;
                    case "custom":       // Nâng cấp lọc Từ ngày - Đến ngày
                        if (startDate.HasValue && endDate.HasValue)
                        {
                            start = startDate.Value.Date;
                            end = endDate.Value.Date.AddDays(1).AddTicks(-1);
                        }
                        break;
                    case "all":
                        start = new DateTime(2000, 1, 1); // Lấy từ xa xưa
                        end = now.Date.AddDays(1).AddTicks(-1);
                        break;
                }

                // Gắn mốc thời gian vào Query chung
                if (timeSpan?.ToLower() != "all")
                {
                    query = query.Where(d => d.NgayDat >= start && d.NgayDat <= end);
                }

                // 3. TÍNH TOÁN KPI
                var validOrdersQuery = query.Where(d => d.TrangThai != "huy" && d.TrangThai != "TuChoi" && d.TrangThai != "DaHuy");
                decimal doanhThu = await validOrdersQuery.SumAsync(d => d.TongTien ?? 0);
                int tongDon = await validOrdersQuery.CountAsync();

                var tongMon = await _context.MonAns.CountAsync(m => !m.IsDeleted);
                var tongKhach = await _context.NguoiDungs.CountAsync(u => u.MaVaiTro != 1); 

                // 4. BIỂU ĐỒ TRÒN (Theo Danh Mục)
                var statusData = await _context.ChiTietDonHangs
                    .Include(ct => ct.DonHang)
                    .Include(ct => ct.MonAn)
                    .ThenInclude(m => m.MaDanhMucNavigation)
                    .Where(ct => ct.DonHang.NgayDat >= start && ct.DonHang.NgayDat <= end 
                                 && ct.DonHang.TrangThai != "huy" && ct.DonHang.TrangThai != "TuChoi" && ct.DonHang.TrangThai != "DaHuy")
                    .GroupBy(ct => ct.MonAn.MaDanhMucNavigation.TenDanhMuc)
                    .Select(g => new
                    {
                        name = g.Key ?? "Khác", 
                        value = g.Sum(x => x.SoLuong ?? 0)
                    })
                    .OrderByDescending(x => x.value)
                    .ToListAsync();

                // 5. TOP SẢN PHẨM BÁN CHẠY
                var topStats = await _context.ChiTietDonHangs
                    .Where(ct => ct.DonHang.NgayDat >= start && ct.DonHang.NgayDat <= end && ct.DonHang.TrangThai != "huy" && ct.DonHang.TrangThai != "TuChoi")
                    .GroupBy(ct => ct.MaMon)
                    .Select(g => new
                    {
                        MaMon = g.Key,
                        SoLuongBan = g.Sum(x => x.SoLuong ?? 0),
                        DoanhThu = g.Sum(x => (decimal)(x.SoLuong ?? 0) * (x.DonGia ?? 0))
                    })
                    .OrderByDescending(x => x.SoLuongBan)
                    .Take(5)
                    .ToListAsync();

                var topSanPham = new List<object>();
                foreach (var stat in topStats)
                {
                    if (stat.MaMon.HasValue)
                    {
                        var mon = await _context.MonAns
                            .Include(m => m.HinhAnhMonAns)
                            .FirstOrDefaultAsync(m => m.MaMon == stat.MaMon);
                        
                        if (mon != null)
                        {
                            topSanPham.Add(new
                            {
                                TenMon = mon.TenMon,
                                SoLuongBan = stat.SoLuongBan,
                                DoanhThu = stat.DoanhThu,
                                HinhAnh = !string.IsNullOrEmpty(mon.HinhAnh) ? mon.HinhAnh : mon.HinhAnhMonAns.Select(h => h.DuongDan).FirstOrDefault()
                            });
                        }
                    }
                }

                // 6. ĐƠN HÀNG MỚI NHẤT (Lấy theo Query thời gian)
                var donMoi = await query // Đã dùng query có sẵn thay vì _context chung chung
                    .OrderByDescending(d => d.NgayDat)
                    .Take(5)
                    .Select(d => new { d.MaDonHang, NguoiNhan = d.NguoiNhan ?? "Khách vãng lai", TongTien = d.TongTien ?? 0, TrangThai = d.TrangThai, NgayDat = d.NgayDat })
                    .ToListAsync();

                // =========================================================
                // 7. BIỂU ĐỒ DOANH THU (🔥 ĐÃ NÂNG CẤP VẼ ĐỘNG THEO NGÀY)
                // =========================================================
                DateTime chartStart = start;
                DateTime chartEnd = end;

                // Nếu chọn "Toàn bộ", tìm ngày có đơn hàng đầu tiên để làm điểm bắt đầu vẽ biểu đồ
                if (timeSpan?.ToLower() == "all")
                {
                    var firstOrder = await _context.DonHangs.OrderBy(d => d.NgayDat).FirstOrDefaultAsync();
                    chartStart = firstOrder?.NgayDat?.Date ?? now.Date.AddDays(-30);
                }

                // Giới hạn biểu đồ vẽ tối đa 365 điểm (tránh lag UI nếu khoảng thời gian quá dài)
                int totalDays = (chartEnd.Date - chartStart.Date).Days + 1;
                if (totalDays > 365) 
                {
                    chartStart = chartEnd.Date.AddDays(-364); 
                    totalDays = 365;
                }

                var chartDataRaw = await _context.DonHangs
                    .Where(d => d.NgayDat >= chartStart && d.NgayDat <= chartEnd && (d.TrangThai != "huy" && d.TrangThai != "TuChoi" && d.TrangThai != "DaHuy"))
                    .Select(d => new { NgayDat = d.NgayDat, TongTien = d.TongTien ?? 0 })
                    .ToListAsync();

                // Tạo trục X động dựa trên số ngày thực tế (Thay vì cứng 7 ngày như cũ)
                var revenueChart = Enumerable.Range(0, totalDays)
                    .Select(offset =>
                    {
                        var currentDate = chartStart.AddDays(offset);
                        var stats = chartDataRaw.Where(d => d.NgayDat.HasValue && d.NgayDat.Value.Date == currentDate.Date).ToList();
                        
                        // Nếu khoảng thời gian > 60 ngày thì hiện mm/yyyy, nếu ngắn thì hiện dd/mm cho gọn
                        string dateFormat = totalDays > 60 ? "MM/yyyy" : "dd/MM";
                        
                        return new { 
                            Date = currentDate.ToString(dateFormat), 
                            DoanhThu = stats.Sum(x => x.TongTien), 
                            SoDon = stats.Count 
                        };
                    })
                    // Nếu thời gian dài, nhóm lại theo hiển thị để không bị trùng (vd: nhiều ngày trong 1 tháng sẽ gộp lại)
                    .GroupBy(x => x.Date)
                    .Select(g => new { 
                        Date = g.Key, 
                        DoanhThu = g.Sum(x => x.DoanhThu), 
                        SoDon = g.Sum(x => x.SoDon) 
                    })
                    .ToList();

                // 8. CẢNH BÁO TỒN KHO 
                var lowStock = await _context.MonAns
                    .Where(m => !m.IsDeleted)
                    .Select(m => new
                    {
                        m.TenMon,
                        TonKho = _context.ChiTietKhos
                                    .Where(k => k.MaMon == m.MaMon && k.NgayHetHan > DateTime.Now)
                                    .Sum(k => k.SoLuongHienTai ?? 0),
                        HinhAnh = !string.IsNullOrEmpty(m.HinhAnh) ? m.HinhAnh : m.HinhAnhMonAns.Select(h => h.DuongDan).FirstOrDefault()
                    })
                    .Where(x => x.TonKho <= 10) 
                    .OrderBy(x => x.TonKho)    
                    .Take(5)
                    .ToListAsync();

                return Ok(new
                {
                    doanhThu,
                    donHang = tongDon,
                    tongMon,
                    tongKhach,
                    aov = tongDon > 0 ? (doanhThu / tongDon) : 0, 
                    statusData,
                    topSanPham,
                    donMoi,
                    revenueChart,
                    lowStock
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }
    }
}