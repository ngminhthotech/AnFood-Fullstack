using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace AnFoodAPI.Models;

public partial class AnshopDbContext : DbContext
{
    public AnshopDbContext()
    {
    }

    public AnshopDbContext(DbContextOptions<AnshopDbContext> options)
        : base(options)
    {
    }

    // --- DANH SÁCH BẢNG ---
    public virtual DbSet<ChiTietDonHang> ChiTietDonHangs { get; set; }
    public virtual DbSet<ChiTietGioHang> ChiTietGioHangs { get; set; }
    public virtual DbSet<DanhGia> DanhGias { get; set; } 
    public virtual DbSet<QuangCao> QuangCaos { get; set; }
    public virtual DbSet<DanhMuc> DanhMucs { get; set; }
    public virtual DbSet<DiaChiGiaoHang> DiaChiGiaoHangs { get; set; }
    public virtual DbSet<DonHang> DonHangs { get; set; }
    public virtual DbSet<GioHang> GioHangs { get; set; }
    public virtual DbSet<GoiYAi> GoiYAis { get; set; }
    public virtual DbSet<HanhViNguoiDung> HanhViNguoiDungs { get; set; }
    public virtual DbSet<HinhAnhMonAn> HinhAnhMonAns { get; set; }
    public virtual DbSet<LichSuTrangThaiDonHang> LichSuTrangThaiDonHangs { get; set; }
    public virtual DbSet<LienHe> LienHes { get; set; }
    public virtual DbSet<MonAn> MonAns { get; set; }
    public virtual DbSet<NguoiDung> NguoiDungs { get; set; }
    public virtual DbSet<QuyTacThoiGian> QuyTacThoiGians { get; set; }
    public virtual DbSet<Quyen> Quyens { get; set; }
    public virtual DbSet<ThanhToan> ThanhToans { get; set; }
    public virtual DbSet<ThoiTiet> ThoiTiets { get; set; }
    public virtual DbSet<ThongBao> ThongBaos { get; set; }
    public virtual DbSet<VaiTro> VaiTros { get; set; }
    public virtual DbSet<YeuThich> YeuThiches { get; set; }
    public virtual DbSet<LichSuKho> LichSuKhos { get; set; }
    public virtual DbSet<Voucher> Vouchers { get; set; }
    
    // 3 Bảng Quản lý Kho chuyên nghiệp
    public virtual DbSet<ChiTietKho> ChiTietKhos { get; set; }
    public virtual DbSet<PhieuKho> PhieuKhos { get; set; }
    public virtual DbSet<ChiTietPhieuKho> ChiTietPhieuKhos { get; set; }
    public DbSet<AiLichSuHanhVi> AiLichSuHanhVis { get; set; }
    public virtual DbSet<LichSuChat> LichSuChats { get; set; }

    // protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    //     => optionsBuilder.UseMySql("server=localhost;database=anshop_db;user=root", Microsoft.EntityFrameworkCore.ServerVersion.Parse("10.4.32-mariadb"));

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .UseCollation("utf8mb4_unicode_ci")
            .HasCharSet("utf8mb4");

        // --- CẤU HÌNH MÓN ĂN ---
        modelBuilder.Entity<MonAn>(entity =>
        {
            entity.HasKey(e => e.MaMon).HasName("PRIMARY");
            entity.ToTable("mon_an");
            entity.Property(e => e.MaMon).HasColumnName("ma_mon");
            entity.Property(e => e.TenMon).HasMaxLength(150).HasColumnName("ten_mon");
            entity.Property(e => e.Gia).HasPrecision(18, 2).HasColumnName("gia");
            entity.Property(e => e.GiaVon).HasPrecision(18, 2).HasColumnName("gia_von");
            entity.Property(e => e.TrangThai).HasDefaultValueSql("'con_ban'").HasColumnName("trang_thai");
            entity.Property(e => e.NgayTao).HasDefaultValueSql("current_timestamp()").HasColumnType("datetime").HasColumnName("ngay_tao");
            entity.Property(e => e.IsDeleted).HasColumnName("isDeleted");

            entity.HasOne(d => d.MaDanhMucNavigation)
                  .WithMany(p => p.MonAns)
                  .HasForeignKey(d => d.MaDanhMuc)
                  .HasConstraintName("mon_an_ibfk_1");
        });

        // --- CẤU HÌNH ĐÁNH GIÁ ---
        modelBuilder.Entity<DanhGia>(entity =>
        {
            entity.HasKey(e => e.MaDanhGia).HasName("PRIMARY");
            entity.ToTable("danh_gia");
            entity.Property(e => e.MaDanhGia).HasColumnName("ma_danh_gia");
            entity.Property(e => e.NgayDanhGia).HasDefaultValueSql("current_timestamp()").HasColumnType("datetime").HasColumnName("ngay_danh_gia");
            
            entity.HasOne<MonAn>().WithMany(p => p.DanhGia).HasForeignKey(d => d.MaMon).OnDelete(DeleteBehavior.ClientSetNull);
            entity.HasOne<NguoiDung>().WithMany(p => p.DanhGia).HasForeignKey(d => d.MaNguoiDung).OnDelete(DeleteBehavior.ClientSetNull);
        });

        // --- CẤU HÌNH CHI TIẾT ĐƠN HÀNG ---
        modelBuilder.Entity<ChiTietDonHang>(entity =>
        {
            entity.HasKey(e => e.MaChiTiet).HasName("PRIMARY");
            entity.ToTable("chi_tiet_don_hang");
            entity.Property(e => e.DonGia).HasPrecision(18, 2).HasColumnName("don_gia");
            entity.Property(e => e.GiaBan).HasPrecision(18, 2).HasColumnName("gia_ban");
            entity.Property(e => e.SoLuong).HasColumnName("so_luong");
        });

        // --- CẤU HÌNH CHI TIẾT GIỎ HÀNG ---
        modelBuilder.Entity<ChiTietGioHang>(entity =>
        {
            entity.HasKey(e => e.MaChiTietGio).HasName("PRIMARY"); 
            entity.ToTable("chi_tiet_gio_hang"); 
            entity.Property(e => e.MaChiTietGio).HasColumnName("ma_chi_tiet");
            entity.Property(e => e.MaGioHang).HasColumnName("ma_gio_hang");
            entity.Property(e => e.MaMon).HasColumnName("ma_mon");
            entity.Property(e => e.SoLuong).HasColumnName("so_luong");
        });

        // --- CẤU HÌNH ĐƠN HÀNG ---
        modelBuilder.Entity<DonHang>(entity =>
        {
            entity.HasKey(e => e.MaDonHang).HasName("PRIMARY");
            entity.ToTable("don_hang");
            entity.Property(e => e.TongTien).HasPrecision(18, 2).HasColumnName("tong_tien");
            entity.Property(e => e.NgayDat).HasDefaultValueSql("current_timestamp()").HasColumnType("datetime").HasColumnName("ngay_dat");
        });

        // --- CẤU HÌNH LỊCH SỬ KHO ---
        modelBuilder.Entity<LichSuKho>(entity =>
        {
            entity.HasKey(e => e.MaLichSu).HasName("PRIMARY");
            entity.ToTable("lich_su_kho");
            entity.Property(e => e.NgayTao).HasDefaultValueSql("current_timestamp()").HasColumnType("datetime");
        });

        // --- CẤU HÌNH BẢNG CHI TIẾT KHO (LÔ HÀNG) ---
        modelBuilder.Entity<ChiTietKho>(entity =>
        {
            entity.HasKey(e => e.MaChiTiet).HasName("PRIMARY");
            entity.ToTable("chi_tiet_kho");
            
            entity.Property(e => e.MaChiTiet).HasColumnName("ma_chi_tiet");
            entity.Property(e => e.MaMon).HasColumnName("ma_mon");
            entity.Property(e => e.SoLuongNhap).HasColumnName("so_luong_nhap");
            entity.Property(e => e.SoLuongHienTai).HasColumnName("so_luong_hien_tai");
            entity.Property(e => e.NgayNhap).HasColumnType("datetime").HasColumnName("ngay_nhap");
            entity.Property(e => e.NgayHetHan).HasColumnType("datetime").HasColumnName("ngay_het_han");
            entity.Property(e => e.GhiChu).HasColumnName("ghi_chu");

            entity.HasOne(d => d.MaMonNavigation)
                  .WithMany()
                  .HasForeignKey(d => d.MaMon)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // --- CẤU HÌNH PHIẾU KHO ---
        modelBuilder.Entity<PhieuKho>(entity =>
        {
            entity.HasKey(e => e.MaPhieu).HasName("PRIMARY");
            entity.ToTable("phieu_kho");
            
            entity.Property(e => e.MaPhieu).HasColumnName("ma_phieu");
            entity.Property(e => e.LoaiPhieu).HasMaxLength(10).HasColumnName("loai_phieu");
            entity.Property(e => e.MaNguoiDung).HasColumnName("ma_nguoi_dung");
            entity.Property(e => e.NgayTao).HasDefaultValueSql("current_timestamp()").HasColumnType("datetime").HasColumnName("ngay_tao");
            entity.Property(e => e.GhiChu).HasColumnName("ghi_chu");
            entity.Property(e => e.TongTien).HasPrecision(18, 2).HasColumnName("tong_tien");

            entity.HasOne(d => d.MaNguoiDungNavigation)
                  .WithMany()
                  .HasForeignKey(d => d.MaNguoiDung);
        });

        // --- CẤU HÌNH CHI TIẾT PHIẾU KHO ---
        modelBuilder.Entity<ChiTietPhieuKho>(entity =>
        {
            entity.HasKey(e => e.MaChiTietPhieu).HasName("PRIMARY");
            entity.ToTable("chi_tiet_phieu_kho");
            
            entity.Property(e => e.MaChiTietPhieu).HasColumnName("ma_chi_tiet_phieu");
            entity.Property(e => e.MaPhieu).HasColumnName("ma_phieu");
            entity.Property(e => e.MaMon).HasColumnName("ma_mon");
            entity.Property(e => e.SoLuong).HasColumnName("so_luong");
            entity.Property(e => e.DonGia).HasPrecision(18, 2).HasColumnName("don_gia");

            entity.HasOne(d => d.MaPhieuNavigation)
                  .WithMany(p => p.ChiTietPhieuKhos)
                  .HasForeignKey(d => d.MaPhieu)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            entity.HasOne(d => d.MaMonNavigation)
                  .WithMany()
                  .HasForeignKey(d => d.MaMon);
        });

        // --- CẤU HÌNH GIỎ HÀNG ---
        modelBuilder.Entity<GioHang>(entity => 
        { 
            entity.HasKey(e => e.MaGioHang).HasName("PRIMARY"); 
            entity.ToTable("gio_hang"); 
            entity.Property(e => e.MaGioHang).HasColumnName("ma_gio_hang");
            entity.Property(e => e.MaNguoiDung).HasColumnName("ma_nguoi_dung");
            entity.Property(e => e.NgayTao).HasColumnType("datetime").HasColumnName("ngay_tao");
        });

        // =====================================================================
        // KHAI BÁO KHÓA CHÍNH (PRIMARY KEY) HÀNG LOẠT CHO CÁC BẢNG CÒN LẠI
        // =====================================================================
        // --- CẤU HÌNH BẢNG AI GỢI Ý (CACHE) ---
        // --- CẤU HÌNH BẢNG AI GỢI Ý (CACHE) - FIX LỖI TẬN GỐC ---
        modelBuilder.Entity<GoiYAi>(entity => 
        { 
            entity.HasKey(e => e.MaGoiY).HasName("PRIMARY"); 
            entity.ToTable("goi_y_ai"); 
            
            entity.Property(e => e.MaGoiY).HasColumnName("ma_goi_y");
            entity.Property(e => e.MaNguoiDung).HasColumnName("ma_nguoi_dung");
            entity.Property(e => e.MaMon).HasColumnName("ma_mon");
            entity.Property(e => e.Diem).HasColumnName("diem");
            entity.Property(e => e.ThoiGian).HasColumnType("datetime").HasColumnName("thoi_gian");

            // 🔥 FIX: Liên kết chéo chuẩn 2 chiều với bảng MonAn
            entity.HasOne(d => d.MaMonNavigation)
                  .WithMany(p => p.GoiYAis) // Cập nhật đúng tên biến List bên bảng cha
                  .HasForeignKey(d => d.MaMon)
                  .HasConstraintName("FK_GoiY_MonAn")
                  .OnDelete(DeleteBehavior.Cascade);

            // 🔥 FIX: Liên kết chéo chuẩn 2 chiều với bảng NguoiDung
            entity.HasOne(d => d.MaNguoiDungNavigation)
                  .WithMany(p => p.GoiYAis) // Cập nhật đúng tên biến List bên bảng cha
                  .HasForeignKey(d => d.MaNguoiDung)
                  .HasConstraintName("FK_GoiY_NguoiDung")
                  .OnDelete(DeleteBehavior.Cascade);
        });
        modelBuilder.Entity<QuangCao>(entity => { entity.HasKey(e => e.MaQuangCao).HasName("PRIMARY"); entity.ToTable("quang_cao"); });
        modelBuilder.Entity<DanhMuc>(entity => { entity.HasKey(e => e.MaDanhMuc).HasName("PRIMARY"); entity.ToTable("danh_muc"); });
        modelBuilder.Entity<NguoiDung>(entity => { entity.HasKey(e => e.MaNguoiDung).HasName("PRIMARY"); entity.ToTable("nguoi_dung"); });
        modelBuilder.Entity<VaiTro>(entity => { entity.HasKey(e => e.MaVaiTro).HasName("PRIMARY"); entity.ToTable("vai_tro"); });
        modelBuilder.Entity<Quyen>(entity => { entity.HasKey(e => e.MaQuyen).HasName("PRIMARY"); entity.ToTable("quyen"); });
        modelBuilder.Entity<ThanhToan>(entity => { entity.HasKey(e => e.MaThanhToan).HasName("PRIMARY"); entity.ToTable("thanh_toan"); });
        modelBuilder.Entity<ThongBao>(entity => { entity.HasKey(e => e.MaThongBao).HasName("PRIMARY"); entity.ToTable("thong_bao"); });
        modelBuilder.Entity<LienHe>(entity => { entity.HasKey(e => e.MaLienHe).HasName("PRIMARY"); entity.ToTable("lien_he"); });
        modelBuilder.Entity<ThoiTiet>(entity => { entity.HasKey(e => e.MaThoiTiet).HasName("PRIMARY"); entity.ToTable("thoi_tiet"); });
        modelBuilder.Entity<HinhAnhMonAn>(entity => { entity.HasKey(e => e.MaHinhAnh).HasName("PRIMARY"); entity.ToTable("hinh_anh_mon_an"); });
        modelBuilder.Entity<QuyTacThoiGian>(entity => { entity.HasKey(e => e.MaQuyTac).HasName("PRIMARY"); entity.ToTable("quy_tac_thoi_gian"); });
        
        // --- CẤU HÌNH BẢNG YÊU THÍCH (FIX CHỐT HẠ LỖI 500) ---
        modelBuilder.Entity<YeuThich>(entity =>
        {
            entity.HasKey(e => e.MaYeuThich).HasName("PRIMARY");
            entity.ToTable("yeu_thich");

            entity.Property(e => e.MaYeuThich).HasColumnName("ma_yeu_thich");
            entity.Property(e => e.MaNguoiDung).HasColumnName("ma_nguoi_dung");
            entity.Property(e => e.MaMon).HasColumnName("ma_mon");
            entity.Property(e => e.NgayTao)
                  .HasDefaultValueSql("current_timestamp()")
                  .HasColumnType("datetime")
                  .HasColumnName("ngay_tao");

            // 🔥 FIX TẬN GỐC: Chỉ định rõ 2 chiều để chặn EF Core đẻ cột ảo
            entity.HasOne(d => d.MaMonNavigation)
                  .WithMany(p => p.YeuThiches) // <--- Điểm mấu chốt ở đây
                  .HasForeignKey(d => d.MaMon)
                  .HasConstraintName("FK_YeuThich_MonAn")
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.MaNguoiDungNavigation)
                  .WithMany(p => p.YeuThiches) // <--- Điểm mấu chốt ở đây
                  .HasForeignKey(d => d.MaNguoiDung)
                  .HasConstraintName("FK_YeuThich_NguoiDung")
                  .OnDelete(DeleteBehavior.Cascade);
        });
        // --- CẤU HÌNH BẢNG HÀNH VI NGƯỜI DÙNG (TRACKING) CHUẨN XÁC ---
        modelBuilder.Entity<HanhViNguoiDung>(entity => 
        { 
            entity.HasKey(e => e.MaHanhVi).HasName("PRIMARY"); 
            entity.ToTable("hanh_vi_nguoi_dung"); 
            
            // Map tên cột
            entity.Property(e => e.MaHanhVi).HasColumnName("ma_hanh_vi");
            entity.Property(e => e.MaNguoiDung).HasColumnName("ma_nguoi_dung");
            entity.Property(e => e.MaMon).HasColumnName("ma_mon");
            entity.Property(e => e.HanhVi).HasColumnName("hanh_vi");
            entity.Property(e => e.ThoiGian)
                  .HasDefaultValueSql("current_timestamp()")
                  .HasColumnType("datetime")
                  .HasColumnName("thoi_gian");

            // 👉 KẾT NỐI HOÀN HẢO: Định nghĩa rõ quan hệ 2 chiều với MonAn và NguoiDung
            entity.HasOne(d => d.MaMonNavigation)
                  .WithMany(p => p.HanhViNguoiDungs) // Trỏ tới tập hợp HanhViNguoiDungs trong class MonAn
                  .HasForeignKey(d => d.MaMon)
                  .HasConstraintName("FK_HanhVi_MonAn");

            entity.HasOne(d => d.MaNguoiDungNavigation)
                  .WithMany(p => p.HanhViNguoiDungs) // Trỏ tới tập hợp HanhViNguoiDungs trong class NguoiDung
                  .HasForeignKey(d => d.MaNguoiDung)
                  .HasConstraintName("FK_HanhVi_NguoiDung");
        });
        
        modelBuilder.Entity<DiaChiGiaoHang>(entity => { entity.HasKey(e => e.MaDiaChi).HasName("PRIMARY"); entity.ToTable("dia_chi_giao_hang"); }); 

        // --- CẤU HÌNH LỊCH SỬ TRẠNG THÁI ĐƠN HÀNG (CHUẨN TẬN GỐC) ---
        modelBuilder.Entity<LichSuTrangThaiDonHang>(entity => 
        { 
            entity.HasKey(e => e.MaLichSu).HasName("PRIMARY"); 
            entity.ToTable("lich_su_trang_thai_don_hang"); 
            
            // Ép tên cột chuẩn xác dưới MySQL
            entity.Property(e => e.MaLichSu).HasColumnName("ma_lich_su");
            entity.Property(e => e.MaDonHang).HasColumnName("ma_don_hang");
            entity.Property(e => e.TrangThai).HasColumnName("trang_thai");
            entity.Property(e => e.GhiChu).HasColumnName("ghi_chu");
            entity.Property(e => e.ThoiGian).HasColumnType("datetime").HasColumnName("thoi_gian");

            // 🔥 ĐIỂM CHỐT HẠ: Khai báo rõ ràng quan hệ 2 chiều
            entity.HasOne(d => d.MaDonHangNavigation)            // Bảng con có biến MaDonHangNavigation
                  .WithMany(p => p.LichSuTrangThaiDonHangs)      // Bảng cha (DonHang) có danh sách LichSuTrangThaiDonHangs
                  .HasForeignKey(d => d.MaDonHang)               // Dùng chung cột khóa ngoại ma_don_hang
                  .HasConstraintName("FK_LichSu_DonHang") 
                  .OnDelete(DeleteBehavior.Cascade); 
        });
        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}