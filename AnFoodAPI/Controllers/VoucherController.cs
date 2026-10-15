using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using AnFoodAPI.Models;

namespace AnFoodAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VoucherController : ControllerBase
    {
        private readonly AnshopDbContext _context;

        public VoucherController(AnshopDbContext context)
        {
            _context = context;
        }

        // =========================================================
        // 1. DÀNH CHO KHÁCH HÀNG: KIỂM TRA MÃ Ở TRANG THANH TOÁN
        // =========================================================
        [HttpPost("Check")]
        public async Task<IActionResult> CheckVoucher([FromBody] VoucherRequest req)
        {
            // 1. Tìm mã trong DB
            var voucher = await _context.Vouchers.FirstOrDefaultAsync(v => v.MaCode == req.MaCode);

            if (voucher == null || voucher.TrangThai == false)
                return BadRequest(new { message = "Mã giảm giá không tồn tại hoặc đã khóa!" });

            // 2. Kiểm tra thời gian & số lượng
            var now = DateTime.Now;
            if (now < voucher.NgayBatDau || now > voucher.NgayKetThuc) 
                return BadRequest(new { message = "Mã giảm giá không trong thời gian sử dụng!" });
                
            if (voucher.SoLuong <= 0) 
                return BadRequest(new { message = "Mã giảm giá đã hết lượt sử dụng!" });

            // 3. Kiểm tra điều kiện đơn hàng (Tổng tiền hàng chưa tính ship)
            if (req.TongTienDonHang < voucher.DonToiThieu)
                return BadRequest(new { message = $"Mua thêm {(voucher.DonToiThieu - req.TongTienDonHang):N0}đ để dùng mã này!" });

            // 4. Tính toán số tiền được giảm
            decimal soTienGiam = 0;
            if (voucher.LoaiGiamGia == "TienMat")
            {
                soTienGiam = (decimal)voucher.GiaTriGiam;
            }
            else if (voucher.LoaiGiamGia == "PhanTram")
            {
                soTienGiam = req.TongTienDonHang * ((decimal)voucher.GiaTriGiam / 100);
                if (voucher.GiamToiDa > 0 && soTienGiam > voucher.GiamToiDa)
                {
                    soTienGiam = (decimal)voucher.GiamToiDa;
                }
            }

            return Ok(new { 
                hopLe = true, 
                maVoucher = voucher.MaVoucher,
                soTienGiam = soTienGiam, 
                message = "Áp dụng mã thành công!" 
            });
        }

        // =========================================================
        // 2. DÀNH CHO ADMIN: LẤY DANH SÁCH MÃ
        // =========================================================
        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAllVouchers()
        {
            // Sắp xếp ngày bắt đầu giảm dần (mã mới tạo lên đầu)
            var vouchers = await _context.Vouchers.OrderByDescending(v => v.NgayBatDau).ToListAsync();
            return Ok(vouchers);
        }

        // =========================================================
        // 3. DÀNH CHO ADMIN: TẠO MÃ KHUYẾN MÃI MỚI
        // =========================================================
        [HttpPost("Create")]
        public async Task<IActionResult> CreateVoucher([FromBody] Voucher newVoucher)
        {
            if (newVoucher == null || string.IsNullOrWhiteSpace(newVoucher.MaCode))
                return BadRequest(new { message = "Dữ liệu mã giảm giá không hợp lệ!" });

            // Chuẩn hóa: Luôn ép mã code viết Hoa
            newVoucher.MaCode = newVoucher.MaCode.Trim().ToUpper();

            // Kiểm tra mã trùng
            var exists = await _context.Vouchers.AnyAsync(v => v.MaCode == newVoucher.MaCode);
            if (exists) return BadRequest(new { message = "Mã code này đã tồn tại trong hệ thống!" });

            // Set trạng thái mở mặc định
            newVoucher.TrangThai = true; 

            _context.Vouchers.Add(newVoucher);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tạo mã giảm giá thành công!", voucher = newVoucher });
        }
    }

    // Class hứng dữ liệu từ React gửi lên lúc Check
    public class VoucherRequest
    {
        public string MaCode { get; set; }
        public decimal TongTienDonHang { get; set; }
    }
}