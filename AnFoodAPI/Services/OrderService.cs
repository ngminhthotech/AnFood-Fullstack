using AnFoodAPI.Models;
using AnFoodAPI.Controllers; 
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace AnFoodAPI.Services
{
    public class OrderService : IOrderService
    {
        private readonly AnshopDbContext _context;

        public OrderService(AnshopDbContext context)
        {
            _context = context;
        }

        public async Task<(bool Success, string Message, int? MaDonHang)> CreateOrderAsync(TaoDonRequest req)
        {
            if (req.ChiTietDonHangs == null || !req.ChiTietDonHangs.Any())
                return (false, "Giỏ hàng trống!", null);

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // ============================================================
                // 1. TẠO ĐƠN HÀNG (TRẠNG THÁI CHUẨN ENUM)
                // ============================================================
                var donHang = new DonHang
                {
                    MaNguoiDung = req.MaNguoiDung,
                    NguoiNhan = req.NguoiNhan,
                    SoDienThoai = req.SoDienThoai,
                    DiaChiGiaoHang = req.DiaChiGiaoHang,
                    GhiChu = req.GhiChu,
                    TongTien = req.TongTien,
                    NgayDat = DateTime.UtcNow.AddHours(7),
                    TrangThai = "cho_xu_ly", // CHUẨN MYSQL
                    PhiVanChuyen = req.PhiVanChuyen,
                    MaVoucher = req.MaVoucher,
                    SoTienGiam = req.SoTienGiam
                };

                _context.DonHangs.Add(donHang);

                // TRỪ LƯỢT SỬ DỤNG VOUCHER (NẾU CÓ)
                if (req.MaVoucher.HasValue)
                {
                    var voucher = await _context.Vouchers.FindAsync(req.MaVoucher.Value);
                    if (voucher != null && voucher.SoLuong > 0)
                    {
                        voucher.SoLuong -= 1;
                        _context.Vouchers.Update(voucher);
                    }
                }

                await _context.SaveChangesAsync();

                // ============================================================
                // 2. GHI LỊCH SỬ TRẠNG THÁI BAN ĐẦU
                // ============================================================
                var lichSuTrangThai = new LichSuTrangThaiDonHang
                {
                    MaDonHang = donHang.MaDonHang,
                    TrangThai = "cho_xu_ly", // CHUẨN MYSQL
                    ThoiGian = DateTime.UtcNow.AddHours(7), 
                    GhiChu = "Đơn hàng mới được tạo trên hệ thống"
                };
                _context.LichSuTrangThaiDonHangs.Add(lichSuTrangThai);

                // ============================================================
                // 3. LƯU CHI TIẾT ĐƠN HÀNG & TRỪ TỒN KHO FIFO
                // ============================================================
                foreach (var item in req.ChiTietDonHangs)
                {
                    // LẤY TÊN MÓN ĐỂ BÁO LỖI CHO ĐẸP
                    var monAn = await _context.MonAns.FindAsync(item.MaMonAn);
                    string tenMonHienThi = monAn != null ? monAn.TenMon : $"Món ăn (Mã {item.MaMonAn})";

                    var chiTiet = new ChiTietDonHang
                    {
                        MaDonHang = donHang.MaDonHang,
                        MaMon = item.MaMonAn,
                        SoLuong = item.SoLuong,
                        DonGia = item.GiaBan 
                    };
                    _context.ChiTietDonHangs.Add(chiTiet);

                    int soLuongCanBan = item.SoLuong;
                    var cacLoHang = await _context.ChiTietKhos
                        .Where(k => k.MaMon == item.MaMonAn && k.SoLuongHienTai > 0 && k.NgayHetHan > DateTime.Now)
                        .OrderBy(k => k.NgayHetHan)
                        .ToListAsync();

                    int tongTonKho = cacLoHang.Sum(k => k.SoLuongHienTai ?? 0);
                    
                    // THÔNG BÁO RÕ RÀNG KHI HẾT HÀNG / HẾT DATE
                    if (tongTonKho < soLuongCanBan)
                        return (false, $"Rất tiếc! Món '{tenMonHienThi}' hiện chỉ còn {tongTonKho} phần (hoặc đã hết HSD). Sếp vui lòng xóa món này khỏi giỏ hàng nhé!", null);

                    foreach (var lo in cacLoHang)
                    {
                        if (soLuongCanBan == 0) break; 

                        if (lo.SoLuongHienTai >= soLuongCanBan)
                        {
                            lo.SoLuongHienTai -= soLuongCanBan;
                            soLuongCanBan = 0;
                        }
                        else
                        {
                            soLuongCanBan -= lo.SoLuongHienTai ?? 0;
                            lo.SoLuongHienTai = 0;
                        }
                        _context.ChiTietKhos.Update(lo);
                    }

                    var lichSuKho = new LichSuKho {
                        MaMon = item.MaMonAn,
                        SoLuong = item.SoLuong * -1, 
                        SoLuongTonSauKhiDoi = tongTonKho - item.SoLuong,
                        LoaiGiaoDich = "XuatBan",
                        GhiChu = $"Bán hàng cho mã đơn: {donHang.MaDonHang}",
                        NgayTao = DateTime.Now
                    };
                    _context.LichSuKhos.Add(lichSuKho);
                }

                // ============================================================
                // 4. LƯU THÔNG TIN THANH TOÁN (ĐÃ FIX LỖI ENUM TRANGTHAI)
                // ============================================================
                var phuongThuc = (req.GhiChu != null && req.GhiChu.ToUpper().Contains("VNPAY")) ? "VNPAY" : "COD";
                var thanhToan = new ThanhToan
                {
                    MaDonHang = donHang.MaDonHang,
                    SoTien = (double)req.TongTien, 
                    NgayThanhToan = DateTime.UtcNow.AddHours(7),
                    PhuongThuc = phuongThuc,
                    
                    // 🌟 ĐÃ FIX: Chỉ gán chữ "cho" theo đúng chuẩn Database
                    // (Nếu là VNPay, hệ thống sẽ tự động cập nhật lại thành "da_thanh_toan" sau khi khách quét mã xong)
                    TrangThai = "cho" 
                };
                _context.ThanhToans.Add(thanhToan);

                // ============================================================
                // 5. XÓA GIỎ HÀNG
                // ============================================================
                var gioHangs = await _context.GioHangs.Where(g => g.MaNguoiDung == req.MaNguoiDung).ToListAsync();
                if (gioHangs.Any())
                {
                    var listMaGioHang = gioHangs.Select(g => g.MaGioHang).ToList();
                    var chiTietCanXoa = await _context.ChiTietGioHangs
                        .Where(ct => ct.MaGioHang != null && listMaGioHang.Contains(ct.MaGioHang.Value))
                        .ToListAsync();

                    if (chiTietCanXoa.Any()) _context.ChiTietGioHangs.RemoveRange(chiTietCanXoa);
                    _context.GioHangs.RemoveRange(gioHangs);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return (true, "Đặt hàng thành công!", donHang.MaDonHang);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine("LỖI TẠO ĐƠN: " + ex.ToString());
                return (false, "Lỗi Đặt Hàng: " + (ex.InnerException?.Message ?? ex.Message), null);
            }
        }
    }
}