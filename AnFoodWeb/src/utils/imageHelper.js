import CONFIG from '../config'; // ✅ Import từ file cấu hình

export const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://placehold.co/600x400?text=No+Image';
    if (imagePath.startsWith('http')) return imagePath;

    // Cắt bỏ đuôi /api nếu lỡ config sai, đảm bảo sạch sẽ
    const rootUrl = CONFIG.API_ROOT.replace(/\/api\/?$/, ''); 
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

    return `${rootUrl}${path}`;
};