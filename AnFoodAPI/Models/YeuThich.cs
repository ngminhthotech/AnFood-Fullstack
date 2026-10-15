using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnFoodAPI.Models;

[Table("yeu_thich")]
public partial class YeuThich
{
    [Key]
    [Column("ma_yeu_thich")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int MaYeuThich { get; set; }

    [Column("ma_nguoi_dung")]
    public int? MaNguoiDung { get; set; }

    [Column("ma_mon")]
    public int? MaMon { get; set; }

    [Column("ngay_tao")]
    public DateTime? NgayTao { get; set; }

    // Mệnh lệnh 1: Khóa ngoại là ma_mon, trỏ chính xác vào list YeuThiches của bảng MonAn
    [ForeignKey("MaMon")]
    [InverseProperty("YeuThiches")]
    public virtual MonAn? MaMonNavigation { get; set; }

    // Mệnh lệnh 2: Khóa ngoại là ma_nguoi_dung, trỏ chính xác vào list YeuThiches của bảng NguoiDung
    [ForeignKey("MaNguoiDung")]
    [InverseProperty("YeuThiches")]
    public virtual NguoiDung? MaNguoiDungNavigation { get; set; }
}