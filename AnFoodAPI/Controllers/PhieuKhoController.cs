using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnFoodAPI.Models;
using AnFoodAPI.DTOs;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace AnFoodAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PhieuKhoController : ControllerBase
    {
        private readonly AnshopDbContext _context;

        public PhieuKhoController(AnshopDbContext context)
        {
            _context = context;
        }

        // ====================================================================
        // 1. TẠO PHIẾU KHO (NHẬP HOẶC XUẤT) - TÍCH HỢP TÍNH GIÁ VỐN & FIFO
        // ====================================================================
        [HttpPost("TaoPhieu")]
        public async Task<IActionResult> TaoPhieuKho([FromBody] TaoPhieuKhoRequest request)
        {
            if (request.DanhSachMon == null || !request.DanhSachMon.Any())
                return BadRequest(new { success = false, message = "Phiếu kho phải có ít nhất 1 món ăn!" });

            // Bắt đầu một Transaction an toàn. (Lỗi 1 chỗ = Hủy tất cả)
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. LƯU THÔNG TIN PHIẾU CHA (MASTER)
                var phieu = new PhieuKho
                {
                    LoaiPhieu = request.LoaiPhieu.ToUpper(), // Đảm bảo luôn in hoa (NHAP/XUAT)
                    MaNguoiDung = request.MaNguoiDung,
                    NgayTao = DateTime.Now,
                    GhiChu = request.GhiChu,
                    TongTien = request.TongTien
                };
                
                _context.PhieuKhos.Add(phieu);
                await _context.SaveChangesAsync(); // Lưu để lấy được MaPhieu (Id tự tăng)

                // 2. LƯU CHI TIẾT PHIẾU (DETAIL) VÀ XỬ LÝ KHO TỪNG MÓN
                foreach (var item in request.DanhSachMon)
                {
                    var monAn = await _context.MonAns.FindAsync(item.MaMon);
                    if (monAn == null) 
                        throw new Exception($"Không tìm thấy món ăn có mã {item.MaMon}");

                    // Thêm vào bảng Chi Tiết Phiếu Kho (Để làm chứng từ đối soát)
                    var chiTietPhieu = new ChiTietPhieuKho
                    {
                        MaPhieu = phieu.MaPhieu,
                        MaMon = item.MaMon,
                        SoLuong = item.SoLuong,
                        DonGia = item.DonGia
                    };
                    _context.ChiTietPhieuKhos.Add(chiTietPhieu);

                    // ==========================================
                    // NẾU LÀ PHIẾU NHẬP HÀNG
                    // ==========================================
                    if (phieu.LoaiPhieu == "NHAP")
                    {
                        // A. Tạo ra 1 Lô Hàng mới trong kho
                        var loHangMoi = new ChiTietKho
                        {
                            MaMon = item.MaMon,
                            SoLuongNhap = item.SoLuong,
                            SoLuongHienTai = item.SoLuong, // Ban đầu nhập về còn nguyên
                            NgayNhap = DateTime.Now,
                            NgayHetHan = item.NgayHetHan,
                            GhiChu = $"Nhập theo phiếu {phieu.MaPhieu}"
                        };
                        _context.ChiTietKhos.Add(loHangMoi);

                        // B. Tính lại Giá Vốn Bình Quân Gia Quyền
                        int tongTonKhoCu = await _context.ChiTietKhos
                            .Where(k => k.MaMon == item.MaMon && k.NgayHetHan > DateTime.Now)
                            .SumAsync(k => k.SoLuongHienTai ?? 0);

                        decimal giaVonCu = monAn.GiaVon ?? 0;
                        decimal giaVonMoi = item.DonGia;

                        if (tongTonKhoCu > 0) 
                        {
                            decimal tongGiaTriCu = giaVonCu * tongTonKhoCu;
                            decimal tongGiaTriMoi = item.DonGia * item.SoLuong;
                            giaVonMoi = (tongGiaTriCu + tongGiaTriMoi) / (tongTonKhoCu + item.SoLuong);
                        }
                        monAn.GiaVon = Math.Round(giaVonMoi, 2); 
                    }
                    
                    // ==========================================
                    // NẾU LÀ PHIẾU XUẤT HÀNG (Xuất Hủy, Xuất Trả,...)
                    // ==========================================
                    else if (phieu.LoaiPhieu == "XUAT")
                    {
                        int soLuongCanXuat = item.SoLuong;

                        // Thuật toán FIFO: Lấy lô sắp hết hạn ra trừ trước
                        var cacLoHang = await _context.ChiTietKhos
                            .Where(k => k.MaMon == item.MaMon && k.SoLuongHienTai > 0 && k.NgayHetHan > DateTime.Now)
                            .OrderBy(k => k.NgayHetHan)
                            .ToListAsync();

                        int tongTonThucTe = cacLoHang.Sum(k => k.SoLuongHienTai ?? 0);
                        if (tongTonThucTe < soLuongCanXuat)
                            throw new Exception($"Món '{monAn.TenMon}' không đủ hàng để xuất. Tồn kho thực tế: {tongTonThucTe}");

                        foreach (var lo in cacLoHang)
                        {
                            if (soLuongCanXuat == 0) break; 

                            if (lo.SoLuongHienTai >= soLuongCanXuat)
                            {
                                lo.SoLuongHienTai -= soLuongCanXuat;
                                soLuongCanXuat = 0;
                            }
                            else
                            {
                                soLuongCanXuat -= lo.SoLuongHienTai ?? 0;
                                lo.SoLuongHienTai = 0;
                            }
                            _context.ChiTietKhos.Update(lo);
                        }
                    }
                    else
                    {
                        throw new Exception("Loại phiếu không hợp lệ (Chỉ nhận NHAP hoặc XUAT)");
                    }
                    
                    _context.MonAns.Update(monAn);
                }

                // 3. CHỐT LƯU TOÀN BỘ VÀ HOÀN TẤT GIAO DỊCH
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { success = true, message = $"Đã tạo phiếu {phieu.LoaiPhieu} thành công!", maPhieu = phieu.MaPhieu });
            }
            catch (Exception ex)
            {
                // Nếu có bất kỳ lỗi gì ở trên (thiếu hàng, sai dữ liệu...), HỦY TẤT CẢ, không ghi bậy vào DB
                await transaction.RollbackAsync(); 
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // ====================================================================
        // 2. LẤY DANH SÁCH TẤT CẢ PHIẾU KHO (CHO ADMIN XEM)
        // ====================================================================
        [HttpGet]
        public async Task<IActionResult> GetAllPhieuKho()
        {
            try
            {
                var danhSachPhieu = await _context.PhieuKhos
                    .Include(p => p.MaNguoiDungNavigation)
                    .OrderByDescending(p => p.NgayTao)
                    .Select(p => new
                    {
                        p.MaPhieu,
                        p.LoaiPhieu, 
                        NguoiLap = p.MaNguoiDungNavigation != null ? p.MaNguoiDungNavigation.HoTen : "Không xác định",
                        p.NgayTao,
                        p.TongTien,
                        p.GhiChu
                    })
                    .ToListAsync();

                return Ok(danhSachPhieu);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi Server: " + ex.Message });
            }
        }

        // ====================================================================
        // 3. XEM CHI TIẾT 1 PHIẾU KHO (BAO GỒM CÁC MÓN ĂN BÊN TRONG)
        // ====================================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetChiTietPhieuKho(int id)
        {
            try
            {
                var phieu = await _context.PhieuKhos
                    .Include(p => p.MaNguoiDungNavigation)
                    .Include(p => p.ChiTietPhieuKhos)
                        .ThenInclude(ct => ct.MaMonNavigation)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.MaPhieu == id);

                if (phieu == null) 
                    return NotFound(new { success = false, message = "Không tìm thấy phiếu kho này!" });

                var result = new
                {
                    phieu.MaPhieu,
                    phieu.LoaiPhieu,
                    NguoiLap = phieu.MaNguoiDungNavigation != null ? phieu.MaNguoiDungNavigation.HoTen : "Không xác định",
                    phieu.NgayTao,
                    phieu.TongTien,
                    phieu.GhiChu,
                    ChiTiet = phieu.ChiTietPhieuKhos.Select(ct => new
                    {
                        ct.MaChiTietPhieu,
                        ct.MaMon,
                        TenMon = ct.MaMonNavigation != null ? ct.MaMonNavigation.TenMon : "Món đã bị xóa",
                        ct.SoLuong,
                        ct.DonGia,
                        ThanhTien = ct.SoLuong * ct.DonGia
                    }).ToList()
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi Server: " + ex.Message });
            }
        }
    }
}