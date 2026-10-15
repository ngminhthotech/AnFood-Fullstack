using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;       // Để dùng [Key]
using System.ComponentModel.DataAnnotations.Schema; // Để dùng [Column]

namespace AnFoodAPI.Models;

public partial class HinhAnhMonAn
{
    // 👇 CHUYÊN NGHIỆP: Phải định nghĩa rõ Key và tên cột trong SQL
    [Key]

    [Column("ma_hinh")] // Tên cột trong MySQL (thường là chữ thường gạch dưới)
    public int MaHinhAnh { get; set; }

    [Column("ma_mon")]
    public int? MaMon { get; set; }

    [Column("duong_dan")]
    public string? DuongDan { get; set; }

    [Column("ngay_tao")]
    public DateTime? NgayTao { get; set; }

    [ForeignKey("MaMon")]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual MonAn? MonAn { get; set; }
}