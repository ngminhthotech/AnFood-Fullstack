using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnFoodAPI.Models
{
    [Table("ai_lich_su_hanh_vi")]
    public class AiLichSuHanhVi
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("ma_nguoi_dung")]
        public int? MaNguoiDung { get; set; } // Có dấu ? vì khách vãng lai có thể NULL

        [Column("ma_mon")]
        public int MaMon { get; set; }

        [Column("loai_hanh_vi")]
        public string LoaiHanhVi { get; set; }

        [Column("diem_hanh_vi")]
        public float DiemHanhVi { get; set; }

        [Column("ngay_tao")]
        public DateTime NgayTao { get; set; }
    }
}