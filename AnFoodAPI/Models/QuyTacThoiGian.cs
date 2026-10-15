using System;
using System.Collections.Generic;

namespace AnFoodAPI.Models;

public partial class QuyTacThoiGian
{
    public int MaQuyTac { get; set; }

    public string? Buoi { get; set; }

    public int? MaDanhMuc { get; set; }

    public virtual DanhMuc? MaDanhMucNavigation { get; set; }
}
