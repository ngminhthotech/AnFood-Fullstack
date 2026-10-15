﻿using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnFoodAPI.Models;
using AnFoodAPI.DTOs; 
using System.Net;
using System.Net.Mail;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization; 
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;

namespace AnFoodAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NguoiDungController : ControllerBase
    {
        private readonly AnshopDbContext _context;
        private readonly IConfiguration _configuration;

        public NguoiDungController(AnshopDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // ============================================================
        // 1. GET ALL USERS (ĐÃ FIX LỖI 500: TÁCH LOGIC XỬ LÝ SANG RAM)
        // ============================================================
        [HttpGet]
        [Authorize(Roles = "admin")] 
        public async Task<ActionResult<IEnumerable<object>>> GetAllNguoiDung()
        {
            try 
            {
                // BƯỚC 1: Ép MySQL chỉ lấy dữ liệu thô, không cho nó dịch logic phức tạp
                var rawData = await _context.NguoiDungs
                    .Select(u => new 
                    {
                        u.MaNguoiDung,
                        u.HoTen,
                        u.Email,
                        u.SoDienThoai,
                        u.DiaChi,
                        u.TrangThai,
                        u.NgayTao,
                        u.IsDeleted, 
                        u.MaVaiTro
                    })
                    .OrderByDescending(u => u.MaNguoiDung)
                    .ToListAsync();

                // BƯỚC 2: Ánh xạ và chuyển đổi dữ liệu cực nhanh trên RAM của C#
                var users = rawData.Select(u => new 
                {
                    u.MaNguoiDung,
                    u.HoTen,
                    u.Email,
                    u.SoDienThoai,
                    u.DiaChi,
                    u.TrangThai,
                    u.NgayTao,
                    IsDeleted = u.IsDeleted ?? false, // Dùng ?? an toàn hơn HasValue
                    VaiTro = u.MaVaiTro == 1 ? "admin" : "user"
                }).ToList();

                return Ok(users);
            }
            catch (Exception ex)
            {
                // Trả về chi tiết lỗi sâu nhất nếu vẫn dính
                return StatusCode(500, new { message = "Server Error: " + ex.Message, detail = ex.InnerException?.Message });
            }
        }

        // ============================================================
        // 2. GET USER BY ID (ĐÃ FIX ĐỒNG BỘ CÁCH LÀM)
        // ============================================================
        [HttpGet("{id}")]
        [Authorize] 
        public async Task<ActionResult<object>> GetNguoiDung(int id)
        {
            var userIdClaim = User.FindFirst("MaNguoiDung")?.Value;
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (userIdClaim != null && roleClaim != "admin" && int.Parse(userIdClaim) != id)
            {
                return Forbid(); 
            }

            var rawUser = await _context.NguoiDungs
                .Where(u => u.MaNguoiDung == id)
                .Select(u => new 
                {
                    u.MaNguoiDung,
                    u.HoTen,
                    u.Email,
                    u.SoDienThoai,
                    u.DiaChi,
                    u.TrangThai,
                    u.NgayTao,
                    u.IsDeleted,
                    u.MaVaiTro
                })
                .FirstOrDefaultAsync();

            if (rawUser == null) return NotFound(new { message = "User not found" });

            var user = new 
            {
                rawUser.MaNguoiDung,
                rawUser.HoTen,
                rawUser.Email,
                rawUser.SoDienThoai,
                rawUser.DiaChi,
                rawUser.TrangThai,
                rawUser.NgayTao,
                IsDeleted = rawUser.IsDeleted ?? false,
                VaiTro = rawUser.MaVaiTro == 1 ? "admin" : "user"
            };

            return Ok(user);
        }

        // ============================================================
        // 3. LOGIN 
        // ============================================================
        [HttpPost("DangNhap")]
        public IActionResult DangNhap([FromBody] UserLoginModel model)
        {
            var user = _context.NguoiDungs.FirstOrDefault(u => u.Email == model.Email && u.MatKhau == model.MatKhau);

            if (user == null) return Unauthorized(new { message = "Sai email hoặc mật khẩu!" });

            bool isLocked = user.IsDeleted ?? false;
            if (isLocked || user.TrangThai == "bi_khoa")
            {
                return Unauthorized(new { message = "Tài khoản đã bị khóa. Vui lòng liên hệ Admin." });
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? "DAY_LA_KEY_BI_MAT_CUA_FASTBITE_123456789"); 

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim("MaNguoiDung", user.MaNguoiDung.ToString()), 
                    new Claim(ClaimTypes.Name, user.HoTen ?? ""),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, (user.MaVaiTro == 1 ? "admin" : "customer")) 
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Ok(new
            {
                message = "Đăng nhập thành công",
                token = tokenString, 
                user = new
                {
                    maNguoiDung = user.MaNguoiDung,
                    hoTen = user.HoTen,
                    email = user.Email,
                    soDienThoai = user.SoDienThoai,
                    vaiTro = (user.MaVaiTro == 1 ? "admin" : "customer"),
                    diaChi = user.DiaChi
                }
            });
        }

        // ============================================================
        // 4. REGISTER
        // ============================================================
        [HttpPost("DangKy")]
        public async Task<IActionResult> DangKy([FromBody] DangKyRequest req)
        {
            if (await _context.NguoiDungs.AnyAsync(u => u.Email == req.Email))
            {
                return BadRequest(new { message = "Email này đã được sử dụng!" });
            }

            var newUser = new NguoiDung
            {
                HoTen = req.TenNguoiDung,
                Email = req.Email,
                MatKhau = req.MatKhau, 
                SoDienThoai = req.SoDienThoai,
                MaVaiTro = 2, 
                TrangThai = "hoat_dong",
                NgayTao = DateTime.Now,
                DiaChi = req.DiaChi,
                IsDeleted = false 
            };

            _context.NguoiDungs.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đăng ký thành công!", userId = newUser.MaNguoiDung });
        }

        // ============================================================
        // 5. ADD USER (ADMIN ONLY)
        // ============================================================
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<NguoiDung>> PostNguoiDung(NguoiDung nguoiDung)
        {
            if (await _context.NguoiDungs.AnyAsync(u => u.Email == nguoiDung.Email))
            {
                return Conflict(new { message = "Email đã tồn tại" });
            }

            if (nguoiDung.MaVaiTro == 0 || nguoiDung.MaVaiTro == null) nguoiDung.MaVaiTro = 2;
            nguoiDung.NgayTao ??= DateTime.Now;
            nguoiDung.IsDeleted = false; 

            _context.NguoiDungs.Add(nguoiDung);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetNguoiDung", new { id = nguoiDung.MaNguoiDung }, nguoiDung);
        }

        // ============================================================
        // 6. UPDATE USER
        // ============================================================
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> PutNguoiDung(int id, NguoiDung nguoiDung)
        {
            var userIdClaim = User.FindFirst("MaNguoiDung")?.Value;
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (userIdClaim != null && roleClaim != "admin" && int.Parse(userIdClaim) != id)
            {
                return Unauthorized(new { message = "Bạn không có quyền sửa thông tin người khác" });
            }

            if (id != nguoiDung.MaNguoiDung) return BadRequest(new { message = "ID không khớp" });

            var existingUser = await _context.NguoiDungs.FindAsync(id);
            if (existingUser == null) return NotFound();

            existingUser.HoTen = nguoiDung.HoTen;
            existingUser.SoDienThoai = nguoiDung.SoDienThoai;
            existingUser.DiaChi = nguoiDung.DiaChi;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }

            return Ok(new { message = "Cập nhật thành công!" });
        }

        // ============================================================
        // 7. SOFT DELETE (LOCK ACCOUNT - ADMIN ONLY)
        // ============================================================
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteNguoiDung(int id)
        {
            var nguoiDung = await _context.NguoiDungs.FindAsync(id);
            if (nguoiDung == null) return NotFound(new { message = "Không tìm thấy người dùng" });

            if (nguoiDung.MaVaiTro == 1) 
            {
                return BadRequest(new { message = "Không thể khóa tài khoản Admin!" });
            }

            nguoiDung.IsDeleted = true;
            nguoiDung.TrangThai = "bi_khoa"; 
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã khóa tài khoản thành công." });
        }

        // ============================================================
        // 8. RESTORE (UNLOCK - ADMIN ONLY)
        // ============================================================
        [HttpPut("Restore/{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> RestoreNguoiDung(int id)
        {
            var nguoiDung = await _context.NguoiDungs.FindAsync(id);
            if (nguoiDung == null) return NotFound("User not found");

            nguoiDung.IsDeleted = false;
            nguoiDung.TrangThai = "hoat_dong"; 
            await _context.SaveChangesAsync();

            return Ok(new { message = "Mở khóa tài khoản thành công!" });
        }

        // ============================================================
        // 9. OTP & QUÊN MẬT KHẨU
        // ============================================================
        [HttpPost("GuiOTP")]
        public async Task<IActionResult> GuiOTP([FromBody] UserLoginModel model)
        {
            var user = await _context.NguoiDungs.FirstOrDefaultAsync(u => u.Email == model.Email);
            if (user == null) return NotFound(new { message = "Email không tồn tại trong hệ thống" });
            
            bool isLocked = user.IsDeleted ?? false;
            if (isLocked) return BadRequest(new { message = "Tài khoản đang bị khóa." });

            Random generator = new Random();
            string otp = generator.Next(0, 1000000).ToString("D6");

            user.OtpCode = otp;
            user.OtpExpiry = DateTime.Now.AddMinutes(5); 
            await _context.SaveChangesAsync();

            bool emailSent = GuiEmailThat(user.Email, "Mã xác thực quên mật khẩu", $"Mã OTP của bạn là: <b>{otp}</b>. Mã có hiệu lực trong 5 phút.");

            if (emailSent)
                return Ok(new { message = "Đã gửi mã OTP vào email của bạn. Vui lòng kiểm tra." });
            else 
                return StatusCode(500, new { message = "Lỗi gửi email. (Dev: Check console log for details)" });
        }

        [HttpPost("DoiMatKhauOTP")]
        public async Task<IActionResult> DoiMatKhauOTP([FromBody] ResetPassModel model)
        {
            var user = await _context.NguoiDungs.FirstOrDefaultAsync(u => u.Email == model.Email);
            if (user == null) return NotFound(new { message = "Người dùng không tồn tại" });

            if (user.OtpCode != model.Otp || user.OtpExpiry < DateTime.Now)
            {
                return BadRequest(new { message = "Mã OTP không đúng hoặc đã hết hạn!" });
            }

            user.MatKhau = model.MatKhauMoi; 
            user.OtpCode = null;
            user.OtpExpiry = null;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Đổi mật khẩu thành công! Vui lòng đăng nhập lại." });
        }

        private bool GuiEmailThat(string toEmail, string subject, string body)
        {
            try
            {
                var smtpClient = new SmtpClient("smtp.gmail.com")
                {
                    Port = 587,
                    Credentials = new NetworkCredential("your-email@gmail.com", "your-app-password"),
                    EnableSsl = true,
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress("your-email@gmail.com", "AnFood Support"),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true,
                };
                mailMessage.To.Add(toEmail);

                smtpClient.Send(mailMessage);
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Lỗi gửi mail: " + ex.Message);
                Console.WriteLine($"[DEBUG MODE] OTP gửi đến {toEmail}: {body}"); 
                return false; 
            }
        }
    }

    // DTOs
    public class UserLoginModel { public string Email { get; set; } public string MatKhau { get; set; } }
    public class DangKyRequest { public string TenNguoiDung { get; set; } public string Email { get; set; } public string MatKhau { get; set; } public string SoDienThoai { get; set; } public string DiaChi { get; set; } }
    public class ResetPassModel { public string Email { get; set; } public string Otp { get; set; } public string MatKhauMoi { get; set; } }
}