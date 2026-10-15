# 🎯 AnFood - 3 Sơ đồ Sequence Chính (Mermaid)

Tài liệu này tích hợp tất cả **3 sơ đồ Mermaid** cho hệ thống AnFood.
Bạn có thể xem preview trực tiếp hoặc copy từng sơ đồ sang [Mermaid Live Editor](https://mermaid.live).

---

## 📌 Hướng dẫn nhanh

### **Xem trên GitHub**:
Mermaid tự động render → Bạn có thể thấy sơ đồ ngay trên trang này!

### **Xem trên VS Code**:
1. Cài extension: `Markdown Preview Mermaid Support`
2. Mở file này → Nhấn `Ctrl+Shift+V` → Preview

### **Xem online**:
1. Copy từng sơ đồ dưới đây
2. Paste vào https://mermaid.live
3. Preview ngay lập tức

---

## 🛒 1️⃣ Sơ đồ Đặt hàng & Thanh toán (Checkout & Payment)

```mermaid
sequenceDiagram
    actor U as Người dùng
    participant FE as Frontend<br/>(Vue/React)
    participant GHC as GioHangController
    participant DHC as DonHangController
    participant OS as OrderService
    participant DB as AnshopDbContext<br/>(Database)
    participant PC as PaymentController
    participant VPS as VnPayService
    participant VNPAY as VNPay<br/>Gateway

    rect rgb(200, 220, 240)
        Note over U,VNPAY: GIAI ĐOẠN 1: HIỂN THỊ GIỎ HÀNG
        U->>FE: Mở giỏ hàng
        FE->>GHC: GET /api/giohang/{userId}
        GHC->>DB: Query ChiTietGioHang + MonAn
        DB-->>GHC: Danh sách sản phẩm
        GHC-->>FE: JSON danh sách
        FE-->>U: Hiển thị giỏ hàng<br/>+ tổng giá + phí
    end

    rect rgb(220, 240, 200)
        Note over U,VNPAY: GIAI ĐOẠN 2: NHẬP THÔNG TIN & ÁP DỤNG VOUCHER
        U->>FE: Nhập thông tin giao hàng<br/>(Tên, SĐT, Địa chỉ, Ghi chú)
        U->>FE: Chọn voucher (nếu có)
        FE->>FE: Tính lại tổng tiền<br/>(Trừ discount)
    end

    rect rgb(240, 220, 200)
        Note over U,VNPAY: GIAI ĐOẠN 3: TẠO ĐƠN HÀNG & KIỂM TRA KHO
        U->>FE: Chọn phương thức thanh toán<br/>(VNPay hoặc COD)
        FE->>DHC: POST /api/donhang/TaoDon
        Note over DHC,DB: {MaNguoiDung, NguoiNhan, SoDienThoai,<br/>DiaChiGiaoHang, GhiChu, MaVoucher,<br/>TongTien, PhiVanChuyen, ChiTietDonHangs}
        
        DHC->>OS: CreateOrderAsync(request)
        
        rect rgb(255, 240, 240)
            Note over OS,DB: 🔒 TRANSACTION BẮT ĐẦU
            OS->>DB: BEGIN TRANSACTION
            OS->>DB: INSERT DonHang<br/>(TrangThai = 'cho_xu_ly')
            DB-->>OS: MaDonHang tạo thành công
            
            OS->>DB: INSERT LichSuTrangThaiDonHang
            OS->>DB: TRỪ SỐ LƯỢNG VOUCHER<br/>(Nếu có MaVoucher)
            
            loop Cho mỗi ChiTietDonHang
                OS->>DB: Query ChiTietKho (FIFO)
                
                alt Tồn kho đủ
                    OS->>DB: INSERT ChiTietDonHang
                    OS->>DB: UPDATE ChiTietKho (Trừ lô hàng)
                    OS->>DB: INSERT LichSuKho
                else Tồn kho KHÔNG đủ
                    OS-->>DHC: Lỗi: Món X chỉ còn Y phần
                    DHC-->>FE: 400 Bad Request
                    FE-->>U: Hiển thị thông báo lỗi
                    Note over OS,DB: ⚠️ ROLLBACK TRANSACTION
                    OS->>DB: ROLLBACK
                end
            end
            
            OS->>DB: INSERT ThanhToan
            OS->>DB: Xóa ChiTietGioHang & GioHang
            OS->>DB: COMMIT TRANSACTION
            Note over OS,DB: ✅ TRANSACTION HOÀN TẤT
        end
        
        OS-->>DHC: Success, MaDonHang
        DHC-->>FE: 200 OK
    end

    rect rgb(240, 240, 220)
        Note over U,VNPAY: GIAI ĐOẠN 4: THANH TOÁN
        
        alt Phương thức = VNPay
            FE->>U: Hiển thị nút "Thanh toán VNPay"
            U->>FE: Bấm nút thanh toán
            
            FE->>PC: POST /api/payment/CreatePaymentUrl
            Note over PC: {OrderId, Amount, OrderInfo}
            
            PC->>VPS: CreatePaymentUrl(request)
            VPS->>VPS: Tạo dữ liệu VNPay:<br/>- MerchantCode<br/>- OrderId<br/>- Amount (×100)<br/>- CreateDate<br/>- ReturnUrl
            
            VPS->>VPS: Lấy IP khách hàng<br/>Tạo HMAC256 signature
            VPS->>VPS: Tạo URL VNPay
            
            VPS-->>PC: URL VNPay
            PC-->>FE: 200 OK {url: "https://..."}
            
            FE-->>U: Redirect đến VNPay gateway
            U->>VNPAY: Truy cập link thanh toán
            VNPAY-->>U: Form thanh toán<br/>(Nhập thông tin thẻ)
            
            U->>VNPAY: Nhập thông tin thanh toán
            VNPAY->>VNPAY: Xác thực thanh toán
            
            alt Thanh toán thành công
                VNPAY-->>FE: Redirect ReturnUrl<br/>(vnp_ResponseCode=00)
                FE->>FE: Xác thực SecureHash
                FE-->>U: Thông báo:<br/>Thanh toán thành công
                DB->>DB: UPDATE ThanhToan<br/>TrangThai = 'success'
            else Thanh toán thất bại
                VNPAY-->>FE: Redirect ReturnUrl<br/>(vnp_ResponseCode!=00)
                FE-->>U: Hiển thị lỗi
                DB->>DB: UPDATE ThanhToan<br/>TrangThai = 'failed'
            end
        else Phương thức = COD
            FE-->>U: Hiển thị xác nhận<br/>"Thanh toán khi nhận hàng"
            U->>FE: Xác nhận
            DB->>DB: UPDATE ThanhToan<br/>TrangThai = 'pending'
        end
    end

    rect rgb(220, 240, 240)
        Note over U,VNPAY: GIAI ĐOẠN 5: HOÀN TẤT & CẬP NHẬT TRẠNG THÁI
        DB->>DB: UPDATE DonHang<br/>TrangThai = 'da_xac_nhan'
        DB->>DB: INSERT LichSuTrangThaiDonHang
        
        FE-->>U: Hiển thị xác nhận:<br/>- Mã đơn hàng<br/>- Tổng tiền<br/>- Thời gian giao dự kiến<br/>- Nút "Quay lại trang chủ"
    end
```

**Công nghệ chính**: 
- ✅ Database Transactions (ACID)
- ✅ FIFO Inventory Check
- ✅ VNPay Payment Gateway
- ✅ JWT Authentication

---

## 🍽️ 2️⃣ Sơ đồ Gợi ý Cá nhân hóa (Personalized Recommendation)

```mermaid
sequenceDiagram
    actor U as Người dùng
    participant FE as Frontend<br/>(Vue/React)
    participant RC as RecommendationController
    participant DB as AnshopDbContext
    participant WS as WeatherService
    participant RS as RecommendationService<br/>(ML.NET)
    participant WEATHER as Weather API
    participant CACHE as Cache<br/>(GoiYAi Table)

    rect rgb(200, 220, 240)
        Note over U,CACHE: GIAI ĐOẠN 1: KHÁCH HÀNG YÊU CẦU GỢI Ý
        U->>FE: Mở trang chủ/danh mục
        FE->>RC: GET /api/recommendation/ForUser/{userId}?lat=10.0452&lon=105.7469
        
        RC->>WS: GetCurrentWeatherAsync(lat, lon)
        WS->>WEATHER: Call Weather API
        WEATHER-->>WS: Thời tiết hiện tại<br/>(Rain, Clear, Hot, ...)
        WS-->>RC: currentWeather = "Rain"
        
        RC->>RC: currentHour = 14 (2 chiều)<br/>Giờ VN chuẩn
    end

    rect rgb(240, 220, 200)
        Note over U,CACHE: GIAI ĐOẠN 2: KIỂM TRA CACHE
        RC->>CACHE: Query GoiYAi<br/>WHERE MaNguoiDung = {userId}<br/>ORDER BY Diem DESC
        
        alt Cache hợp lệ (< 15 phút)
            CACHE-->>RC: Danh sách gợi ý<br/>đã sắp xếp
            
            RC->>DB: Query MonAn<br/>WHERE MaMon IN (cache)<br/>AND TrangThai='con_ban'
            DB-->>RC: Chi tiết các món
            
            RC->>DB: Query DiemDanhGia<br/>Tính điểm TB
            DB-->>RC: Điểm đánh giá
            
            RC-->>FE: 200 OK<br/>{success: true,<br/>type: "ai-personalized-cached",<br/>context: {weather: "Rain", hour: 14},<br/>data: [{MonAnDTO...}]}
            
            Note over RC,FE: ✅ Cache HIT<br/>Trả kết quả ngay
            FE-->>U: Hiển thị danh sách gợi ý
        else Cache hết hạn hoặc không có
            Note over RC,CACHE: 🔄 Cache MISS<br/>Cần tính toán lại
        end
    end

    rect rgb(220, 240, 200)
        Note over U,CACHE: GIAI ĐOẠN 3: KÍCH HOẠT LÕI ML.NET (COLLABORATIVE FILTERING)
        RC->>DB: Query MonAn<br/>WHERE TrangThai='con_ban'
        DB-->>RC: allActiveFoods
        
        loop Cho mỗi MonAn
            RC->>RS: PredictScore(userId, monAn.MaMon)
            
            RS->>RS: Dùng ML.NET Matrix Factorization<br/>trên AiLichSuHanhVi
            RS->>RS: Tính điểm dựa trên:<br/>- User-Product history<br/>- User tương tự<br/>- Sản phẩm tương tự
            
            RS-->>RC: float aiScore (ví dụ: 8.5)
            
            rect rgb(200, 240, 240)
                Note over RC,RS: GIAI ĐOẠN 4: ÁP DỤNG NGỮ CẢNH (CONTEXT-AWARE)
                RC->>RC: contextMultiplier = 1.0f
                
                alt Khung giờ sáng (6-9)<br/>& Danh mục = Đồ uống
                    RC->>RC: contextMultiplier += 0.5f<br/>🌅 Sáng -> Đồ uống
                end
                
                alt Khung giờ khuya (21-23)<br/>& Danh mục = Ăn vặt/Gà rán
                    RC->>RC: contextMultiplier += 0.5f<br/>🌙 Khuya -> Ăn vặt
                end
                
                alt Thời tiết = Mưa<br/>& Danh mục = Lẩu/Pizza/Gà rán
                    RC->>RC: contextMultiplier += 0.8f<br/>🌧️ Mưa -> Món ấm
                end
                
                alt Thời tiết = Nóng<br/>& Danh mục = Đồ uống
                    RC->>RC: contextMultiplier += 0.6f<br/>☀️ Nóng -> Đồ uống lạnh
                end
            end
            
            RC->>RC: finalScore = aiScore × contextMultiplier<br/>Ví dụ: 8.5 × 1.3 = 11.05
        end
    end

    rect rgb(200, 240, 240)
        Note over U,CACHE: GIAI ĐOẠN 5: FALLBACK VÀ TOP 30 GỢI Ý
        RC->>RC: Sắp xếp theo finalScore<br/>Giảm dần
        
        alt Danh sách rỗng (Cold-Start Problem)
            Note over RC: ⚠️ Người dùng mới<br/>-> Fallback: Top bán chạy
            RC->>DB: Query MonAn<br/>ORDER BY BanChay DESC<br/>LIMIT 30
            DB-->>RC: 30 món bán chạy nhất
        else Có dữ liệu ML.NET
            RC->>RC: Lấy Top 30 món<br/>óc điểm cao nhất
        end
        
        RC->>DB: Query DiemDanhGia<br/>cho 30 món này
        DB-->>RC: DiemDanhGia
    end

    rect rgb(240, 240, 200)
        Note over U,CACHE: GIAI ĐOẠN 6: LƯU CACHE & TRẢ KẾT QUẢ
        RC->>CACHE: DELETE GoiYAi<br/>WHERE MaNguoiDung = userId
        
        loop Cho mỗi Top 30 món
            RC->>CACHE: INSERT GoiYAi<br/>(MaNguoiDung, MaMon,<br/>Diem, ThoiGian)
        end
        
        CACHE-->>RC: Cache lưu thành công
        
        RC->>RC: Tạo MonAnDTO list
        RC-->>FE: 200 OK<br/>{success: true,<br/>type: "ai-personalized",<br/>context: {weather, hour},<br/>data: [{MonAnDTO...}]}
        
        FE-->>U: Hiển thị 30 món gợi ý<br/>✅ Sở thích cá nhân (ML.NET)<br/>✅ Thời tiết hiện tại<br/>✅ Giờ trong ngày
    end

    rect rgb(220, 200, 220)
        Note over U,CACHE: GHI CHÚ: CHỈNH SỬA GỢI Ý
        U->>FE: (Tùy chọn) Thay đổi vị trí<br/>hoặc chọn bộ lọc khác
        
        alt Có thay đổi
            RC->>CACHE: Xóa cache cũ
            Note over RC,CACHE: LẶP LẠI GIAI ĐOẠN 2-6
        end
    end
```

**Công nghệ chính**:
- ✅ ML.NET Matrix Factorization (Collaborative Filtering)
- ✅ Weather API Integration
- ✅ Context-Aware Boosting (Thời tiết + Giờ)
- ✅ 15-minute Cache Strategy

---

## 💬 3️⃣ Sơ đồ Trò chuyện AI (Gemini AI Chatbot)

```mermaid
sequenceDiagram
    actor U as Người dùng
    participant FE as Frontend<br/>(Vue/React)
    participant CBC as ChatbotController
    participant CBS as ChatbotService
    participant DB as AnshopDbContext
    participant RS as RecommendationService<br/>(ML.NET)
    participant GEMINI as Gemini API<br/>(Google)

    rect rgb(200, 220, 240)
        Note over U,GEMINI: GIAI ĐOẠN 1: KHÁCH HÀNG GỬI TIN NHẮN
        U->>FE: Nhập tin nhắn vào chatbot<br/>"Em muốn ăn gì buổi chiều?"
        FE->>CBC: POST /api/chatbot/SendMessage<br/>{MaNguoiDung: 123,<br/>NoiDung: "..."}
    end

    rect rgb(240, 220, 200)
        Note over U,GEMINI: GIAI ĐOẠN 2: LƯU TIN NHẮN NGƯỜI DÙNG
        CBC->>DB: INSERT LichSuChat<br/>(MaNguoiDung, NoiDung,<br/>NguoiGui="User", ThoiGian)
        DB-->>CBC: Lưu thành công
        
        CBC->>CBS: LayPhanHoiTuAiAsync(123, "...")
    end

    rect rgb(220, 240, 200)
        Note over U,GEMINI: GIAI ĐOẠN 3: KÍCH HOẠT ML.NET<br/>LỌC RA TOP 5 MÓN
        CBS->>DB: Query MonAn<br/>WHERE TrangThai='con_ban'
        DB-->>CBS: allActiveFoods
        
        alt Khách đã đăng nhập (userId > 0)
            Note over CBS,RS: 🧠 ML.NET Collaborative Filtering
            
            loop Cho mỗi MonAn
                CBS->>RS: PredictScore(userId=123, monAn.MaMon)
                RS->>RS: Matrix Factorization<br/>từ AiLichSuHanhVi
                RS-->>CBS: float score (ví dụ: 8.7)
            end
            
            CBS->>CBS: Sắp xếp theo score<br/>Lấy Top 5 món
        else Khách vãng lai (userId = null)
            Note over CBS,RS: ❄️ Cold-Start Problem<br/>-> Top bán chạy
            CBS->>DB: Query MonAn<br/>ORDER BY BanChay DESC<br/>LIMIT 5
            DB-->>CBS: Top 5 bán chạy nhất
        end
        
        CBS->>CBS: Tạo top5Foods array<br/>[{id, name, price,<br/>tag: "Cá nhân hóa"}, ...]
    end

    rect rgb(200, 240, 240)
        Note over U,GEMINI: GIAI ĐOẠN 4: LẤY LỊCH SỬ CHAT<br/>ĐỂ AI NHỚ NGỮ CẢNH
        CBS->>DB: Query LichSuChat<br/>WHERE MaNguoiDung = 123<br/>ORDER BY ThoiGian DESC<br/>LIMIT 5
        DB-->>CBS: 5 tin nhắn gần nhất
        
        CBS->>CBS: Đảo ngược thứ tự (Cũ -> Mới)<br/>lichSuChat = "User: ...<br/>Bot: ...<br/>User: Em muốn ăn gì?"
    end

    rect rgb(240, 240, 200)
        Note over U,GEMINI: GIAI ĐOẠN 5: TẠO PROMPT & GỬI GEMINI
        CBS->>CBS: Tạo promptSystem:<br/>"Bạn là trợ lý AI FastBite<br/>Top 5 món: [{...}]<br/><br/>🚨 YÊU CẦU JSON:<br/>{<br/>'message': 'Câu tư vấn',<br/>'suggestedProductIds': [...]<br/>}"
        
        CBS->>CBS: Tạo fullPrompt:<br/>promptSystem + LỊCH SỬ<br/>+ "Khách hỏi: ..."
        
        Note over CBS: ⚡ Ép Gemini trả JSON<br/>Chỉ gửi Top 5<br/>-> Token tiết kiệm
        
        CBS->>CBS: Tạo request body:<br/>{contents, responseMimeType}
        CBS->>GEMINI: POST /v1beta/models/gemini-2.5-flash
        Note over CBS,GEMINI: ?key=
        
        Note over GEMINI: 🤖 Gemini xử lý:<br/>1. Đọc prompt + lịch sử<br/>2. Hiểu ý khách<br/>3. Tư vấn Top 5 món<br/>4. Trả JSON định dạng
        
        GEMINI-->>CBS: 200 OK<br/>{"candidates": [{<br/>"content": {<br/>"parts": [{<br/>"text": "{<br/>'message': 'Buổi chiều nóng...',<br/>'suggestedProductIds': [1, 5]<br/>}"<br/>}]}}]}
        
        CBS->>CBS: Parse JSON response<br/>Deserialize -> AiResponseDto
    end

    rect rgb(220, 200, 220)
        Note over U,GEMINI: GIAI ĐOẠN 6: LƯU TIN NHẮN BOT<br/>VÀ TRẢ PHẢN HỒI
        CBS->>DB: INSERT LichSuChat<br/>(MaNguoiDung, NoiDung=message,<br/>NguoiGui="Bot", ThoiGian)
        DB-->>CBS: Lưu thành công
        
        Note over CBS,DB: ✅ Lưu lịch sử để:<br/>- Tracking hành vi<br/>- Huấn luyện ML<br/>- Hiểu user tốt hơn
        
        CBS-->>CBC: AiResponseDto<br/>{message: "...",<br/>suggestedProductIds: [1, 5]}
    end

    rect rgb(200, 220, 220)
        Note over U,GEMINI: GIAI ĐOẠN 7: HIỂN THỊ PHẢN HỒI<br/>TRÊN FRONTEND
        CBC-->>FE: 200 OK<br/>AiResponseDto JSON
        
        FE->>FE: Hiển thị tin nhắn Bot
        FE->>FE: Lấy suggestedProductIds = [1, 5]<br/>Query thông tin:<br/>- Tên, Giá, Hình, Đánh giá
        
        FE-->>U: Hiển thị:<br/>1️⃣ Tin nhắn bot<br/>2️⃣ Thẻ sản phẩm<br/>[Cơm tấm - 45K]<br/>[Cơm gà - 50K]<br/>Nút: Thêm giỏ, Chi tiết
    end

    rect rgb(240, 200, 220)
        Note over U,GEMINI: GIAI ĐOẠN 8: NGƯỜI DÙNG TƯƠNG TÁC & LẶP LẠI
        
        alt Người dùng tiếp tục chat
            U->>FE: Gửi tin nhắn tiếp:<br/>"Em muốn gà rán + Coca"
            Note over FE: 🔄 LẶP LẠI GIAI ĐOẠN 1<br/>Lịch sử sẽ được<br/>Gemini nhớ
        else Người dùng thêm vào giỏ
            U->>FE: Bấm "Thêm vào giỏ"
            FE->>FE: Tăng số lượng GioHang
            Note over FE: ➕ Hành động được ghi<br/>vào AiLichSuHanhVi<br/>cho lần gợi ý tiếp
        else Người dùng kết thúc chat
            U->>FE: Đóng chatbot
            FE-->>U: Lưu lịch sử<br/>(Mở lại sau)
        end
    end

    rect rgb(255, 240, 240)
        Note over U,GEMINI: ⚠️ EXCEPTION HANDLING
        
        alt API Gemini timeout
            CBS->>CBS: Bắt exception
            CBS-->>CBC: AiResponseDto<br/>{message: "Dạ máy chủ đang quá tải...",<br/>suggestedProductIds: []}
            CBC-->>FE: 500 Error
            FE-->>U: Hiển thị lỗi nhân ái
        end
    end
```

**Công nghệ chính**:
- ✅ Gemini 2.5 Flash API
- ✅ ML.NET Top 5 Filtering
- ✅ Lịch sử Chat (Context Awareness)
- ✅ JSON Response Forcing
- ✅ Cold-Start Problem Handling

---

## 📊 So sánh 3 Sơ đồ

| Tính năng | Checkout | Recommendation | Chatbot |
|-----------|----------|-----------------|---------|
| **Giai đoạn** | 5 | 7 | 8 |
| **API gọi** | VNPay | Weather API | Gemini API |
| **Cache** | ❌ | ✅ (15 min) | ❌ |
| **ML.NET** | ❌ | ✅ | ✅ |
| **Database Transaction** | ✅ | ❌ | ✅ (Chat log) |
| **Context-Aware** | ❌ | ✅ | ✅ (Chat history) |

---

## 🎨 Hướng dẫn sử dụng từng định dạng

### **Mermaid (Tệp `.mmd`)**
- Dùng cho: Quick share, GitHub, Markdown
- Preview: Mermaid Live, VS Code (extension)
- Export: PNG, PDF, SVG

### **PlantUML (Tệp `.puml`)**
- Dùng cho: Enterprise, chi tiết cao
- Preview: PlantUML Online
- Export: PNG, PDF, SVG, EPS

---

## 💡 Mẹo sử dụng hiệu quả

1. **GitHub**: Push file markdown này lên → Mermaid tự động render
2. **VS Code**: Cài extension Mermaid Preview → Mở file → `Ctrl+Shift+V`
3. **Slides**: Export PNG → Insert vào PowerPoint/Google Slides
4. **Share nhanh**: Copy code → Paste vào https://mermaid.live
5. **Documentation**: Tích hợp vào wiki/Confluence

---

## 📝 Chú ý quan trọng

- ⚠️ **Checkout**: Transaction phải ACID để tránh mất dữ liệu
- ⚠️ **Recommendation**: Cache 15 phút để balance giữa performance & freshness
- ⚠️ **Chatbot**: JSON forcing để tránh lỗi parsing

---

**Tạo bởi**: GitHub Copilot  
**Ngày tạo**: 2026-06-04  
**Phiên bản**: 1.0

