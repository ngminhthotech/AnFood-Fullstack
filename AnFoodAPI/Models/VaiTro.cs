using System;
using System.Collections.Generic;

namespace AnFoodAPI.Models;

public partial class VaiTro
{
    public int MaVaiTro { get; set; }

    public string? TenVaiTro { get; set; }

    public DateTime? NgayTao { get; set; }

    public virtual ICollection<NguoiDung> NguoiDungs { get; set; } = new List<NguoiDung>();

    public virtual ICollection<Quyen> MaQuyens { get; set; } = new List<Quyen>();
}
