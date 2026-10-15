import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaMagic, FaRobot, FaHistory, FaCloudRain, FaSun, FaMoon, FaCoffee, 
    FaInfoCircle, FaRandom, FaFilter, FaFire, FaMoneyBillWave, FaSyncAlt, 
    FaStar, FaCrown, FaWallet, FaGift, FaPlus, FaDna, FaSlidersH, FaPercentage
} from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Slider from "react-slick";

import axiosClient from '../../api/axiosClient';
import ProductCard from '../../components/ProductCard'; 
import { useTracking } from '../../hooks/useTracking';
import { getImageUrl } from '../../utils/imageHelper';

// --- COMPONENT SKELETON ---
const SkeletonCard = () => (
    <div style={{ backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', overflow: 'hidden', height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className="skeleton-pulse" style={{ height: '220px', width: '100%', backgroundColor: '#eee', flexShrink: 0 }}></div>
        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="skeleton-pulse" style={{ height: '24px', width: '80%', backgroundColor: '#eee', borderRadius: '4px' }}></div>
            <div className="skeleton-pulse" style={{ height: '20px', width: '40%', backgroundColor: '#eee', borderRadius: '4px' }}></div>
            <div style={{ marginTop: 'auto' }}>
                <div className="skeleton-pulse" style={{ height: '45px', width: '100%', backgroundColor: '#eee', borderRadius: '15px' }}></div>
            </div>
        </div>
    </div>
);

const ArrowButton = ({ onClick, direction }) => (
    <div onClick={onClick} style={{
        position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 10,
        width: '40px', height: '40px', borderRadius: '50%', background: '#fff', boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        right: direction === 'next' ? '-15px' : 'auto', left: direction === 'prev' ? '-15px' : 'auto'
    }}>
        <span style={{ color: '#e64a19', fontWeight: 'bold' }}>{direction === 'next' ? '❯' : '❮'}</span>
    </div>
);

function Suggest({ addToCart }) {
    // 5 KỆ DỮ LIỆU CHÍNH THỨC
    const [buyAgainFoods, setBuyAgainFoods] = useState([]); 
    const [timeFoods, setTimeFoods] = useState([]);
    const [weatherFoods, setWeatherFoods] = useState([]);
    const [mlnetFoodsOriginal, setMlnetFoodsOriginal] = useState([]); 
    const [mlnetFoods, setMlnetFoods] = useState([]); 
    const [trendingFoods, setTrendingFoods] = useState([]); 
    
    // TÍNH NĂNG KHÁCH HÀNG
    const [aiFilter, setAiFilter] = useState('all'); 
    const [showComboModal, setShowComboModal] = useState(false); 
    const [suggestedCombos, setSuggestedCombos] = useState([]);
    const [randomCombo, setRandomCombo] = useState([]);
    
    // TÍNH NĂNG HỌC THUẬT: HYBRID CONTROLLER & DNA TASTE PROFILE
    const [hybridWeight, setHybridWeight] = useState(80); 
    const [tasteProfile, setTasteProfile] = useState([]); 

    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [banners, setBanners] = useState([]);
    const [aiContext, setAiContext] = useState(null);

    const track = useTracking();

    useEffect(() => {
        const fetchAIRecommendations = async () => {
            try {
                window.scrollTo(0, 0);
                setLoading(true);

                const savedUser = localStorage.getItem('user');
                const user = savedUser ? JSON.parse(savedUser) : null;
                const userId = user?.id || user?.maNguoiDung || 0;
                
                if (user?.hoTen) setUserName(user.hoTen.split(' ').pop());
                if(userId) track('VIEW_CATEGORY', { maDanhMuc: 0, tuKhoa: 'AI_PAGE_VIEW', diemHanhVi: 1.0 });

                // 👉 GỌI THÊM API TASTE PROFILE CHUẨN REAL 100% TỪ BACKEND
                const [resRec, resBanners, resBuyAgain, allFoodsRes, profileRes] = await Promise.all([
                    axiosClient.get(`/Recommendation/ForUser/${userId}`),
                    axiosClient.get('/QuangCao/Active').catch(() => []),
                    axiosClient.get(`/Recommendation/BuyAgain/${userId}`).catch(() => null),
                    axiosClient.get('/MonAn').catch(() => []),
                    userId > 0 ? axiosClient.get(`/Recommendation/TasteProfile/${userId}`).catch(() => null) : null
                ]);

                // XỬ LÝ DNA PROFILE TỪ API
                if (profileRes && profileRes.success && profileRes.data.length > 0) {
                    setTasteProfile(profileRes.data);
                } else {
                    // Nếu user mới chưa có lịch sử mua hàng thì báo mờ
                    setTasteProfile([{ label: 'Chưa đủ dữ liệu hành vi', percent: 0, color: '#b2bec3' }]);
                }

                if (resBuyAgain && resBuyAgain.success) setBuyAgainFoods(resBuyAgain.data);
                
                if (resRec && resRec.success && resRec.data.length > 0) {
                    if (resRec.context) setAiContext(resRec.context);
                    
                    const tFoods = [];
                    const wFoods = [];
                    const mFoods = [];

                    const hour = resRec.context?.hour || new Date().getHours();
                    const weather = resRec.context?.weather || "Clear";

                    const isMorning = hour >= 5 && hour < 10;
                    const isAfternoon = hour >= 14 && hour < 18;
                    const isNight = hour >= 21 || hour <= 3;
                    const isRainy = weather === "Rain" || weather === "Thunderstorm" || weather === "Drizzle";
                    const isHot = weather === "Clear" || weather === "Hot";

                    resRec.data.forEach(item => {
                        const catId = Number(item.maDanhMuc || item.MaDanhMuc); 
                        if (wFoods.length < 5) {
                            if (isHot && catId === 3) { wFoods.push(item); return; }
                            if (isRainy && (catId === 2 || catId === 5)) { wFoods.push(item); return; }
                        }
                        if (tFoods.length < 5) {
                            if (isNight && (catId === 5 || catId === 6 || catId === 4)) { tFoods.push(item); return; }
                            if (isAfternoon && (catId === 6 || catId === 4 || catId === 5)) { tFoods.push(item); return; }
                            if (isMorning && (catId === 1 || catId === 4 || catId === 3)) { tFoods.push(item); return; }
                            if (!isNight && !isAfternoon && !isMorning && (catId === 1 || catId === 2)) { tFoods.push(item); return; }
                        }
                        mFoods.push(item);
                    });

                    setTimeFoods(tFoods);
                    setWeatherFoods(wFoods);
                    setMlnetFoodsOriginal(mFoods);
                    setMlnetFoods(mFoods);
                }

                const allF = Array.isArray(allFoodsRes) ? allFoodsRes : (allFoodsRes?.data || []);
                const hot = [...allF].sort((a,b) => (b.daBan || b.DaBan || 0) - (a.daBan || a.DaBan || 0)).slice(0,8);
                setTrendingFoods(hot);

                setBanners(Array.isArray(resBanners) ? resBanners : []);

            } catch (err) {
                console.error("Lỗi tải AI:", err);
            } finally {
                setTimeout(() => setLoading(false), 800);
            }
        };

        fetchAIRecommendations();
    }, []);

    // LOGIC: LỌC DANH MỤC CƠ BẢN
    useEffect(() => {
        if (aiFilter === 'all') {
            setMlnetFoods(mlnetFoodsOriginal);
        } else if (aiFilter === 'cheap') {
            setMlnetFoods(mlnetFoodsOriginal.filter(item => Number(item.giaBan || item.gia) < 40000));
        } else if (aiFilter === 'spicy') {
            setMlnetFoods(mlnetFoodsOriginal.filter(item => [2, 5].includes(Number(item.maDanhMuc || item.MaDanhMuc))));
        }
    }, [aiFilter, mlnetFoodsOriginal]);

    // LOGIC: HYBRID CONTROLLER (XÁO TRỘN TRỌNG SỐ)
    useEffect(() => {
        if (mlnetFoodsOriginal.length === 0) return;
        if (hybridWeight < 50) {
            const mixed = [...mlnetFoodsOriginal].sort(() => 0.5 - Math.random());
            setMlnetFoods(mixed);
        } else {
            setMlnetFoods([...mlnetFoodsOriginal]);
        }
    }, [hybridWeight]);

    const getPriceInfo = (item) => {
        const originalPrice = Number(item.giaBan || item.gia || 0);
        const appliedBanner = banners.find(b => Number(b.maMon) === Number(item.maMon) || (Number(b.maDanhMuc) === Number(item.maDanhMuc) && !b.maMon));
        if (appliedBanner && appliedBanner.phanTramGiam > 0) return { finalPrice: originalPrice * (1 - appliedBanner.phanTramGiam / 100), originalPrice, isSale: true, percent: appliedBanner.phanTramGiam };
        return { finalPrice: originalPrice, originalPrice, isSale: false, percent: 0 };
    };

    const handleQuickAddToCart = (e, item) => {
        if(e) e.preventDefault();
        addToCart({ ...item, soLuong: 1 });
        track('ADD_TO_CART', { maMon: item.maMon || item.MaMon, diemHanhVi: 5.0, tuKhoa: 'AI_CONVERTED' });
        toast.success(`Đã thêm ${item.tenMon || item.TenMon} vào giỏ! 🛒`, { position: "top-center", autoClose: 1500 });
    };

    // LOGIC TẠO LIST COMBO (TĂNG LÊN 4 MÂM CỐ ĐỊNH)
    const generateInitialCombos = () => {
        const pool = [...trendingFoods, ...mlnetFoodsOriginal];
        if (pool.length < 3) return toast.warning("Dữ liệu chưa đủ để lên mâm!");

        const buildCombo = (sourceArray, type = 'normal') => {
            let filtered = [...sourceArray];
            if (type === 'cheap') filtered = sourceArray.filter(i => Number(i.giaBan || i.gia) < 45000);
            
            const main = filtered.find(i => [1,2,4,5].includes(Number(i.maDanhMuc || i.MaDanhMuc))) || sourceArray[0];
            const drink = sourceArray.find(i => Number(i.maDanhMuc || i.MaDanhMuc) === 3 && i.maMon !== main?.maMon) || sourceArray[1];
            const side = sourceArray.find(i => Number(i.maDanhMuc || i.MaDanhMuc) === 6 && i.maMon !== main?.maMon && i.maMon !== drink?.maMon) || sourceArray[2];
            return [main, drink, side].filter(Boolean);
        };

        setSuggestedCombos([
            { id: 1, title: "🔥 Mâm Bán Chạy", icon: <FaCrown />, color: '#ff7675', desc: "Lựa chọn của số đông", items: buildCombo(trendingFoods) },
            { id: 2, title: "🎯 Mâm Chuẩn Gu", icon: <FaMagic />, color: '#00b894', desc: "AI phân tích riêng bạn", items: buildCombo(mlnetFoodsOriginal) },
            { id: 3, title: "💰 Mâm Tiết Kiệm", icon: <FaWallet />, color: '#0984e3', desc: "Ngon bổ rẻ cho mọi người", items: buildCombo(pool, 'cheap') },
            { id: 4, title: "🌟 Mâm Đầy Đủ", icon: <FaStar />, color: '#6c5ce7', desc: "Trọn vẹn hương vị", items: buildCombo(pool.sort(() => 0.5 - Math.random())) }
        ]);

        reRollRandomCombo(pool);
        setShowComboModal(true);
    };

    const reRollRandomCombo = (poolData) => {
        const pool = poolData || [...trendingFoods, ...mlnetFoodsOriginal];
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        
        const main = shuffled.find(i => [1,2,4,5].includes(Number(i.maDanhMuc || i.MaDanhMuc))) || shuffled[0];
        const drink = shuffled.find(i => Number(i.maDanhMuc || i.MaDanhMuc) === 3 && i.maMon !== main?.maMon) || shuffled[1];
        const side = shuffled.find(i => Number(i.maDanhMuc || i.MaDanhMuc) === 6 && i.maMon !== main?.maMon && i.maMon !== drink?.maMon) || shuffled[2];
        
        setRandomCombo([main, drink, side].filter(Boolean));
    };

    const addSpecificComboToCart = (comboItems) => {
        comboItems.forEach(item => addToCart({ ...item, soLuong: 1 }));
        toast.success(`Đã thêm mâm cơm vào giỏ! 🚀`, { position: "top-center", autoClose: 2000, theme: "colored" });
        setShowComboModal(false);
    };

    const sliderSettings = {
        dots: false, infinite: false, speed: 500, slidesToShow: 4, slidesToScroll: 1,
        nextArrow: <ArrowButton direction="next" />, prevArrow: <ArrowButton direction="prev" />,
        responsive: [ { breakpoint: 1024, settings: { slidesToShow: 3 } }, { breakpoint: 768, settings: { slidesToShow: 2 } }, { breakpoint: 480, settings: { slidesToShow: 1 } } ]
    };

    const generateSocialProof = (item) => {
        const rating = item.diemDanhGia || item.DiemDanhGia || 0;
        const sold = item.daBan || item.DaBan || 0;
        const catId = Number(item.maDanhMuc || item.MaDanhMuc);

        if (sold >= 50) return { text: `🔥 Đã bán hơn ${sold} phần`, color: "#ff4757", bg: "#ff475715" };
        if (rating >= 4.5) return { text: `⭐ Top Review (${rating} sao)`, color: "#ffa502", bg: "#ffa50215" };
        if (sold >= 10 && sold < 50) return { text: `🚀 Đang lên xu hướng`, color: "#3742fa", bg: "#3742fa15" };
        if (catId === 3) return { text: "🥤 Mát lạnh sảng khoái", color: "#00b894", bg: "#00b89415" };
        return { text: "❤️ Nhiều người quan tâm", color: "#ff6b81", bg: "#ff6b8115" };
    };

    // LOGIC: TẠO NHÃN EXPLAINABLE AI BẰNG TEXT MATCHING THAY VÌ RANDOM
    const generateExplainableTag = (item) => {
        const name = (item.tenMon || item.TenMon || '').toLowerCase();
        const cat = Number(item.maDanhMuc || item.MaDanhMuc);
        
        if (name.includes('bò') || name.includes('beef')) return { text: `🥩 Content-Based: Chứa đạm "Bò"`, color: '#d63031', bg: '#ffdad6' };
        if (name.includes('gà') || name.includes('chicken')) return { text: `🐔 Content-Based: Nguyên liệu "Gà"`, color: '#e17055', bg: '#ffeaa7' };
        if (name.includes('hải sản') || name.includes('tôm') || name.includes('mực')) return { text: `🦑 Content-Based: Vị "Hải sản"`, color: '#0984e3', bg: '#dff9fb' };
        if (name.includes('phô mai') || name.includes('cheese')) return { text: `🧀 Content-Based: "Phô mai"`, color: '#f39c12', bg: '#fef3c7' };
        if (name.includes('trà') || name.includes('sữa') || name.includes('đào') || name.includes('vải')) return { text: `🧋 Content-Based: Thức uống "Ngọt"`, color: '#6c5ce7', bg: '#e0e7ff' };
        if (name.includes('cay') || name.includes('spicy')) return { text: `🌶️ Content-Based: Gu "Cay nồng"`, color: '#c0392b', bg: '#fab1a0' };

        if (cat === 1) return { text: `🍔 Thuộc tính: Nhóm "FastFood"`, color: '#e67e22', bg: '#fdebd0' };
        if (cat === 2) return { text: `🍲 Thuộc tính: Nhóm "Lẩu"`, color: '#c0392b', bg: '#f2d7d5' };
        if (cat === 3) return { text: `🧊 Thuộc tính: "Giải khát"`, color: '#0984e3', bg: '#81ecec' };
        if (cat === 4) return { text: `🍕 Thuộc tính: Nhóm "Pizza"`, color: '#d35400', bg: '#edbb99' };
        if (cat === 5) return { text: `🔥 Thuộc tính: "Chiên Giòn"`, color: '#e17055', bg: '#ffeaa7' };
        if (cat === 6) return { text: `🍟 Thuộc tính: "Ăn Vặt"`, color: '#8e44ad', bg: '#d7bde2' };

        return { text: `✨ Gợi ý từ ML.NET (Đám đông)`, color: '#00b894', bg: '#55efc4' };
    };

    const getTimeConfig = () => {
        const hour = aiContext?.hour || new Date().getHours();
        const shortName = userName ? `${userName} ơi, ` : "";
        if (hour >= 5 && hour < 10) return { title: `${shortName}Nạp Năng Lượng Buổi Sáng Thôi!`, icon: <FaCoffee size={22}/>, badge: "🌅 Buổi sáng", explain: "FastBite ưu tiên các món nhẹ nhàng, dễ tiêu và đồ uống tỉnh táo giúp bạn khởi đầu ngày mới hiệu quả." };
        if (hour >= 10 && hour < 14) return { title: `${shortName}Tới Giờ Cơm Trưa Rồi!`, icon: <FaSun size={22}/>, badge: "🍱 Bữa trưa", explain: "Dựa vào khung giờ trưa, AI đã lọc ra các món chính chắc bụng, giàu dinh dưỡng cho bạn." };
        if (hour >= 14 && hour < 18) return { title: `Lai Rai Xế Chiều Chút Nhỉ ${userName}?`, icon: <FaCoffee size={22}/>, badge: "🍟 Xế chiều", explain: "Giờ giải lao hoàn hảo! Các món ăn vặt và trà sữa đang được đánh giá cao nhất hệ thống chiều nay." };
        if (hour >= 18 && hour < 22) return { title: `${shortName}Bữa Tối Ấm Cúng Nhé!`, icon: <FaMoon size={22}/>, badge: "🍲 Bữa tối", explain: "Sau một ngày dài, hãy tự thưởng cho mình bằng những món ăn thịnh soạn được nhiều người bình chọn nhất." };
        return { title: `Cú Đêm Đói Bụng Hả ${userName}? 🦉`, icon: <FaMoon size={22}/>, badge: "🦉 Món khuya", explain: "Nửa đêm thèm ăn vặt? AI đã chọn lọc các món ăn nhanh, ít dầu mỡ và đồ uống nhẹ cho hội cú đêm." };
    };

    const getWeatherConfig = () => {
        const weather = aiContext?.weather || "Clear";
        if (weather === "Rain" || weather === "Thunderstorm" || weather === "Drizzle") 
            return { title: "Trú Mưa Cùng Món Ngon 🌧️", icon: <FaCloudRain size={22}/>, badge: "🌧️ Ngày mưa", explain: "Thời tiết bên ngoài đang có mưa lạnh, thuật toán đã điều chỉnh đẩy các món Lẩu, Nướng, Cay nồng lên ưu tiên hàng đầu." };
        if (weather === "Clear" || weather === "Hot") 
            return { title: "Giải Nhiệt Ngày Trưa Hè ☀️", icon: <FaSun size={22}/>, badge: "☀️ Giải nhiệt", explain: "Trời đang khá oi bức! Các món sinh tố, trà trái cây và món ăn thanh mát sẽ giúp bạn hạ nhiệt tức thì." };
        return { title: "Thời Tiết Chiều Lòng Người ☁️", icon: <FaCloudRain size={22}/>, badge: "☁️ Mát mẻ", explain: "Trời mát mẻ thì ăn gì cũng ngon! Đây là những món đang cực hot theo dòng sự kiện." };
    };

    const tConfig = getTimeConfig();
    const wConfig = getWeatherConfig();

    const RenderSection = ({ title, explain, icon, color, data, badgeText, badgeColor, isXAI = false }) => {
        if (!data || data.length === 0) return null;
        const useSlider = data.length >= 4;

        return (
            <div style={{ marginBottom: '60px', background: '#fff', padding: '35px', borderRadius: '25px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
                <div style={{ marginBottom: '25px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ padding: '10px', background: `${color}15`, borderRadius: '12px', color: color }}>
                            {icon}
                        </div>
                        <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#2d3436', fontWeight: '800' }}>{title}</h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#636e72', fontSize: '0.95rem', paddingLeft: '56px' }}>
                        <FaInfoCircle color="#b2bec3" />
                        <span style={{ fontStyle: 'italic' }}>{explain}</span>
                    </div>
                </div>

                {useSlider ? (
                    <Slider {...sliderSettings} className="ai-slider">
                        {data.map((item, index) => {
                            const socialProof = generateSocialProof(item);
                            const explainTag = isXAI ? generateExplainableTag(item) : null;
                            return (
                                <div key={`slider-${item.maMon || item.MaMon}`}>
                                    <ProductCard 
                                        item={item} priceInfo={getPriceInfo(item)} rating={item.diemDanhGia || item.DiemDanhGia || 0}
                                        onAddToCart={(e, itm) => handleQuickAddToCart(e, itm)}
                                        customBadge={
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                                                {explainTag && (
                                                    <div style={{ background: explainTag.bg, color: explainTag.color, padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '800', border: `1px solid ${explainTag.color}50` }}>
                                                        {explainTag.text}
                                                    </div>
                                                )}
                                                <div style={{ background: badgeColor, color: '#fff', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', display:'flex', gap:'5px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                                                    {badgeText || `Phù hợp ${98-index}%`}
                                                </div>
                                                <div style={{ background: socialProof.bg, color: socialProof.color, border: `1px solid ${socialProof.color}30`, padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '700', display:'flex', gap:'4px' }}>
                                                    {socialProof.text}
                                                </div>
                                            </div>
                                        }
                                    />
                                </div>
                            );
                        })}
                    </Slider>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '25px' }}>
                        {data.map((item, index) => {
                            const socialProof = generateSocialProof(item);
                            const explainTag = isXAI ? generateExplainableTag(item) : null;
                            return (
                                <div key={`grid-${item.maMon || item.MaMon}`} style={{ height: '100%' }}>
                                    <ProductCard 
                                        item={item} priceInfo={getPriceInfo(item)} rating={item.diemDanhGia || item.DiemDanhGia || 0}
                                        onAddToCart={(e, itm) => handleQuickAddToCart(e, itm)}
                                        customBadge={
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                                                {explainTag && (
                                                    <div style={{ background: explainTag.bg, color: explainTag.color, padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '800', border: `1px solid ${explainTag.color}50` }}>
                                                        {explainTag.text}
                                                    </div>
                                                )}
                                                <div style={{ background: badgeColor, color: '#fff', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', display:'flex', gap:'5px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                                                    {badgeText || `Phù hợp ${98-index}%`}
                                                </div>
                                                <div style={{ background: socialProof.bg, color: socialProof.color, border: `1px solid ${socialProof.color}30`, padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '700', display:'flex', gap:'4px' }}>
                                                    {socialProof.text}
                                                </div>
                                            </div>
                                        }
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ background: '#f8f9fa', minHeight: '100vh', paddingBottom: '80px', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
            <ToastContainer />
            <style>{`
                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
                .skeleton-pulse { animation: pulse 1.5s ease-in-out infinite; }
                .ai-slider .slick-track { display: flex !important; align-items: stretch !important; padding: 20px 0; }
                .ai-slider .slick-slide { height: auto !important; display: flex !important; }
                .ai-slider .slick-slide > div { width: 100%; display: flex; padding: 0 12px; }
                .filter-btn { border: 1px solid #dfe6e9; background: #fff; padding: 8px 16px; border-radius: 50px; cursor: pointer; color: #636e72; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
                .filter-btn:hover { background: #f1f2f6; }
                .filter-btn.active { background: #e64a19; color: #fff; border-color: #e64a19; }
                
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f2f6; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a4b0be; }
                
                input[type=range] { -webkit-appearance: none; width: 100%; background: transparent; }
                input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 20px; width: 20px; border-radius: 50%; background: #e64a19; cursor: pointer; margin-top: -6px; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }
                input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 8px; cursor: pointer; background: #dfe6e9; border-radius: 5px; }
            `}</style>

            <section style={{ background: '#fff', padding: '60px 20px 40px', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                <div style={{ width: '80px', height: '80px', background: '#fff0e6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#e64a19', boxShadow: '0 10px 20px rgba(230, 74, 25, 0.2)' }}>
                    {loading ? <FaRobot size={40} className="skeleton-pulse" /> : <FaMagic size={35} />}
                </div>
                <h1 style={{ fontSize: '3rem', fontFamily: '"Playfair Display", serif', color: '#2d3436', margin: '0 0 15px 0' }}>
                    Menu Thiết Kế Riêng Cho {userName || 'Bạn'}
                </h1>
                <p style={{ fontSize: '1.1rem', color: '#636e72', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                    Hệ thống AI ML.NET và Bộ phân tích ngữ cảnh (TF-IDF) đang vận hành để tạo ra mâm cơm hoàn hảo cho bạn.
                </p>
                
                {/* HỒ SƠ ẨM THỰC DNA - REAL TỪ API */}
                {!loading && tasteProfile.length > 0 && (
                    <div style={{ background: '#f8f9fa', borderRadius: '20px', padding: '20px 30px', maxWidth: '600px', margin: '25px auto 0', display: 'flex', alignItems: 'center', gap: '30px', border: '1px dashed #dfe6e9', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', minWidth: '100px' }}>
                            <FaDna color="#e64a19" size={30}/>
                            <span style={{ fontWeight: '800', color: '#2d3436', fontSize: '0.9rem' }}>DNA KHẨU VỊ</span>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {tasteProfile.map((p, i) => (
                                <div key={i}>
                                    <div style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#636e72', fontWeight: 'bold' }}>
                                        <span>{p.label}</span> <span>{p.percent}%</span>
                                    </div>
                                    <div style={{ background: '#dfe6e9', height: '8px', borderRadius: '5px', overflow: 'hidden' }}>
                                        <div style={{ width: `${p.percent}%`, background: p.color || '#0984e3', height: '100%', transition: 'width 1s ease-in-out' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-25px', position: 'relative', zIndex: 10 }}>
                <button onClick={generateInitialCombos} style={{ background: 'linear-gradient(90deg, #e64a19, #ff7675)', color: '#fff', border: 'none', padding: '15px 40px', borderRadius: '50px', fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(230, 74, 25, 0.4)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform='scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform='scale(1)'}>
                    <FaRandom size={20} /> KHÔNG BIẾT ĂN GÌ? BẤM VÀO ĐÂY
                </button>
            </div>

            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '25px' }}>
                        {[...Array(8)].map((_, i) => <div key={i}><SkeletonCard /></div>)}
                    </div>
                ) : (
                    <>
                        {buyAgainFoods.length > 0 && (
                            <RenderSection 
                                title="Mua Lại Món Quen" icon={<FaHistory size={22} />} color="#e17055" 
                                explain="Dựa trên lịch sử thanh toán thành công của bạn, đây là những món bạn đặt nhiều nhất."
                                data={buyAgainFoods} badgeText="❤️ Món Tủ" badgeColor="#e17055"
                            />
                        )}

                        <RenderSection 
                            title={tConfig.title} icon={tConfig.icon} color="#6c5ce7" 
                            explain={tConfig.explain}
                            data={timeFoods} badgeText={tConfig.badge} badgeColor="#6c5ce7"
                        />

                        {/* HYBRID CONTROLLER */}
                        <div style={{ background: 'linear-gradient(90deg, #fff0e6, #e3f2fd)', padding: '25px 30px', borderRadius: '20px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '30px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                            <div style={{ background: '#fff', padding: '15px', borderRadius: '15px', color: '#e64a19', boxShadow: '0 5px 15px rgba(230,74,25,0.1)' }}>
                                <FaSlidersH size={28} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '800', color: '#2d3436', marginBottom: '12px', textTransform: 'uppercase' }}>
                                    <span>🌱 Khám Phá Nguyên Liệu (TF-IDF)</span>
                                    <span>🤝 Theo Trend Đám Đông (ML.NET)</span>
                                </div>
                                <input type="range" min="0" max="100" value={hybridWeight} onChange={(e) => setHybridWeight(e.target.value)} />
                            </div>
                            <div style={{ background: '#2d3436', color: '#00ff00', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', fontSize: '1.2rem', fontFamily: 'monospace', minWidth: '100px', textAlign: 'center' }}>
                                {hybridWeight}% ML
                            </div>
                        </div>

                        {/* KỆ CHÍNH VỚI NHÃN EXPLAINABLE AI */}
                        {mlnetFoods.length > 0 && (
                            <RenderSection 
                                title="Gợi Ý Lai Trọng Số (Weighted Hybrid)" icon={<FaPercentage size={22} />} color="#00b894" 
                                explain="Mô hình đang kết hợp điểm số ma trận (Collaborative) và điểm từ khóa (Content-Based) để đưa ra đề xuất dưới đây."
                                data={mlnetFoods} badgeText={null} badgeColor="linear-gradient(90deg, #ff9f43, #e64a19)"
                                isXAI={true} 
                            />
                        )}

                        <RenderSection 
                            title="Đang Thịnh Hành Tại FastBite" icon={<FaFire size={22} />} color="#e84393" 
                            explain="Các món ăn ngon đang được nhiều khách hàng săn đón nhất hệ thống."
                            data={trendingFoods} badgeText="🔥 Đang hot" badgeColor="#e84393"
                        />
                    </>
                )}
            </div>

            {/* MODAL MÂM CƠM TỔNG HỢP */}
            {showComboModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="custom-scrollbar" style={{ background: '#f4f7f6', width: '95%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '30px', padding: '40px', position: 'relative', animation: 'slide-up 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                        <button onClick={() => setShowComboModal(false)} style={{ position: 'absolute', top: 25, right: 25, background: '#fff', border: 'none', width: '40px', height: '40px', borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer', color: '#333', boxShadow: '0 5px 10px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

                        <div style={{ background: 'linear-gradient(135deg, #e64a19 0%, #ff7e5f 100%)', borderRadius: '25px', padding: '35px', marginBottom: '40px', color: '#fff', boxShadow: '0 15px 35px rgba(230, 74, 25, 0.3)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'relative', zIndex: 2 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                                    <div>
                                        <h2 style={{ fontSize: '2.4rem', margin: 0, fontFamily: '"Playfair Display", serif', fontWeight: '900' }}>🎲 Mâm Cơm Tùy Biến</h2>
                                        <p style={{ opacity: 0.9, fontSize: '1.1rem', marginTop: '5px', margin: 0 }}>Để AI quay số chọn món ngon ngẫu nhiên cho bạn!</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button onClick={() => reRollRandomCombo()} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', padding: '12px 25px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.3s' }}>
                                            <FaSyncAlt /> Đổi Mâm
                                        </button>
                                        <button onClick={() => addSpecificComboToCart(randomCombo)} style={{ background: '#fff', color: '#e64a19', border: 'none', padding: '12px 30px', borderRadius: '50px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
                                            CHỐT LUÔN MÂM NÀY
                                        </button>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' }}>
                                    {randomCombo.map((item, idx) => (
                                        <div key={idx} style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>{idx === 0 ? "🍔 Món Chính" : idx === 1 ? "🥤 Giải Khát" : "🍟 Ăn Kèm"}</div>
                                            <img src={getImageUrl(item?.hinhAnh || item?.HinhAnh)} alt="food" style={{ width: '110px', height: '110px', objectFit: 'cover', borderRadius: '50%', marginBottom: '15px', border: '4px solid #fff' }} onError={(e) => e.target.src='https://placehold.co/110'} />
                                            <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>{item?.tenMon || item?.TenMon}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <h3 style={{ fontSize: '1.8rem', color: '#2d3436', marginBottom: '25px', textAlign: 'center', fontWeight: '800' }}>Hoặc Chọn Mâm Đã Được Thiết Kế Sẵn</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '25px' }}>
                            {suggestedCombos.map(combo => (
                                <div key={combo.id} style={{ background: '#fff', borderRadius: '20px', padding: '25px', border: '1px solid #eee', boxShadow: '0 5px 15px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: `${combo.color}15`, color: combo.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>{combo.icon}</div>
                                            <div>
                                                <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#2d3436' }}>{combo.title}</h4>
                                                <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '4px' }}>{combo.desc}</div>
                                            </div>
                                        </div>
                                        <button onClick={() => addSpecificComboToCart(combo.items)} style={{ background: combo.color, color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '50px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>Chọn mâm</button>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                        {combo.items.map((item, idx) => (
                                            <div key={idx} style={{ textAlign: 'center' }}>
                                                <img src={getImageUrl(item?.hinhAnh || item?.HinhAnh)} alt="food" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%', marginBottom: '8px', border: '2px solid #f1f2f6' }} onError={(e) => e.target.src='https://placehold.co/50'} />
                                                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item?.tenMon || item?.TenMon}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

export default Suggest;