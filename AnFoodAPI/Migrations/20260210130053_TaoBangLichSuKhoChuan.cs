using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AnFoodAPI.Migrations
{
    public partial class TaoBangLichSuKhoChuan : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 👇 CHỈ GIỮ LẠI ĐÚNG ĐOẠN TẠO BẢNG LICH_SU_KHO NÀY THÔI 👇
            migrationBuilder.CreateTable(
                name: "lich_su_kho",
                columns: table => new
                {
                    ma_lich_su = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ma_mon = table.Column<int>(type: "int", nullable: false),
                    so_luong = table.Column<int>(type: "int", nullable: false),
                    so_luong_ton_sau_khi_doi = table.Column<int>(type: "int", nullable: false),
                    loai_giao_dich = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ngay_tao = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    ghi_chu = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_lich_su_kho", x => x.ma_lich_su);
                    // Khóa ngoại nối với bảng mon_an cũ
                    table.ForeignKey(
                        name: "FK_lich_su_kho_mon_an_ma_mon",
                        column: x => x.ma_mon,
                        principalTable: "mon_an", // Tên bảng cũ trong DB
                        principalColumn: "ma_mon", // Tên cột khóa chính cũ
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            // Tạo chỉ mục cho nhanh
            migrationBuilder.CreateIndex(
                name: "IX_lich_su_kho_ma_mon",
                table: "lich_su_kho",
                column: "ma_mon");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "lich_su_kho");
        }
    }
}