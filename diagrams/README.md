# 📊 PlantUML Sequence Diagrams - AnFood System

Tệp này chứa 3 sơ đồ tuần tự (Sequence Diagram) chi tiết miêu tả các quy trình chính của hệ thống AnFood.

---

## 📁 Danh sách các file

### 1. **01_Checkout_Payment_Sequence.puml**
   **Chủ đề**: Sơ đồ xử lý **Đặt hàng và Thanh toán** (Checkout & Payment)
   
   **Mô tả quy trình**:
   - **GIAI ĐOẠN 1**: Hiển thị giỏ hàng
     - Frontend lấy dữ liệu từ GioHangController
     - Hiển thị danh sách sản phẩm với tổng giá
   
   - **GIAI ĐOẠN 2**: Nhập thông tin giao hàng
     - Người dùng nhập: Tên, SĐT, Địa chỉ, Ghi chú
     - Chọn voucher (nếu có)
     - Tính toán lại tổng tiền
   
   - **GIAI ĐOẠN 3**: Tạo đơn hàng & Kiểm tra kho
     - **Transaction bắt đầu** (Đảm bảo toàn vẹn dữ liệu)
     - INSERT DonHang (TrangThai = 'cho_xu_ly')
     - Giảm số lượng Voucher
     - **FIFO Inventory Check**: 
       - Lọc ChiTietKho theo ngày hết hạn (FIFO)
       - Trừ tồn kho từng lô
       - Nếu không đủ → Rollback + Thông báo lỗi
     - INSERT ChiTietDonHang
     - INSERT LichSuKho (Ghi lại trừ kho)
     - INSERT ThanhToan
     - Xóa GioHang
     - **Transaction commit** (Dữ liệu lưu)
   
   - **GIAI ĐOẠN 4**: Thanh toán
     - **VNPay**:
       - Tạo Payment URL
       - Redirect đến VNPay Gateway
       - Xác thực HMAC256 Signature
       - Người dùng nhập thông tin thẻ
       - VNPay xác thực & trả kết quả
     - **COD**: Ghi nhận pending
   
   - **GIAI ĐOẠN 5**: Hoàn tất & Cập nhật trạng thái
     - UPDATE DonHang (TrangThai = 'da_xac_nhan')
     - Hiển thị xác nhận đơn hàng

   **Công nghệ chính**: Transactions, FIFO, VNPay API, JWT

---

### 2. **02_Recommendation_Sequence.puml**
   **Chủ đề**: Sơ đồ xử lý **Gợi ý món ăn thông minh** (Personalized Recommendation)
   
   **Mô tả quy trình**:
   - **GIAI ĐOẠN 1**: Khách hàng yêu cầu gợi ý
     - Frontend gọi RecommendationController
     - Gửi vị trí: `lat`, `lon`
   
   - **GIAI ĐOẠN 2**: Kiểm tra Cache
     - Query bảng GoiYAi
     - Nếu cache hợp lệ (< 15 phút) → Trả kết quả ngay ✅
     - Nếu cache hết hạn → Tính toán lại 🔄
   
   - **GIAI ĐOẠN 3**: Kích hoạt lõi ML.NET (Collaborative Filtering)
     - RecommendationService sử dụng **Matrix Factorization**
     - Duyệt qua tất cả các món ăn
     - Gọi `PredictScore(userId, productId)` cho mỗi món
     - ML.NET tính điểm dựa trên:
       - Lịch sử hành vi của người dùng
       - Những user tương tự
       - Những sản phẩm tương tự
   
   - **GIAI ĐOẠN 4**: Áp dụng Ngữ cảnh (Context-Aware Boost)
     - Lấy thời tiết hiện tại từ Weather API
     - Lấy giờ hiện tại (VN timezone)
     - Áp dụng các quy tắc booster:
       - **🌅 Sáng (6-9h)**: Tăng điểm đồ uống
       - **🌙 Khuya (21-23h)**: Tăng điểm ăn vặt, gà rán
       - **🌧️ Mưa/Thunderstorm**: Tăng điểm lẩu, gà rán (món ấm)
       - **☀️ Nóng**: Tăng điểm đồ uống lạnh
     - Công thức: `finalScore = aiScore × contextMultiplier`
   
   - **GIAI ĐOẠN 5**: Fallback & Top 30
     - Nếu **Cold-Start** (người dùng mới): Dùng Top bán chạy
     - Nếu có dữ liệu: Lấy Top 30 món óc điểm cao nhất
   
   - **GIAI ĐOẠN 6**: Lưu Cache & Trả Kết quả
     - DELETE cache cũ
     - INSERT GoiYAi với Top 30 món
     - Trả JSON danh sách gợi ý
     - Frontend hiển thị danh sách
   
   - **GIAI ĐOẠN 7**: Tùy chọn - Thay đổi gợi ý
     - Người dùng thay đổi vị trí/bộ lọc
     - Xóa cache cũ
     - Lặp lại từ GIAI ĐOẠN 2

   **Công nghệ chính**: ML.NET Matrix Factorization, Weather API, Context-Aware Boosting, 15-min Cache

---

### 3. **03_Chatbot_AI_Sequence.puml**
   **Chủ đề**: Sơ đồ xử lý **Trò chuyện với Trợ lý ảo** (Gemini AI Chatbot)
   
   **Mô tả quy trình**:
   - **GIAI ĐOẠN 1**: Khách hàng gửi tin nhắn
     - Người dùng nhập câu hỏi vào chatbot
     - Frontend gửi POST /api/chatbot/SendMessage
   
   - **GIAI ĐOẠN 2**: Lưu tin nhắn người dùng
     - INSERT LichSuChat (NguoiGui = "User")
     - Lưu để AI kịp đọc bước sau
   
   - **GIAI ĐOẠN 3**: Kích hoạt lõi ML.NET - Lọc Top 5 Món
     - Query tất cả các món đang bán
     - **Nếu khách đã đăng nhập** (userId > 0):
       - Dùng ML.NET Collaborative Filtering
       - `PredictScore()` cho mỗi món
       - Lấy **Top 5 món** óc điểm cao nhất
     - **Nếu khách vãng lai** (userId = null):
       - Bài toán khởi động lạnh (Cold-Start)
       - Dùng Top 5 bán chạy thay thế
   
   - **GIAI ĐOẠN 4**: Lấy lịch sử chat
     - Query 5 tin nhắn gần nhất từ LichSuChat
     - Tạo ngữ cảnh chat:
       ```
       User: Hôm qua em ăn cơm tấm
       Bot: Cơm tấm là món ăn ngon lắm
       User: Em muốn ăn gì buổi chiều?
       ```
   
   - **GIAI ĐOẠN 5**: Tạo Prompt & Gửi Gemini
     - Tạo `promptSystem`:
       - Giới thiệu Gemini là trợ lý AI
       - Nhúng **Top 5 món** từ bước 3
       - **Ép luật JSON cứng**: Gemini PHẢI trả JSON với:
         - `message`: Câu tư vấn
         - `suggestedProductIds`: Danh sách ID món
     - Nối thêm lịch sử chat & câu hỏi hiện tại
     - POST đến Gemini API (gemini-2.5-flash)
     - Cài đặt: `responseMimeType = "application/json"`
   
   - **GIAI ĐOẠN 6**: Lưu tin nhắn Bot & Trả phản hồi
     - Gemini trả JSON response
     - Parse & deserialize thành AiResponseDto
     - INSERT LichSuChat (NguoiGui = "Bot")
     - Trả AiResponseDto về Frontend
   
   - **GIAI ĐOẠN 7**: Hiển thị phản hồi trên Frontend
     - Hiển thị tin nhắn bot
     - Lấy suggestedProductIds
     - Query thông tin chi tiết từng sản phẩm
     - Hiển thị thẻ sản phẩm với:
       - Tên món
       - Giá
       - Hình ảnh
       - Nút: Thêm giỏ, Chi tiết, Yêu thích
   
   - **GIAI ĐOẠN 8**: Tương tác & Lặp lại
     - Người dùng gửi tin nhắn tiếp → Lặp từ GIAI ĐOẠN 1
     - Lịch sử sẽ được Gemini nhớ
   
   - **Exception Handling**:
     - Nếu Gemini timeout → Trả thông báo default
     - Xử lý lỗi an toàn

   **Công nghệ chính**: Gemini 2.5 Flash API, ML.NET, Lịch sử Chat, JSON Response Forcing

---

## 🚀 Cách sử dụng PlantUML

### Online Viewer
1. Truy cập [PlantUML Online Editor](http://www.plantuml.com/plantuml/uml/)
2. Copy toàn bộ nội dung file `.puml`
3. Dán vào editor
4. Nhấn **Refresh** để xem sơ đồ

### VS Code Extension
1. Cài đặt extension: **PlantUML** (jebbs)
2. Mở file `.puml`
3. Nhấn **Alt+D** để xem preview

### Command Line
```bash
# Cài đặt PlantUML
choco install plantuml

# Xuất thành PNG
plantuml 01_Checkout_Payment_Sequence.puml -o ./output

# Xuất thành SVG (độ sắc cao hơn)
plantuml 01_Checkout_Payment_Sequence.puml -tsvg -o ./output
```

### Export thành ảnh
```bash
# PNG
plantuml -Tpng file.puml -o output.png

# PDF
plantuml -Tpdf file.puml -o output.pdf

# SVG
plantuml -Tsvg file.puml -o output.svg
```

---

## 📝 Ghi chú

- **Sequence Diagram** thể hiện thứ tự tương tác giữa các thành phần
- **Màu sắc**: Mỗi giai đoạn được phân biệt rõ ràng
- **Bộ lộc Transaction**: GIAI ĐOẠN 3 (Checkout) sử dụng transaction để đảm bảo ACID
- **ML.NET caching**: GIAI ĐOẠN 2 (Recommendation) cache 15 phút để tiết kiệm CPU
- **Gemini JSON forcing**: GIAI ĐOẠN 5 (Chatbot) ép Gemini trả JSON để tránh lỗi parsing

---

## 💡 Lợi ích của các sơ đồ này

✅ **Hiểu rõ quy trình** từ frontend đến backend  
✅ **Xác định các điểm gọi API** và truyền dữ liệu  
✅ **Phát hiện bottleneck** trong kiến trúc  
✅ **Hỗ trợ onboarding** cho dev mới  
✅ **Tài liệu kỹ thuật** cho khách hàng  
✅ **Cơ sở để tối ưu hóa** hiệu suất  

---

**Tạo bởi**: GitHub Copilot  
**Ngày tạo**: 2026-06-04  
**Phiên bản**: 1.0

