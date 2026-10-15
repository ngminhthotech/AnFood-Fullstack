using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnFoodAPI.Models;
using AnFoodAPI.Services; 
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace AnFoodAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DonHangController : ControllerBase
    {
        private readonly AnshopDbContext _context;
        private readonly IOrderService _orderService;

        public DonHangController(AnshopDbContext context, IOrderService orderService)
        {
            _context = context;
            _orderService = orderService;
        }

        // ============================================================
        // 0. HÀM HELPER: CHUYỂN TIẾNG VIỆT SANG CHUẨN ENUM MYSQL
        // Ngăn chặn tuyệt đối lỗi "Data truncated for column 'trang_thai'"
        // ============================================================
        private string ChuanHoaTrangThai(string input)
        {
            if (string.IsNullOrWhiteSpace(input)) return "cho_xu_ly";
            
            var str = input.Trim().ToLower();
            if (str == "chờ xử lý" || str == "pending" || str == "cho_xu_ly") return "cho_xu_ly";
            if (str == "đang giao" || str == "delivering" || str == "dang_giao") return "dang_giao";
            if (str == "hoàn thành" || str == "đã giao" || str == "completed" || str == "hoan_thanh") return "hoan_thanh";
            if (str == "đã hủy" || str == "hủy" || str == "cancelled" || str == "huy") return "huy";
            
            return "cho_xu_ly"; // Mặc định an toàn
        }

        // ============================================================
        // 1. TẠO ĐƠN HÀNG (TRỪ KHO FIFO + GHI LỊCH SỬ TRẠNG THÁI)
        // (Lưu ý: Lỗi ENUM tạo đơn nằm trong OrderService, sếp xem hướng dẫn bên dưới nhé)
        // ============================================================
        [HttpPost("TaoDon")]
        public async Task<IActionResult> TaoDon([FromBody] TaoDonRequest req)
        {
            var result = await _orderService.CreateOrderAsync(req);

            if (!result.Success)
            {
                return BadRequest(new { success = false, message = result.Message });
            }

            return Ok(new { success = true, message = result.Message, maDonHang = result.MaDonHang });
        }

        // ============================================================
        // 2. LẤY TẤT CẢ ĐƠN (CHO ADMIN)
        // ============================================================
        [HttpGet]
        public async Task<IActionResult> GetAllDonHangs()
        {
            var donHangs = await _context.DonHangs
                .Include(d => d.NguoiDung)
                .Include(d => d.ChiTietDonHangs)
                    .ThenInclude(ct => ct.MonAn)
                        .ThenInclude(m => m.HinhAnhMonAns)
                .OrderByDescending(d => d.NgayDat)
                .ToListAsync();

            var list = donHangs.Select(d => new 
            {
                d.MaDonHang,
                d.NguoiNhan,        
                d.SoDienThoai,
                d.DiaChiGiaoHang,
                d.TongTien,
                d.PhiVanChuyen, 
                d.SoTienGiam,   
                d.MaVoucher,    
                d.TrangThai,
                d.NgayDat,
                d.GhiChu,
                d.LyDoHuy, 
                NguoiDung = d.NguoiDung == null ? null : new {
                    d.NguoiDung.MaNguoiDung,
                    d.NguoiDung.HoTen,
                    d.NguoiDung.Email,
                    d.NguoiDung.SoDienThoai
                },
                ChiTietDonHangs = d.ChiTietDonHangs.Select(ct => new {
                    ct.MaChiTiet,
                    ct.SoLuong,
                    ct.DonGia,
                    ct.MaMon,
                    MonAn = ct.MonAn == null ? null : new {
                        ct.MonAn.TenMon,
                        HinhAnh = !string.IsNullOrEmpty(ct.MonAn.HinhAnh) 
                            ? ct.MonAn.HinhAnh 
                            : (ct.MonAn.HinhAnhMonAns?.FirstOrDefault()?.DuongDan)
                    }
                }).ToList()
            }).ToList();

            return Ok(list);
        }

        // ============================================================
        // 3. CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG BỞI ADMIN (ĐÃ BỌC THÉP ENUM)
        // ============================================================
        [HttpPut("CapNhatTrangThai/{id}")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string trangThaiMoi)
        {
            // 🌟 Ép Frontend gửi tiếng Việt hay tiếng Anh đều về chuẩn ENUM của DB
            string trangThaiDbChuan = ChuanHoaTrangThai(trangThaiMoi);

            var donHang = await _context.DonHangs
                .Include(d => d.ChiTietDonHangs)
                .FirstOrDefaultAsync(d => d.MaDonHang == id);

            if (donHang == null) return NotFound(new { message = "Không tìm thấy đơn hàng!" });

            string trangThaiCu = donHang.TrangThai;
            if (trangThaiCu == trangThaiDbChuan) return Ok(new { message = "Trạng thái không thay đổi." });

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                donHang.TrangThai = trangThaiDbChuan;

                var lichSu = new LichSuTrangThaiDonHang
                {
                    MaDonHang = id,
                    TrangThai = trangThaiDbChuan,
                    ThoiGian = DateTime.UtcNow.AddHours(7), 
                    GhiChu = $"Chuyển trạng thái từ [{trangThaiCu}] sang [{trangThaiDbChuan}]"
                };
                _context.LichSuTrangThaiDonHangs.Add(lichSu);

                // Nếu hủy đơn thì hoàn kho
                if (trangThaiDbChuan == "huy" && trangThaiCu != "huy")
                {
                    foreach (var item in donHang.ChiTietDonHangs)
                    {
                        int maMonThucTe = item.MaMon ?? 0;
                        int soLuongThucTe = item.SoLuong ?? 0;

                        var loHang = await _context.ChiTietKhos
                            .Where(k => k.MaMon == maMonThucTe)
                            .OrderByDescending(k => k.NgayHetHan)
                            .FirstOrDefaultAsync();

                        if (loHang != null)
                        {
                            loHang.SoLuongHienTai = (loHang.SoLuongHienTai ?? 0) + soLuongThucTe;
                            _context.ChiTietKhos.Update(loHang);

                            var lichSuKho = new LichSuKho {
                                MaMon = maMonThucTe,
                                SoLuong = soLuongThucTe, 
                                LoaiGiaoDich = "HoanTra",
                                GhiChu = $"Hoàn trả kho do Admin hủy đơn hàng: #{id}",
                                NgayTao = DateTime.Now
                            };
                            _context.LichSuKhos.Add(lichSuKho);
                        }
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Cập nhật thành công và đã lưu lịch sử!" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine("LỖI CẬP NHẬT TRẠNG THÁI: " + ex.Message);
                return StatusCode(500, new { message = "Có lỗi xảy ra khi cập nhật." });
            }
        }

        // ============================================================
        // 4. LỊCH SỬ ĐƠN HÀNG (CHO KHÁCH HÀNG) 
        // ============================================================
        [HttpGet("LichSu/{maNguoiDung}")]
        public async Task<IActionResult> GetLichSuDonHang(int maNguoiDung)
        {
            var donHangs = await _context.DonHangs
                .Include(d => d.ChiTietDonHangs)
                    .ThenInclude(ct => ct.MonAn)
                        .ThenInclude(m => m.HinhAnhMonAns)
                .Where(d => d.MaNguoiDung == maNguoiDung)
                .OrderByDescending(d => d.NgayDat)
                .ToListAsync();

            var history = donHangs.Select(d => new
            {
                d.MaDonHang,
                d.NgayDat,
                d.TongTien,
                d.PhiVanChuyen, 
                d.SoTienGiam,   
                d.TrangThai,
                d.DiaChiGiaoHang, 
                d.LyDoHuy, 
                ChiTiet = d.ChiTietDonHangs.Select(ct => new
                {
                    TenMon = ct.MonAn?.TenMon ?? "Món đã bị xóa",
                    SoLuong = ct.SoLuong,
                    DonGia = ct.DonGia,
                    HinhAnh = !string.IsNullOrEmpty(ct.MonAn?.HinhAnh) 
                            ? ct.MonAn.HinhAnh 
                            : (ct.MonAn?.HinhAnhMonAns?.FirstOrDefault()?.DuongDan ?? "https://placehold.co/100x100?text=Food")
                }).ToList()
            }).ToList();

            return Ok(history);
        }

        // ============================================================
        // 5. KHÁCH HÀNG TỰ HỦY ĐƠN (ĐÃ BỌC THÉP ENUM)
        // ============================================================
        [HttpPost("KhachHangHuyDon")]
        public async Task<IActionResult> KhachHangHuyDon([FromBody] HuyDonRequest req)
        {
            var donHang = await _context.DonHangs
                .Include(d => d.ChiTietDonHangs)
                .FirstOrDefaultAsync(d => d.MaDonHang == req.MaDonHang && d.MaNguoiDung == req.MaNguoiDung);

            if (donHang == null) return NotFound(new { message = "Không tìm thấy đơn hàng hoặc bạn không có quyền!" });

            if (donHang.TrangThai != "cho_xu_ly") 
                return BadRequest(new { message = "Bạn không thể hủy đơn hàng này vì quán đã bắt đầu xử lý!" });

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 🌟 Gán chữ "huy" (Tuyệt đối không gán "Đã hủy" có dấu)
                donHang.TrangThai = "huy";
                donHang.LyDoHuy = req.LyDoHuy;

                var lichSu = new LichSuTrangThaiDonHang
                {
                    MaDonHang = req.MaDonHang,
                    TrangThai = "huy",
                    ThoiGian = DateTime.UtcNow.AddHours(7), 
                    GhiChu = $"[KHÁCH TỰ HỦY ĐƠN] Lý do: {req.LyDoHuy}"
                };
                _context.LichSuTrangThaiDonHangs.Add(lichSu);

                foreach (var item in donHang.ChiTietDonHangs)
                {
                    int maMonThucTe = item.MaMon ?? 0;
                    int soLuongThucTe = item.SoLuong ?? 0;

                    var loHang = await _context.ChiTietKhos
                        .Where(k => k.MaMon == maMonThucTe)
                        .OrderByDescending(k => k.NgayHetHan)
                        .FirstOrDefaultAsync();

                    if (loHang != null)
                    {
                        loHang.SoLuongHienTai = (loHang.SoLuongHienTai ?? 0) + soLuongThucTe;
                        _context.ChiTietKhos.Update(loHang);

                        var lichSuKho = new LichSuKho {
                            MaMon = maMonThucTe,
                            SoLuong = soLuongThucTe, 
                            LoaiGiaoDich = "HoanTra",
                            GhiChu = $"Hoàn kho do khách tự hủy đơn #{req.MaDonHang}",
                            NgayTao = DateTime.Now
                        };
                        _context.LichSuKhos.Add(lichSuKho);
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { success = true, message = "Hủy đơn hàng thành công!" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Lỗi khi hủy đơn: " + ex.Message });
            }
        }

        // ============================================================
        // 6. KIỂM TRA TỒN KHO TRƯỚC KHI VÀO TRANG THANH TOÁN
        // ============================================================
        [HttpPost("KiemTraTonKho")]
        public async Task<IActionResult> KiemTraTonKho([FromBody] List<ChiTietDonHangRequest> req)
        {
            foreach (var item in req)
            {
                var cacLoHang = await _context.ChiTietKhos
                    .Where(k => k.MaMon == item.MaMonAn && k.SoLuongHienTai > 0 && k.NgayHetHan > DateTime.Now)
                    .ToListAsync();

                int tongTonKho = cacLoHang.Sum(k => k.SoLuongHienTai ?? 0);

                if (tongTonKho < item.SoLuong)
                {
                    var monAn = await _context.MonAns.FindAsync(item.MaMonAn);
                    string tenMonHienThi = monAn != null ? monAn.TenMon : $"Món này";

                    return BadRequest(new { 
                        success = false, 
                        message = $"⚠️ Ôi không! Món '{tenMonHienThi}' hiện chỉ còn {tongTonKho} phần (hoặc đã hết HSD). Sếp vui lòng xóa khỏi giỏ và chọn món khác ở phần Gợi ý bên dưới nhé!" 
                    });
                }
            }

            return Ok(new { success = true });
        }
    } 

    // ============================================================
    // DTOs (Data Transfer Objects)
    // ============================================================
    public class TaoDonRequest
    {
        public int MaNguoiDung { get; set; }
        public string NguoiNhan { get; set; }
        public string SoDienThoai { get; set; }
        public string DiaChiGiaoHang { get; set; }
        public string GhiChu { get; set; }
        public decimal TongTien { get; set; }
        
        public decimal PhiVanChuyen { get; set; }
        public int? MaVoucher { get; set; }
        public decimal SoTienGiam { get; set; }

        public List<ChiTietDonHangRequest> ChiTietDonHangs { get; set; }
    }

    public class ChiTietDonHangRequest
    {
        public int MaMonAn { get; set; }
        public int SoLuong { get; set; }
        public decimal GiaBan { get; set; }
    }

    public class HuyDonRequest
    {
        public int MaDonHang { get; set; }
        public int MaNguoiDung { get; set; }
        public string LyDoHuy { get; set; }
    }
}