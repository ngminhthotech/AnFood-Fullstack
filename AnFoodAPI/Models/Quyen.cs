using System;
using System.Collections.Generic;

namespace AnFoodAPI.Models;

public partial class Quyen
{
    public int MaQuyen { get; set; }

    public string? TenQuyen { get; set; }

    public DateTime? NgayTao { get; set; }

    public virtual ICollection<VaiTro> MaVaiTros { get; set; } = new List<VaiTro>();
}
