using Microsoft.AspNetCore.Mvc;
using AnFoodAPI.Models;
using AnFoodAPI.DTOs;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace AnFoodAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class KhoHangController : ControllerBase
    {
        private readonly AnshopDbContext _context;

        public KhoHangController(AnshopDbContext context)
        {
            _context = context;
        }

        // ====================================================================
        // 1. API CẢNH BÁO: Hàng sắp hết & Lô hàng sắp hết hạn
        // ====================================================================
        [HttpGet("CanhBao")]
        public async Task<IActionResult> GetCanhBaoHetHang()
        {
            var today = DateTime.Now;
            var thresholdDate = today.AddDays(3); // Cảnh báo trước 3 ngày

            // 1. Cảnh báo Món ăn có TỔNG tồn kho thấp (<= 5)
            var sapHetSoLuong = await _context.MonAns
                .Where(m => !m.IsDeleted)
                .Select(m => new {
                    MaMon = m.MaMon,
                    TenMon = m.TenMon,
                    HinhAnh = m.HinhAnh,
                    TongTonKho = _context.ChiTietKhos.Where(k => k.MaMon == m.MaMon && k.NgayHetHan > today).Sum(k => k.SoLuongHienTai ?? 0)
                })
                .Where(m => m.TongTonKho <= 5)
                .ToListAsync();

            // 2. Cảnh báo Lô hàng sắp hết hạn
            var sapHetHan = await _context.ChiTietKhos
                .Include(k => k.MaMonNavigation)
                .Where(k => k.SoLuongHienTai > 0 && k.NgayHetHan <= thresholdDate && !k.MaMonNavigation.IsDeleted)
                .Select(k => new {
                    MaMon = k.MaMon,
                    TenMon = k.MaMonNavigation.TenMon,
                    SoLuongConLaiTrongLo = k.SoLuongHienTai,
                    NgayHetHan = k.NgayHetHan,
                    IsExpired = k.NgayHetHan < today,
                    IsNearExpiry = k.NgayHetHan >= today && k.NgayHetHan <= thresholdDate
                })
                .ToListAsync();

            return Ok(new { 
                SoMonSapHetHang = sapHetSoLuong.Count, 
                DanhSachSapHetHang = sapHetSoLuong,
                SoLoSapHetHan = sapHetHan.Count,
                DanhSachLoSapHetHan = sapHetHan
            });
        }

        // ====================================================================
        // 2. API XEM LỊCH SỬ KHO (Giữ nguyên)
        // ====================================================================
        [HttpGet("LichSu/{maMon}")]
        public async Task<IActionResult> GetLichSu(int maMon)
        {
            var history = await _context.LichSuKhos
                .Where(x => x.MaMon == maMon)
                .OrderByDescending(x => x.NgayTao)
                .Select(x => new 
                {
                    x.MaLichSu,
                    x.SoLuong,
                    x.SoLuongTonSauKhiDoi,
                    x.LoaiGiaoDich,
                    x.GhiChu,
                    Ngay = x.NgayTao.ToString("dd/MM/yyyy HH:mm")
                })
                .ToListAsync();

            return Ok(history);
        }

        // ====================================================================
        // 3. API NHẬP HÀNG (TẠO LÔ MỚI)
        // ====================================================================
        [HttpPost("NhapHang")]
        public async Task<IActionResult> NhapHang([FromBody] NhapHangRequest req)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (req.SoLuong <= 0) return BadRequest("Số lượng nhập phải > 0");
                if (req.GiaNhap < 0) return BadRequest("Giá nhập không hợp lệ");

                var monAn = await _context.MonAns.FindAsync(req.MaMon);
                if (monAn == null) return NotFound("Không tìm thấy món ăn");

                // --- TẠO LÔ HÀNG MỚI VÀO BẢNG CHI_TIET_KHO ---
                var loHangMoi = new ChiTietKho
                {
                    MaMon = req.MaMon,
                    SoLuongNhap = req.SoLuong,
                    SoLuongHienTai = req.SoLuong,
                    NgayNhap = DateTime.Now,
                    NgayHetHan = req.NgayHetHan, // Hạn sử dụng lưu vào Lô hàng
                    GhiChu = req.GhiChu ?? "Nhập kho"
                };
                _context.ChiTietKhos.Add(loHangMoi);

                // --- TÍNH GIÁ VỐN TRUNG BÌNH & CẬP NHẬT TỔNG TỒN (Optional) ---
                int tongTonKhoCu = await _context.ChiTietKhos
                    .Where(k => k.MaMon == req.MaMon && k.NgayHetHan > DateTime.Now)
                    .SumAsync(k => k.SoLuongHienTai ?? 0);

                decimal giaVonCu = monAn.GiaVon ?? 0;
                decimal giaVonMoi = req.GiaNhap;

                if (tongTonKhoCu > 0) 
                {
                    decimal tongGiaTriCu = giaVonCu * tongTonKhoCu;
                    decimal tongGiaTriMoi = req.GiaNhap * req.SoLuong;
                    giaVonMoi = (tongGiaTriCu + tongGiaTriMoi) / (tongTonKhoCu + req.SoLuong);
                }

                monAn.GiaVon = Math.Round(giaVonMoi, 2); 
                // Có thể bỏ qua cập nhật monAn.SoLuong ở đây, vì sau này Tồn kho = SUM(ChiTietKho)

                // --- GHI LOG ---
                var lichSu = new LichSuKho
                {
                    MaMon = req.MaMon,
                    SoLuong = req.SoLuong, 
                    SoLuongTonSauKhiDoi = tongTonKhoCu + req.SoLuong,
                    LoaiGiaoDich = "NhapHang",
                    GhiChu = $"Nhập lô mới: {req.SoLuong} x {req.GiaNhap:N0}đ",
                    NgayTao = DateTime.Now
                };
                _context.LichSuKhos.Add(lichSu);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Nhập hàng thành công lô mới!" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, "Lỗi hệ thống: " + ex.Message);
            }
        }

        // ====================================================================
        // 4. API XUẤT KHO / BÁN HÀNG (THUẬT TOÁN FIFO - First In First Out)
        // ====================================================================
        [HttpPost("CapNhat")]
        public async Task<IActionResult> CapNhatKho([FromBody] CapNhatKhoRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try 
            {
                var monAn = await _context.MonAns.FindAsync(request.MaMon);
                if (monAn == null) return NotFound("Món không tồn tại");

                // Nếu là Xuất hàng (Số lượng âm)
                if (request.SoLuongThayDoi < 0)
                {
                    int soLuongCanXuat = Math.Abs(request.SoLuongThayDoi);

                    // Lấy danh sách các lô hàng còn tồn, xếp theo Hạn sử dụng Tăng dần (Sắp hết hạn xuất trước)
                    var cacLoHang = await _context.ChiTietKhos
                        .Where(k => k.MaMon == request.MaMon && k.SoLuongHienTai > 0 && k.NgayHetHan > DateTime.Now)
                        .OrderBy(k => k.NgayHetHan)
                        .ToListAsync();

                    int tongTonThucTe = cacLoHang.Sum(k => k.SoLuongHienTai ?? 0);
                    if (tongTonThucTe < soLuongCanXuat)
                        return BadRequest($"Kho không đủ hàng! Chỉ còn {tongTonThucTe} sản phẩm.");

                    // THUẬT TOÁN TRỪ DẦN FIFO
                    foreach (var lo in cacLoHang)
                    {
                        if (soLuongCanXuat == 0) break; // Đã xuất đủ

                        if (lo.SoLuongHienTai >= soLuongCanXuat)
                        {
                            // Lô này đủ hàng để xuất
                            lo.SoLuongHienTai -= soLuongCanXuat;
                            soLuongCanXuat = 0;
                        }
                        else
                        {
                            // Lô này không đủ, lấy sạch lô này rồi trừ tiếp ở lô sau
                            soLuongCanXuat -= lo.SoLuongHienTai ?? 0;
                            lo.SoLuongHienTai = 0;
                        }
                        _context.ChiTietKhos.Update(lo);
                    }
                }
                
                // --- Ghi LOG ---
                int tongTonMoi = await _context.ChiTietKhos
                    .Where(k => k.MaMon == request.MaMon && k.NgayHetHan > DateTime.Now)
                    .SumAsync(k => k.SoLuongHienTai ?? 0) + request.SoLuongThayDoi;

                var lichSu = new LichSuKho {
                    MaMon = request.MaMon,
                    SoLuong = request.SoLuongThayDoi,
                    SoLuongTonSauKhiDoi = tongTonMoi,
                    LoaiGiaoDich = request.LoaiGiaoDich ?? "XuatKho",
                    GhiChu = request.GhiChu ?? "Xuất kho tự động FIFO",
                    NgayTao = DateTime.Now
                };
                _context.LichSuKhos.Add(lichSu);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                
                return Ok(new { message = "Xuất kho thành công!", tonKhoMoi = tongTonMoi });
            }
            catch (Exception ex) 
            {
                await transaction.RollbackAsync();
                return StatusCode(500, "Lỗi hệ thống: " + ex.Message);
            }
        }
    }
}