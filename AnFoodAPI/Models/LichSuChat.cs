using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnFoodAPI.Models
{
    [Table("lich_su_chats")]
    public class LichSuChat
    {
        [Key]
        [Column("MaTinNhan")]
        public int MaTinNhan { get; set; }
        
        [Column("MaNguoiDung")]
        public int? MaNguoiDung { get; set; }
        
        [Column("NoiDung")]
        public string NoiDung { get; set; }
        
        [Column("NguoiGui")]
        public string NguoiGui { get; set; }
        
        [Column("ThoiGian")]
        public DateTime? ThoiGian { get; set; }
    }
}