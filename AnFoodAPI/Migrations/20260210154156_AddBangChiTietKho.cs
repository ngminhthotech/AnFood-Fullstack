using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AnFoodAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddBangChiTietKho : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "chi_tiet_kho",
                columns: table => new
                {
                    ma_chi_tiet = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ma_mon = table.Column<int>(type: "int(11)", nullable: false),
                    so_luong_nhap = table.Column<int>(type: "int", nullable: false),
                    so_luong_hien_tai = table.Column<int>(type: "int", nullable: false),
                    ngay_nhap = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    ngay_het_han = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    ghi_chu = table.Column<string>(type: "longtext", nullable: true, collation: "utf8mb4_unicode_ci")
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_chi_tiet_kho", x => x.ma_chi_tiet);
                    table.ForeignKey(
                        name: "FK_chi_tiet_kho_mon_an_ma_mon",
                        column: x => x.ma_mon,
                        principalTable: "mon_an",
                        principalColumn: "ma_mon",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4")
                .Annotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.CreateIndex(
                name: "IX_chi_tiet_kho_ma_mon",
                table: "chi_tiet_kho",
                column: "ma_mon");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "chi_tiet_kho");
        }
    }
}
