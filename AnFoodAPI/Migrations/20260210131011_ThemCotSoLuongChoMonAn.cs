using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AnFoodAPI.Migrations
{
    /// <inheritdoc />
    public partial class ThemCotSoLuongChoMonAn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "so_luong",
                table: "mon_an",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "so_luong",
                table: "mon_an");
        }
    }
}
