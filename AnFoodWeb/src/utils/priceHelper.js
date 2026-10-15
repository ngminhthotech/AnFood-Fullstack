/**
 * Hàm tính giá chuẩn cho toàn bộ dự án.
 * Quy tắc ưu tiên: Banner theo Món > Banner theo Danh mục.
 * @param {Object} product - Đối tượng món ăn (từ API)
 * @param {Array} banners - Danh sách banner quảng cáo (từ API)
 * @returns {Object} { finalPrice, originalPrice, isSale, percent }
 */
export const calculateFinalPrice = (product, banners) => {
    // 1. Kiểm tra đầu vào an toàn
    if (!product) return { finalPrice: 0, originalPrice: 0, isSale: false, percent: 0 };
    const safeBanners = Array.isArray(banners) ? banners : [];

    // 2. Chuẩn hóa dữ liệu mã ID (Bao phủ cả camelCase và PascalCase)
    const itemId = Number(product.maMon || product.MaMon || product.id || 0);
    const itemCatId = Number(product.maDanhMuc || product.MaDanhMuc || product.categoryId || 0);

    // 3. Chuẩn hóa trường Giá (Tự động vét cạn các tên biến có thể có)
    const originalPrice = Number(product.gia || product.Gia || product.giaBan || product.GiaBan || 0);

    // 4. Tìm khuyến mãi dành riêng cho MÓN (Ưu tiên số 1)
    const itemBanner = safeBanners.find(b => 
        Number(b.maMon) === itemId && Number(b.phanTramGiam) > 0
    );

    // 5. Tìm khuyến mãi dành cho DANH MỤC (Ưu tiên số 2)
    const categoryBanner = safeBanners.find(b => 
        Number(b.maDanhMuc) === itemCatId && Number(b.maMon) === 0 && Number(b.phanTramGiam) > 0
    );

    // 6. Chốt banner áp dụng (Món đè Danh mục)
    const activeBanner = itemBanner || categoryBanner;

    // 7. Trả về kết quả
    if (activeBanner) {
        return {
            finalPrice: originalPrice * (1 - activeBanner.phanTramGiam / 100),
            originalPrice: originalPrice,
            isSale: true,
            percent: activeBanner.phanTramGiam
        };
    }

    // Không có khuyến mãi
    return { 
        finalPrice: originalPrice, 
        originalPrice: originalPrice, 
        isSale: false, 
        percent: 0 
    };
};