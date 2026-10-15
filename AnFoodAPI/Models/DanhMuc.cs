using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnFoodAPI.Models
{
    [Table("danh_muc")]
    public partial class DanhMuc
    {
        public DanhMuc()
        {
            MonAns = new HashSet<MonAn>();
            QuyTacThoiGians = new HashSet<QuyTacThoiGian>();
        }

        [Key]
        [Column("ma_danh_muc")]
        public int MaDanhMuc { get; set; }

        [Column("ten_danh_muc")]
        public string? TenDanhMuc { get; set; }

        [Column("mo_ta")]
        public string? MoTa { get; set; }
        

        [Column("IsDeleted")]
        public bool IsDeleted { get; set; } = false;

        // --- Quan hệ ---
        [InverseProperty("MaDanhMucNavigation")]
        public virtual ICollection<MonAn> MonAns { get; set; }

        public virtual ICollection<QuyTacThoiGian> QuyTacThoiGians { get; set; }
    }
}