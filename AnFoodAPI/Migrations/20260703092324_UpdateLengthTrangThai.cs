using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AnFoodAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateLengthTrangThai : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "dia_chi_giao_hang_ibfk_1",
                table: "dia_chi_giao_hang");

            migrationBuilder.DropForeignKey(
                name: "gio_hang_ibfk_1",
                table: "gio_hang");

            migrationBuilder.DropForeignKey(
                name: "goi_y_ai_ibfk_1",
                table: "goi_y_ai");

            migrationBuilder.DropForeignKey(
                name: "goi_y_ai_ibfk_2",
                table: "goi_y_ai");

            migrationBuilder.DropForeignKey(
                name: "hanh_vi_nguoi_dung_ibfk_1",
                table: "hanh_vi_nguoi_dung");

            migrationBuilder.DropForeignKey(
                name: "hanh_vi_nguoi_dung_ibfk_2",
                table: "hanh_vi_nguoi_dung");

            migrationBuilder.DropForeignKey(
                name: "lich_su_trang_thai_don_hang_ibfk_1",
                table: "lich_su_trang_thai_don_hang");

            migrationBuilder.DropForeignKey(
                name: "nguoi_dung_ibfk_1",
                table: "nguoi_dung");

            migrationBuilder.DropForeignKey(
                name: "quy_tac_thoi_gian_ibfk_1",
                table: "quy_tac_thoi_gian");

            migrationBuilder.DropForeignKey(
                name: "thanh_toan_ibfk_1",
                table: "thanh_toan");

            migrationBuilder.DropForeignKey(
                name: "thong_bao_ibfk_1",
                table: "thong_bao");

            migrationBuilder.DropForeignKey(
                name: "yeu_thich_ibfk_1",
                table: "yeu_thich");

            migrationBuilder.DropForeignKey(
                name: "yeu_thich_ibfk_2",
                table: "yeu_thich");

            migrationBuilder.DropTable(
                name: "vai_tro_quyen");

            migrationBuilder.DropIndex(
                name: "ma_nguoi_dung6",
                table: "thong_bao");

            migrationBuilder.DropIndex(
                name: "ma_danh_muc1",
                table: "quy_tac_thoi_gian");

            migrationBuilder.DropPrimaryKey(
                name: "PK_quang_cao",
                table: "quang_cao");

            migrationBuilder.DropIndex(
                name: "email",
                table: "nguoi_dung");

            migrationBuilder.DropPrimaryKey(
                name: "PK_lich_su_kho",
                table: "lich_su_kho");

            migrationBuilder.DropPrimaryKey(
                name: "PK_hinh_anh_mon_an",
                table: "hinh_anh_mon_an");

            migrationBuilder.DropPrimaryKey(
                name: "PK_chi_tiet_kho",
                table: "chi_tiet_kho");

            migrationBuilder.DropColumn(
                name: "la_do_uong_mat",
                table: "mon_an");

            migrationBuilder.DropColumn(
                name: "la_mon_nong",
                table: "mon_an");

            migrationBuilder.DropColumn(
                name: "so_luong",
                table: "mon_an");

            migrationBuilder.DropColumn(
                name: "ton_kho",
                table: "mon_an");

            migrationBuilder.RenameIndex(
                name: "ma_nguoi_dung7",
                table: "yeu_thich",
                newName: "IX_yeu_thich_ma_nguoi_dung");

            migrationBuilder.RenameIndex(
                name: "ma_mon5",
                table: "yeu_thich",
                newName: "IX_yeu_thich_ma_mon");

            migrationBuilder.RenameColumn(
                name: "ten_vai_tro",
                table: "vai_tro",
                newName: "TenVaiTro");

            migrationBuilder.RenameColumn(
                name: "ngay_tao",
                table: "vai_tro",
                newName: "NgayTao");

            migrationBuilder.RenameColumn(
                name: "ma_vai_tro",
                table: "vai_tro",
                newName: "MaVaiTro");

            migrationBuilder.RenameColumn(
                name: "noi_dung",
                table: "thong_bao",
                newName: "NoiDung");

            migrationBuilder.RenameColumn(
                name: "ngay_tao",
                table: "thong_bao",
                newName: "NgayTao");

            migrationBuilder.RenameColumn(
                name: "ma_nguoi_dung",
                table: "thong_bao",
                newName: "MaNguoiDung");

            migrationBuilder.RenameColumn(
                name: "da_doc",
                table: "thong_bao",
                newName: "DaDoc");

            migrationBuilder.RenameColumn(
                name: "ma_thong_bao",
                table: "thong_bao",
                newName: "MaThongBao");

            migrationBuilder.RenameColumn(
                name: "loai",
                table: "thoi_tiet",
                newName: "Loai");

            migrationBuilder.RenameColumn(
                name: "thoi_gian",
                table: "thoi_tiet",
                newName: "ThoiGian");

            migrationBuilder.RenameColumn(
                name: "nhiet_do",
                table: "thoi_tiet",
                newName: "NhietDo");

            migrationBuilder.RenameColumn(
                name: "ma_thoi_tiet",
                table: "thoi_tiet",
                newName: "MaThoiTiet");

            migrationBuilder.RenameIndex(
                name: "ma_don_hang2",
                table: "thanh_toan",
                newName: "IX_thanh_toan_ma_don_hang");

            migrationBuilder.RenameColumn(
                name: "ten_quyen",
                table: "quyen",
                newName: "TenQuyen");

            migrationBuilder.RenameColumn(
                name: "ngay_tao",
                table: "quyen",
                newName: "NgayTao");

            migrationBuilder.RenameColumn(
                name: "ma_quyen",
                table: "quyen",
                newName: "MaQuyen");

            migrationBuilder.RenameColumn(
                name: "buoi",
                table: "quy_tac_thoi_gian",
                newName: "Buoi");

            migrationBuilder.RenameColumn(
                name: "ma_danh_muc",
                table: "quy_tac_thoi_gian",
                newName: "MaDanhMuc");

            migrationBuilder.RenameColumn(
                name: "ma_quy_tac",
                table: "quy_tac_thoi_gian",
                newName: "MaQuyTac");

            migrationBuilder.RenameIndex(
                name: "ma_vai_tro",
                table: "nguoi_dung",
                newName: "IX_nguoi_dung_ma_vai_tro");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "mon_an",
                newName: "isDeleted");

            migrationBuilder.RenameIndex(
                name: "ma_danh_muc",
                table: "mon_an",
                newName: "IX_mon_an_ma_danh_muc");

            migrationBuilder.RenameIndex(
                name: "ma_don_hang1",
                table: "lich_su_trang_thai_don_hang",
                newName: "IX_lich_su_trang_thai_don_hang_ma_don_hang");

            migrationBuilder.RenameIndex(
                name: "ma_nguoi_dung5",
                table: "hanh_vi_nguoi_dung",
                newName: "IX_hanh_vi_nguoi_dung_ma_nguoi_dung");

            migrationBuilder.RenameIndex(
                name: "ma_mon4",
                table: "hanh_vi_nguoi_dung",
                newName: "IX_hanh_vi_nguoi_dung_ma_mon");

            migrationBuilder.RenameIndex(
                name: "ma_nguoi_dung4",
                table: "goi_y_ai",
                newName: "IX_goi_y_ai_ma_nguoi_dung");

            migrationBuilder.RenameIndex(
                name: "ma_mon3",
                table: "goi_y_ai",
                newName: "IX_goi_y_ai_ma_mon");

            migrationBuilder.RenameIndex(
                name: "ma_nguoi_dung3",
                table: "gio_hang",
                newName: "IX_gio_hang_ma_nguoi_dung");

            migrationBuilder.RenameIndex(
                name: "ma_nguoi_dung2",
                table: "don_hang",
                newName: "IX_don_hang_ma_nguoi_dung");

            migrationBuilder.RenameIndex(
                name: "ma_dia_chi",
                table: "don_hang",
                newName: "IX_don_hang_ma_dia_chi");

            migrationBuilder.RenameIndex(
                name: "ma_nguoi_dung1",
                table: "dia_chi_giao_hang",
                newName: "IX_dia_chi_giao_hang_ma_nguoi_dung");

            migrationBuilder.RenameIndex(
                name: "ma_nguoi_dung",
                table: "danh_gia",
                newName: "IX_danh_gia_ma_nguoi_dung");

            migrationBuilder.RenameIndex(
                name: "ma_mon2",
                table: "danh_gia",
                newName: "IX_danh_gia_ma_mon");

            migrationBuilder.RenameIndex(
                name: "ma_mon1",
                table: "chi_tiet_gio_hang",
                newName: "IX_chi_tiet_gio_hang_ma_mon");

            migrationBuilder.RenameIndex(
                name: "ma_gio_hang",
                table: "chi_tiet_gio_hang",
                newName: "IX_chi_tiet_gio_hang_ma_gio_hang");

            migrationBuilder.RenameIndex(
                name: "ma_mon",
                table: "chi_tiet_don_hang",
                newName: "IX_chi_tiet_don_hang_ma_mon");

            migrationBuilder.RenameIndex(
                name: "ma_don_hang",
                table: "chi_tiet_don_hang",
                newName: "IX_chi_tiet_don_hang_ma_don_hang");

            migrationBuilder.AlterColumn<int>(
                name: "ma_nguoi_dung",
                table: "yeu_thich",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int(11)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_mon",
                table: "yeu_thich",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int(11)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_yeu_thich",
                table: "yeu_thich",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int(11)")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<string>(
                name: "TenVaiTro",
                table: "vai_tro",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "varchar(50)",
                oldMaxLength: 50,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<DateTime>(
                name: "NgayTao",
                table: "vai_tro",
                type: "datetime(6)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "current_timestamp()");

            migrationBuilder.AlterColumn<int>(
                name: "MaVaiTro",
                table: "vai_tro",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int(11)")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<string>(
                name: "NoiDung",
                table: "thong_bao",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<DateTime>(
                name: "NgayTao",
                table: "thong_bao",
                type: "datetime(6)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "current_timestamp()");

            migrationBuilder.AlterColumn<int>(
                name: "MaNguoiDung",
                table: "thong_bao",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int(11)",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "DaDoc",
                table: "thong_bao",
                type: "tinyint(1)",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "tinyint(1)",
                oldNullable: true,
                oldDefaultValueSql: "'0'");

            migrationBuilder.AlterColumn<int>(
                name: "MaThongBao",
                table: "thong_bao",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int(11)")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AddColumn<int>(
                name: "MaNguoiDungNavigationMaNguoiDung",
                table: "thong_bao",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Loai",
                table: "thoi_tiet",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "enum('nong','lanh','mua')",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<DateTime>(
                name: "ThoiGian",
                table: "thoi_tiet",
                type: "datetime(6)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "current_timestamp()");

            migrationBuilder.AlterColumn<int>(
                name: "MaThoiTiet",
                table: "thoi_tiet",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int(11)")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<string>(
                name: "trang_thai",
                table: "thanh_toan",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "enum('cho','da_thanh_toan','that_bai')",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<string>(
                name: "phuong_thuc",
                table: "thanh_toan",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "varchar(50)",
                oldMaxLength: 50,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<DateTime>(
                name: "ngay_thanh_toan",
                table: "thanh_toan",
                type: "datetime(6)",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldDefaultValueSql: "current_timestamp()");

            migrationBuilder.AlterColumn<int>(
                name: "ma_don_hang",
                table: "thanh_toan",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int(11)");

            migrationBuilder.AlterColumn<int>(
                name: "ma_thanh_toan",
                table: "thanh_toan",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int(11)")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<string>(
                name: "TenQuyen",
                table: "quyen",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "varchar(100)",
                oldMaxLength: 100,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<DateTime>(
                name: "NgayTao",
                table: "quyen",
                type: "datetime(6)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "current_timestamp()");

            migrationBuilder.AlterColumn<int>(
                name: "MaQuyen",
                table: "quyen",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int(11)")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<string>(
                name: "Buoi",
                table: "quy_tac_thoi_gian",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "enum('sang','trua','toi')",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<int>(
                name: "MaDanhMuc",
                table: "quy_tac_thoi_gian",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int(11)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "MaQuyTac",
                table: "quy_tac_thoi_gian",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int(11)")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AddColumn<int>(
                name: "MaDanhMucNavigationMaDanhMuc",
                table: "quy_tac_thoi_gian",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "trang_thai",
                table: "nguoi_dung",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "enum('hoat_dong','khoa')",
                oldNullable: true,
                oldDefaultValueSql: "'hoat_dong'")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<string>(
                name: "so_dien_thoai",
                table: "nguoi_dung",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "varchar(20)",
                oldMaxLength: 20,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<DateTime>(
                name: "ngay_tao",
                table: "nguoi_dung",
                type: "datetime(6)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "current_timestamp()");

            migrationBuilder.AlterColumn<string>(
                name: "mat_khau",
                table: "nguoi_dung",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "varchar(255)",
                oldMaxLength: 255,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<int>(
                name: "ma_vai_tro",
                table: "nguoi_dung",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int(11)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ho_ten",
                table: "nguoi_dung",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "varchar(100)",
                oldMaxLength: 100,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<string>(
                name: "email",
                table: "nguoi_dung",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "varchar(100)",
                oldMaxLength: 100,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<int>(
                name: "ma_nguoi_dung",
                table: "nguoi_dung",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int(11)")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<string>(
                name: "trang_thai",
                table: "mon_an",
                type: "longtext",
                nullable: true,
                defaultValueSql: "'con_ban'",
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "enum('con_ban','het_hang')",
                oldNullable: true,
                oldDefaultValueSql: "'con_ban'")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<string>(
                name: "mo_ta",
                table: "mon_an",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<int>(
                name: "ma_danh_muc",
                table: "mon_an",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int(11)",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "gia",
                table: "mon_an",
                type: "decimal(18,0)",
                precision: 18,
                scale: 2,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(10,2)",
                oldPrecision: 10,
                oldScale: 2);

            migrationBuilder.AlterColumn<int>(
                name: "ban_chay",
                table: "mon_an",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true,
                oldDefaultValueSql: "'0'");

            migrationBuilder.AlterColumn<int>(
                name: "ma_mon",
                table: "mon_an",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int(11)")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AddColumn<int>(
                name: "da_ban",
                table: "mon_an",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "gia_von",
                table: "mon_an",
                type: "decimal(18,0)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "so_dien_thoai",
                table: "lien_he",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "varchar(20)",
                oldMaxLength: 20,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<string>(
                name: "noi_dung",
                table: "lien_he",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<DateTime>(
                name: "ngay_gui",
                table: "lien_he",
                type: "datetime(6)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "current_timestamp()");

            migrationBuilder.AlterColumn<string>(
                name: "ho_ten",
                table: "lien_he",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "varchar(100)",
                oldMaxLength: 100,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<string>(
                name: "email",
                table: "lien_he",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "varchar(100)",
                oldMaxLength: 100,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<bool>(
                name: "da_phan_hoi",
                table: "lien_he",
                type: "tinyint(1)",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "tinyint(1)",
                oldNullable: true,
                oldDefaultValueSql: "'0'");

            migrationBuilder.AlterColumn<int>(
                name: "ma_lien_he",
                table: "lien_he",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int(11)")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<string>(
                name: "trang_thai",
                table: "lich_su_trang_thai_don_hang",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "varchar(50)",
                oldMaxLength: 50,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<DateTime>(
                name: "thoi_gian",
                table: "lich_su_trang_thai_don_hang",
                type: "datetime",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "current_timestamp()");

            migrationBuilder.AlterColumn<int>(
                name: "ma_don_hang",
                table: "lich_su_trang_thai_don_hang",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int(11)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ghi_chu",
                table: "lich_su_trang_thai_don_hang",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<int>(
                name: "ma_lich_su",
                table: "lich_su_trang_thai_don_hang",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int(11)")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<DateTime>(
                name: "ngay_tao",
                table: "lich_su_kho",
                type: "datetime",
                nullable: false,
                defaultValueSql: "current_timestamp()",
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)");

            migrationBuilder.AlterColumn<int>(
                name: "ma_mon",
                table: "lich_su_kho",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int(11)");

            migrationBuilder.AlterColumn<int>(
                name: "ma_mon",
                table: "hinh_anh_mon_an",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int(11)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_nguoi_dung",
                table: "hanh_vi_nguoi_dung",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int(11)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_mon",
                table: "hanh_vi_nguoi_dung",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int(11)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "hanh_vi",
                table: "hanh_vi_nguoi_dung",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "enum('xem','them_gio','mua')",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<int>(
                name: "ma_hanh_vi",
                table: "hanh_vi_nguoi_dung",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int(11)")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<DateTime>(
                name: "thoi_gian",
                table: "goi_y_ai",
                type: "datetime",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "current_timestamp()");

            migrationBuilder.AlterColumn<int>(
                name: "ma_nguoi_dung",
                table: "goi_y_ai",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int(11)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_mon",
                table: "goi_y_ai",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int(11)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_goi_y",
                table: "goi_y_ai",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int(11)")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<DateTime>(
                name: "ngay_tao",
                table: "gio_hang",
                type: "datetime",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "current_timestamp()");

            migrationBuilder.AlterColumn<int>(
                name: "ma_nguoi_dung",
                table: "gio_hang",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int(11)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_gio_hang",
                table: "gio_hang",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int(11)")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<string>(
                name: "trang_thai",
                table: "don_hang",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "enum('cho_xu_ly','dang_giao','hoan_thanh','huy','ChoDuyet')",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<decimal>(
                name: "tong_tien",
                table: "don_hang",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(10,2)",
                oldPrecision: 10,
                oldScale: 2,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "so_dien_thoai",
                table: "don_hang",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "varchar(20)",
                oldMaxLength: 20,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<string>(
                name: "nguoi_nhan",
                table: "don_hang",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "varchar(255)",
                oldMaxLength: 255,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<int>(
                name: "ma_nguoi_dung",
                table: "don_hang",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int(11)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_dia_chi",
                table: "don_hang",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int(11)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ghi_chu",
                table: "don_hang",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<string>(
                name: "dia_chi_giao_hang",
                table: "don_hang",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<int>(
                name: "ma_don_hang",
                table: "don_hang",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int(11)")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AddColumn<string>(
                name: "ly_do_huy",
                table: "don_hang",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_unicode_ci")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "ma_voucher",
                table: "don_hang",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "phi_van_chuyen",
                table: "don_hang",
                type: "decimal(65,30)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "so_tien_giam",
                table: "don_hang",
                type: "decimal(65,30)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "so_dien_thoai",
                table: "dia_chi_giao_hang",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "varchar(20)",
                oldMaxLength: 20,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<DateTime>(
                name: "ngay_tao",
                table: "dia_chi_giao_hang",
                type: "datetime(6)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true,
                oldDefaultValueSql: "current_timestamp()");

            migrationBuilder.AlterColumn<bool>(
                name: "mac_dinh",
                table: "dia_chi_giao_hang",
                type: "tinyint(1)",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "tinyint(1)",
                oldDefaultValueSql: "'0'");

            migrationBuilder.AlterColumn<int>(
                name: "ma_nguoi_dung",
                table: "dia_chi_giao_hang",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int(11)");

            migrationBuilder.AlterColumn<string>(
                name: "ho_ten_nguoi_nhan",
                table: "dia_chi_giao_hang",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "varchar(100)",
                oldMaxLength: 100,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<string>(
                name: "dia_chi",
                table: "dia_chi_giao_hang",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<int>(
                name: "ma_dia_chi",
                table: "dia_chi_giao_hang",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int(11)")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<string>(
                name: "ten_danh_muc",
                table: "danh_muc",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "varchar(100)",
                oldMaxLength: 100,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<string>(
                name: "mo_ta",
                table: "danh_muc",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<int>(
                name: "ma_danh_muc",
                table: "danh_muc",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int(11)")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<int>(
                name: "so_sao",
                table: "danh_gia",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int(11)");

            migrationBuilder.AlterColumn<string>(
                name: "nhan_xet",
                table: "danh_gia",
                type: "longtext",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<int>(
                name: "ma_nguoi_dung",
                table: "danh_gia",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int(11)");

            migrationBuilder.AlterColumn<int>(
                name: "ma_mon",
                table: "danh_gia",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int(11)");

            migrationBuilder.AlterColumn<int>(
                name: "ma_danh_gia",
                table: "danh_gia",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int(11)")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<int>(
                name: "so_luong_nhap",
                table: "chi_tiet_kho",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<int>(
                name: "so_luong_hien_tai",
                table: "chi_tiet_kho",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "ngay_nhap",
                table: "chi_tiet_kho",
                type: "datetime",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "ngay_het_han",
                table: "chi_tiet_kho",
                type: "datetime",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_mon",
                table: "chi_tiet_kho",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int(11)");

            migrationBuilder.AlterColumn<int>(
                name: "so_luong",
                table: "chi_tiet_gio_hang",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int(11)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_mon",
                table: "chi_tiet_gio_hang",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int(11)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_gio_hang",
                table: "chi_tiet_gio_hang",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int(11)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_chi_tiet",
                table: "chi_tiet_gio_hang",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int(11)")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<int>(
                name: "so_luong",
                table: "chi_tiet_don_hang",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int(11)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_mon",
                table: "chi_tiet_don_hang",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int(11)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_don_hang",
                table: "chi_tiet_don_hang",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int(11)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_chi_tiet",
                table: "chi_tiet_don_hang",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int(11)")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AddPrimaryKey(
                name: "PRIMARY",
                table: "quang_cao",
                column: "ma_quang_cao");

            migrationBuilder.AddPrimaryKey(
                name: "PRIMARY",
                table: "lich_su_kho",
                column: "ma_lich_su");

            migrationBuilder.AddPrimaryKey(
                name: "PRIMARY",
                table: "hinh_anh_mon_an",
                column: "ma_hinh");

            migrationBuilder.AddPrimaryKey(
                name: "PRIMARY",
                table: "chi_tiet_kho",
                column: "ma_chi_tiet");

            migrationBuilder.CreateTable(
                name: "ai_lich_su_hanh_vi",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ma_nguoi_dung = table.Column<int>(type: "int", nullable: true),
                    ma_mon = table.Column<int>(type: "int", nullable: false),
                    loai_hanh_vi = table.Column<string>(type: "longtext", nullable: true, collation: "utf8mb4_unicode_ci")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    diem_hanh_vi = table.Column<float>(type: "float", nullable: false),
                    ngay_tao = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ai_lich_su_hanh_vi", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4")
                .Annotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.CreateTable(
                name: "lich_su_chats",
                columns: table => new
                {
                    MaTinNhan = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    MaNguoiDung = table.Column<int>(type: "int", nullable: true),
                    NoiDung = table.Column<string>(type: "longtext", nullable: true, collation: "utf8mb4_unicode_ci")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    NguoiGui = table.Column<string>(type: "longtext", nullable: true, collation: "utf8mb4_unicode_ci")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ThoiGian = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_lich_su_chats", x => x.MaTinNhan);
                })
                .Annotation("MySql:CharSet", "utf8mb4")
                .Annotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.CreateTable(
                name: "phieu_kho",
                columns: table => new
                {
                    ma_phieu = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    loai_phieu = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true, collation: "utf8mb4_unicode_ci")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ma_nguoi_dung = table.Column<int>(type: "int", nullable: true),
                    ngay_tao = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "current_timestamp()"),
                    ghi_chu = table.Column<string>(type: "longtext", nullable: true, collation: "utf8mb4_unicode_ci")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    tong_tien = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PRIMARY", x => x.ma_phieu);
                    table.ForeignKey(
                        name: "FK_phieu_kho_nguoi_dung_ma_nguoi_dung",
                        column: x => x.ma_nguoi_dung,
                        principalTable: "nguoi_dung",
                        principalColumn: "ma_nguoi_dung");
                })
                .Annotation("MySql:CharSet", "utf8mb4")
                .Annotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.CreateTable(
                name: "QuyenVaiTro",
                columns: table => new
                {
                    MaQuyensMaQuyen = table.Column<int>(type: "int", nullable: false),
                    MaVaiTrosMaVaiTro = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuyenVaiTro", x => new { x.MaQuyensMaQuyen, x.MaVaiTrosMaVaiTro });
                    table.ForeignKey(
                        name: "FK_QuyenVaiTro_quyen_MaQuyensMaQuyen",
                        column: x => x.MaQuyensMaQuyen,
                        principalTable: "quyen",
                        principalColumn: "MaQuyen",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QuyenVaiTro_vai_tro_MaVaiTrosMaVaiTro",
                        column: x => x.MaVaiTrosMaVaiTro,
                        principalTable: "vai_tro",
                        principalColumn: "MaVaiTro",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4")
                .Annotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.CreateTable(
                name: "voucher",
                columns: table => new
                {
                    ma_voucher = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ma_code = table.Column<string>(type: "longtext", nullable: true, collation: "utf8mb4_unicode_ci")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    loai_giam_gia = table.Column<string>(type: "longtext", nullable: true, collation: "utf8mb4_unicode_ci")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    gia_tri_giam = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    giam_toi_da = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    don_toi_thieu = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    so_luong = table.Column<int>(type: "int", nullable: false),
                    ngay_bat_dau = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    ngay_ket_thuc = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    trang_thai = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_voucher", x => x.ma_voucher);
                })
                .Annotation("MySql:CharSet", "utf8mb4")
                .Annotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.CreateTable(
                name: "chi_tiet_phieu_kho",
                columns: table => new
                {
                    ma_chi_tiet_phieu = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ma_phieu = table.Column<int>(type: "int", nullable: false),
                    ma_mon = table.Column<int>(type: "int", nullable: false),
                    so_luong = table.Column<int>(type: "int", nullable: false),
                    don_gia = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PRIMARY", x => x.ma_chi_tiet_phieu);
                    table.ForeignKey(
                        name: "FK_chi_tiet_phieu_kho_mon_an_ma_mon",
                        column: x => x.ma_mon,
                        principalTable: "mon_an",
                        principalColumn: "ma_mon",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_chi_tiet_phieu_kho_phieu_kho_ma_phieu",
                        column: x => x.ma_phieu,
                        principalTable: "phieu_kho",
                        principalColumn: "ma_phieu",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4")
                .Annotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.CreateIndex(
                name: "IX_thong_bao_MaNguoiDungNavigationMaNguoiDung",
                table: "thong_bao",
                column: "MaNguoiDungNavigationMaNguoiDung");

            migrationBuilder.CreateIndex(
                name: "IX_quy_tac_thoi_gian_MaDanhMucNavigationMaDanhMuc",
                table: "quy_tac_thoi_gian",
                column: "MaDanhMucNavigationMaDanhMuc");

            migrationBuilder.CreateIndex(
                name: "IX_chi_tiet_phieu_kho_ma_mon",
                table: "chi_tiet_phieu_kho",
                column: "ma_mon");

            migrationBuilder.CreateIndex(
                name: "IX_chi_tiet_phieu_kho_ma_phieu",
                table: "chi_tiet_phieu_kho",
                column: "ma_phieu");

            migrationBuilder.CreateIndex(
                name: "IX_phieu_kho_ma_nguoi_dung",
                table: "phieu_kho",
                column: "ma_nguoi_dung");

            migrationBuilder.CreateIndex(
                name: "IX_QuyenVaiTro_MaVaiTrosMaVaiTro",
                table: "QuyenVaiTro",
                column: "MaVaiTrosMaVaiTro");

            migrationBuilder.AddForeignKey(
                name: "FK_dia_chi_giao_hang_nguoi_dung_ma_nguoi_dung",
                table: "dia_chi_giao_hang",
                column: "ma_nguoi_dung",
                principalTable: "nguoi_dung",
                principalColumn: "ma_nguoi_dung",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_gio_hang_nguoi_dung_ma_nguoi_dung",
                table: "gio_hang",
                column: "ma_nguoi_dung",
                principalTable: "nguoi_dung",
                principalColumn: "ma_nguoi_dung");

            migrationBuilder.AddForeignKey(
                name: "FK_GoiY_MonAn",
                table: "goi_y_ai",
                column: "ma_mon",
                principalTable: "mon_an",
                principalColumn: "ma_mon",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_GoiY_NguoiDung",
                table: "goi_y_ai",
                column: "ma_nguoi_dung",
                principalTable: "nguoi_dung",
                principalColumn: "ma_nguoi_dung",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_HanhVi_MonAn",
                table: "hanh_vi_nguoi_dung",
                column: "ma_mon",
                principalTable: "mon_an",
                principalColumn: "ma_mon");

            migrationBuilder.AddForeignKey(
                name: "FK_HanhVi_NguoiDung",
                table: "hanh_vi_nguoi_dung",
                column: "ma_nguoi_dung",
                principalTable: "nguoi_dung",
                principalColumn: "ma_nguoi_dung");

            migrationBuilder.AddForeignKey(
                name: "FK_LichSu_DonHang",
                table: "lich_su_trang_thai_don_hang",
                column: "ma_don_hang",
                principalTable: "don_hang",
                principalColumn: "ma_don_hang",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_nguoi_dung_vai_tro_ma_vai_tro",
                table: "nguoi_dung",
                column: "ma_vai_tro",
                principalTable: "vai_tro",
                principalColumn: "MaVaiTro");

            migrationBuilder.AddForeignKey(
                name: "FK_quy_tac_thoi_gian_danh_muc_MaDanhMucNavigationMaDanhMuc",
                table: "quy_tac_thoi_gian",
                column: "MaDanhMucNavigationMaDanhMuc",
                principalTable: "danh_muc",
                principalColumn: "ma_danh_muc");

            migrationBuilder.AddForeignKey(
                name: "FK_thanh_toan_don_hang_ma_don_hang",
                table: "thanh_toan",
                column: "ma_don_hang",
                principalTable: "don_hang",
                principalColumn: "ma_don_hang",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_thong_bao_nguoi_dung_MaNguoiDungNavigationMaNguoiDung",
                table: "thong_bao",
                column: "MaNguoiDungNavigationMaNguoiDung",
                principalTable: "nguoi_dung",
                principalColumn: "ma_nguoi_dung");

            migrationBuilder.AddForeignKey(
                name: "FK_YeuThich_MonAn",
                table: "yeu_thich",
                column: "ma_mon",
                principalTable: "mon_an",
                principalColumn: "ma_mon",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_YeuThich_NguoiDung",
                table: "yeu_thich",
                column: "ma_nguoi_dung",
                principalTable: "nguoi_dung",
                principalColumn: "ma_nguoi_dung",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_dia_chi_giao_hang_nguoi_dung_ma_nguoi_dung",
                table: "dia_chi_giao_hang");

            migrationBuilder.DropForeignKey(
                name: "FK_gio_hang_nguoi_dung_ma_nguoi_dung",
                table: "gio_hang");

            migrationBuilder.DropForeignKey(
                name: "FK_GoiY_MonAn",
                table: "goi_y_ai");

            migrationBuilder.DropForeignKey(
                name: "FK_GoiY_NguoiDung",
                table: "goi_y_ai");

            migrationBuilder.DropForeignKey(
                name: "FK_HanhVi_MonAn",
                table: "hanh_vi_nguoi_dung");

            migrationBuilder.DropForeignKey(
                name: "FK_HanhVi_NguoiDung",
                table: "hanh_vi_nguoi_dung");

            migrationBuilder.DropForeignKey(
                name: "FK_LichSu_DonHang",
                table: "lich_su_trang_thai_don_hang");

            migrationBuilder.DropForeignKey(
                name: "FK_nguoi_dung_vai_tro_ma_vai_tro",
                table: "nguoi_dung");

            migrationBuilder.DropForeignKey(
                name: "FK_quy_tac_thoi_gian_danh_muc_MaDanhMucNavigationMaDanhMuc",
                table: "quy_tac_thoi_gian");

            migrationBuilder.DropForeignKey(
                name: "FK_thanh_toan_don_hang_ma_don_hang",
                table: "thanh_toan");

            migrationBuilder.DropForeignKey(
                name: "FK_thong_bao_nguoi_dung_MaNguoiDungNavigationMaNguoiDung",
                table: "thong_bao");

            migrationBuilder.DropForeignKey(
                name: "FK_YeuThich_MonAn",
                table: "yeu_thich");

            migrationBuilder.DropForeignKey(
                name: "FK_YeuThich_NguoiDung",
                table: "yeu_thich");

            migrationBuilder.DropTable(
                name: "ai_lich_su_hanh_vi");

            migrationBuilder.DropTable(
                name: "chi_tiet_phieu_kho");

            migrationBuilder.DropTable(
                name: "lich_su_chats");

            migrationBuilder.DropTable(
                name: "QuyenVaiTro");

            migrationBuilder.DropTable(
                name: "voucher");

            migrationBuilder.DropTable(
                name: "phieu_kho");

            migrationBuilder.DropIndex(
                name: "IX_thong_bao_MaNguoiDungNavigationMaNguoiDung",
                table: "thong_bao");

            migrationBuilder.DropIndex(
                name: "IX_quy_tac_thoi_gian_MaDanhMucNavigationMaDanhMuc",
                table: "quy_tac_thoi_gian");

            migrationBuilder.DropPrimaryKey(
                name: "PRIMARY",
                table: "quang_cao");

            migrationBuilder.DropPrimaryKey(
                name: "PRIMARY",
                table: "lich_su_kho");

            migrationBuilder.DropPrimaryKey(
                name: "PRIMARY",
                table: "hinh_anh_mon_an");

            migrationBuilder.DropPrimaryKey(
                name: "PRIMARY",
                table: "chi_tiet_kho");

            migrationBuilder.DropColumn(
                name: "MaNguoiDungNavigationMaNguoiDung",
                table: "thong_bao");

            migrationBuilder.DropColumn(
                name: "MaDanhMucNavigationMaDanhMuc",
                table: "quy_tac_thoi_gian");

            migrationBuilder.DropColumn(
                name: "da_ban",
                table: "mon_an");

            migrationBuilder.DropColumn(
                name: "gia_von",
                table: "mon_an");

            migrationBuilder.DropColumn(
                name: "ly_do_huy",
                table: "don_hang");

            migrationBuilder.DropColumn(
                name: "ma_voucher",
                table: "don_hang");

            migrationBuilder.DropColumn(
                name: "phi_van_chuyen",
                table: "don_hang");

            migrationBuilder.DropColumn(
                name: "so_tien_giam",
                table: "don_hang");

            migrationBuilder.RenameIndex(
                name: "IX_yeu_thich_ma_nguoi_dung",
                table: "yeu_thich",
                newName: "ma_nguoi_dung7");

            migrationBuilder.RenameIndex(
                name: "IX_yeu_thich_ma_mon",
                table: "yeu_thich",
                newName: "ma_mon5");

            migrationBuilder.RenameColumn(
                name: "TenVaiTro",
                table: "vai_tro",
                newName: "ten_vai_tro");

            migrationBuilder.RenameColumn(
                name: "NgayTao",
                table: "vai_tro",
                newName: "ngay_tao");

            migrationBuilder.RenameColumn(
                name: "MaVaiTro",
                table: "vai_tro",
                newName: "ma_vai_tro");

            migrationBuilder.RenameColumn(
                name: "NoiDung",
                table: "thong_bao",
                newName: "noi_dung");

            migrationBuilder.RenameColumn(
                name: "NgayTao",
                table: "thong_bao",
                newName: "ngay_tao");

            migrationBuilder.RenameColumn(
                name: "MaNguoiDung",
                table: "thong_bao",
                newName: "ma_nguoi_dung");

            migrationBuilder.RenameColumn(
                name: "DaDoc",
                table: "thong_bao",
                newName: "da_doc");

            migrationBuilder.RenameColumn(
                name: "MaThongBao",
                table: "thong_bao",
                newName: "ma_thong_bao");

            migrationBuilder.RenameColumn(
                name: "Loai",
                table: "thoi_tiet",
                newName: "loai");

            migrationBuilder.RenameColumn(
                name: "ThoiGian",
                table: "thoi_tiet",
                newName: "thoi_gian");

            migrationBuilder.RenameColumn(
                name: "NhietDo",
                table: "thoi_tiet",
                newName: "nhiet_do");

            migrationBuilder.RenameColumn(
                name: "MaThoiTiet",
                table: "thoi_tiet",
                newName: "ma_thoi_tiet");

            migrationBuilder.RenameIndex(
                name: "IX_thanh_toan_ma_don_hang",
                table: "thanh_toan",
                newName: "ma_don_hang2");

            migrationBuilder.RenameColumn(
                name: "TenQuyen",
                table: "quyen",
                newName: "ten_quyen");

            migrationBuilder.RenameColumn(
                name: "NgayTao",
                table: "quyen",
                newName: "ngay_tao");

            migrationBuilder.RenameColumn(
                name: "MaQuyen",
                table: "quyen",
                newName: "ma_quyen");

            migrationBuilder.RenameColumn(
                name: "Buoi",
                table: "quy_tac_thoi_gian",
                newName: "buoi");

            migrationBuilder.RenameColumn(
                name: "MaDanhMuc",
                table: "quy_tac_thoi_gian",
                newName: "ma_danh_muc");

            migrationBuilder.RenameColumn(
                name: "MaQuyTac",
                table: "quy_tac_thoi_gian",
                newName: "ma_quy_tac");

            migrationBuilder.RenameIndex(
                name: "IX_nguoi_dung_ma_vai_tro",
                table: "nguoi_dung",
                newName: "ma_vai_tro");

            migrationBuilder.RenameColumn(
                name: "isDeleted",
                table: "mon_an",
                newName: "IsDeleted");

            migrationBuilder.RenameIndex(
                name: "IX_mon_an_ma_danh_muc",
                table: "mon_an",
                newName: "ma_danh_muc");

            migrationBuilder.RenameIndex(
                name: "IX_lich_su_trang_thai_don_hang_ma_don_hang",
                table: "lich_su_trang_thai_don_hang",
                newName: "ma_don_hang1");

            migrationBuilder.RenameIndex(
                name: "IX_hanh_vi_nguoi_dung_ma_nguoi_dung",
                table: "hanh_vi_nguoi_dung",
                newName: "ma_nguoi_dung5");

            migrationBuilder.RenameIndex(
                name: "IX_hanh_vi_nguoi_dung_ma_mon",
                table: "hanh_vi_nguoi_dung",
                newName: "ma_mon4");

            migrationBuilder.RenameIndex(
                name: "IX_goi_y_ai_ma_nguoi_dung",
                table: "goi_y_ai",
                newName: "ma_nguoi_dung4");

            migrationBuilder.RenameIndex(
                name: "IX_goi_y_ai_ma_mon",
                table: "goi_y_ai",
                newName: "ma_mon3");

            migrationBuilder.RenameIndex(
                name: "IX_gio_hang_ma_nguoi_dung",
                table: "gio_hang",
                newName: "ma_nguoi_dung3");

            migrationBuilder.RenameIndex(
                name: "IX_don_hang_ma_nguoi_dung",
                table: "don_hang",
                newName: "ma_nguoi_dung2");

            migrationBuilder.RenameIndex(
                name: "IX_don_hang_ma_dia_chi",
                table: "don_hang",
                newName: "ma_dia_chi");

            migrationBuilder.RenameIndex(
                name: "IX_dia_chi_giao_hang_ma_nguoi_dung",
                table: "dia_chi_giao_hang",
                newName: "ma_nguoi_dung1");

            migrationBuilder.RenameIndex(
                name: "IX_danh_gia_ma_nguoi_dung",
                table: "danh_gia",
                newName: "ma_nguoi_dung");

            migrationBuilder.RenameIndex(
                name: "IX_danh_gia_ma_mon",
                table: "danh_gia",
                newName: "ma_mon2");

            migrationBuilder.RenameIndex(
                name: "IX_chi_tiet_gio_hang_ma_mon",
                table: "chi_tiet_gio_hang",
                newName: "ma_mon1");

            migrationBuilder.RenameIndex(
                name: "IX_chi_tiet_gio_hang_ma_gio_hang",
                table: "chi_tiet_gio_hang",
                newName: "ma_gio_hang");

            migrationBuilder.RenameIndex(
                name: "IX_chi_tiet_don_hang_ma_mon",
                table: "chi_tiet_don_hang",
                newName: "ma_mon");

            migrationBuilder.RenameIndex(
                name: "IX_chi_tiet_don_hang_ma_don_hang",
                table: "chi_tiet_don_hang",
                newName: "ma_don_hang");

            migrationBuilder.AlterColumn<int>(
                name: "ma_nguoi_dung",
                table: "yeu_thich",
                type: "int(11)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_mon",
                table: "yeu_thich",
                type: "int(11)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_yeu_thich",
                table: "yeu_thich",
                type: "int(11)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<string>(
                name: "ten_vai_tro",
                table: "vai_tro",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<DateTime>(
                name: "ngay_tao",
                table: "vai_tro",
                type: "datetime",
                nullable: true,
                defaultValueSql: "current_timestamp()",
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_vai_tro",
                table: "vai_tro",
                type: "int(11)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<string>(
                name: "noi_dung",
                table: "thong_bao",
                type: "text",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<DateTime>(
                name: "ngay_tao",
                table: "thong_bao",
                type: "datetime",
                nullable: true,
                defaultValueSql: "current_timestamp()",
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_nguoi_dung",
                table: "thong_bao",
                type: "int(11)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "da_doc",
                table: "thong_bao",
                type: "tinyint(1)",
                nullable: true,
                defaultValueSql: "'0'",
                oldClrType: typeof(bool),
                oldType: "tinyint(1)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_thong_bao",
                table: "thong_bao",
                type: "int(11)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<string>(
                name: "loai",
                table: "thoi_tiet",
                type: "enum('nong','lanh','mua')",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<DateTime>(
                name: "thoi_gian",
                table: "thoi_tiet",
                type: "datetime",
                nullable: true,
                defaultValueSql: "current_timestamp()",
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_thoi_tiet",
                table: "thoi_tiet",
                type: "int(11)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<string>(
                name: "trang_thai",
                table: "thanh_toan",
                type: "enum('cho','da_thanh_toan','that_bai')",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<string>(
                name: "phuong_thuc",
                table: "thanh_toan",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<DateTime>(
                name: "ngay_thanh_toan",
                table: "thanh_toan",
                type: "datetime",
                nullable: false,
                defaultValueSql: "current_timestamp()",
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)");

            migrationBuilder.AlterColumn<int>(
                name: "ma_don_hang",
                table: "thanh_toan",
                type: "int(11)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<int>(
                name: "ma_thanh_toan",
                table: "thanh_toan",
                type: "int(11)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<string>(
                name: "ten_quyen",
                table: "quyen",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<DateTime>(
                name: "ngay_tao",
                table: "quyen",
                type: "datetime",
                nullable: true,
                defaultValueSql: "current_timestamp()",
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_quyen",
                table: "quyen",
                type: "int(11)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<string>(
                name: "buoi",
                table: "quy_tac_thoi_gian",
                type: "enum('sang','trua','toi')",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<int>(
                name: "ma_danh_muc",
                table: "quy_tac_thoi_gian",
                type: "int(11)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_quy_tac",
                table: "quy_tac_thoi_gian",
                type: "int(11)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<string>(
                name: "trang_thai",
                table: "nguoi_dung",
                type: "enum('hoat_dong','khoa')",
                nullable: true,
                defaultValueSql: "'hoat_dong'",
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<string>(
                name: "so_dien_thoai",
                table: "nguoi_dung",
                type: "varchar(20)",
                maxLength: 20,
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<DateTime>(
                name: "ngay_tao",
                table: "nguoi_dung",
                type: "datetime",
                nullable: true,
                defaultValueSql: "current_timestamp()",
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "mat_khau",
                table: "nguoi_dung",
                type: "varchar(255)",
                maxLength: 255,
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<int>(
                name: "ma_vai_tro",
                table: "nguoi_dung",
                type: "int(11)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ho_ten",
                table: "nguoi_dung",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<string>(
                name: "email",
                table: "nguoi_dung",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<int>(
                name: "ma_nguoi_dung",
                table: "nguoi_dung",
                type: "int(11)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<string>(
                name: "trang_thai",
                table: "mon_an",
                type: "enum('con_ban','het_hang')",
                nullable: true,
                defaultValueSql: "'con_ban'",
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true,
                oldDefaultValueSql: "'con_ban'")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<string>(
                name: "mo_ta",
                table: "mon_an",
                type: "text",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<int>(
                name: "ma_danh_muc",
                table: "mon_an",
                type: "int(11)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "gia",
                table: "mon_an",
                type: "decimal(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,0)",
                oldPrecision: 18,
                oldScale: 2,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ban_chay",
                table: "mon_an",
                type: "int",
                nullable: true,
                defaultValueSql: "'0'",
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_mon",
                table: "mon_an",
                type: "int(11)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AddColumn<int>(
                name: "la_do_uong_mat",
                table: "mon_an",
                type: "int",
                nullable: true,
                defaultValueSql: "'0'");

            migrationBuilder.AddColumn<int>(
                name: "la_mon_nong",
                table: "mon_an",
                type: "int",
                nullable: true,
                defaultValueSql: "'0'");

            migrationBuilder.AddColumn<int>(
                name: "so_luong",
                table: "mon_an",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ton_kho",
                table: "mon_an",
                type: "int(11)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "so_dien_thoai",
                table: "lien_he",
                type: "varchar(20)",
                maxLength: 20,
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<string>(
                name: "noi_dung",
                table: "lien_he",
                type: "text",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<DateTime>(
                name: "ngay_gui",
                table: "lien_he",
                type: "datetime",
                nullable: true,
                defaultValueSql: "current_timestamp()",
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ho_ten",
                table: "lien_he",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<string>(
                name: "email",
                table: "lien_he",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<bool>(
                name: "da_phan_hoi",
                table: "lien_he",
                type: "tinyint(1)",
                nullable: true,
                defaultValueSql: "'0'",
                oldClrType: typeof(bool),
                oldType: "tinyint(1)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_lien_he",
                table: "lien_he",
                type: "int(11)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<string>(
                name: "trang_thai",
                table: "lich_su_trang_thai_don_hang",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<DateTime>(
                name: "thoi_gian",
                table: "lich_su_trang_thai_don_hang",
                type: "datetime",
                nullable: true,
                defaultValueSql: "current_timestamp()",
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_don_hang",
                table: "lich_su_trang_thai_don_hang",
                type: "int(11)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ghi_chu",
                table: "lich_su_trang_thai_don_hang",
                type: "text",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<int>(
                name: "ma_lich_su",
                table: "lich_su_trang_thai_don_hang",
                type: "int(11)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<DateTime>(
                name: "ngay_tao",
                table: "lich_su_kho",
                type: "datetime(6)",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldDefaultValueSql: "current_timestamp()");

            migrationBuilder.AlterColumn<int>(
                name: "ma_mon",
                table: "lich_su_kho",
                type: "int(11)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<int>(
                name: "ma_mon",
                table: "hinh_anh_mon_an",
                type: "int(11)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_nguoi_dung",
                table: "hanh_vi_nguoi_dung",
                type: "int(11)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_mon",
                table: "hanh_vi_nguoi_dung",
                type: "int(11)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "hanh_vi",
                table: "hanh_vi_nguoi_dung",
                type: "enum('xem','them_gio','mua')",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<int>(
                name: "ma_hanh_vi",
                table: "hanh_vi_nguoi_dung",
                type: "int(11)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<DateTime>(
                name: "thoi_gian",
                table: "goi_y_ai",
                type: "datetime",
                nullable: true,
                defaultValueSql: "current_timestamp()",
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_nguoi_dung",
                table: "goi_y_ai",
                type: "int(11)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_mon",
                table: "goi_y_ai",
                type: "int(11)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_goi_y",
                table: "goi_y_ai",
                type: "int(11)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<DateTime>(
                name: "ngay_tao",
                table: "gio_hang",
                type: "datetime",
                nullable: true,
                defaultValueSql: "current_timestamp()",
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_nguoi_dung",
                table: "gio_hang",
                type: "int(11)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_gio_hang",
                table: "gio_hang",
                type: "int(11)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<string>(
                name: "trang_thai",
                table: "don_hang",
                type: "enum('cho_xu_ly','dang_giao','hoan_thanh','huy','ChoDuyet')",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "varchar(50)",
                oldMaxLength: 50,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<decimal>(
                name: "tong_tien",
                table: "don_hang",
                type: "decimal(10,2)",
                precision: 10,
                scale: 2,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldPrecision: 18,
                oldScale: 2,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "so_dien_thoai",
                table: "don_hang",
                type: "varchar(20)",
                maxLength: 20,
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<string>(
                name: "nguoi_nhan",
                table: "don_hang",
                type: "varchar(255)",
                maxLength: 255,
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<int>(
                name: "ma_nguoi_dung",
                table: "don_hang",
                type: "int(11)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_dia_chi",
                table: "don_hang",
                type: "int(11)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ghi_chu",
                table: "don_hang",
                type: "text",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<string>(
                name: "dia_chi_giao_hang",
                table: "don_hang",
                type: "text",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<int>(
                name: "ma_don_hang",
                table: "don_hang",
                type: "int(11)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<string>(
                name: "so_dien_thoai",
                table: "dia_chi_giao_hang",
                type: "varchar(20)",
                maxLength: 20,
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<DateTime>(
                name: "ngay_tao",
                table: "dia_chi_giao_hang",
                type: "datetime",
                nullable: true,
                defaultValueSql: "current_timestamp()",
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "mac_dinh",
                table: "dia_chi_giao_hang",
                type: "tinyint(1)",
                nullable: false,
                defaultValueSql: "'0'",
                oldClrType: typeof(bool),
                oldType: "tinyint(1)");

            migrationBuilder.AlterColumn<int>(
                name: "ma_nguoi_dung",
                table: "dia_chi_giao_hang",
                type: "int(11)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "ho_ten_nguoi_nhan",
                table: "dia_chi_giao_hang",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<string>(
                name: "dia_chi",
                table: "dia_chi_giao_hang",
                type: "text",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<int>(
                name: "ma_dia_chi",
                table: "dia_chi_giao_hang",
                type: "int(11)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<string>(
                name: "ten_danh_muc",
                table: "danh_muc",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<string>(
                name: "mo_ta",
                table: "danh_muc",
                type: "text",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<int>(
                name: "ma_danh_muc",
                table: "danh_muc",
                type: "int(11)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<int>(
                name: "so_sao",
                table: "danh_gia",
                type: "int(11)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "nhan_xet",
                table: "danh_gia",
                type: "text",
                nullable: true,
                collation: "utf8mb4_unicode_ci",
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.AlterColumn<int>(
                name: "ma_nguoi_dung",
                table: "danh_gia",
                type: "int(11)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<int>(
                name: "ma_mon",
                table: "danh_gia",
                type: "int(11)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<int>(
                name: "ma_danh_gia",
                table: "danh_gia",
                type: "int(11)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<int>(
                name: "so_luong_nhap",
                table: "chi_tiet_kho",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "so_luong_hien_tai",
                table: "chi_tiet_kho",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "ngay_nhap",
                table: "chi_tiet_kho",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "ngay_het_han",
                table: "chi_tiet_kho",
                type: "datetime(6)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_mon",
                table: "chi_tiet_kho",
                type: "int(11)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<int>(
                name: "so_luong",
                table: "chi_tiet_gio_hang",
                type: "int(11)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_mon",
                table: "chi_tiet_gio_hang",
                type: "int(11)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_gio_hang",
                table: "chi_tiet_gio_hang",
                type: "int(11)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_chi_tiet",
                table: "chi_tiet_gio_hang",
                type: "int(11)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<int>(
                name: "so_luong",
                table: "chi_tiet_don_hang",
                type: "int(11)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_mon",
                table: "chi_tiet_don_hang",
                type: "int(11)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_don_hang",
                table: "chi_tiet_don_hang",
                type: "int(11)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ma_chi_tiet",
                table: "chi_tiet_don_hang",
                type: "int(11)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AddPrimaryKey(
                name: "PK_quang_cao",
                table: "quang_cao",
                column: "ma_quang_cao");

            migrationBuilder.AddPrimaryKey(
                name: "PK_lich_su_kho",
                table: "lich_su_kho",
                column: "ma_lich_su");

            migrationBuilder.AddPrimaryKey(
                name: "PK_hinh_anh_mon_an",
                table: "hinh_anh_mon_an",
                column: "ma_hinh");

            migrationBuilder.AddPrimaryKey(
                name: "PK_chi_tiet_kho",
                table: "chi_tiet_kho",
                column: "ma_chi_tiet");

            migrationBuilder.CreateTable(
                name: "vai_tro_quyen",
                columns: table => new
                {
                    ma_vai_tro = table.Column<int>(type: "int(11)", nullable: false),
                    ma_quyen = table.Column<int>(type: "int(11)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PRIMARY", x => new { x.ma_vai_tro, x.ma_quyen })
                        .Annotation("MySql:IndexPrefixLength", new[] { 0, 0 });
                    table.ForeignKey(
                        name: "vai_tro_quyen_ibfk_1",
                        column: x => x.ma_vai_tro,
                        principalTable: "vai_tro",
                        principalColumn: "ma_vai_tro");
                    table.ForeignKey(
                        name: "vai_tro_quyen_ibfk_2",
                        column: x => x.ma_quyen,
                        principalTable: "quyen",
                        principalColumn: "ma_quyen");
                })
                .Annotation("MySql:CharSet", "utf8mb4")
                .Annotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.CreateIndex(
                name: "ma_nguoi_dung6",
                table: "thong_bao",
                column: "ma_nguoi_dung");

            migrationBuilder.CreateIndex(
                name: "ma_danh_muc1",
                table: "quy_tac_thoi_gian",
                column: "ma_danh_muc");

            migrationBuilder.CreateIndex(
                name: "email",
                table: "nguoi_dung",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ma_quyen",
                table: "vai_tro_quyen",
                column: "ma_quyen");

            migrationBuilder.AddForeignKey(
                name: "dia_chi_giao_hang_ibfk_1",
                table: "dia_chi_giao_hang",
                column: "ma_nguoi_dung",
                principalTable: "nguoi_dung",
                principalColumn: "ma_nguoi_dung",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "gio_hang_ibfk_1",
                table: "gio_hang",
                column: "ma_nguoi_dung",
                principalTable: "nguoi_dung",
                principalColumn: "ma_nguoi_dung");

            migrationBuilder.AddForeignKey(
                name: "goi_y_ai_ibfk_1",
                table: "goi_y_ai",
                column: "ma_nguoi_dung",
                principalTable: "nguoi_dung",
                principalColumn: "ma_nguoi_dung");

            migrationBuilder.AddForeignKey(
                name: "goi_y_ai_ibfk_2",
                table: "goi_y_ai",
                column: "ma_mon",
                principalTable: "mon_an",
                principalColumn: "ma_mon");

            migrationBuilder.AddForeignKey(
                name: "hanh_vi_nguoi_dung_ibfk_1",
                table: "hanh_vi_nguoi_dung",
                column: "ma_nguoi_dung",
                principalTable: "nguoi_dung",
                principalColumn: "ma_nguoi_dung");

            migrationBuilder.AddForeignKey(
                name: "hanh_vi_nguoi_dung_ibfk_2",
                table: "hanh_vi_nguoi_dung",
                column: "ma_mon",
                principalTable: "mon_an",
                principalColumn: "ma_mon");

            migrationBuilder.AddForeignKey(
                name: "lich_su_trang_thai_don_hang_ibfk_1",
                table: "lich_su_trang_thai_don_hang",
                column: "ma_don_hang",
                principalTable: "don_hang",
                principalColumn: "ma_don_hang");

            migrationBuilder.AddForeignKey(
                name: "nguoi_dung_ibfk_1",
                table: "nguoi_dung",
                column: "ma_vai_tro",
                principalTable: "vai_tro",
                principalColumn: "ma_vai_tro");

            migrationBuilder.AddForeignKey(
                name: "quy_tac_thoi_gian_ibfk_1",
                table: "quy_tac_thoi_gian",
                column: "ma_danh_muc",
                principalTable: "danh_muc",
                principalColumn: "ma_danh_muc");

            migrationBuilder.AddForeignKey(
                name: "thanh_toan_ibfk_1",
                table: "thanh_toan",
                column: "ma_don_hang",
                principalTable: "don_hang",
                principalColumn: "ma_don_hang",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "thong_bao_ibfk_1",
                table: "thong_bao",
                column: "ma_nguoi_dung",
                principalTable: "nguoi_dung",
                principalColumn: "ma_nguoi_dung");

            migrationBuilder.AddForeignKey(
                name: "yeu_thich_ibfk_1",
                table: "yeu_thich",
                column: "ma_nguoi_dung",
                principalTable: "nguoi_dung",
                principalColumn: "ma_nguoi_dung");

            migrationBuilder.AddForeignKey(
                name: "yeu_thich_ibfk_2",
                table: "yeu_thich",
                column: "ma_mon",
                principalTable: "mon_an",
                principalColumn: "ma_mon");
        }
    }
}
