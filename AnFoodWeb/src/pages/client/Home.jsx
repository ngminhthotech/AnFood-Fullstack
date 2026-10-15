import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ✅ 1. IMPORT HỆ THỐNG
import axiosClient from '../../api/axiosClient'; 
import { getImageUrl } from '../../utils/imageHelper';
import AiRecommendedList from '../../components/AiRecommendedList'; 
import ProductCard from '../../components/ProductCard'; 

import { 
  FaTruck, FaArrowRight, FaMagic, 
  FaUserShield, FaChevronLeft, FaChevronRight, FaFire, 
  FaHotdog, FaPizzaSlice
} from 'react-icons/fa';

// --- COMPONENT CON: NÚT SLIDER ---
const ArrowButton = ({ onClick, direction }) => (
  <div onClick={onClick} className={`slider-arrow ${direction}`}>
    {direction === 'next' ? <FaChevronRight /> : <FaChevronLeft />}
  </div>
);

// --- COMPONENT CON: BANNER QUẢNG CÁO ---
const PromoBanner = () => {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await axiosClient.get('/QuangCao/Active');
        setBanners(Array.isArray(res) ? res : []);
      } catch (err) { setBanners([]); }
    };
    fetchBanners();
  }, []);

  if (!Array.isArray(banners) || banners.length === 0) return null;

  const settings = {
    dots: true, infinite: true, speed: 1000, slidesToShow: 1, slidesToScroll: 1,
    autoplay: true, autoplaySpeed: 6000, arrows: true,
    nextArrow: <ArrowButton direction="next" />,
    prevArrow: <ArrowButton direction="prev" />,
    appendDots: dots => <div style={{ bottom: "30px" }}><ul className="custom-dots"> {dots} </ul></div>,
  };

  return (
    <section className="banner-section">
        <style>
            {`
                .banner-section { margin: 0; padding: 0; width: 100%; overflow: hidden; background: #fdfdfd; }
                .slider-arrow { position: absolute; top: 50%; transform: translateY(-50%); z-index: 20; width: 60px; height: 60px; border-radius: 50%; background: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; color: #2d3436; cursor: pointer; transition: 0.3s; border: 1px solid #f1f2f6; }
                .slider-arrow:hover { background: #e64a19; color: #fff; transform: translateY(-50%) scale(1.1); box-shadow: 0 15px 40px rgba(230, 74, 25, 0.3); }
                .slider-arrow.next { right: 30px; }
                .slider-arrow.prev { left: 30px; }
                .custom-dots { margin: 0; padding: 0; display: flex; justify-content: center; gap: 10px; }
                .custom-dots li { width: 12px; height: 12px; border-radius: 50%; background: #dfe6e9; transition: 0.3s; }
                .custom-dots li.slick-active { width: 40px; border-radius: 12px; background: #e64a19; }
                .custom-dots li button { display: none; }
                .banner-slide-bg { width: 100%; background: linear-gradient(135deg, #fffbf0 0%, #fff 100%); padding: 60px 0; }
                .slide-inner-container { max-width: 1400px; margin: 0 auto; padding: 0 50px; display: flex; gap: 60px; align-items: center; min-height: 500px; flex-wrap: wrap-reverse; }
                .text-content { z-index: 10; flex: 1; min-width: 300px; }
                .image-content { flex: 1.5; width: 100%; height: 500px; border-radius: 30px; overflow: hidden; position: relative; box-shadow: 0 25px 50px rgba(0,0,0,0.15); transform: perspective(1000px) rotateY(-2deg); transition: 0.5s; min-width: 300px; }
                .image-content:hover { transform: perspective(1000px) rotateY(0deg) scale(1.02); }
                .image-content img { width: 100%; height: 100%; object-fit: cover; }
                @media (max-width: 1024px) {
                    .slide-inner-container { text-align: center; padding: 0 20px; gap: 40px; justify-content: center; }
                    .image-content { height: 350px; transform: none; }
                    .image-content:hover { transform: none; }
                    .slider-arrow { display: none !important; }
                }
            `}
        </style>
        <div style={{ width: '100%' }}>
            <Slider {...settings}>
                {banners.map((banner, index) => {
                    const bgImage = getImageUrl(banner.hinhAnh) || 'https://placehold.co/1200x600/eee/999?text=Delicious+Food';
                    return (
                        <div key={banner.maQuangCao || index}>
                            <div className="banner-slide-bg">
                                <div className="slide-inner-container">
                                    <div className="text-content">
                                        {banner.phanTramGiam > 0 && (
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#fff0e6', color: '#e64a19', padding: '10px 25px', borderRadius: '50px', fontWeight: '800', fontSize: '0.9rem', marginBottom: '25px', letterSpacing: '1px', border:'1px solid #ffccb3', boxShadow:'0 5px 15px rgba(230, 74, 25, 0.1)' }}>
                                                <FaFire /> DEAL SỐC GIẢM {banner.phanTramGiam}%
                                            </div>
                                        )}
                                        <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '3rem', lineHeight: '1.15', fontWeight: '800', color: '#2d3436', marginBottom: '20px' }}>{banner.tieuDe}</h2>
                                        <p style={{ fontSize: '1.1rem', color: '#636e72', marginBottom: '40px', lineHeight: '1.7', maxWidth: '90%' }}>
                                            {banner.moTa || "Cơ hội thưởng thức những món ăn tuyệt hảo với mức giá không thể tin được. Đặt ngay hôm nay!"}
                                        </p>
                                        <Link to={banner.maMon ? `/product-detail/${banner.maMon}` : "/menu"} style={{ background: '#e64a19', color: '#fff', padding: '15px 40px', borderRadius: '50px', fontWeight: 'bold', textDecoration: 'none', fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', gap: '12px', boxShadow: '0 15px 30px rgba(230, 74, 25, 0.3)', transition: '0.3s' }}>
                                            {banner.maMon ? "MUA NGAY" : "KHÁM PHÁ MENU"} <FaArrowRight />
                                        </Link>
                                    </div>
                                    <div className="image-content">
                                        <img src={bgImage} alt={banner.tieuDe} onError={(e) => e.target.src='https://placehold.co/1200x600/eee/999?text=No+Image'} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </Slider>
        </div>
    </section>
  );
};

const FeaturesSection = () => (
    <section style={{ padding: '80px 0', background: '#fff' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{ color: '#e64a19', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.9rem' }}>Vì Sao Chọn Chúng Tôi</span>
            <h2 style={{ fontSize: '2.5rem', margin: '10px 0 0', fontWeight: '800', fontFamily: '"Playfair Display", serif' }}>Trải Nghiệm <span style={{ color: '#e64a19' }}>Tuyệt Vời</span></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          <div style={{ padding: '40px 30px', borderRadius: '24px', background: '#fff9f5', border: '1px solid #ffe0b2', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', background: '#fff', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 10px 20px rgba(230,74,25,0.1)' }}><FaTruck size={35} color="#e64a19" /></div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>Giao Hàng Hỏa Tốc</h3>
              <p style={{ color: '#636e72', lineHeight: '1.6' }}>Cam kết món ăn nóng hổi giao đến tận tay bạn trong vòng 30 phút.</p>
          </div>
          <div style={{ padding: '40px 30px', borderRadius: '24px', background: '#f5fbee', border: '1px solid #c8e6c9', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', background: '#fff', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 10px 20px rgba(76,175,80,0.1)' }}><FaPizzaSlice size={35} color="#e9f908" /></div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>100% Tươi Sạch</h3>
              <p style={{ color: '#636e72', lineHeight: '1.6' }}>Sản phẩm được nhập từ các nguồn cung cấp uy tín, đảm bảo chất lượng.</p>
          </div>
          <div style={{ padding: '40px 30px', borderRadius: '24px', background: '#f0f8ff', border: '1px solid #bbdefb', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', background: '#fff', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 10px 20px rgba(33,150,243,0.1)' }}><FaUserShield size={35} color="#2196f3" /></div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>An Toàn Vệ Sinh</h3>
              <p style={{ color: '#636e72', lineHeight: '1.6' }}>Bếp trung tâm đạt chuẩn ISO, quy trình chế biến khép kín tuyệt đối.</p>
          </div>
        </div>
      </div>
    </section>
);

// --- 🔴 COMPONENT CHÍNH: HOME ---
const Home = ({ addToCart }) => {
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resFoods, resBanners] = await Promise.all([
            axiosClient.get('/MonAn'),
            axiosClient.get('/QuangCao/Active')
        ]);
        setFoods(Array.isArray(resFoods) ? resFoods : []);
        setBanners(Array.isArray(resBanners) ? resBanners : []);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  const bestSellerFoods = useMemo(() => {
    if (!Array.isArray(foods) || foods.length === 0) return [];
    let hotItems = foods.filter(item => item.banChay === true || item.banChay === 1 || item.BanChay === true || item.BanChay === 1);

    if (hotItems.length < 8) { 
        const soldItems = [...foods].sort((a, b) => {
            const soldA = a.DaBan || a.daBan || a.da_ban || 0;
            const soldB = b.DaBan || b.daBan || b.da_ban || 0;
            return soldB - soldA;
        });
        const uniqueItems = new Map();
        [...hotItems, ...soldItems].forEach(item => {
             const id = item.maMon || item.MaMon;
             if (!uniqueItems.has(id)) uniqueItems.set(id, item);
        });
        hotItems = Array.from(uniqueItems.values());
    }
    if (hotItems.length === 0) { hotItems = foods; }
    return hotItems.slice(0, 8);
  }, [foods]);

  const getPriceInfo = (item) => {
    const safeBanners = Array.isArray(banners) ? banners : [];
    const itemId = Number(item.maMon);
    const itemCatId = Number(item.maDanhMuc);
    const originalPrice = Number(item.giaBan || item.gia || 0);

    const itemBanner = safeBanners.find(b => Number(b.maMon) === itemId);
    const categoryBanner = safeBanners.find(b => {
        const bCatId = Number(b.maDanhMuc);
        const bMonId = Number(b.maMon || 0);
        return bCatId === itemCatId && bMonId === 0;
    });

    const appliedBanner = itemBanner || categoryBanner;
    if (appliedBanner && appliedBanner.phanTramGiam > 0) {
        return {
            finalPrice: originalPrice * (1 - appliedBanner.phanTramGiam / 100),
            originalPrice: originalPrice,
            isSale: true,
            percent: appliedBanner.phanTramGiam
        };
    }
    return { finalPrice: originalPrice, originalPrice: originalPrice, isSale: false, percent: 0 };
  };

  const handleQuickAddToCart = (e, item) => {
    e.preventDefault();
    const itemToAdd = { ...item, soLuong: 1 };
    addToCart(itemToAdd);
    toast.success(`Đã thêm ${item.tenMon} vào giỏ! 🛒`, { position: "top-center", autoClose: 1500 });
  };

  return (
    <div style={{ backgroundColor: '#fff', position: 'relative' }}>
      <ToastContainer />
      
      {/* 🎯 1. HERO SECTION (Banner To) */}
      <section style={{ backgroundColor: '#fff9f0', minHeight: '85vh', display: 'flex', alignItems: 'center', padding: '60px 0', overflow: 'hidden', position: 'relative' }}>
        <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', padding: '0 5vw' }}> 
          <div style={{ flex: '1 1 450px', maxWidth: '600px', zIndex: 2, paddingRight: '60px', paddingBottom: '40px' }}> 
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#ffe0b2', color: '#e65100', padding: '8px 16px', borderRadius: '30px', fontWeight: '600', fontSize: '0.9rem', marginBottom: '20px' }}>
              <span>🎉</span> Trải nghiệm món ăn tuyệt vời từ nhà FastBite
            </div>
            
            <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(3.5rem, 5vw, 5rem)', lineHeight: '1.1', color: '#2d3436', marginBottom: '25px', fontWeight: '900', letterSpacing: '-1px' }}>
              Đồ Ăn Ngon, <br /> <span style={{ color: '#e64a19' }}>Giao Siêu Tốc</span>
            </h1>
            
            <p style={{ fontSize: '1.15rem', color: '#636e72', marginBottom: '45px', lineHeight: '1.7', maxWidth: '500px' }}>
              Thưởng thức những món ăn nóng hổi tuyệt vời. Công nghệ AI gợi ý thông minh giúp bạn chọn món chỉ trong vài giây!
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '50px' }}>
              <Link to="/menu" style={{ backgroundColor: '#e64a19', color: '#fff', padding: '16px 40px', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px rgba(230, 74, 25, 0.3)' }}>
                Xem Thực Đơn <FaArrowRight />
              </Link>
              <Link to="/suggest" style={{ backgroundColor: '#fff', color: '#e64a19', padding: '16px 40px', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem', border: '2px solid #e64a19', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaMagic /> AI Gợi Ý Cho Bạn
              </Link>
            </div>
            
            <div style={{ display: 'flex', gap: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ background: '#ffebee', padding: '12px', borderRadius: '50%', color: '#e64a19' }}><FaTruck size={22}/></div>
                  <div>
                      <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#2d3436' }}>15-30p</div>
                      <div style={{ fontSize: '0.9rem', color: '#636e72' }}>Giao hàng nhanh</div>
                  </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ background: '#e8f5e9', padding: '12px', borderRadius: '50%', color: '#e64a19' }}><FaHotdog size={22}/></div>
                  <div>
                      <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#2d3436' }}>Thơm ngon</div>
                      <div style={{ fontSize: '0.9rem', color: '#636e72' }}>chất lượng 100%</div>
                  </div>
              </div>
            </div>
          </div>
          
          <div style={{ flex: '1.5 1 500px', display: 'flex', justifyContent: 'flex-end', position: 'relative' }}> 
            <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: '#ffe0b2', borderRadius: '50%', filter: 'blur(90px)', zIndex: 0, top: '0', right: '0' }}></div>
            <div style={{ width: '100%', minWidth: '550px', maxWidth: '900px', aspectRatio: '16/11', borderRadius: '36px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(230, 74, 25, 0.15)', backgroundColor: '#fff', position: 'relative', zIndex: 1 }}>
                <img src="/sales/banner.png" alt="Banner Sản Phẩm FastBite" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>

      {/* 🎯 2. DẢI BĂNG AI RECOMMENDATION LÊN ĐẦU */}
      <AiRecommendedList getPriceInfo={getPriceInfo} addToCart={addToCart} />
      
      {/* 🎯 3. BANNER Khuyến mãi */}
      <PromoBanner />

      {/* 🎯 4. BEST SELLER */}
      <section style={{ padding: '80px 0', background: '#fafafa' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <span style={{ color: '#e64a19', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.9rem' }}>Lựa Chọn Hàng Đầu</span>
              <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.5rem', margin: '10px 0 0', color: '#2d3436', fontWeight: '800' }}>Món Ăn <span style={{ color: '#e64a19' }}>Bán Chạy Nhất</span></h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '30px' }}>
            {bestSellerFoods.map((item) => {
              const priceInfo = getPriceInfo(item);

              return (
                <div key={item.maMon || item.MaMon} style={{ height: '100%' }}>
                    <ProductCard 
                        item={item}
                        priceInfo={priceInfo}
                        rating={item.diemDanhGia || item.DiemDanhGia || 0}
                        onAddToCart={handleQuickAddToCart}
                        customBadge={
                            <div style={{ background: '#e64a19', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                🔥 HOT
                            </div>
                        }
                    />
                </div>
              );
            })}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <Link to="/menu" style={{ border: '1px solid #e2e8f0', background: '#fff', color: '#2d3436', padding: '15px 40px', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold', transition: 'all 0.2s', display: 'inline-block', fontSize: '1rem', boxShadow: '0 5px 15px rgba(0,0,0,0.02)' }} onMouseOver={e => {e.target.style.borderColor = '#e64a19'; e.target.style.color = '#fff'; e.target.style.backgroundColor = '#e64a19'}} onMouseOut={e => {e.target.style.borderColor = '#e2e8f0'; e.target.style.color = '#2d3436'; e.target.style.backgroundColor = '#fff'}}>
                  Xem Toàn Bộ Menu
              </Link>
          </div>
        </div>
      </section>

      {/* 🎯 5. FEATURES */}
      <FeaturesSection />

    </div>
  );
};

export default Home;