import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FaMinus, FaPlus, FaShoppingCart, FaStar, FaHeart, FaRegHeart,
  FaCheckCircle, FaChevronRight, FaUserCircle, FaUtensils, FaFireAlt
} from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import axiosClient from '../../api/axiosClient'; 
import { getImageUrl } from '../../utils/imageHelper';
import { calculateFinalPrice } from '../../utils/priceHelper'; 
import { useTracking } from '../../hooks/useTracking'; 

// Import Components
import RelatedProducts from '../../components/RelatedProducts';
import ProductCard from '../../components/ProductCard';

function ProductDetail({ addToCart, user }) {
  const { productId } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [banners, setBanners] = useState([]);
  const [reviews, setReviews] = useState([]); 
  const [sideDishes, setSideDishes] = useState([]); 
  
  // 👉 ĐỔI TÊN STATE: Thay vì cùng danh mục, ta dùng Thịnh Hành (Trending)
  const [trendingFoods, setTrendingFoods] = useState([]); 
  
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(''); 
  const [activeTab, setActiveTab] = useState('desc');
  const [quantity, setQuantity] = useState(1); 
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);

  const track = useTracking();

  useEffect(() => {
    const fetchData = async () => {
        try {
            window.scrollTo(0, 0); 
            setLoading(true);
            setQuantity(1); 

            const [prodRes, bannerRes, allFoodsRes] = await Promise.all([
                axiosClient.get(`/MonAn/${productId}`),
                axiosClient.get(`/QuangCao/Active`),
                axiosClient.get(`/MonAn`)
            ]);

            const safeProduct = prodRes || null;
            const safeBanners = Array.isArray(bannerRes) ? bannerRes : [];
            const safeAllFoods = Array.isArray(allFoodsRes) ? allFoodsRes : (allFoodsRes?.data || []);

            setProduct(safeProduct);
            setBanners(safeBanners);

            if (safeProduct) {
                const firstImg = safeProduct.hinhAnh || (safeProduct.hinhAnhMonAns?.[0]?.duongDan);
                setMainImage(getImageUrl(firstImg));

                const currentId = Number(safeProduct.maMon || safeProduct.MaMon);
                const currentCatId = Number(safeProduct.maDanhMuc || safeProduct.MaDanhMuc || 0);

                // 1. GỢI Ý MÓN KÈM (Dùng cho dải mini)
                let targetCatIds = [];
                if ([1, 2, 4, 5].includes(currentCatId)) targetCatIds = [3];
                else if (currentCatId === 3) targetCatIds = [6];
                else if (currentCatId === 6) targetCatIds = [3];
                else targetCatIds = [3, 6];

                let sides = safeAllFoods.filter(item => {
                    const catId = Number(item.maDanhMuc || item.MaDanhMuc);
                    const itemId = Number(item.maMon || item.MaMon);
                    return targetCatIds.includes(catId) && itemId !== currentId;
                });

                sides.sort((a, b) => (b.daBan || b.DaBan || 0) - (a.daBan || a.DaBan || 0));

                if (sides.length < 4) {
                    let extraSides = safeAllFoods.filter(item => {
                        const catId = Number(item.maDanhMuc || item.MaDanhMuc);
                        const itemId = Number(item.maMon || item.MaMon);
                        return (catId === 3 || catId === 6) && itemId !== currentId && !sides.some(s => (s.maMon || s.MaMon) === itemId);
                    });
                    extraSides.sort((a, b) => (b.daBan || b.DaBan || 0) - (a.daBan || a.DaBan || 0));
                    sides = [...sides, ...extraSides];
                }
                setSideDishes(sides.slice(0, 4));

                // 👉 2. LOGIC MỚI: TOP MÓN THỊNH HÀNH TOÀN HỆ THỐNG
                let trending = [...safeAllFoods].filter(item => {
                    const itemId = Number(item.maMon || item.MaMon);
                    return itemId !== currentId; // Bỏ món đang xem
                });
                
                // Sắp xếp theo số lượng bán ra (daBan) giảm dần
                trending.sort((a, b) => (b.daBan || b.DaBan || 0) - (a.daBan || a.DaBan || 0));
                setTrendingFoods(trending.slice(0, 10)); // Lấy 10 món hot nhất

                // 3. Lấy đánh giá
                try {
                    const reviewRes = await axiosClient.get(`/DanhGia/MonAn/${currentId}`);
                    const productReviews = Array.isArray(reviewRes) ? reviewRes : (reviewRes?.data || []);
                    setReviews(productReviews);
                } catch (reviewError) {
                    setReviews([]); 
                }
            }
        } catch (err) {
            setProduct(null); 
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [productId]);

  useEffect(() => {
      if (product && user && user.id) {
          const checkFav = async () => {
              try {
                  const currentId = product.maMon || product.MaMon;
                  const res = await axiosClient.get(`/YeuThich/Check?maNguoiDung=${user.id}&maMon=${currentId}`);
                  setIsFavorite(res.isFavorite);
              } catch (err) { }
          };
          checkFav();
      }
  }, [product, user]);

  useEffect(() => {
    if (product && (product.maMon || product.MaMon)) {
        track('VIEW_PRODUCT', { maMon: product.maMon || product.MaMon, diemHanhVi: 1.0 });
    }
  }, [product, track]); 

  const handleToggleFavorite = async () => {
      if (!user || !user.id) return toast.warning("Vui lòng đăng nhập để yêu thích món ăn! 🔒");

      const currentFavStatus = isFavorite;
      const currentMonId = product.maMon || product.MaMon;
      
      setIsFavorite(!currentFavStatus);
      setIsHeartAnimating(true);
      setTimeout(() => setIsHeartAnimating(false), 300);

      try {
          const res = await axiosClient.post('/YeuThich/Toggle', { maNguoiDung: user.id, maMon: currentMonId });
          setIsFavorite(res.isFavorite);
          toast.success(res.message, { position: "bottom-right", autoClose: 1500, theme: "colored" });
      } catch (error) {
          setIsFavorite(currentFavStatus);
          toast.error("Lỗi kết nối, không thể cập nhật yêu thích!");
      }
  };

  const priceInfo = useMemo(() => calculateFinalPrice(product, banners), [product, banners]);

  const averageRating = useMemo(() => {
      if (reviews.length === 0) return 5;
      const totalStars = reviews.reduce((sum, r) => sum + (Number(r.soSao || r.so_sao || r.SoSao) || 5), 0);
      return (totalStars / reviews.length).toFixed(1);
  }, [reviews]);

  const handleAddToCart = (isBuyNow = false) => {
      if (!product) return;
      const itemToAdd = { ...product, soLuong: quantity };
      addToCart(itemToAdd);

      track('ADD_TO_CART', { maMon: product.maMon || product.MaMon, diemHanhVi: 3.0 });

      if (isBuyNow) {
          navigate('/cart');
      } else {
          toast.success(`Đã thêm ${quantity} món vào giỏ!`, { position: "top-center", autoClose: 1500, theme: "colored" });
      }
  };

  const handleQuantityChange = (delta) => setQuantity(prev => Math.max(1, prev + delta));
  
  const handleSubmitReview = async () => {
      if (!userComment.trim()) return toast.warning("Bạn chưa viết nhận xét! ✍️");
      const token = localStorage.getItem('accessToken'); 
      if (!token) return toast.warning("Vui lòng đăng nhập để đánh giá! 🔒");

      try {
          setIsSubmitting(true);
          
          await axiosClient.post('/DanhGia', {
              maMon: product.maMon || product.MaMon,
              soSao: userRating,
              nhanXet: userComment
          }, { headers: { 'Authorization': `Bearer ${token}` } });
          
          toast.success("Đánh giá thành công! 🎉", { position: "top-center", autoClose: 2000, theme: "colored" });
          setUserComment('');
          setUserRating(5);
          
          const res = await axiosClient.get(`/DanhGia/MonAn/${product.maMon || product.MaMon}`);
          const productReviews = Array.isArray(res) ? res : (res?.data || []);
          setReviews(productReviews);
      } catch (error) {
          const errorMessage = error.response?.data?.message || "Không thể gửi đánh giá lúc này!";
          toast.error(errorMessage, { position: "top-center", autoClose: 3000, theme: "colored" });
      } finally {
          setIsSubmitting(false);
      }
  };

  const renderStars = (rating) => {
      return [...Array(5)].map((_, i) => (
          <FaStar key={i} size={14} color={i < Math.round(rating) ? "#ffa502" : "#dfe6e9"} />
      ));
  };

  if (loading) return <div style={{ minHeight:'80vh', display:'flex', justifyContent:'center', alignItems:'center' }}>Đang tải thông tin... 🍔</div>;
  if (!product) return <div style={{ textAlign:'center', padding:'100px' }}><h3>Không tìm thấy sản phẩm!</h3><Link to="/menu">Quay lại thực đơn</Link></div>;

  const thumbnails = [product.hinhAnh || product.HinhAnh, ...(product.hinhAnhMonAns?.map(img => img.duongDan || img.DuongDan) || [])].filter(Boolean);
  const tenMon = product.tenMon || product.TenMon;
  const moTa = product.moTa || product.MoTa;
  const daBan = product.daBan || product.DaBan || 0;

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', paddingBottom: '60px', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      <ToastContainer />
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#999', fontSize: '0.9rem', marginBottom: '20px' }}>
            <Link to="/" style={{ textDecoration: 'none', color: '#666' }}>Trang chủ</Link> <FaChevronRight size={10} />
            <Link to="/menu" style={{ textDecoration: 'none', color: '#666' }}>Thực đơn</Link> <FaChevronRight size={10} />
            <span style={{ color: '#e64a19', fontWeight: '600' }}>{tenMon}</span>
        </div>

        <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 5px 20px rgba(0,0,0,0.03)', padding: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
          <div>
            <div style={{ position: 'relative', borderRadius: '15px', overflow: 'hidden', border:'1px solid #eee', marginBottom: '15px' }}>
                <img src={mainImage} alt={tenMon} style={{ width: '100%', height: '450px', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '15px', left: '15px', display:'flex', flexDirection:'column', gap:'10px' }}>
                    {priceInfo.isSale && <span style={{ background: '#e64a19', color: '#fff', padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>-{priceInfo.percent}% OFF</span>}
                </div>
                <div onClick={handleToggleFavorite} style={{ position: 'absolute', top: '15px', right: '15px', background: '#fff', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', cursor: 'pointer', transform: isHeartAnimating ? 'scale(1.2)' : 'scale(1)', transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                    {isFavorite ? <FaHeart size={22} color="#ff4757" /> : <FaRegHeart size={22} color="#a4b0be" />}
                </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
                {thumbnails.map((img, idx) => (
                    <img key={idx} src={getImageUrl(img)} alt="thumb" onClick={() => setMainImage(getImageUrl(img))} style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover', cursor: 'pointer', border: mainImage === getImageUrl(img) ? '2px solid #e64a19' : '2px solid transparent' }} />
                ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '2.4rem', fontWeight: '800', color: '#2d3436', margin: '0 0 10px' }}>{tenMon}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ffa502', fontWeight:'bold' }}>
                    {averageRating} <FaStar /> <span style={{fontWeight:'400', color:'#999'}}>({reviews.length} đánh giá)</span>
                </span>
                <span style={{ width: '1px', height: '15px', background: '#ddd' }}></span>
                <span style={{ color: '#00b894', fontWeight: '600' }}><FaCheckCircle size={14}/> Đã bán {daBan}</span>
            </div>

            <div style={{ background: '#fff9f5', padding: '20px', borderRadius: '15px', display: 'flex', alignItems: 'flex-end', gap: '15px', marginBottom: '25px', border:'1px dashed #e64a19' }}>
                {priceInfo.isSale ? (
                    <>
                        <span style={{ fontSize: '2.2rem', fontWeight: '800', color: '#e64a19' }}>{priceInfo.finalPrice.toLocaleString()} đ</span>
                        <div style={{ display:'flex', flexDirection:'column' }}>
                            <span style={{ fontSize: '1.1rem', color: '#b2bec3', textDecoration: 'line-through' }}>{priceInfo.originalPrice.toLocaleString()} đ</span>
                        </div>
                    </>
                ) : (
                    <span style={{ fontSize: '2.2rem', fontWeight: '800', color: '#e64a19' }}>{priceInfo.finalPrice.toLocaleString()} đ</span>
                )}
            </div>

            <p style={{ color: '#636e72', lineHeight: '1.6', marginBottom: '20px' }}>{moTa || "Món ăn thơm ngon, hấp dẫn."}</p>

            <div style={{ marginBottom: '20px' }}>
                <span style={{ display:'block', marginBottom:'10px', fontWeight:'600' }}>Số lượng:</span>
                <div style={{ display: 'inline-flex', alignItems: 'center', background: '#f5f6fa', borderRadius: '30px', padding: '8px 15px', border:'1px solid #dfe6e9' }}>
                    <button onClick={() => handleQuantityChange(-1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><FaMinus color="#636e72"/></button>
                    <span style={{ margin: '0 15px', fontWeight: 'bold', fontSize:'1.1rem' }}>{quantity}</span>
                    <button onClick={() => handleQuantityChange(1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><FaPlus color="#636e72"/></button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <button onClick={() => handleAddToCart(false)} style={{ flex: 1, background: '#fff', border: '2px solid #e64a19', color: '#e64a19', padding: '15px', borderRadius: '50px', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                   <FaShoppingCart /> Thêm vào giỏ
                </button>
                <button onClick={() => handleAddToCart(true)} style={{ flex: 1, background: '#e64a19', border: 'none', color: '#fff', padding: '15px', borderRadius: '50px', fontWeight: '700', cursor: 'pointer' }}>
                    Mua Ngay
                </button>
            </div>

            {sideDishes.length > 0 && (
                <div style={{ paddingTop: '20px', marginTop: '10px', borderTop: '1px dashed #eee' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '15px', color: '#2d3436', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaUtensils color="#e64a19" /> Dùng kèm cho trọn vị:
                    </h4>
                    <div className="custom-scrollbar-mini" style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                        {sideDishes.map(side => {
                            const priceSide = calculateFinalPrice(side, banners);
                            return (
                                <div key={side.maMon || side.MaMon} style={{ 
                                    minWidth: '130px', 
                                    maxWidth: '130px', 
                                    background: '#fff', 
                                    border: '1px solid #f1f2f6', 
                                    borderRadius: '12px', 
                                    padding: '10px', 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: '8px', 
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                                    cursor: 'pointer',
                                    transition: '0.2s'
                                }}
                                onMouseOver={e => e.currentTarget.style.borderColor = '#ffe0b2'}
                                onMouseOut={e => e.currentTarget.style.borderColor = '#f1f2f6'}
                                >
                                    <img src={getImageUrl(side.hinhAnh || side.HinhAnh)} alt={side.tenMon || side.TenMon} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px' }} onError={(e) => e.target.src='https://placehold.co/80'} />
                                    
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#2d3436', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
                                            {side.tenMon || side.TenMon}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                            <span style={{ color: '#e64a19', fontWeight: '800', fontSize: '0.9rem' }}>+{priceSide.finalPrice.toLocaleString()}đ</span>
                                            
                                            <button 
                                                onClick={(e) => { 
                                                    e.preventDefault(); 
                                                    addToCart({ ...side, soLuong: 1 }); 
                                                    track('ADD_TO_CART', { maMon: side.maMon || side.MaMon, diemHanhVi: 3.0 });
                                                    toast.success(`Đã thêm ${side.tenMon || side.TenMon} vào giỏ! 🛒`, { position: 'top-center', autoClose: 1000, theme: 'colored' }); 
                                                }}
                                                style={{ background: '#ffe0b2', color: '#e64a19', border: 'none', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: '0.2s', flexShrink: 0 }}
                                                title="Thêm món này"
                                            >
                                                <FaPlus style={{ fontSize: '12px', minWidth: '12px', minHeight: '12px', color: 'inherit' }} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '40px', background: '#fff', borderRadius: '20px', padding: '30px' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #eee', marginBottom: '20px' }}>
                {['desc', 'review'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '15px 30px', background: 'none', border: 'none', fontSize: '1rem', fontWeight: '700', color: activeTab === tab ? '#e64a19' : '#999', borderBottom: activeTab === tab ? '3px solid #e64a19' : '3px solid transparent', cursor: 'pointer' }}>
                        {tab === 'desc' ? 'Mô Tả' : `Đánh Giá (${reviews.length})`}
                    </button>
                ))}
            </div>
            
            {activeTab === 'desc' ? (
                <p style={{ lineHeight: '1.6', color: '#2d3436' }}>{moTa || "Chưa có mô tả chi tiết."}</p>
            ) : (
                <div>
                    <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '15px', marginBottom: '20px' }}>
                        <div style={{ marginBottom: '10px' }}>
                            {[1,2,3,4,5].map(s => <FaStar key={s} onClick={() => setUserRating(s)} color={s <= userRating ? "#ffa502" : "#dfe6e9"} style={{cursor:'pointer'}} />)}
                        </div>
                        <textarea value={userComment} onChange={e => setUserComment(e.target.value)} placeholder="Nhận xét của bạn..." style={{ width: '100%', padding: '10px', borderRadius: '10px', border:'1px solid #ddd', minHeight: '80px' }} />
                        <button onClick={handleSubmitReview} disabled={isSubmitting} style={{ marginTop: '10px', background: '#e64a19', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold' }}>Gửi đánh giá</button>
                    </div>

                    {reviews.map((rev, i) => (
                        <div key={i} style={{ display:'flex', gap:'15px', marginBottom:'15px', borderBottom:'1px solid #eee', paddingBottom:'10px' }}>
                            <FaUserCircle size={40} color="#dfe6e9" />
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{fontWeight:'bold', color: '#2d3436'}}>{rev.tenHienThi || rev.TenHienThi || "Khách hàng"}</div>
                                    <div style={{fontSize: '0.85rem', color: '#b2bec3'}}>
                                        {rev.ngayDanhGia || rev.NgayDanhGia ? new Date(rev.ngayDanhGia || rev.NgayDanhGia).toLocaleDateString('vi-VN') : ''}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '5px' }}>{renderStars(rev.soSao || rev.SoSao)}</div>
                                <p style={{ color: '#636e72', margin: '5px 0 0 0', lineHeight: '1.5' }}>{rev.nhanXet || rev.NhanXet}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* 👉 ĐÃ FIX: DẢI SẢN PHẨM THỊNH HÀNH TOÀN HỆ THỐNG CÓ NHÃN EXPLAINABLE AI */}
        {trendingFoods.length > 0 && (
            <div style={{ marginTop: '40px', background: '#fff', borderRadius: '20px', padding: '30px', boxShadow: '0 5px 20px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#fff0e6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaFireAlt color="#e64a19" size={20} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#2d3436', fontWeight: '800' }}>Đang thịnh hành tại FastBite</h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#636e72', marginTop: '4px' }}>Các món ngon được khách hàng order nhiều nhất</p>
                    </div>
                </div>
                
                <div className="custom-scrollbar" style={{ display: 'flex', flexNowrap: 'nowrap', gap: '20px', overflowX: 'auto', paddingBottom: '15px' }}>
                    {trendingFoods.map(item => (
                        <div key={item.maMon || item.MaMon} style={{ minWidth: '240px', maxWidth: '240px' }}>
                            <ProductCard 
                                item={item}
                                priceInfo={calculateFinalPrice(item, banners)}
                                rating={item.diemDanhGia || item.DiemDanhGia || 0}
                                onAddToCart={(e, itm) => {
                                    e.preventDefault();
                                    addToCart({ ...itm, soLuong: 1 });
                                    track('ADD_TO_CART', { maMon: itm.maMon || itm.MaMon, diemHanhVi: 3.0 });
                                    toast.success(`Đã thêm ${itm.tenMon || itm.TenMon} vào giỏ! 🛒`, { position: 'top-center', autoClose: 1000, theme: 'colored' });
                                }}
                                customBadge={
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                                        {/* Nhãn giải thích AI cho dải Thịnh Hành */}
                                        <div style={{ background: '#ffdad6', color: '#d63031', padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '800', border: '1px solid rgba(214, 48, 49, 0.5)' }}>
                                            📈 Lượt mua cao
                                        </div>
                                        <div style={{ background: '#e64a19', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display: 'flex', gap: '5px' }}>
                                            🔥 Đã bán {(item.daBan || item.DaBan || 0)}
                                        </div>
                                    </div>
                                }
                            />
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* 4. THUẬT TOÁN AI COLLABORATIVE: GỢI Ý MUA CÙNG MÓN (Nằm trong component RelatedProducts) */}
        <RelatedProducts 
            maMonHienTai={product.maMon || product.MaMon} 
            getPriceInfo={(item) => calculateFinalPrice(item, banners)} 
            getAverageRating={(item) => item.diemDanhGia || item.DiemDanhGia || 0} 
            addToCart={addToCart} 
        />
        
      </div>
      
      <style>{`
          .custom-scrollbar-mini::-webkit-scrollbar { height: 4px; }
          .custom-scrollbar-mini::-webkit-scrollbar-track { background: #f1f2f6; border-radius: 10px; }
          .custom-scrollbar-mini::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
          .custom-scrollbar-mini::-webkit-scrollbar-thumb:hover { background: #a4b0be; }
      `}</style>
    </div>
  );
}

export default ProductDetail;