# LEGION SHOP – Đồ án tốt nghiệp

LEGION SHOP là website bán laptop/phụ kiện gaming gồm frontend HTML/CSS/JavaScript, backend Spring Boot và database MySQL. Bản này đã được dọn lại cấu trúc project, gộp README, bỏ file build/cache/IDE, chuẩn hóa đường dẫn tài nguyên và bổ sung lớp bảo vệ admin bằng access token có chữ ký. Một số phần như VNPay/email thật để ở mức cấu hình demo/sandbox.

---

## 1. Cấu trúc project

```bash
LEGION_SHOP_CLEAN/
├── frontend/
│   ├── html/          # Các trang giao diện
│   ├── css/           # Style
│   ├── js/            # JavaScript theo module
│   │   ├── core/
│   │   ├── features/
│   │   ├── legacy/
│   │   └── pages/
│   ├── images/        # Ảnh giao diện / sản phẩm
│   └── components/    # Header, footer, component HTML
│
├── backend/           # Spring Boot backend
│   ├── src/
│   ├── pom.xml
│   └── mvnw / mvnw.cmd
│
├── database/
│   ├── database.sql
│   ├── backup_database.bat
│   ├── import_database.bat
│   └── BACKUP_IMPORT_GUIDE.md
│
├── .gitignore
└── README.md
```

---

## 2. Công nghệ sử dụng

### Frontend

- HTML5
- CSS3
- JavaScript ES6
- Font Awesome CDN
- Local Storage

### Backend

- Java 17+
- Spring Boot
- Spring Security
- Spring Data JPA
- Maven

### Database

- MySQL 8+

---

## 3. Tính năng chính

### Người dùng

- Đăng ký / đăng nhập / đăng xuất
- Quên mật khẩu / đặt lại mật khẩu
- Xem danh sách sản phẩm
- Tìm kiếm và lọc sản phẩm
- Xem chi tiết sản phẩm
- Thêm sản phẩm vào giỏ hàng
- Đặt hàng
- Theo dõi lịch sử đơn hàng
- In hóa đơn
- Gửi yêu cầu sửa chữa / dịch vụ
- Quản lý thông tin cá nhân

### Admin

- Dashboard quản trị
- Quản lý sản phẩm
- Upload nhiều ảnh sản phẩm
- Quản lý giá và giảm giá
- Quản lý tồn kho
- Quản lý đơn hàng
- Cập nhật trạng thái đơn hàng
- Lưu lịch sử trạng thái đơn hàng
- Quản lý tài khoản
- Phân quyền admin/user
- Quản lý yêu cầu dịch vụ

### Hệ thống

- Validate form phía frontend và backend
- Loading spinner toàn hệ thống
- Trang lỗi 403 / 404
- Backup / import database
- Cấu trúc JS tách theo core, features, pages

---

## 4. Yêu cầu môi trường

Cài trước:

- Java 17 hoặc mới hơn
- Maven hoặc Maven Wrapper có sẵn trong project
- MySQL 8+
- VS Code / IntelliJ IDEA
- Live Server extension nếu chạy frontend bằng VS Code

---

## 5. Cài đặt database

### Cách 1: Import bằng MySQL command

```bash
mysql -u root -p < database/database.sql
```

Hoặc nếu đã tạo sẵn database:

```bash
mysql -u root -p legionshop < database/database.sql
```

### Cách 2: Dùng file `.bat`

Mở thư mục `database/`, chạy:

```bash
import_database.bat
```

Xem thêm hướng dẫn trong:

```bash
database/BACKUP_IMPORT_GUIDE.md
```

---

## 6. Cấu hình backend

Mở file cấu hình trong backend:

```bash
backend/src/main/resources/application.properties
```

Kiểm tra các thông tin sau:

```properties
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/legionshop?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Bangkok}
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:}
```

Nếu máy bạn có mật khẩu MySQL, đặt biến môi trường `DB_PASSWORD` hoặc điền tạm trong file `application.properties` khi chạy local. Không nên nộp/deploy project với mật khẩu thật trong mã nguồn.

Có thể cấu hình thêm:

```properties
app.security.token-secret=${APP_TOKEN_SECRET:legion-shop-local-demo-secret-change-me}
app.demo.expose-reset-token=${APP_EXPOSE_RESET_TOKEN:false}
```

- `APP_TOKEN_SECRET`: secret dùng để ký token đăng nhập, nên đổi khi deploy.
- `APP_EXPOSE_RESET_TOKEN=true`: chỉ bật khi demo quên mật khẩu nếu muốn API trả reset token trực tiếp cho frontend. Khi nộp/deploy nên để `false`.

---

## 7. Chạy backend

Vào thư mục backend:

```bash
cd backend
```

Windows:

```bash
mvnw.cmd spring-boot:run
```

Linux/macOS:

```bash
./mvnw spring-boot:run
```

Nếu Maven Wrapper báo lỗi tải Maven do mạng, cài Maven trên máy rồi chạy:

```bash
mvn clean package
mvn spring-boot:run
```

Backend mặc định chạy tại:

```txt
http://localhost:8080
```

---

## 8. Chạy frontend

Mở bằng Live Server:

```bash
frontend/html/home.html
```

Hoặc mở trực tiếp file HTML trong trình duyệt.

Khuyến nghị dùng Live Server để tránh lỗi load component/header/footer.

---

## 9. API chính

### Auth

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### Products

```http
GET    /api/products
GET    /api/products/{id}
POST   /api/products
PUT    /api/products/{id}
DELETE /api/products/{id}
```

### Orders

```http
GET  /api/orders
POST /api/orders
PUT  /api/orders/{id}
```

### Users

```http
GET /api/users
PUT /api/users/{id}
```

### Repair / Service

```http
GET  /api/repair-requests
POST /api/repair-requests
PUT  /api/repair-requests/{id}
```

---

## 10. Tài khoản demo

Dữ liệu mẫu có sẵn trong `database/database.sql`.

```txt
Admin: admin@legion.com / admin123
User demo: an@gmail.com / 123456
User demo: binh@gmail.com / 123456
```

Lưu ý: chức năng admin yêu cầu đăng nhập admin để frontend gửi `Authorization: Bearer <accessToken>` lên backend.

---

## 11. Backup database

Vào thư mục database:

```bash
backup_database.bat
```

File backup sẽ được tạo theo cấu hình trong script.

---

## 12. Deploy miễn phí

### Frontend

Có thể deploy bằng:

- GitHub Pages
- Netlify
- Vercel

### Backend

Có thể deploy bằng:

- Render
- Railway
- Koyeb

### Database

Có thể dùng:

- Railway MySQL
- Aiven MySQL
- PlanetScale

Khi deploy backend, nhớ sửa URL API trong frontend nếu không còn dùng `localhost:8080`.

---

## 13. Checklist trước khi nộp / deploy

### Frontend

- [ ] Mở `home.html` bằng Live Server
- [ ] Kiểm tra console không còn lỗi đỏ
- [ ] Test đăng nhập / đăng ký
- [ ] Test lọc sản phẩm
- [ ] Test giỏ hàng
- [ ] Test đặt hàng
- [ ] Test trang admin

### Backend

- [ ] Backend chạy không lỗi
- [ ] Kết nối được MySQL
- [ ] API auth hoạt động
- [ ] API sản phẩm hoạt động
- [ ] API đơn hàng hoạt động
- [ ] Phân quyền admin/user đúng
- [ ] Đăng nhập admin rồi thử thêm/sửa/xóa sản phẩm
- [ ] Đổi `APP_TOKEN_SECRET` nếu deploy public

### Database

- [ ] Import `database.sql` thành công
- [ ] Có dữ liệu sản phẩm
- [ ] Có dữ liệu tài khoản demo hoặc tài khoản admin
- [ ] Có dữ liệu đơn hàng test nếu cần báo cáo

---

## 14. Nội dung đã cleanup trong bản này

- Xóa `.git/`
- Xóa `.idea/`
- Xóa `backend/target/`
- Ẩn cấu hình database bằng biến môi trường
- Chặn API quản trị bằng access token có chữ ký, không còn tin vào header role đơn thuần
- Tắt trả reset token trực tiếp mặc định trong API quên mật khẩu
- Gộp README rời thành một README chính
- Đổi `HTML`, `CSS`, `JS`, `Images`, `Components` thành `frontend/html`, `frontend/css`, `frontend/js`, `frontend/images`, `frontend/components`
- Đổi `db` thành `database`
- Đổi `legion-shop-backend` thành `backend`
- Chuẩn hóa đường dẫn trong HTML/CSS/JS sang folder mới
- Chuyển Font Awesome sang CDN để project nhẹ và sạch hơn
- Thêm `.gitignore`

---

## 15. Gợi ý nâng cấp tiếp theo

- Docker hóa backend + database
- Thêm GitHub Actions build tự động
- Upload ảnh qua Cloudinary
- Tích hợp VNPay / MoMo
- Thêm unit test và integration test
- Nâng cấp token tự ký hiện tại thành JWT chuẩn nếu muốn production
- Tối ưu search bằng Elasticsearch hoặc full-text index MySQL

---

## 16. Tác giả

Đồ án tốt nghiệp – LEGION SHOP

Stack: Spring Boot + MySQL + HTML/CSS/JavaScript
