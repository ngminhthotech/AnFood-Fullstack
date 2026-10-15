using System;
using System.Collections.Generic;

namespace AnFoodAPI.Models;

public partial class LichSuTrangThaiDonHang
{
    public int MaLichSu { get; set; }

    public int? MaDonHang { get; set; }

    public string? TrangThai { get; set; }

    public string? GhiChu { get; set; }

    public DateTime? ThoiGian { get; set; }

    public virtual DonHang? MaDonHangNavigation { get; set; }
}
