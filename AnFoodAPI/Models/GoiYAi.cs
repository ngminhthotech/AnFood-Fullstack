using System;
using System.Collections.Generic;

namespace AnFoodAPI.Models;

public partial class GoiYAi
{
    public int MaGoiY { get; set; }

    public int? MaNguoiDung { get; set; }

    public int? MaMon { get; set; }

    public float? Diem { get; set; }

    public DateTime? ThoiGian { get; set; }

    public virtual MonAn? MaMonNavigation { get; set; }

    public virtual NguoiDung? MaNguoiDungNavigation { get; set; }
}
