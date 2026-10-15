using System;
using System.Collections.Generic;

namespace AnFoodAPI.Models;

public partial class ThoiTiet
{
    public int MaThoiTiet { get; set; }

    public string? Loai { get; set; }

    public float? NhietDo { get; set; }

    public DateTime? ThoiGian { get; set; }
}
